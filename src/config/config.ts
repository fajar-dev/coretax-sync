/**
 * Global Application Configuration
 * All environment variables are centralized here
 */
export const config = {
    app: {
        port: Number(process.env.PORT) || 3000,
        env: process.env.ENV || 'development',
    },
    database: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        pass: process.env.DB_PASS || '',
        name: process.env.DB_NAME || 'kawan_nusa',
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    minio: {
        endpoint: process.env.MINIO_STORAGE_ENDPOINT || '',
        port: Number(process.env.MINIO_STORAGE_PORT) || 9000,
        useSSL: process.env.MINIO_STORAGE_SSL === 'true',
        accessKey: process.env.MINIO_STORAGE_KEY || '',
        secretKey: process.env.MINIO_STORAGE_SECRET || '',
        bucketName: process.env.MINIO_STORAGE_BUCKET || '',
    }
}