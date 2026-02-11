import { Router } from 'express';
import { OpportunityStage } from '@prisma/client';
import { z } from 'zod';
import { authRequired } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { prisma } from '../utils/prisma';
import { ok } from '../utils/response';
import { ownerFilter, parsePagination } from '../utils/query';
import { writeLog } from '../services/log.service';

const router = Router();
const payload = z.object({
  title: z.string().min(1),
  customerId: z.string().uuid(),
  ownerId: z.string().uuid().optional(),
  stage: z.nativeEnum(OpportunityStage).optional(),
  amount: z.coerce.number(),
  closeDate: z.string().datetime().optional().nullable(),
  probability: z.number().min(0).max(100).optional().nullable(),
  remark: z.string().optional().nullable()
});

router.use(authRequired);

router.get('/', async (req, res) => {
  const { search, stage, customerId, ownerId } = req.query as any;
  const { skip, take, page, pageSize } = parsePagination(req);
  const where: any = { deletedAt: null, ...ownerFilter(req) };
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (stage) where.stage = stage;
  if (customerId) where.customerId = customerId;
  if (ownerId && req.user!.role === 'admin') where.ownerId = ownerId;
  const [rows, total] = await Promise.all([
    prisma.opportunity.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { customer: true, owner: { select: { id: true, name: true } } } }),
    prisma.opportunity.count({ where })
  ]);
  res.json(ok(rows, 'success', { page, pageSize, total }));
});

router.post('/', validate(payload), async (req, res) => {
  const created = await prisma.opportunity.create({
    data: {
      ...req.body,
      closeDate: req.body.closeDate ? new Date(req.body.closeDate) : null,
      ownerId: req.user!.role === 'admin' ? req.body.ownerId || req.user!.id : req.user!.id
    }
  });
  await writeLog({ actorId: req.user!.id, entityType: 'Opportunity', entityId: created.id, action: 'create', after: created });
  res.json(ok(created));
});

router.get('/:id', validate(z.object({ id: z.string().uuid() }), 'params'), async (req, res, next) => {
  const row = await prisma.opportunity.findFirst({ where: { id: req.params.id, deletedAt: null, ...ownerFilter(req) } });
  if (!row) return next({ status: 404, message: 'Opportunity not found' });
  res.json(ok(row));
});

router.patch('/:id', validate(z.object({ id: z.string().uuid() }), 'params'), validate(payload.partial()), async (req, res, next) => {
  const before = await prisma.opportunity.findFirst({ where: { id: req.params.id, deletedAt: null, ...ownerFilter(req) } });
  if (!before) return next({ status: 403, message: 'Forbidden or not found' });
  const data: any = { ...req.body };
  if (data.closeDate) data.closeDate = new Date(data.closeDate);
  if (req.user!.role !== 'admin') delete data.ownerId;
  const after = await prisma.opportunity.update({ where: { id: req.params.id }, data });
  await writeLog({ actorId: req.user!.id, entityType: 'Opportunity', entityId: after.id, action: 'update', before, after });
  res.json(ok(after));
});

router.delete('/:id', validate(z.object({ id: z.string().uuid() }), 'params'), async (req, res, next) => {
  const before = await prisma.opportunity.findFirst({ where: { id: req.params.id, deletedAt: null, ...ownerFilter(req) } });
  if (!before) return next({ status: 403, message: 'Forbidden or not found' });
  await prisma.opportunity.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  await writeLog({ actorId: req.user!.id, entityType: 'Opportunity', entityId: req.params.id, action: 'delete', before });
  res.json(ok(null, 'deleted'));
});

export default router;
