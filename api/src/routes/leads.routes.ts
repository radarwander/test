import { Router } from 'express';
import { z } from 'zod';
import { LeadStatus } from '@prisma/client';
import { authRequired } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { prisma } from '../utils/prisma';
import { ok } from '../utils/response';
import { ownerFilter, parsePagination } from '../utils/query';
import { writeLog } from '../services/log.service';

const router = Router();
const payload = z.object({
  name: z.string().min(1),
  source: z.string().min(1),
  status: z.nativeEnum(LeadStatus).optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  ownerId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional().nullable(),
  remark: z.string().optional().nullable()
});

router.use(authRequired);

router.get('/', async (req, res) => {
  const { search, status, source, ownerId } = req.query as any;
  const { skip, take, page, pageSize } = parsePagination(req);
  const where: any = { deletedAt: null, ...ownerFilter(req) };
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (status) where.status = status;
  if (source) where.source = source;
  if (ownerId && req.user!.role === 'admin') where.ownerId = ownerId;
  const [rows, total] = await Promise.all([
    prisma.lead.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { owner: { select: { id: true, name: true } }, customer: true } }),
    prisma.lead.count({ where })
  ]);
  res.json(ok(rows, 'success', { page, pageSize, total }));
});

router.post('/', validate(payload), async (req, res) => {
  const data = { ...req.body, ownerId: req.user!.role === 'admin' ? req.body.ownerId || req.user!.id : req.user!.id };
  const created = await prisma.lead.create({ data });
  await writeLog({ actorId: req.user!.id, entityType: 'Lead', entityId: created.id, action: 'create', after: created });
  res.json(ok(created));
});

router.get('/:id', validate(z.object({ id: z.string().uuid() }), 'params'), async (req, res, next) => {
  const row = await prisma.lead.findFirst({ where: { id: req.params.id, deletedAt: null, ...ownerFilter(req) } });
  if (!row) return next({ status: 404, message: 'Lead not found' });
  res.json(ok(row));
});

router.patch('/:id', validate(z.object({ id: z.string().uuid() }), 'params'), validate(payload.partial()), async (req, res, next) => {
  const before = await prisma.lead.findFirst({ where: { id: req.params.id, deletedAt: null, ...ownerFilter(req) } });
  if (!before) return next({ status: 403, message: 'Forbidden or not found' });
  const data: any = { ...req.body };
  if (req.user!.role !== 'admin') delete data.ownerId;
  const after = await prisma.lead.update({ where: { id: req.params.id }, data });
  await writeLog({ actorId: req.user!.id, entityType: 'Lead', entityId: after.id, action: 'update', before, after });
  res.json(ok(after));
});

router.delete('/:id', validate(z.object({ id: z.string().uuid() }), 'params'), async (req, res, next) => {
  const before = await prisma.lead.findFirst({ where: { id: req.params.id, deletedAt: null, ...ownerFilter(req) } });
  if (!before) return next({ status: 403, message: 'Forbidden or not found' });
  await prisma.lead.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
  await writeLog({ actorId: req.user!.id, entityType: 'Lead', entityId: req.params.id, action: 'delete', before });
  res.json(ok(null, 'deleted'));
});

router.post('/:id/convert', validate(z.object({ id: z.string().uuid() }), 'params'), async (req, res, next) => {
  const lead = await prisma.lead.findFirst({ where: { id: req.params.id, deletedAt: null, ...ownerFilter(req) } });
  if (!lead) return next({ status: 403, message: 'Forbidden or not found' });

  const customer = lead.customerId
    ? await prisma.customer.findUnique({ where: { id: lead.customerId } })
    : await prisma.customer.create({ data: { name: `${lead.name} 客户`, ownerId: lead.ownerId, phone: lead.phone, email: lead.email } });

  const opportunity = await prisma.opportunity.create({
    data: {
      title: `${lead.name} 转化商机`,
      customerId: customer!.id,
      ownerId: lead.ownerId,
      amount: 0,
      stage: 'prospecting',
      probability: 20
    }
  });

  const updated = await prisma.lead.update({ where: { id: lead.id }, data: { status: 'converted', customerId: customer!.id } });
  await writeLog({ actorId: req.user!.id, entityType: 'Lead', entityId: lead.id, action: 'convert', before: lead, after: updated });
  res.json(ok({ lead: updated, customer, opportunity }));
});

export default router;
