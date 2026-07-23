import { OAuth2Client } from "google-auth-library"
import { config } from "../config/config"
import { BadRequestException, UnauthorizedException } from "../helpers/exception"

export class AuthService {

    private googleClient: OAuth2Client

    constructor() {
        this.googleClient = new OAuth2Client(config.google.clientId)
    }

    async verifyGoogleToken(credential: string) {
        try {
            // Access token (ya29.xxx) — verify via userinfo endpoint
            if (credential.startsWith("ya29.")) {
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                    headers: { Authorization: `Bearer ${credential}` },
                })
                if (!res.ok) {
                    throw new UnauthorizedException("Invalid Google access token")
                }
                return await res.json() as {
                    sub: string
                    email: string
                    name: string
                    picture: string
                    email_verified: boolean
                    hd?: string
                }
            }

            // ID token (JWT) — verify via google-auth-library
            const ticket = await this.googleClient.verifyIdToken({
                idToken: credential,
                audience: config.google.clientId,
            })

            const payload = ticket.getPayload()

            if (!payload) {
                throw new UnauthorizedException("Invalid Google token payload")
            }

            return payload
        } catch (error: any) {
            if (error instanceof UnauthorizedException) throw error
            throw new UnauthorizedException(error.message || "Invalid Google token")
        }
    }

    async logout(token: string) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
            method: "POST",
        })
    }

    async loginWithGoogle(credential: string) {
        if (!credential) {
            throw new BadRequestException("Google credential is required")
        }

        const payload = await this.verifyGoogleToken(credential)

        if (payload.hd !== "nusa.id") {
            throw new UnauthorizedException("Invalid access")
        }

        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            emailVerified: payload.email_verified,
            token: credential,
        }
    }
}
