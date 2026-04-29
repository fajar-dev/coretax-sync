import { Hono } from 'hono'
import { AuthController } from '../controller/auth.controller'
import { SyncController } from '../controller/sync.controller'
import { AuthService } from '../service/auth.service'
import { StorageService } from '../service/storage.service'
import { NisService } from '../service/nis.service'
import { authMiddleware } from '../middleware/auth.middleware'
import type { Variables } from '../helpers/types'
import { NusaworkService } from '../service/nusawork.service'

const router = new Hono<{ Variables: Variables }>()

const authService = new AuthService()
const storageService = new StorageService()
const nisService = new NisService()
const nusaworkService = new NusaworkService()

const authController = new AuthController(authService)
const syncController = new SyncController(storageService, nisService, nusaworkService)

router.post('/auth/google', (c) => authController.google(c))
router.get('/auth/me', authMiddleware, (c) => authController.me(c))
router.post('/auth/logout', authMiddleware, (c) => authController.logout(c))

router.post('/sync', authMiddleware, (c) => syncController.sync(c))
export default router
