import { Router } from 'express';
import { authRequired } from '../middlewares/auth';
import { prisma } from '../utils/prisma';
import { ok } from '../utils/response';
import { parsePagination } from '../utils/query';

const router = Router();
router.use(authRequired);

router.get('/', async (req, res) => {
  const { entityType, actorId } = req.query as any;
  const { skip, take, page, pageSize } = parsePagination(req);
  const where: any = {};
  if (req.user!.role !== 'admin') where.actorId = req.user!.id;
  else if (actorId) where.actorId = actorId;
  if (entityType) where.entityType = entityType;

  const [rows, total] = await Promise.all([
    prisma.activityLog.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { actor: { select: { id: true, name: true, email: true } } } }),
    prisma.activityLog.count({ where })
  ]);
  res.json(ok(rows, 'success', { page, pageSize, total }));
});

export default router;
