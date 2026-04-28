import { minioClient, ensureBucketExists } from '../helpers/minio'
import { config } from '../config/config'
import { randomUUID } from 'crypto'
import { extname } from 'path'

const bucket = config.minio.bucketName

export type UploadResult = {
    objectName: string
    url: string
    size: number
    mimetype: string
}

export async function uploadFile(
    file: File,
    folder: string = '',
    keepOriginalName: boolean = false
): Promise<UploadResult> {
    await ensureBucketExists(bucket)

    const filename = keepOriginalName ? file.name : `${randomUUID()}${extname(file.name)}`
    const objectName = folder ? `${folder.replace(/\/$/, '')}/${filename}` : filename

    const buffer = Buffer.from(await file.arrayBuffer())

    await minioClient.putObject(bucket, objectName, buffer, buffer.length, {
        'Content-Type': file.type,
    })

    const url = await getFileUrl(objectName)

    return {
        objectName,
        url,
        size: file.size,
        mimetype: file.type,
    }
}

export async function uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    folder: string = ''
): Promise<UploadResult> {
    await ensureBucketExists(bucket)

    const ext = extname(filename)
    const uniqueName = `${randomUUID()}${ext}`
    const objectName = folder ? `${folder.replace(/\/$/, '')}/${uniqueName}` : uniqueName

    await minioClient.putObject(bucket, objectName, buffer, buffer.length, {
        'Content-Type': mimetype,
    })

    const url = await getFileUrl(objectName)

    return {
        objectName,
        url,
        size: buffer.length,
        mimetype,
    }
}

export async function deleteFile(objectName: string): Promise<void> {
    await minioClient.removeObject(bucket, objectName)
}

// Returns a presigned URL valid for 7 days by default
export async function getFileUrl(objectName: string, expirySeconds: number = 7 * 24 * 3600): Promise<string> {
    return minioClient.presignedGetObject(bucket, objectName, expirySeconds)
}
