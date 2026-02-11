import { Router } from 'express';
import { z } from 'zod';
import { authRequired } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { prisma } from '../utils/prisma';
import { ok } from '../utils/response';
import { ownerFilter, parsePagination } from '../utils/query';
import { writeLog } from '../services/log.service';

const router = Router();
const payload = z.object({
  name: z.string().min(1),
  industry: z.string().optional().nullable(),
  level: z.string().optional().nullable(),
  ownerId: z.string().uuid().optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  remark: z.string().optional().nullable()
});

router.use(authRequired);

router.get('/', async (req, res) => {
  const { search, level, ownerId } = req.query as any;
  const { skip, take, page, pageSize } = parsePagination(req);
  const where: any = { deletedAt: null, ...ownerFilter(req) };
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (level) where.level = level;
  if (ownerId && req.user!.role === 'admin') where.ownerId = ownerId;
  const [rows, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { owner: { select: { id: true, name: true } } } }),
    prisma.customer.count({ where })
  ]);
  res.json(ok(rows, 'success', { page, pageSize, total }));
});

router.post('/', validate(payload), async (req, res) => {
  const data = { ...req.body, ownerId: req.user!.role === 'admin' ? req.body.ownerId || req.user!.id : req.user!.id };
  const created = await prisma.customer.create({ data });
  await writeLog({ actorId: req.user!.id, entityType: 'Customer', entityId: created.id, action: 'create', after: created });
  res.json(ok(created));
});

router.get('/:id', validate(z.object({ id: z.string().uuid() }), 'params'), async (req, res, next) => {
  const where: any = { id: req.params.id, deletedAt: null, ...ownerFilter(req) };
  const row = await prisma.customer.findFirst({ where });
  if (!row) return next({ status: 404, message: 'Customer not found' });
  res.json(ok(row));
});

router.patch('/:id', validate(z.object({ id: z.string().uuid() }), 'params'), validate(payload.partial()), async (req, res, next) => {
  const before = await prisma.customer.findFirst({ where: { id: req.params.id, deletedAt: null, ...ownerFilter(req) } });
  if (!before) return next({ status: 403, message: 'Forbidden or not found' });
  const data = { ...req.body } as any;
  if (req.user!.role !== 'admin') delete data.ownerId;
  const after = await prisma.customer.update({ where: { id: req.params.id }, data });
  await writeLog({ actorId: req.user!.id, entityType: 'Customer', entityId: after.id, action: 'update', before, after });
  res.json(ok(after));
});

router.delete('/:id', validate(z.object({ id: z.string().uuid() }), 'params'), async (req, res, next) => {
  const before = await prisma.customer.findFirst({ where: { id: req.params.id, deletedAt: null, ...ownerFilter(req) } });
  if (!before) return next({ status: 403, message: 'Forbidden or not found' });
  await prisma.customer.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  await writeLog({ actorId: req.user!.id, entityType: 'Customer', entityId: req.params.id, action: 'delete', before });
  res.json(ok(null, 'deleted'));
});

export default router;
