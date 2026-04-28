import { Hono } from 'hono'
import { config } from './config/config';
import { cors } from 'hono/cors'

const app = new Hono()
app.use('*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default {
  port: config.app.port,
  fetch: app.fetch,
};

console.log(`🚀 Server running on http://localhost:${config.app.port}`);