Python Quiz V3 — 保留旧学习记录的升级补丁

目标：不删除主屏幕 App、不清空 Safari 数据、不改变 localStorage 键。

1. 电脑上进入 https://github.com/MaxFantastic/python-quiz
2. Add file -> Upload files
3. 上传 ZIP 解压后的四个文件：index.html、app.js、styles.css、sw.js
4. GitHub 如果询问替换同名文件，确认提交 Commit changes。
5. 等待 Pages 部署成功（Settings -> Pages）。
6. iPhone 保持联网，打开原来的主屏幕题库，尽量让它在前台停留片刻。
7. 如果页面刷新到 V3，先点击“备份学习记录”，保存到 iPhone「文件」App，再检查错题和统计。
8. 如果仍停留在70道，请勿卸载和清理网站数据。可以稍后再次联网打开让 Service Worker 检查新版。

重要说明：
- 修复只能在旧 App 成功检查并激活新版 Service Worker 后生效。iOS 可能延迟检查；不能保证立即修好。
- 这个补丁不会调用 localStorage.clear()、removeItem()、unregister()，也不会替换存储键。
- Safari 网页版的学习记录与主屏幕版记录在 iOS 上可能彼此独立，所以要在原来的主屏幕 App 内导出。
- 如果始终不触发更新，可能需要用 Mac 的 Safari Web Inspector 远程检查原 App 的 Service Worker 状态，或待完成记录备份后再考虑重新安装。
