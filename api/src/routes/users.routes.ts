import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authRequired, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { ok } from '../utils/response';
import { parsePagination } from '../utils/query';
import { writeLog } from '../services/log.service';

const router = Router();
const createSchema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6), role: z.enum(['admin', 'sales']) });
const updateSchema = createSchema.partial().omit({ password: true }).extend({ password: z.string().min(6).optional() });

router.use(authRequired, requireRole(['admin']));

router.get('/', async (req, res) => {
  const { skip, take, page, pageSize } = parsePagination(req);
  const [rows, total] = await Promise.all([
    prisma.user.findMany({ where: { deletedAt: null }, skip, take, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
    prisma.user.count({ where: { deletedAt: null } })
  ]);
  res.json(ok(rows, 'success', { page, pageSize, total }));
});

router.post('/', validate(createSchema), async (req, res) => {
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  const user = await prisma.user.create({ data: { name: req.body.name, email: req.body.email, passwordHash, role: req.body.role } });
  await writeLog({ actorId: req.user!.id, entityType: 'User', entityId: user.id, action: 'create', after: user });
  res.json(ok(user));
});

router.patch('/:id', validate(z.object({ id: z.string().uuid() }), 'params'), validate(updateSchema), async (req, res, next) => {
  const before = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!before || before.deletedAt) return next({ status: 404, message: 'User not found' });
  const data: any = { ...req.body };
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  const after = await prisma.user.update({ where: { id: req.params.id }, data });
  await writeLog({ actorId: req.user!.id, entityType: 'User', entityId: after.id, action: 'update', before, after });
  res.json(ok(after));
});

router.delete('/:id', validate(z.object({ id: z.string().uuid() }), 'params'), async (req, res, next) => {
  const before = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!before || before.deletedAt) return next({ status: 404, message: 'User not found' });
  await prisma.user.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  await writeLog({ actorId: req.user!.id, entityType: 'User', entityId: req.params.id, action: 'delete', before });
  res.json(ok(null, 'deleted'));
});

export default router;
