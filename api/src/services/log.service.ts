import { prisma } from '../utils/prisma';

export async function writeLog(input: {
  actorId: string;
  entityType: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
}) {
  await prisma.activityLog.create({
    data: {
      actorId: input.actorId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      before: input.before as any,
      after: input.after as any
    }
  });
}
