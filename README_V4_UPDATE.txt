Python Quiz V4 — GitHub 手动更新版（保留学习记录）

本补丁包含：index.html、app.js、styles.css、sw.js、questions.json、version.json、manifest.webmanifest。
icons 文件夹继续使用仓库中已有的图标，不需要替换。

上传步骤：
1. 在电脑上解压本 ZIP。
2. 打开 https://github.com/MaxFantastic/python-quiz
3. Add file -> Upload files。
4. 把解压目录中的上述 7 个文件上传到仓库根目录，替换同名文件。
5. Commit changes，等待 GitHub Pages 部署完成。
6. 在原 iPhone 主屏幕 App 中联网打开。如果旧版已成功更新到 V4，首页会出现“从 GitHub 检查并获取更新”按钮。
7. 点击按钮，会读取公开仓库的 version.json，然后调用 Service Worker update 检查；新 Worker 会从 GitHub Pages 获取最新版文件并激活。

重要：
- 学习记录仍使用 localStorage 键 pythonQuizIphone.v1。
- 不调用 localStorage.clear()、removeItem()，不清除 Safari 数据，不删除主屏幕 App。
- 更新 Service Worker 只清理本程序的 Cache Storage，不会清除 localStorage 学习记录。
- Safari 与主屏幕网页 App 的存储空间在 iOS 上可能隔离；备份必须在原来的主屏幕 App 内执行。
- 如果主屏幕 App 仍是完全没有 V4 按钮的旧界面，说明 V4 还没有进入该 App 的上下文。此时按钮无法从旧版页面凭空出现；先不要卸载。请将此现象截图发回，我们再诊断 iOS Service Worker 是否检查到新脚本。
- 版本检查地址：https://raw.githubusercontent.com/MaxFantastic/python-quiz/main/version.json
- 仓库：https://github.com/MaxFantastic/python-quiz
