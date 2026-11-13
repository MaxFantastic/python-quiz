Python Quiz V7.0.0 更新说明

本次重点修复 iOS 屏幕布局：
1. Safari 浏览器模式：读取 visualViewport 的高度与偏移量，内容区域止于 Safari 实际可视区域，不会被底部地址栏/工具栏遮挡。
2. iPhone 主屏幕独立 App 模式：通过 navigator.standalone / display-mode: standalone 识别独立 App，使用完整 WebView 高度，不再沿用 Safari 浏览器模式的视口尺寸。
3. safe-area-inset-top / bottom 单独处理：顶部避开状态栏与灵动岛区域，底部避开 Home Indicator。
4. 应用外框改为 fixed 视口框架；主内容区 flex:1，底部标签栏 flex-shrink:0，自然贴合实际可视区域底部安全区。
5. 顶部版本信息加大并增加高度；保留现有字号整体调整。

数据安全：
- 仍然使用 localStorage 键 pythonQuizIphone.v1。
- 不清除 localStorage、错题、答题统计或练习进度。
- 保留 186 道题及自动更新逻辑。

上传：将本包内全部文件上传到 GitHub 仓库根目录，覆盖同名文件。建议连同 manifest.webmanifest、version.json 一起上传。等待 GitHub Pages 发布后，在原 iPhone 主屏幕 App 中点击刷新/检查更新。不要删除旧 App。

验证说明：已进行静态检查与桌面浏览器视口模拟。iOS standalone 实机的 safe-area / visualViewport 行为仍需在用户设备确认。
