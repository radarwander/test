# 简易 CRM MVP（React + Express + Prisma + PostgreSQL）

## 功能概览
- 登录/退出、JWT 会话保持、bcrypt 密码加密
- 客户（Customer）CRUD + 搜索/筛选/分页
- 线索（Lead）CRUD + 转化（convert）
- 商机（Opportunity）CRUD + 搜索/筛选/分页
- 用户管理（仅 admin）
- 操作审计日志（ActivityLog）
- 角色权限：admin 全量；sales 仅本人 owner 数据
- Docker Compose 一键启动（web/api/db）

## 项目结构
```bash
.
├── api
│   ├── prisma
│   │   ├── migrations/0001_init/migration.sql
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src
│   │   ├── __tests__
│   │   │   ├── auth.test.ts
│   │   │   └── customers.test.ts
│   │   ├── middlewares
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   ├── app.ts
│   │   └── index.ts
│   ├── Dockerfile
│   └── package.json
├── web
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── contexts
│   │   ├── layouts
│   │   ├── pages
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## 本地开发启动
### 1) API
```bash
cd api
npm install
cp ../.env.example .env
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```
API 地址：`http://localhost:3000`

### 2) Web
```bash
cd web
npm install
npm run dev
```
Web 地址：`http://localhost:5173`

## Docker 一键启动
```bash
docker compose up --build
```
- Web: `http://localhost:5173`
- API: `http://localhost:3000`
- DB: `localhost:5432`

## 初始账号（seed）
统一密码：`Password123!`
- admin：`admin@crm.local`
- sales：`alice@crm.local`
- sales：`bob@crm.local`

## 环境变量
见 `.env.example`。

## 常见问题
1. **Prisma 连接失败**：确认 `DATABASE_URL` 与 PostgreSQL 端口一致。
2. **登录 401**：确认已执行 seed，且使用上面初始账号密码。
3. **前端跨域问题**：默认 API 已启用 CORS，检查 `VITE_API_URL`。
