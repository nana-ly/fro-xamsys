# 剩余任务交接文档

> 本文档包含本项目未解决的问题清单和已完成的功能记录。

---

## 目录

- [未解决问题](#未解决问题)
- [已完成功能](#已完成功能)
- [附录：关键文件路径速查](#附录关键文件路径速查)

---

## 未解决问题

| 优先级 | 问题 | 涉及文件 | 说明 |
|--------|------|---------|------|
| **高** | 错题本"标记已掌握"按钮无反应 | `WrongBook.vue`、后端 `WrongQuestionMasterView` | 点击后界面无变化，API 调用可能失败或前端状态未更新 |
| **高** | 错题本右下角"自主添加错题"不行 | `WrongBook.vue`、后端 `WrongQuestionAddView` | 弹窗表单提交后无反应 |
| **高** | 做题历史记录只显示部分题目 | `History.vue`（`/student/history`）、`PracticeRecordView` | 写了 10 题只显示 2 题，可能是分页或数据加载问题 |
| **中** | 个人主页缺少信息编辑 | `Profile.vue` | 缺少真实姓名、电话号码、邮箱的填写/编辑功能；缺少"忘记密码"功能 |
| **中** | 教师端试卷预览无选项 | `CreateExam.vue` 的预览弹窗 | 预览试卷时题目显示正常但选项（A/B/C/D）不显示 |
| **低** | 学生端/教师端前端优化 | 全局 | 界面细节、交互体验、响应式适配等 |
| **低** | 热力图数据不对应 | `StudyHeatmap.vue` | 图表能显示但数据与实际做题情况不匹配 |
| **低** | 教师端 AI 出题多选题只能生成单选 | `apps/student/views.py` AI Prompt | Prompt 要求多选题返回多答案，但 AI 仍返回单答案 |

---

## 已完成功能

| 步骤 | 内容 |
|------|------|
| Step 1 | 数据库模型：`question_ai` 表、`WrongQuestion` 扩展字段（`source_type`/`source_id`）、`PracticeRecord` 表 |
| Step 2 | AI 出题（教师端弹窗 + `target_library` 参数）、编辑回填修复、AI 出题超时 30s |
| Step 3 | 练习模式（从题库选题 + AI 智能出题）、AI 问答 `source_type` 支持、做题记录保存 |
| Step 4 | ExamPage.vue Bug 修复（计时器、选项反馈、答案解析返回、显示时机、AI 按钮时机） |
| Step 5 | 练习模式支持全部题型（单/多选/判断/填空/简答的渲染+比较逻辑） |
| Step 6 | 热力图 ECharts 初始化修复（`proxy.$echarts` → `import * as echarts`） |
| Step 7 | 多选题交互修复（checkbox + 提交按钮 + 不自动判断） |
| Step 8 | 判断题答案映射（`A/B` → `正确/错误`），`WrongQuestionSerializer` 重写（兼容 null question） |
| Step 9 | 练习模式答错自动加入错题本 |
| Step 10 | AI 出题 Prompt 改进（多选题强制多答案，无内容自动降级单选择） |
| Step 11 | 教师端搜索筛选（difficulty 字符串→整数、type 前端值→后端值） |
| Step 12 | 教师端多选题答案修复（`answerArray` 数组 ↔ `answer` 逗号分隔字符串） |
| Step 13 | AI 出题改为循环调用（每次 1 题，N 次循环，实时进度提示） |
| Step 14 | 练习模式独立页面 `PracticePage.vue`：从题库选题 + AI 出题入口、`isAnswerCorrect` 比较函数、判断题 `正确/错误`、答案/解析显示、错题本联动、刷新保持结果 |
| Step 15 | 学生端 API 增强：`getPracticeQuestions`、`savePracticeRecord`、`getPracticeRecords`、`submitPracticeAnswers` |
| Step 16 | 教师端 `ExamList.vue`：开始/结束时间从 `published_at` + `duration` 计算、状态正确分类（未发布/进行中/已结束） |
| Step 17 | `ExamPage.vue` 计时器 localStorage 持久化（刷新不归零）、交卷后答案/解析从后端 `details` 合并显示 |
| Step 18 | 智能组卷缺题自动补充（同题型→同题型其他难度→任意题型兜底） |
| Step 19 | 题库管理分页序号跨页累计（`:index="calcIndex"`）、列表按 `-created_at` 倒序 |
| Step 20 | 教师端 AI 出题循环调用 + 数量输入框 + 进度提示 |
| Step 21 | 教师端 AI 出题超时 60s、题型/难度列使用后端 `question_type_display`/`difficulty_display` |
| Step 22 | 编辑弹窗难度不回显修复（`difficulty` 整数 → 前端字符串映射） |
| Step 23 | 搜索筛选 `difficulty`/`type` 参数转换、修复 `medium 不在可用选项中` 报错 |
| Step 24 | 登录角色校验（学生账号不能登录教师端，反之亦然） |
| Step 25 | 多标签页路由跳转干扰修复（角色不匹配时跳转 `/login` 而非另一端） |
| Step 26 | 退出登录后跳转对应角色登录页（教师→`/login?role=teacher`，学生→`/login?role=student`） |
| Step 27 | CSS 变量 fallback：`RoleSelect.vue`、`Login.vue`、`Register.vue` 背景/卡片颜色冲突修复 |
| Step 28 | 智能组卷总分显示修复（`Number()` 避免字符串拼接 `05.05.0...`）、题目列表 `max-height` 滚动 |
| Step 29 | 发布试卷报错修复（编辑模式只发后端支持的字段，去除 `start_time`/`end_time`/`pass_score`） |
| Step 30 | 判断题 `judge`/`true_false` 双类型兼容（`PracticePage.vue` 模板 + `typeLabel`） |

---

## 附录：关键文件路径速查

### 后端

| 文件路径 | 说明 |
|----------|------|
| `backend/exam/settings.py` | Django 配置，数据库、`ZHIPU_API_KEY` |
| `backend/exam/urls.py` | 根路由 |
| `backend/question_bank/models.py` | `Question`、`QuestionAI` 模型 |
| `backend/question_bank/serializers.py` | 题目序列化器（含 `score` 字段） |
| `backend/question_bank/views.py` | 题目 CRUD ViewSet |
| `backend/exam_core/models.py` | `ExamPaper`、`ExamRecord`、`WrongQuestion`、`PracticeRecord` |
| `backend/exam_core/views.py` | 考试核心逻辑 ViewSet |
| `backend/exam_core/urls.py` | 考试核心路由 |
| `backend/apps/student/views.py` | 学生端 API 视图 |
| `backend/apps/student/urls.py` | 学生端路由 |
| `backend/apps/student/serializers.py` | 学生端序列化器 |
| `backend/users/views.py` | 用户认证 ViewSet |
| `backend/users/serializers.py` | 用户序列化器 |

### 前端

| 文件路径 | 说明 |
|----------|------|
| `frontend/src/main.js` | 应用入口，注册 Element Plus、ECharts |
| `frontend/src/router/index.js` | 路由配置（含导航守卫） |
| `frontend/src/store/index.js` | Vuex 状态管理 |
| `frontend/src/api/student.js` | 学生端 API 函数（独立 axios 实例） |
| `frontend/src/api/teacher.js` | 教师端 API 函数 |
| `frontend/src/utils/request.js` | 教师端 axios 实例（10s 超时） |
| `frontend/src/views/student/StudentHome.vue` | 学生首页（练习入口 + AI 出题） |
| `frontend/src/views/student/PracticePage.vue` | 练习模式答题页 |
| `frontend/src/views/student/ExamPage.vue` | 考试模式答题页 |
| `frontend/src/views/student/WrongBook.vue` | 错题本 |
| `frontend/src/views/student/Profile.vue` | 个人中心（需重写） |
| `frontend/src/views/student/History.vue` | 学习历史记录 |
| `frontend/src/views/teacher/QuestionBank.vue` | 教师题库管理 |
| `frontend/src/views/teacher/CreateExam.vue` | 智能组卷 / 创建试卷 |
| `frontend/src/views/teacher/ExamList.vue` | 试卷管理列表 |
| `frontend/src/layouts/TeacherLayout.vue` | 教师端布局 |
| `frontend/src/layouts/StudentLayout.vue` | 学生端布局 |
| `frontend/src/views/auth/Login.vue` | 登录页 |
| `frontend/src/views/auth/Register.vue` | 注册页 |
| `frontend/src/views/auth/RoleSelect.vue` | 身份选择页 |
| `frontend/src/components/StudyHeatmap.vue` | ECharts 热力图组件 |
| `frontend/src/components/AIAnswerModal.vue` | AI 问答弹窗组件 |

### 数据库表

| 表名 | 对应 Django 模型 | 说明 |
|------|-----------------|------|
| `questions` | `Question` | 主题库题目（含 `score` 字段） |
| `question_ai` | `QuestionAI` | AI 练习库题目 |
| `wrong_questions` | `WrongQuestion` | 错题本（含 `source_type`、`source_id`） |
| `practice_records` | `PracticeRecord` | 练习做题记录 |
| `exam_records` | `ExamRecord` | 考试/练习批记录 |
| `answer_details` | `AnswerDetail` | 答题详情 |
| `exam_papers` | `ExamPaper` | 试卷 |
| `exam_paper_questions` | `ExamPaperQuestion` | 试卷-题目关联 |
| `users` | `User`（自定义） | 用户（含 `role`、`phone`、`real_name`） |
| `classes` | `Class` | 班级 |
| `student_classes` | `StudentClass` | 学生-班级关联 |
