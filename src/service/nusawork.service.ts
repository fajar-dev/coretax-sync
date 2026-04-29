import axios, { AxiosInstance } from "axios"
import { config } from "../config/config"

export class NusaworkService {
    private readonly http: AxiosInstance

    constructor() {
        this.http = axios.create({
            baseURL: config.nusawork.apiUrl,
            headers: {
                Accept: "application/json",
            },
        })
    }

    private cachedToken: string | null = null
    private tokenExpiresAt: number = 0

    private async getToken(): Promise<string> {
        if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
            return this.cachedToken
        }

        const res = await this.http.post<any>("/auth/api/oauth/token", {
            grant_type: "client_credentials",
            client_id: config.nusawork.clientId,
            client_secret: config.nusawork.clientSecret,
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })

        const expiresIn: number = res.data.expires_in ?? 3600
        this.cachedToken = res.data.access_token as string
        // refresh 60 detik sebelum expired untuk menghindari race condition
        this.tokenExpiresAt = Date.now() + (expiresIn - 60) * 1000

        return this.cachedToken
    }

    /**
     * Ambil data user berdasarkan email dari Nusawork.
     */
    async getUserbyEmail(email: string): Promise<any> {
        const token = await this.getToken()

        const res = await this.http.get<any>("/auth/api/client/users/email/"+email, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        
        return (res.data.data as any) ?? null
    }

    /**
     * Ambil data karyawan berdasarkan id dari Nusawork.
     */
    async getEmployeeById(userId: number): Promise<any> {
        const token = await this.getToken()

        const res = await this.http.get<any>("/emp/api/v1.1/employee/"+userId, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        
        return (res.data as any) ?? null
    }

    /**
     * Ambil data karyawan berdasarkan email dari Nusawork.
     */
    async getEmployeeByEmail(email: string): Promise<any> {
        const user = await this.getUserbyEmail(email)
        const employee = await this.getEmployeeById(user.id)
        return employee
    }
}