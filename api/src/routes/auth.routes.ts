import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/auth';
import { ok } from '../utils/response';
import { authRequired } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { writeLog } from '../services/log.service';

const router = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
      return next({ status: 401, message: 'Invalid credentials' });
    }
    const pass = await bcrypt.compare(password, user.passwordHash);
    if (!pass) return next({ status: 401, message: 'Invalid credentials' });
    const token = signToken({ id: user.id, role: user.role, email: user.email });
    await writeLog({ actorId: user.id, entityType: 'User', entityId: user.id, action: 'login' });
    res.json(ok({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }));
  } catch (e) {
    next(e);
  }
});

router.get('/me', authRequired, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) return next({ status: 404, message: 'User not found' });
    res.json(ok({ id: user.id, name: user.name, email: user.email, role: user.role }));
  } catch (e) {
    next(e);
  }
});

router.post('/logout', authRequired, async (req, res) => {
  await writeLog({ actorId: req.user!.id, entityType: 'User', entityId: req.user!.id, action: 'logout' });
  res.json(ok(null, 'logout success'));
});

export default router;
