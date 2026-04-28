import type { Context } from "hono"
import { AuthService } from "../service/auth.service"
import { ApiResponse } from "../helpers/response"
import { UnauthorizedException } from "../helpers/exception"

const authService = new AuthService()

export class AuthController {
    async google(c: Context) {
        const body = await c.req.json()
        const { credential } = body
        const user = await authService.loginWithGoogle(credential)
        return ApiResponse.success(c, { user }, "User login successfully")
    }

    async me(c: Context) {
        const user = c.get("user")
        return ApiResponse.success(c, { user }, "User successfully retrieved")
    }

    async logout(c: Context) {
        const [, token] = c.req.header("Authorization")!.split(" ")
        await authService.logout(token)
        return ApiResponse.success(c, null, "User logged out successfully")
    }
}