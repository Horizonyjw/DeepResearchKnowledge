# Knowledge Platform MVP

最小闭环：深度检索证据包 -> OpenManus (stub) -> 可追溯引用报告。

## 运行方式
1. 复制环境变量：
   ```bash
   cp .env.example .env
   ```
2. 编辑 `.env` 并填入 `OPENAI_API_KEY`（即使当前 stub 不使用也保留）。
3. 启动服务：
   ```bash
   docker compose up -d --build
   ```
4. 打开 API 文档：<http://localhost:8000/docs>
5. 创建报告任务：`POST /api/v1/reports`
6. 轮询 `GET /api/v1/reports/{report_id}` 直到 `SUCCEEDED`

## 说明
- Retrieval 任务生成假数据并写入 MinIO + Postgres。
- OpenManus runner 当前为 stub 实现，可替换为真实调用。
- Alembic 配置已提供，当前在应用启动时执行 `create_all`。
