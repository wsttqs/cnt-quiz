# 部署到 GitHub Pages

本项目为**纯静态站点**（零依赖、零构建），仓库根目录即源码仓库，发布内容为 `web/` 目录。

**当前线上地址**：https://wsttqs.github.io/cnt-quiz/

## 一、发布产物

| 路径 | 说明 |
| --- | --- |
| `web/` | **站点根目录**，最终导致 `https://<用户名>.github.io/<仓库名>/` |
| `web/.nojekyll` | 关闭 Jekyll 处理，保证 `_` 开头的目录不被忽略 |
| `.github/workflows/pages.yml` | GitHub Actions 自动部署工作流 |

## 二、首次发布

1. 在 GitHub 新建仓库（**选 Public**，见下方说明）
2. 推送本仓库代码（如：`git push`）
3. 工作流已配置 `enablement: true`，**首次 push 会自动开启 Pages**，无需手动设置
   - 若提示未自动开启：进入 **Settings → Pages → Build and deployment → Source 选 GitHub Actions**
4. Actions 跑完（约 1 分钟）后访问 `https://wsttqs.github.io/<仓库名>/`

> ⚠️ **首次推送的常见报错**：如果第 1 次工作流停在 `Configure Pages` 步骤失败，说明仓库里还没有 Pages 站点实例。
> 解决：进入 **Settings → Pages → Build and deployment → Source 选 `GitHub Actions`** 手动开启一次，
> 再回到 **Actions** 页面点 `Deploy to GitHub Pages` 工作流的 **Re-run all jobs**，约 1 分钟即可发布成功。

## 三、后续更新

```bash
git add -A
git commit -m "your message"
git push
```

推送后 Actions 自动重新发布，约 1 分钟生效。

## 四、本地预览

```bash
node web/tools/serve.js 5173
# 打开 http://localhost:5173/
```

## 五、注意事项

- **仓库必须设为 Public**：GitHub 免费账号的 Private 仓库不支持 GitHub Pages（需 GitHub Pro）。本项目无敏感数据，建议开放。
- 站点内所有资源均为**相对路径**，已适配 `https://<用户名>.github.io/<仓库名>/` 子路径部署。
- `web/404.html` 内置了**站点根目录探测**：GitHub Pages 会在「请求的原路径」上返回 404.html，即使缺失路径含多级目录，样式与链接仍能正确解析。
- 仓库里的 `preview/、`docs/、`scripts/` 不影响站点发布，仅作为项目资料保留。
