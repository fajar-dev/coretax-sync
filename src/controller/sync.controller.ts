import type { Context } from "hono"
import { ApiResponse } from "../helpers/response"
import { BadRequestException } from "../helpers/exception"
import { uploadFile } from "../service/storage.service"

export class SyncController {
    async sync(c: Context) {
        const body = await c.req.parseBody()
        const file = body["file"]

        if (!file || !(file instanceof File)) {
            throw new BadRequestException("file is required")
        }

        const result = await uploadFile(file, "sync", true)

        return ApiResponse.success(c, result, "File uploaded successfully")
    }
}