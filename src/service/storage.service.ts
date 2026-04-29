import { minioClient, ensureBucketExists } from '../helpers/minio'
import { config } from '../config/config'
import { randomUUID } from 'crypto'
import { extname } from 'path'

export type UploadResult = {
    objectName: string
    url: string
    size: number
    mimetype: string
}

export class StorageService {
    private readonly bucket: string

    constructor() {
        this.bucket = config.minio.bucketName
    }

    async uploadFile(
        file: File,
        folder: string = '',
        keepOriginalName: boolean = false
    ): Promise<UploadResult> {
        await ensureBucketExists(this.bucket)

        const filename = keepOriginalName ? file.name : `${randomUUID()}${extname(file.name)}`
        const objectName = folder ? `${folder.replace(/\/$/, '')}/${filename}` : filename

        const buffer = Buffer.from(await file.arrayBuffer())

        await minioClient.putObject(this.bucket, objectName, buffer, buffer.length, {
            'Content-Type': file.type,
        })

        const url = await this.getFileUrl(objectName)

        return {
            objectName,
            url,
            size: file.size,
            mimetype: file.type,
        }
    }

    async uploadBuffer(
        buffer: Buffer,
        filename: string,
        mimetype: string,
        folder: string = ''
    ): Promise<UploadResult> {
        await ensureBucketExists(this.bucket)

        const ext = extname(filename)
        const uniqueName = `${randomUUID()}${ext}`
        const objectName = folder ? `${folder.replace(/\/$/, '')}/${uniqueName}` : uniqueName

        await minioClient.putObject(this.bucket, objectName, buffer, buffer.length, {
            'Content-Type': mimetype,
        })

        const url = await this.getFileUrl(objectName)

        return {
            objectName,
            url,
            size: buffer.length,
            mimetype,
        }
    }

    async deleteFile(objectName: string): Promise<void> {
        await minioClient.removeObject(this.bucket, objectName)
    }

    async getFileUrl(objectName: string, expirySeconds: number = 7 * 24 * 3600): Promise<string> {
        return minioClient.presignedGetObject(this.bucket, objectName, expirySeconds)
    }
}
