# 剩余任务交接文档

> 本文档包含本项目剩余的开发任务，共 2 个步骤，包含后端和前端的完整修改方案。

---

## 目录

- [项目现状说明](#项目现状说明)
- [Step 5：个人中心真实数据 + 考试功能修复 + 控制台报错](#step-5个人中心真实数据--考试功能修复--控制台报错)
- [附录：关键文件路径速查](#附录关键文件路径速查)

---

## 项目现状说明

### 已完成的功能

| 步骤 | 内容 |
|------|------|
| Step 1 | 数据库模型：`question_ai` 表、`WrongQuestion` 扩展字段（`source_type`/`source_id`）、`PracticeRecord` 表 |
| Step 2 | AI 出题（教师端弹窗 + `target_library` 参数）、编辑回填修复、AI 出题超时 30s（如单次出 5 题仍超时可改为 60s） |
| Step 3 | 练习模式（从题库选题 + AI 智能出题）、AI 问答 `source_type` 支持、做题记录保存 |
| Step 4 | ExamPage.vue Bug 修复（计时器、选项反馈、答案解析返回、显示时机、AI 按钮时机） |
| Step 5 | 练习模式支持全部题型（单/多选/判断/填空/简答的渲染+比较逻辑） |
| Step 6 | 热力图 ECharts 初始化修复（`proxy.$echarts` → `import * as echarts`）（目前只能看见图，里面的数据好像不对应） |
| Step 7 | 多选题交互修复（checkbox + 提交按钮 + 不自动判断） |
| Step 8 | 判断题答案映射（`A/B` → `正确/错误`），`WrongQuestionSerializer` 重写（兼容 null question） |
| Step 9 | 练习模式答错自动加入错题本（调用 `POST /api/student/wrongbook/add/`）（错题本数量是对的，但是那个标记已掌握的按钮现在是坏的，点击后没有反应，然后那个自定义错题无法添加） |
| Step 10 | AI 出题 Prompt 改进（多选题强制多答案，无内容自动降级单选择） （这里ai教师端生成多选题就是只能生成出单选，这里要改） |
| Step 11 | 教师端搜索筛选（difficulty 字符串→整数、type 前端值→后端值） |
| Step 12 | 教师端多选题答案修复（`answerArray` 数组 ↔ `answer` 逗号分隔字符串） |
| Step 13 | AI 出题改为循环调用（每次 1 题，N 次循环，实时进度提示），避免单次请求超时 |

### 项目的当前文件状态

- **后端**：Django，MySQL 数据库（阿里云 RDS）
- **前端**：Vue 3 + Vite + Element Plus + ECharts
- **API 客户端**：教师端用 `utils/request.js`（10s 超时），学生端用 `api/student.js`（15s 超时，独立 axios 实例）
- **认证方式**：Token 认证（存 localStorage），CSRF Token（存 Cookie）
- **智谱 AI**：`ZHIPU_API_KEY` 环境变量，调用 `glm-4-flash` 模型
- **AI 出题策略**：改用**循环调用**，每次只生成 1 题。前端循环 N 次，每次 `count=1`，实时显示进度 `"正在生成第 i/N 题..."`。单次请求超时 30s 足够，避免一次生成多题超时。某题失败中止循环，已生成的仍可使用。

---

## Step 5：个人中心真实数据 + 考试功能修复 + 控制台报错

### 文件清单

| # | 文件 | 操作 | 说明 |
|---|------|------|------|
| 1 | `frontend/src/views/student/Profile.vue` | **重写** | 从后端获取真实数据、添加编辑功能、统计数据 |
| 2 | `frontend/src/api/student.js` | **已有** | `getCurrentUser()` 已存在，确认可用 |
| 3 | `backend/users/views.py`（AuthViewSet） | **可能修改** | 确认 `me` 接口返回 `real_name`、`phone`、`email` |
| 4 | `frontend/src/views/student/ExamPage.vue` | **修改** | 计时器 localStorage 持久化、交卷结果详细页 |
| 5 | `frontend/src/views/student/StudentHome.vue` | **修改** | 待考试卷提交后从列表移除 |
| 6 | `frontend/src/main.js` | **修改** | 添加 ResizeObserver 全局错误拦截 |

### 5.1 个人中心 — 获取真实用户信息

**确认后端 `/api/users/auth/me/` 返回字段**

在 `backend/users/views.py` 中找到 `AuthViewSet` 的 `me` action，确保返回：

```json
{
  "id": 1,
  "username": "student1",
  "real_name": "张三",
  "phone": "13800138000",
  "email": "student@example.com",
  "role": "student"
}
```

**前端 Profile.vue 修改要点：**

```javascript
// 引入 API
import { getCurrentUser } from '@/api/student'

// onMounted 中调用
async function loadProfile() {
  try {
    const res = await getCurrentUser()
    const user = res.data || res
    userName.value = user.real_name || user.username
    userInfo.value = {
      username: user.username,
      realName: user.real_name || '',
      phone: user.phone || '',
      email: user.email || '',
      role: user.role || 'student'
    }
  } catch (e) {
    console.error('获取用户信息失败', e)
  }
}
```

### 5.2 个人中心 — 编辑功能

**后端：添加用户信息更新接口**

```python
# backend/users/views.py - AuthViewSet
@action(detail=False, methods=['patch'])
def update_profile(self, request):
    """更新个人信息"""
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
```

若使用 `DefaultRouter`，路由自动为 `/api/users/auth/update_profile/`。

**前端 Profile.vue 编辑弹窗：**

```html
<div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
  <div class="edit-modal card">
    <h3>编辑个人信息</h3>
    <div class="form-group">
      <label>真实姓名</label>
      <input v-model="editForm.realName" type="text" />
    </div>
    <div class="form-group">
      <label>手机号</label>
      <input v-model="editForm.phone" type="text" />
    </div>
    <div class="form-group">
      <label>邮箱</label>
      <input v-model="editForm.email" type="email" />
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" @click="showEditModal = false">取消</button>
      <button class="btn btn-primary" @click="handleEditSubmit">保存</button>
    </div>
  </div>
</div>
```

API 调用示例：
```javascript
import { api } from '@/api/student'  // 或直接用 axios

async function handleEditSubmit() {
  try {
    await api.patch('/users/auth/update_profile/', {
      real_name: editForm.value.realName,
      phone: editForm.value.phone,
      email: editForm.value.email
    })
    // 刷新用户信息
    loadProfile()
    showEditModal.value = false
  } catch (e) {
    console.error('更新失败', e)
  }
}
```

> 注意：student.js 导出的 `api` 是 axios 实例。可以直接 `api.patch(...)` 调用，或自己 import axios。

### 5.3 个人中心 — 学习统计数据

当前 Profile.vue 使用全 mock 数据，需替换为真实 API：

| 统计项 | API 接口 | 计算方式 |
|--------|---------|---------|
| 参加考试数 | `GET /api/exam/records/` | `total` 或 `response.length` |
| 已完成考试 | `GET /api/exam/records/` | `filter(status='submitted' \|\| 'graded').length` |
| 平均分 | `GET /api/exam/records/` | 计算 `score` 字段平均值 |
| 错题数 | `GET /api/student/wrongbook/` | `data.length` |
| 已掌握 | `GET /api/student/wrongbook/?is_mastered=true` | 或在客户端 filter |
| 学习天数 | `GET /api/student/practice/records/` | distinct `created_at` 的日期数 |
| 正确率 | `GET /api/student/practice/records/` | `correct / total * 100` |

```javascript
import { getExamRecords, getWrongBook, getPracticeRecords } from '@/api/student'

async function loadStats() {
  try {
    const [examRes, wrongRes, practiceRes] = await Promise.all([
      getExamRecords(),
      getWrongBook(),
      getPracticeRecords({ page_size: 999 })
    ])
    const exams = examRes.data || []
    const wrong = wrongRes.data || []
    const practices = practiceRes.data?.results || []

    stats.value = {
      totalExams: exams.length,
      completedExams: exams.filter(e => e.status === 'submitted' || e.status === 'graded').length,
      avgScore: exams.length > 0 ? Math.round(exams.reduce((s, e) => s + parseFloat(e.score || 0), 0) / exams.length) : 0,
      wrongCount: wrong.length,
      masteredQuestions: wrong.filter(w => w.is_mastered).length,
      correctRate: practices.length > 0 ? Math.round(practices.filter(p => p.is_correct).length / practices.length * 100) : 0,
      studyDays: [...new Set(practices.map(p => p.created_at?.substring(0, 10)))].length,
      totalHours: Math.round(practices.length / 10)  // 粗略估计
    }
  } catch (e) {
    console.error('加载统计数据失败', e)
  }
}
```

### 5.4 计时器持久化（考试模式刷新不重置）

**位置**：`frontend/src/views/student/ExamPage.vue`

```javascript
const LOCAL_STORAGE_KEY = 'exam_timer_' + examId

async function loadExam() {
  // ... 获取试卷 ...

  if (isExamMode.value) {
    // 从 localStorage 恢复计时
    const savedTimer = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (savedTimer) {
      const startedAt = parseInt(savedTimer)
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      const totalSeconds = (examInfo.value?.duration || 120) * 60
      remainingSeconds.value = Math.max(0, totalSeconds - elapsed)
    }
    startTimer()
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval)

  // 考试模式首次启动时记录开始时间
  if (isExamMode.value && !localStorage.getItem(LOCAL_STORAGE_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString())
  }

  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      clearInterval(timerInterval)
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      if (isExamMode.value) confirmSubmit()
    }
  }, 1000)
}
```

### 5.5 交卷结果详细页

**需求**：交卷后显示每题的学生答案、正确答案、解析。

**实现思路**：
1. 后端 `SubmitAnswerView` 已经在返回中包含了 `details` 数组：`[{question_id, correct, correct_answer, explanation}, ...]`
2. 前端 `confirmSubmit` 中保存 `res.data.details` 到响应式变量
3. 在 `showResult` 模式下，将题目列表切换为"结果展示"模式

```html
<!-- ExamPage.vue 中新增结果详情区域 -->
<div v-if="showResult && isExamMode" class="result-detail-list">
  <div v-for="(q, idx) in questions" :key="q.id" class="result-question-card card">
    <div class="question-header">
      <span class="question-num">{{ idx + 1 }}.</span>
      <span>{{ q.content }}</span>
    </div>
    <div class="result-answers">
      <p>你的答案：<span :class="answers[q.id] === q.answer ? 'text-success' : 'text-danger'">{{ answers[q.id] || '未作答' }}</span></p>
      <p>正确答案：<span class="text-success">{{ q.answer }}</span></p>
    </div>
    <div v-if="q.analysis" class="result-analysis">
      <p><strong>解析：</strong>{{ q.analysis }}</p>
    </div>
  </div>
</div>
```

### 5.6 待考试卷提交后从列表移除

**位置**：`backend/apps/student/views.py` — `ExamListView.get()`

```python
def get(self, request):
    if not request.user.is_authenticated:
        return Response({'error': '请先登录'}, status=401)

    # 获取当前学生已提交的试卷ID列表
    submitted_paper_ids = ExamRecord.objects.filter(
        student=request.user,
        status__in=['submitted', 'graded'],
        paper__isnull=False
    ).values_list('paper_id', flat=True)

    queryset = ExamPaper.objects.filter(
        published_at__isnull=False,
        published_at__lte=timezone.now(),
        target_class__class_students__student=request.user
    ).exclude(
        id__in=submitted_paper_ids  # 排除已提交的
    ).distinct().order_by('-published_at')

    serializer = ExamListSerializer(queryset, many=True)
    return Response(serializer.data)
```

### 5.7 ResizeObserver 全局错误拦截

**位置**：`frontend/src/main.js`

在 `app.mount('#app')` 之前添加：

```javascript
// 忽略 ResizeObserver loop limit exceeded 错误
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('ResizeObserver loop')) {
    e.stopImmediatePropagation()
    return
  }
})

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && e.reason.message.includes('ResizeObserver loop')) {
    e.preventDefault()
  }
})
```

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
| `backend/exam_core/views.py` | 考试核心逻辑 ViewSet（695 行） |
| `backend/exam_core/urls.py` | 考试核心路由 |
| `backend/apps/student/views.py` | 学生端 API 视图（~820 行） |
| `backend/apps/student/urls.py` | 学生端路由 |
| `backend/apps/student/serializers.py` | 学生端序列化器 |
| `backend/users/views.py` | 用户认证 ViewSet（含 `AuthViewSet`） |
| `backend/users/serializers.py` | 用户序列化器 |

### 前端

| 文件路径 | 说明 |
|----------|------|
| `frontend/src/main.js` | 应用入口，注册 Element Plus、ECharts |
| `frontend/src/router/index.js` | 路由配置（含导航守卫） |
| `frontend/src/store/index.js` | Vuex 状态管理（用户登录态） |
| `frontend/src/api/student.js` | 学生端 API 函数（独立 axios 实例） |
| `frontend/src/api/teacher.js` | 教师端 API 函数（共用 utils/request） |
| `frontend/src/utils/request.js` | 教师端 axios 实例（10s 超时） |
| `frontend/src/views/student/StudentHome.vue` | 学生首页 |
| `frontend/src/views/student/ExamPage.vue` | 考试/练习答题页 |
| `frontend/src/views/student/WrongBook.vue` | 错题本 |
| `frontend/src/views/student/Profile.vue` | 个人中心（**全 mock，需重写**） |
| `frontend/src/views/teacher/QuestionBank.vue` | 教师题库管理 |
| `frontend/src/components/StudyHeatmap.vue` | ECharts 热力图组件 |
| `frontend/src/components/AIAnswerModal.vue` | AI 问答弹窗组件 |

### 数据库表

| 表名 | 对应 Django 模型 | 说明 |
|------|-----------------|------|
| `questions` | `Question` | 主题库题目（含 `score` 字段） |
| `question_ai` | `QuestionAI` | AI 练习库题目 |
| `wrong_questions` | `WrongQuestion` | 错题本（含 `source_type`、`source_id`） |
| `practice_records` | `PracticeRecord` | 练习做题记录（逐题粒度的记录） |
| `exam_records` | `ExamRecord` | 考试/练习批记录 |
| `answer_details` | `AnswerDetail` | 答题详情 |
| `exam_papers` | `ExamPaper` | 试卷 |
| `exam_paper_questions` | `ExamPaperQuestion` | 试卷-题目关联 |
| `users` | `User`（自定义） | 用户（含 `role`、`phone`、`real_name`） |
| `classes` | `Class` | 班级 |
| `student_classes` | `StudentClass` | 学生-班级关联 |
