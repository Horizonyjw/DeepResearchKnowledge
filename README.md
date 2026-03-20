# DeepResearchKnowledge

一个学术搜索与报告生成网站，前端使用 React + Vite，后端使用 Express。  
当前项目的后端已经改为“外围适配”模式：

- 搜索能力接到 `backend/database` 里的 Python 爬虫逻辑
- 报告生成接到 `backend/API` 里的 Python / Dify 工作流逻辑
- `backend/API` 和 `backend/database` 目录本身不需要改动

## 项目结构

```text
DeepResearchKnowledge/
├─ frontend/              前端代码（React + Vite）
├─ backend/               Node.js 后端
│  ├─ src/                Express 路由与适配层
│  ├─ API/                报告生成与 PDF 处理 Python 逻辑
│  ├─ database/           论文抓取 Python 逻辑
│  ├─ storage/            用户数据与历史记录
│  └─ tests/              Postman / Newman / curl 测试
└─ README.md
```

## 运行前准备

### 1. 基础环境

- Node.js 18+（建议使用较新的 LTS）
- Python 3.10+
- Windows PowerShell 或其他终端

### 2. 后端 Python 依赖

后端虽然是 Node.js，但搜索和报告会调用 Python 代码，所以还需要安装 Python 依赖：

```powershell
cd backend/database
pip install paperscraper arxiv tqdm aiohttp aiofiles requests python-dotenv openai
```

`backend/API` 使用的代码也依赖 `requests` 等包，上面的安装通常已经覆盖。

### 3. 环境变量

后端使用 `backend/.env`。至少需要确认这些值：

```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace-with-strong-secret
API_KEY=your-valid-glm-api-key
```

说明：

- `API_KEY` 会被 `backend/database` 下的 Python 爬虫读取，用来把中文关键词转换成可搜索的学术查询。
- 如果这个 key 无效，中文搜索很可能直接返回 0 条结果。

## 启动方式

推荐开两个终端窗口，分别启动后端和前端。

### 1. 启动后端

```powershell
cd backend
npm install --cache .npm-cache
npm run dev
```

默认地址：

```text
http://localhost:3001
```

健康检查：

```text
http://localhost:3001/api/health
```

### 2. 启动前端

```powershell
cd frontend
npm install --cache .npm-cache
npm run dev:client
```

默认地址：

```text
http://localhost:3000
```

前端开发环境下默认会请求：

```text
http://localhost:3001/api
```

## 目前的真实调用链路

### 搜索

前端搜索页面会调用：

```text
GET /api/papers/search
```

后端流程：

1. `backend/src/routes/paper-routes.js` 接收请求
2. `backend/src/services/paper-service.js` 通过 Python 子进程调用 `backend/database/topic_crawler.py`
3. 如果 TopicCrawler 没拿到结果，再降级调用 `backend/database/daily_crawler.py`
4. 后端把 Python 返回的数据统一整理成前端需要的结构并分页返回

### 报告生成

前端报告页面会调用：

```text
POST /api/reports/generate
```

后端流程：

1. `backend/src/routes/report-routes.js` 接收请求
2. `backend/src/services/report-service.js` 通过 Python 子进程调用 `backend/API` 下的报告生成逻辑
3. Python 侧通过 Dify / SSE 工作流生成报告
4. 后端把结果返回给前端

## 常见问题

### 1. `npm install` 报 `EPERM`

Windows 下如果 npm 全局缓存目录在 `D:\Program Files\...`，很容易遇到权限问题。  
优先用本地缓存安装：

```powershell
npm install --cache .npm-cache
```

前后端都建议这样执行。

### 2. 前端能打开，但搜索不到结果

先检查两件事：

- 后端是否真的启动在 `http://localhost:3001`
- `backend/.env` 里的 `API_KEY` 是否有效

如果 `API_KEY` 失效，`backend/database` 里的中文关键词转换会失败，中文搜索大概率返回空结果。

### 3. 前端启动时报 `pnpm` 不存在

本项目前端建议直接使用：

```powershell
npm run dev:client
```

不要依赖全局 `pnpm`。

## 接口简表

### 认证与用户

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/users/me`
- `PUT /api/users/me`
- `PUT /api/users/me/password`
- `DELETE /api/users/me`
- `GET /api/users/me/preferences`
- `PUT /api/users/me/preferences`
- `GET /api/users/me/history`

### 学术搜索与报告

- `GET /api/papers/search`
- `POST /api/reports/generate`

## API 测试

后端目录已包含：

- Postman collection：`backend/tests/postman/DeepResearchBackend.postman_collection.json`
- curl 清单：`backend/tests/curl/curl-api-checklist.md`
- Newman 脚本：`backend/scripts/run-newman.js`

运行：

```powershell
cd backend
npm run test:api
```

CI 模式：

```powershell
npm run test:api:ci
```
