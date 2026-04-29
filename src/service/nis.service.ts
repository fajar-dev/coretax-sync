import { pool } from "../config/database"

export class NisService {
    async insertBupot(fileName: string, time: number, employeeId: string) {
        const [result]: any = await pool.query(
            `INSERT INTO Pph23BuktiPotong (
                fileName,
                storage,
                batchId,
                insertBy,
                insertTime,
                status
            ) VALUES (?, ?, ?, ?, NOW(), ?)`,
            [fileName, 'minio', time, employeeId, 'Queued']
        )

        return result
    }
}
