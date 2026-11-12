Python 选择题训练 · iPhone 版

内容：根据《习题1》至《习题6》整理的 70 道选择题。

如何在 iPhone 上使用：
本项目是静态网页/PWA，不是 App Store 安装包。要使用“添加到主屏幕”和离线缓存，需要先通过 HTTPS 网站打开。

推荐：GitHub Pages（免费）
1. 在电脑上解压本压缩包。
2. 登录 GitHub，新建一个 Public repository，例如 python-quiz。
3. 将本文件夹里的所有内容（index.html、app.js、styles.css、questions.json、manifest.webmanifest、sw.js、icons 文件夹）上传到仓库根目录。注意不要只上传外层文件夹。
4. 打开仓库 Settings → Pages。
5. 在 Build and deployment 中选择 Deploy from a branch；Branch 选择 main，目录选择 /(root)，保存。
6. 等待部署完成，GitHub 会给出一个 https://用户名.github.io/python-quiz/ 网址。
7. 在 iPhone 上用 Safari 打开该网址，点击分享按钮 → 添加到主屏幕 → 添加。

使用说明：
- 全部题目：70 题随机练习。
- 章节练习：按习题 1 至习题 6 练习。
- 错题复习：自动收集做错的题目。
- 进度、统计、错题记录保存在当前设备浏览器本地（localStorage），不会上传。
- 首次成功打开并加载完成后，Service Worker 会缓存题库文件；之后可离线打开。iOS 可能会在系统存储压力下清理网站缓存，建议偶尔联网打开一次。
- 如需清空统计和错题：在 iPhone 设置中清除 Safari 对应网站数据；目前界面不提供一键清空，避免误删学习记录。

题目说明：
部分原题存在答案标注疑点或多个正确选项，程序会提示并将争议题排除在正确率计算之外。题目文字及选项依据用户提供的六份习题整理。
