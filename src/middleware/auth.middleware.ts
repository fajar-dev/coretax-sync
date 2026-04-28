import type { Context, Next } from "hono"
import { AuthService } from "../service/auth.service"
import { UnauthorizedException } from "../helpers/exception"

const authService = new AuthService()

export async function authMiddleware(c: Context, next: Next) {
    const authorization = c.req.header("Authorization")

    if (!authorization || !authorization.startsWith("Bearer ")) {
        throw new UnauthorizedException("Missing or invalid Authorization header")
    }

    const token = authorization.slice(7)
    const payload = await authService.verifyGoogleToken(token)

    if (payload.hd !== "nusa.net.id") {
        throw new UnauthorizedException("Invalid Google account")
    }

    c.set("user", {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified,
    })

    await next()
}
