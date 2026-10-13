# 元见 MCP｜WorkBuddy 定制主题操作步骤

> 适用：WorkBuddy 远程 MCP
>
> 当前内网地址：`http://192.168.218.220:3100/api/mcp`

## 1. 添加 MCP

在 WorkBuddy 中打开 **设置 → MCP / 工具 → 添加远程 MCP**（不同版本名称可能略有区别）。

填写：

| 配置项 | 内容 |
|---|---|
| 名称 | `元见` |
| 类型 | `Streamable HTTP` / `远程 HTTP` |
| URL | `http://192.168.218.220:3100/api/mcp` |
| 首次 Token | 先留空 |

保存并连接。首次不填 Token 是正常流程。

健康检查地址：`http://192.168.218.220:3100/api/health`。看到 `"ok":true` 和 `"db":"ok"` 才继续。

## 2. 引导定制主题

在 WorkBuddy 对话框粘贴：

```text
请接入元见 MCP。先调用 yuanjian_start_topic_setup，按问卷方式引导我选择：关注方向、阅读目标、信息深度、阅读频率和细分主题。确认前先把最终主题列表展示给我，不要提前查询情报。
```

首次应先看到两个初始化工具：`yuanjian_start_topic_setup`、`yuanjian_confirm_topic_setup`。

可以这样回答：

```text
关注方向：AI 产品与技术、AI 产业与基础设施
阅读目标：快速了解行业变化
信息深度：标准简报
阅读频率：每日精选
细分主题：大模型动态、AI Agent、AI 产品、算力基础设施、AI 产业与政策
```

确认无误后粘贴：

```text
主题确认无误，请调用 yuanjian_confirm_topic_setup 生成我的专属 Token。
```

## 3. 配置 Token

Token 只显示一次，立即复制保存，不要发到群聊或截图中。

- 有 **Bearer Token** 输入框：只填写 Token 本身；
- 只能填请求头时填写：`Authorization: Bearer <你的Token>`；
- 不要写成 `Bearer Bearer ...`。

保存后执行 **断开 → 重新连接**。仅刷新对话通常不算重新连接。

## 4. 验证画像生效

重新连接后应看到 7 个情报工具：

```text
yuanjian_get_latest
yuanjian_search
yuanjian_get_hot_topics
yuanjian_get_story
yuanjian_get_daily
yuanjian_get_weekly
yuanjian_get_monthly
```

然后粘贴：

```text
请按我的主题画像查询最近 24 小时的精选情报，最多 8 条，给出标题、来源、摘要、关注理由和原文链接。
```

再验证全量查询：

```text
请查询全部公开分类的最近 7 天情报，不要只按我的主题画像筛选。
```

第一条应按画像返回，第二条使用 `scope=all` 返回全部公开范围。出现“已按你的关注方向定制”即可视为画像生效。

## 5. 当前更新边界

当前 MCP 支持 **首次问卷定制并生成 Token**。已有 Token 后，MCP 暂时没有 `update_topic` 工具，不能让 Agent 调用不存在的更新工具。

如需修改已有主题：保留原 Token，联系服务维护人通过网页画像功能或后台更新，更新后重新连接 WorkBuddy 验证。

## 6. 常见问题

| 问题 | 处理 |
|---|---|
| 只看到 2 个工具 | 完成问卷，并重新连接 MCP |
| 返回 401 | 检查 Token 是否完整，是否重复写了 `Bearer` |
| 看不到服务 | 确认连接公司办公 Wi-Fi，不是访客网络 |
| 暂无内容 | 改查最近 7 天，或使用 `scope=all` |
| 地址打不开 | 联系维护人检查 Docker、电脑和内网 IP |

## 7. 完成标准

- [ ] 连接正确 MCP 地址；
- [ ] 无 Token 时看到 2 个初始化工具；
- [ ] 完成主题问卷并生成 Token；
- [ ] 配置 Token 后重新连接；
- [ ] 看到 7 个情报工具；
- [ ] 成功查询一条按主题定制的情报。
