import request from 'supertest';
import { app } from '../app';

describe('customers api', () => {
  it('GET /customers should require token', async () => {
    const res = await request(app).get('/customers');
    expect(res.status).toBe(401);
  });
});
