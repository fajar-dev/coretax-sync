import { Hono } from 'hono'
import { AuthController } from '../controller/auth.controller'
import { SyncController } from '../controller/sync.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import type { Variables } from '../helpers/types'

const router = new Hono<{ Variables: Variables }>()

const authController = new AuthController()
const syncController = new SyncController()

router.post('/auth/google', (c) => authController.google(c))
router.get('/auth/me', authMiddleware, (c) => authController.me(c))
router.post('/auth/logout', authMiddleware, (c) => authController.logout(c))

router.post('/sync', authMiddleware, (c) => syncController.sync(c))

export default router
