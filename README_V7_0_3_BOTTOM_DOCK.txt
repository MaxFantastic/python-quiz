Python Quiz V7.0.3 底部导航修复

本次修复：
1. iOS 主屏幕独立 App 的底部导航背景延伸到视口最底部。
2. Home Indicator 安全区由白色 dock 背景覆盖；可点击的四个标签按钮仍位于安全区上方，不会被 Home Indicator 遮挡。
3. Safari 浏览器模式保持原有底部布局，不受此次修改影响。
4. 版本号更新为 V7.0.3，Service Worker 缓存版本同步递增。

GitHub 更新：
将本压缩包中的 index.html、app.js、styles.css、sw.js、version.json、manifest.webmanifest 上传到仓库根目录并覆盖同名文件，提交后等待 GitHub Pages 部署。

不要删除 questions.json。不要卸载原来的 iPhone 主屏幕 App。

学习记录兼容：仍使用 pythonQuizIphone.v1，不主动清除或覆盖本地学习记录。
