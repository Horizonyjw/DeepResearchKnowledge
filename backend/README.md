# DeepResearch Backend

这是项目的 Node.js 后端，负责：

- 用户注册、登录、账号管理
- 用户偏好设置与历史记录
- 调用 `backend/database` 的 Python 搜索逻辑
- 调用 `backend/API` 的 Python 报告生成逻辑

注意：当前后端已经不再使用旧的 OpenAlex + 本地样例论文模式，而是通过适配层接入现有 Python 代码。

## 目录说明

```text
backend/
├─ src/            Express 路由、鉴权、中间层、Python 适配层
├─ API/            既有 Python 报告接口逻辑（不要直接改动）
├─ database/       既有 Python 搜索接口逻辑（不要直接改动）
├─ storage/        用户数据与历史记录
├─ tests/          Postman / Newman / curl 测试
└─ README.md
```

## 运行依赖

### Node 依赖

```powershell
cd backend
npm install --cache .npm-cache
```

### Python 依赖

搜索和报告会调用 Python，因此需要安装：

```powershell
cd backend/database
pip install paperscraper arxiv tqdm aiohttp aiofiles requests python-dotenv openai
```

## 环境变量

后端读取 `backend/.env`。

示例：

```env
PORT=3001
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
API_KEY=your-valid-glm-api-key
PYTHON_SEARCH_TIMEOUT_MS=30000
PYTHON_REPORT_TIMEOUT_MS=120000
```

说明：

- `API_KEY` 供 `backend/database` 中的 Python 爬虫使用，用于中文关键词转换。
- 如果 `API_KEY` 无效，中文搜索会很容易返回 0 条结果。

## 启动后端

```powershell
cd backend
npm run dev
```

默认地址：

```text
http://localhost:3001
```

健康检查：

```text
GET http://localhost:3001/api/health
```

## 前端联调方式

前端默认开发地址是：

```text
http://localhost:3000
```

前端默认会请求：

```text
http://localhost:3001/api
```

因此本地联调时通常需要同时启动前后端。

## 当前后端实现

### 1. 认证与用户

接口：

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
- `DELETE /api/users/me/history/:id`
- `DELETE /api/users/me/history`

存储：

- 用户、偏好、历史记录保存在 `backend/storage/users.json`

### 2. 搜索接口

接口：

```text
GET /api/papers/search
```

后端流程：

1. `src/routes/paper-routes.js` 解析 query / page / pageSize / filters
2. `src/services/paper-service.js` 调用 Python bridge
3. Python bridge 启动 `backend/database/topic_crawler.py`
4. 如果主搜索为空，再降级调用 `backend/database/daily_crawler.py`
5. 将结果归一化为前端需要的字段并分页返回

返回结构核心字段：

- `results`
- `total`
- `page`
- `pageSize`
- `facets`

### 3. 报告接口

接口：

```text
POST /api/reports/generate
```

后端流程：

1. `src/routes/report-routes.js` 接收 query / papers / reportType
2. `src/services/report-service.js` 通过 Python bridge 调用 `backend/API`
3. Python 侧走 Dify / SSE 工作流生成报告
4. 若外部报告流程失败，后端返回本地 fallback 报告，避免接口直接报错

## 开发说明

### 适配层原则

为了对齐已有 Python 代码，后端只在 `src/` 下做适配：

- 不修改 `backend/API`
- 不修改 `backend/database`
- Node 只负责鉴权、参数整理、子进程调用、结果格式化、历史记录写入

### Python bridge

关键文件：

- `src/services/python-bridge.js`

作用：

- 启动 Python 子进程
- 设置工作目录
- 控制超时
- 从带标记的 stdout 中提取 JSON / 文本结果
- 避免把 Python 日志误当成接口返回值

## API 测试

### Postman / Newman

```powershell
cd backend
npm run test:api
```

CI 模式：

```powershell
npm run test:api:ci
```

### 相关文件

- `backend/tests/postman/DeepResearchBackend.postman_collection.json`
- `backend/tests/postman/DeepResearchBackend.local.postman_environment.json`
- `backend/tests/curl/curl-api-checklist.md`

## 常见问题

### 1. `npm install` 权限报错

使用本地缓存安装：

```powershell
npm install --cache .npm-cache
```

### 2. 搜索返回 0 条

优先检查：

- `backend/.env` 里的 `API_KEY` 是否有效
- Python 依赖是否安装完整
- 后端日志里是否有 Python 报错或超时

### 3. 报告生成失败

优先检查：

- `backend/API/config.py` 中配置的外部工作流接口是否可用
- 本机网络是否能访问 Dify / SSE 接口
- 后端日志里是否有 Python 调用错误
