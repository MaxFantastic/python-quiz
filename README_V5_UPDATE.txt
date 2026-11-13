Python Quiz V5 更新包

本版新增：
1. 页面最顶部固定显示版本号 V5.0.0。
2. 首页、课堂习题、课件专项、学习记录使用底部四标签导航；主要页面固定在一屏内，不再整页上下滚动。
3. 在屏幕顶部向下拖动并松开（约 72px）即可检查 GitHub 最新版本。
4. App 启动、从后台回到前台超过 5 分钟、网络恢复时也会自动检查版本。
5. 答题界面和结果界面使用独立单屏布局；较长题干/选项仅在题目卡片内部滚动，不带动整页。

学习记录安全：
- STORAGE_KEY 仍为 pythonQuizIphone.v1，与旧版本保持一致。
- 不调用 localStorage.clear() 或删除学习记录。
- Service Worker 只更新 Cache Storage，不会主动清除 localStorage。
- 更新前建议在「我的」页面导出 JSON 备份。

上传步骤：
1. 解压本 ZIP。
2. 打开 https://github.com/MaxFantastic/python-quiz
3. Add file -> Upload files。
4. 上传解压目录中的文件，替换仓库根目录同名文件；icons 文件夹也一并上传。
5. Commit changes，等待 GitHub Pages 发布。
6. 在原 iPhone 主屏幕 App 中保持联网，等待更新自动激活；若未自动切换，可尝试在页面顶部下拉松开。

注意：
- 不要删除旧 App 或清除网站数据，以免丢失本机学习记录。
- Safari 与主屏幕 Web App 在 iOS 上可能使用不同的本地存储容器；备份必须在原主屏幕 App 内执行。
- 当前版本号 V5.0.0；以后发布题库更新时应同步递增 version.json 的 version/build，并更改 sw.js 的 VERSION。
