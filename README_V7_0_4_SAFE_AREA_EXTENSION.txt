Python Quiz V7.0.4 — iOS 独立 App 底部空白修复

本次根据 iPhone 实机诊断数据修复：
- screen.height = 874 CSS px
- window.innerHeight = 812 CSS px
- safe-area-inset-top = 62 CSS px
- safe-area-inset-bottom = 34 CSS px

根因：V7.0.3 的 .app-shell 仍然只覆盖 812px 的布局视口；底部 Dock 虽然延伸到容器底部，但容器本身比屏幕短 62px。

修复：仅在 display-mode: standalone 下保持 top:0，并将 bottom 设为 0 - env(safe-area-inset-top)，让根容器向下延伸缺失的 62px。底部 Dock 继续使用 safe-area-inset-bottom 保留 Home Indicator 区域。Safari 模式不受影响。

GitHub 更新：把本包内 index.html、app.js、styles.css、sw.js、version.json、manifest.webmanifest 上传到仓库根目录并覆盖同名文件，然后 Commit changes。不要上传/覆盖 questions.json。

数据安全：APP_VERSION 更新为 7.0.4；STORAGE_KEY 仍为 pythonQuizIphone.v1，不清除本地学习记录。不要卸载原 App。
