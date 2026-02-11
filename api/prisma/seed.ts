import { PrismaClient, Role, LeadStatus, OpportunityStage } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  await prisma.activityLog.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@crm.local', passwordHash: password, role: Role.admin }
  });
  const salesA = await prisma.user.create({
    data: { name: 'Alice Sales', email: 'alice@crm.local', passwordHash: password, role: Role.sales }
  });
  const salesB = await prisma.user.create({
    data: { name: 'Bob Sales', email: 'bob@crm.local', passwordHash: password, role: Role.sales }
  });

  const c1 = await prisma.customer.create({
    data: { name: 'Acme Corp', industry: 'SaaS', level: 'A', ownerId: salesA.id, phone: '13800000001', email: 'contact@acme.com' }
  });
  const c2 = await prisma.customer.create({
    data: { name: 'Beta Manufacturing', industry: '制造业', level: 'B', ownerId: salesB.id }
  });

  await prisma.lead.createMany({
    data: [
      { name: '张三', source: '官网', status: LeadStatus.new, ownerId: salesA.id, phone: '13900000001' },
      { name: '李四', source: '活动', status: LeadStatus.contacted, ownerId: salesB.id, customerId: c2.id }
    ]
  });

  await prisma.opportunity.createMany({
    data: [
      { title: 'Acme 年度合同', customerId: c1.id, ownerId: salesA.id, stage: OpportunityStage.proposal, amount: 200000, probability: 70 },
      { title: 'Beta 系统升级', customerId: c2.id, ownerId: salesB.id, stage: OpportunityStage.negotiation, amount: 120000, probability: 55 }
    ]
  });

  await prisma.activityLog.create({
    data: {
      actorId: admin.id,
      entityType: 'User',
      entityId: admin.id,
      action: 'seed_init',
      after: { note: 'Initial seed data created' }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
