import type { Context } from "hono"
import { ApiResponse } from "../helpers/response"
import { BadRequestException } from "../helpers/exception"
import { StorageService } from "../service/storage.service"
import { NisService } from "../service/nis.service"
import { NusaworkService } from "../service/nusawork.service"

export class SyncController {
    private readonly storageService: StorageService
    private readonly nisService: NisService
    private readonly nusaworkService: NusaworkService

    constructor(storageService: StorageService, nisService: NisService, nusaworkService: NusaworkService) {
        this.storageService = storageService
        this.nisService = nisService
        this.nusaworkService = nusaworkService
    }

    async sync(c: Context) {
        const user = c.get("user")
        const body = await c.req.parseBody({ all: true })
        const files = body["files"]

        const fileArray = Array.isArray(files) ? files : files ? [files] : []

        if (fileArray.length === 0 || !fileArray.every(f => f instanceof File)) {
            throw new BadRequestException("at least one file is required")
        }

        const time = Date.now()
        const employee = await this.nusaworkService.getEmployeeByEmail(user.email)
        
        const results = await Promise.all(
            fileArray.map(async (file) => {
                const result = await this.storageService.uploadFile(file as File, "bupot-pph23", true)
                const existingBupot = await this.nisService.getBupotByFileName(result.objectName)
                if (!existingBupot) {
                    await this.nisService.insertBupot(result.objectName, time, employee.employee_id)
                }
                return result
            })
        )

        return ApiResponse.success(c, results, "Files uploaded successfully")
    }
}
