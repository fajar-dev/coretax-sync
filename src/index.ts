import { Hono } from 'hono'
import { config } from './config/config';
import { cors } from 'hono/cors'
import { BaseException } from './helpers/exception';
import { ApiResponse } from './helpers/response';
import apiRouter from './routes/api';
import { checkDatabaseConnection } from './config/database';

const app = new Hono()
checkDatabaseConnection()
app.use('*', cors())

app.route('/api', apiRouter)


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


const server = Bun.serve({
  port: config.app.port,
  hostname: '0.0.0.0',
  fetch: app.fetch,
});

console.log(`🚀 Server running on http://localhost:${server.port}`);