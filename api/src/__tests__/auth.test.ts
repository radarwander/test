import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../app';
import { prisma } from '../utils/prisma';

jest.mock('../utils/prisma', () => ({
  prisma: { user: { findUnique: jest.fn() }, activityLog: { create: jest.fn() } }
}));

describe('auth api', () => {
  it('POST /auth/login should login successfully', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'u1',
      email: 'admin@crm.local',
      name: 'Admin',
      role: 'admin',
      passwordHash: await bcrypt.hash('Password123!', 10)
    });

    const res = await request(app).post('/auth/login').send({ email: 'admin@crm.local', password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });
});
