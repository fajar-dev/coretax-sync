import { Client } from 'minio'
import { config } from '../config/config'

export const minioClient = new Client({
    endPoint: config.minio.endpoint,
    port: config.minio.port,
    useSSL: config.minio.useSSL,
    accessKey: config.minio.accessKey,
    secretKey: config.minio.secretKey,
})

export async function ensureBucketExists(bucketName: string): Promise<void> {
    const exists = await minioClient.bucketExists(bucketName)
    if (!exists) {
        await minioClient.makeBucket(bucketName)
    }
}
