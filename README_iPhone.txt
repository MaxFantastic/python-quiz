Python 选择题训练 · iPhone 版 V2

更新日期：2026-11-13
题库规模：186 道（原始习题 70 道 + 新增课件精选 116 道）

题目来源：
- 原始《习题1》至《习题6》：70 题，原题 ID 保持不变。
- 新增《第0讲 绪论》：12 题。
- 新增《第1讲 基础知识》：24 题。
- 新增《第2讲 算法和顺序结构》：14 题。
- 新增《第3讲 选择结构》：16 题。
- 新增《第4讲 循环结构》：19 题。
- 新增《第5讲 列表》：31 题。

新增内容：
1. 首页题目总数自动从题库数据获取，不再写死 70。
2. 旧习题章节与新课件专项分开展示。
3. 每一道课件新题提供答案解析和原课件页码。
4. 更新离线缓存策略与版本号，避免长期使用旧题库缓存。
5. 继续使用旧版保存键 pythonQuizIphone.v1，保留旧错题和学习统计。

更新已有 GitHub Pages：
1. 使用 Python_Quiz_Update_V2.zip（包含 6 个文件）。
2. 解压后在 GitHub 仓库 MaxFantastic/python-quiz 的 Code 页面选择 Add file -> Upload files。
3. 把解压出的六个文件上传到仓库根目录（不是整个 zip）：
   questions.json、index.html、app.js、styles.css、sw.js、README_iPhone.txt。
4. GitHub 对同名文件进行替换/覆盖，核对变更后点击 Commit changes。
5. 等待 Actions/Pages 显示部署成功。
6. 在 iPhone 的 Safari 打开 https://maxfantastic.github.io/python-quiz/ ，刷新后应看到 186 QUESTIONS。
7. 已添加到主屏幕的旧 App 无需重新安装。若仍显示 70 题，请先联网、关闭 App、在 Safari 刷新网址，再重新打开 App；不要清除 Safari 网站数据，以免丢失统计。

注意：
- 练习记录保存于本机浏览器 localStorage，不会自动同步到其他设备，也不会上传到 GitHub。
- 沿用原网址与保存键可读取已有记录，但 iOS 在储存空间紧张时可能会清除离线缓存。
- 如从头上传新仓库，请改用 Python_Quiz_Complete_V2.zip，保留 icons 文件夹，确保 index.html 在仓库根目录。
- 原习题中存在答案争议的题仍按照旧版规则显示与处理；新增课件题已经给出单选答案与解析。
