import { Router } from 'express';
import { authRequired } from '../middlewares/auth';
import { prisma } from '../utils/prisma';
import { ok } from '../utils/response';
import { ownerFilter } from '../utils/query';

const router = Router();
router.use(authRequired);

router.get('/', async (req, res) => {
  const where = { deletedAt: null, ...ownerFilter(req) };
  const [customers, leads, amountResult] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.lead.count({ where }),
    prisma.opportunity.aggregate({ where, _sum: { amount: true } })
  ]);
  res.json(ok({ customers, leads, opportunityAmount: Number(amountResult._sum.amount || 0) }));
});

export default router;
