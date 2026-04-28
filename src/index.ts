import { Hono } from 'hono'
import { config } from './config/config';
import { cors } from 'hono/cors'
import { BaseException } from './helpers/exception';
import { ApiResponse } from './helpers/response';
import { AuthController } from './controller/auth.controller';
import { authMiddleware } from './middleware/auth.middleware';
import type { Variables } from './helpers/types';

const app = new Hono<{ Variables: Variables }>()
app.use('*', cors())

const authController = new AuthController()

app.post('/auth/google', (c) => authController.google(c))
app.get('/auth/me', authMiddleware, (c) => authController.me(c))
app.post('/auth/logout', authMiddleware, (c) => authController.logout(c))
app.get('/', authMiddleware, (c) => {
    return c.text('Hello Hono!')
})

// Global Error Handler
app.onError((err, c) => {
    if (err instanceof BaseException) {
        console.error(`[Exception] ${err.status} - ${err.message}`)
        return ApiResponse.error(c, err.message, err.status, err.context)
    }

    console.error("error: ", err.message)

    const errors = config.app.env !== "production" ? { 
        message: err.message, 
        stack: err.stack 
    } : null

    return ApiResponse.error(c, "Internal Server Error", 500, errors)
})


export default {
  port: config.app.port,
  fetch: app.fetch,
};

console.log(`🚀 Server running on http://localhost:${config.app.port}`);