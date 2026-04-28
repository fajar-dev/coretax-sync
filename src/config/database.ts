import { createPool, type Pool } from 'mysql2/promise'
import { config } from './config'

export const pool: Pool = createPool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.pass,
    database: config.database.name,
    waitForConnections: true,
    queueLimit: 0,
})