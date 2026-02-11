import { Request } from 'express';

export function parsePagination(req: Request) {
  const page = Number(req.query.page || 1);
  const pageSize = Math.min(Number(req.query.pageSize || 10), 100);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function ownerFilter(req: Request, ownerField = 'ownerId') {
  return req.user?.role === 'admin' ? {} : { [ownerField]: req.user?.id };
}
