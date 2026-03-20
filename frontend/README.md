# Deep Research Frontend

前端使用 React + TypeScript + Vite，负责：

- 登录 / 注册
- 学术搜索页面与分页筛选
- 报告生成页面
- 用户中心与偏好设置

## 运行要求

- Node.js 18+

## 安装依赖

Windows 下建议使用本地 npm 缓存，避免全局缓存目录权限问题：

```powershell
cd frontend
npm install --cache .npm-cache
```

## 启动开发环境

```powershell
cd frontend
npm run dev:client
```

默认地址：

```text
http://localhost:3000
```

## 后端地址

前端支持通过 Vite 环境变量配置 API 地址：

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

默认行为：

- 若设置了 `VITE_API_BASE_URL`，则请求该地址
- 若未设置且为开发环境，默认请求 `http://localhost:3001/api`
- 若未设置且为生产环境，默认请求 `/api`

## 常用命令

```powershell
npm run dev:client
npm run build:client
```

## 本地联调

联调时通常需要同时启动：

1. 后端：`cd backend && npm run dev`
2. 前端：`cd frontend && npm run dev:client`

然后访问：

```text
http://localhost:3000
```
