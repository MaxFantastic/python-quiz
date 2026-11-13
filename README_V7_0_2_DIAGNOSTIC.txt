Python Quiz V7.0.2 iOS 布局诊断版

这不是又一次盲目调整底部 margin 的版本。本次先采集 iPhone 主屏幕 App 的真实运行数据，以确认 iOS 27.2 下实际 WebView/visualViewport 的边界。

更新方法：
1. 解压本包。
2. GitHub 仓库 -> Add file -> Upload files。
3. 覆盖 index.html、app.js、styles.css、sw.js、version.json、manifest.webmanifest。
4. Commit changes，等待 Pages 部署。
5. 在原来的主屏幕 App 中更新，不要卸载。
6. 打开“我的”标签，点击“查看 iPhone 屏幕布局诊断”，将弹窗截图发回。

诊断信息包括：display mode、navigator.standalone、screen.height、innerHeight、visualViewport、safe-area、app-shell 和 bottom-tabs 的实际坐标。

数据安全：继续使用 pythonQuizIphone.v1；不改 questions.json，不清理 localStorage，不修改题目 ID。
