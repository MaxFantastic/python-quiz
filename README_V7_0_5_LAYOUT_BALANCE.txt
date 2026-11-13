Python Quiz V7.0.5 — Layout Balance Update

本次修复：
1. 撤销 V7.0.4 将 .app-shell 的 bottom 设为负安全区高度的做法。iOS WebView 会裁切超出视口的部分，导致底部 Dock 被遮挡。
2. 独立 App 的应用外框保持在实际 WebView 视口内；底部 Dock 锚定在应用外框底边，并预留 Home Indicator 安全区。
3. 独立 App 的页面根背景改为白色，使 WebView 视口之外的底部原生安全区与 Dock 背景连续，不再露出灰色条带。
4. 首页由 justify-content:center 改为 space-between，让 Hero、学习统计、练习入口和提示语均匀分布在标题栏与底部 Dock 之间。
5. “我的”页面也采用纵向分布；较短屏幕使用紧凑间距。

更新包文件：index.html、app.js、styles.css、sw.js、version.json、manifest.webmanifest。
questions.json 未修改，题目仍为 186 道。学习数据键仍为 pythonQuizIphone.v1。

更新方法：将本目录中的上述 6 个文件上传并覆盖 GitHub 仓库根目录同名文件，然后 Commit changes。等待 GitHub Pages 部署后，在原来的主屏幕 App 中检查更新。不要卸载原 App。

说明：已进行源代码语法、CSS 解析、题库数量和 ZIP 完整性检查；最终 iOS 实机效果仍需设备验证。
