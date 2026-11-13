Python Quiz V7.0.1 热修复更新说明

本次修复两个问题：
1. 版本检测不再把远端旧版 V6 当成新版。现在同时读取 GitHub Pages 与 raw GitHub 的 version.json，选择较高的语义版本；若远端版本低于本机版本，会明确提示版本文件过旧，不会提示更新到旧版。
2. iOS 主屏幕独立 App 不再用 window.innerHeight 计算固定像素高度。standalone 模式使用 fixed inset:0 填满完整 WebView，并在底部只预留 env(safe-area-inset-bottom) 安全区，使底部标签栏贴近屏幕下沿但避开 Home Indicator。Safari 模式仍使用 visualViewport，避开浏览器工具栏。

上传方法：
1. 解压本包。
2. 在 GitHub 仓库根目录选择 Add file -> Upload files。
3. 上传并覆盖 index.html、app.js、styles.css、sw.js、version.json、manifest.webmanifest。
4. README_V7_0_1_HOTFIX.txt 可选，不影响程序。
5. Commit changes，等待 GitHub Pages 完成部署。
6. 在原 iPhone 主屏幕 App 中点击更新/下拉刷新。不要卸载 App。

数据安全：
- 沿用 localStorage 键 pythonQuizIphone.v1。
- 不删除 localStorage，不更改题目 ID，不覆盖 questions.json。
- 建议更新前仍在「我的」页面导出一次学习记录备份。

如果更新检测仍显示旧版本，请先检查 GitHub 仓库根目录 version.json 的 version 是否为 7.0.1，并确认 Pages 部署完成。
