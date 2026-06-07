<template>
  <div class="exam-start-page">
    <div class="container">
      <!-- 考试基本信息 -->
      <div class="start-card card" v-if="examInfo">
        <div class="exam-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h1>{{ examInfo.name || '考试' }}</h1>
        <div class="exam-meta">
          <div class="meta-item">
            <span class="meta-label">题目数量</span>
            <span class="meta-value">{{ examInfo.question_count || questions.length }} 题</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-label">考试时长</span>
            <span class="meta-value">{{ examInfo.duration || 60 }} 分钟</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-label">试卷总分</span>
            <span class="meta-value">{{ examInfo.total_score || 100 }} 分</span>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state card">
        <div class="spinner"></div>
        <p>加载考试信息中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-if="error" class="error-state card">
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="$router.push('/student/home')">返回首页</button>
      </div>

      <!-- 考前须知 -->
      <div v-if="!loading && !error" class="rules-section">
        <div class="rules-card card">
          <div class="rules-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <h2>考前须知</h2>
          </div>
          <p class="rules-subtitle">请仔细阅读以下考试规则，确认后进入考试</p>

          <div class="rule-list">
            <!-- 诚信考试 -->
            <div class="rule-item">
              <div class="rule-icon rule-icon-honor">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div class="rule-content">
                <h4>诚信考试</h4>
                <p>本次考试旨在检验你的真实水平，请独立完成所有题目。请勿查阅资料、抄袭或使用辅助工具。请对自己负责，用真实的成绩证明自己的能力。</p>
              </div>
            </div>

            <!-- 防作弊 -->
            <div class="rule-item">
              <div class="rule-icon rule-icon-anticheat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div class="rule-content">
                <h4>防作弊保护</h4>
                <p>考试期间系统已禁用复制、粘贴、右键菜单等操作。请勿尝试使用任何作弊手段，诚信应考。</p>
              </div>
            </div>

            <!-- 切屏监控 -->
            <div class="rule-item">
              <div class="rule-icon rule-icon-warn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div class="rule-content">
                <h4>切屏监控</h4>
                <p>考试期间请勿离开当前考试页面，系统会记录页面离开行为。累计切屏离开三次后，考试将被自动终止并强制交卷，成绩以当前已作答情况为准。</p>
              </div>
            </div>

            <!-- 中途离开 -->
            <div class="rule-item">
              <div class="rule-icon rule-icon-leave">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <div class="rule-content">
                <h4>退出即交卷</h4>
                <p>进入考试后，返回主页或关闭网址等操作，均视为中途退出。系统将自动提交当前答题结果并计算成绩，无法继续答题。</p>
              </div>
            </div>

            <!-- 时间限制 -->
            <div class="rule-item">
              <div class="rule-icon rule-icon-time">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="rule-content">
                <h4>时间限制</h4>
                <p>考试设有时间限制，倒计时在进入考试后开始计时。时间用尽后系统将自动提交试卷，不再允许修改答案。</p>
              </div>
            </div>

            <!-- 答题提醒 -->
            <div class="rule-item">
              <div class="rule-icon rule-icon-answer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <div class="rule-content">
                <h4>自动保存</h4>
                <p>答题过程中你的答案会自动保存，不必担心意外情况导致数据丢失。提交试卷前请仔细检查所有题目，确保没有遗漏。</p>
              </div>
            </div>

          </div>
        </div>

        <!-- 确认操作 -->
        <div class="actions-card card">
          <div class="actions-content">
            <label class="confirm-checkbox">
              <input type="checkbox" v-model="agreed" />
              <span>我已阅读并同意以上考试规则，承诺诚信考试</span>
            </label>
            <div class="actions-buttons">
              <button class="btn btn-outline btn-lg" @click="goBack">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
                返回首页
              </button>
              <button
                class="btn btn-primary btn-lg"
                :disabled="!agreed || entering"
                @click="enterExam"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                {{ entering ? '正在进入...' : '开始考试' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getExamDetail } from '@/api/student'

const route = useRoute()
const router = useRouter()
const examId = route.params.id || '0'

const loading = ref(true)
const error = ref('')
const examInfo = ref(null)
const questions = ref([])
const agreed = ref(false)
const entering = ref(false)

function goBack() {
  router.push('/student/home')
}

async function enterExam() {
  if (!agreed.value || entering.value) return
  entering.value = true
  // 跳转到考试页面，并通过 query 标记是从须知页进入的
  router.push(`/student/exam/${examId}?from=start`)
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getExamDetail(examId)
    examInfo.value = res.data?.exam || res.data
    questions.value = res.data?.questions || []
  } catch (err) {
    error.value = '加载考试信息失败：' + (err.response?.data?.error || '网络错误')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.exam-start-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== 考试信息卡片 ===== */
.start-card {
  padding: 32px 28px;
  text-align: center;
}

.exam-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--primary-bg, rgba(217, 119, 87, 0.1));
  color: var(--primary, #d97757);
  margin-bottom: 16px;
}

.start-card h1 {
  margin: 0 0 20px 0;
  font-size: 1.35em;
  font-weight: 700;
  color: var(--ink, #2a2a2a);
}

.exam-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
}

.meta-label {
  font-size: 12px;
  color: var(--muted-soft, #9f988e);
  margin-bottom: 4px;
}

.meta-value {
  font-size: 1.05em;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
}

.meta-divider {
  width: 1px;
  height: 32px;
  background: var(--hairline, #e3dbd0);
}

/* ===== 规则区域 ===== */
.rules-card {
  padding: 28px;
}

.rules-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  color: var(--primary, #d97757);
}

.rules-header h2 {
  margin: 0;
  font-size: 1.15em;
  font-weight: 700;
  color: var(--ink, #2a2a2a);
}

.rules-subtitle {
  margin: 0 0 24px 0;
  font-size: 13.5px;
  color: var(--muted, #6b655c);
  padding-left: 30px;
}

.rule-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rule-item {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: var(--radius-md, 10px);
  background: var(--bg-soft, #faf8f5);
  border: 1px solid var(--hairline-soft, #f0ebe0);
  transition: all 0.2s;
}

.rule-item:hover {
  border-color: var(--hairline, #e3dbd0);
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.rule-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rule-icon-honor {
  background: linear-gradient(135deg, rgba(241, 196, 15, 0.15), rgba(243, 156, 18, 0.1));
  color: #f39c12;
}

.rule-icon-warn {
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.12), rgba(192, 57, 43, 0.08));
  color: #e74c3c;
}

.rule-icon-anticheat {
  background: linear-gradient(135deg, rgba(217, 119, 87, 0.12), rgba(200, 100, 60, 0.08));
  color: #d97757;
}

.rule-icon-leave {
  background: linear-gradient(135deg, rgba(142, 68, 173, 0.12), rgba(155, 89, 182, 0.08));
  color: #8e44ad;
}

.rule-icon-time {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.12), rgba(41, 128, 185, 0.08));
  color: #3498db;
}

.rule-icon-answer {
  background: linear-gradient(135deg, rgba(46, 204, 113, 0.12), rgba(39, 174, 96, 0.08));
  color: #27ae60;
}

.rule-content {
  flex: 1;
  min-width: 0;
}

.rule-content h4 {
  margin: 0 0 6px 0;
  font-size: 0.95em;
  font-weight: 600;
  color: var(--ink, #2a2a2a);
}

.rule-content p {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--muted, #6b655c);
}

.rule-content p b {
  color: var(--ink, #2a2a2a);
  font-weight: 600;
}

/* ===== 操作区域 ===== */
.actions-card {
  padding: 24px 28px;
}

.actions-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.confirm-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--ink, #2a2a2a);
  user-select: none;
}

.confirm-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary, #d97757);
  cursor: pointer;
  flex-shrink: 0;
}

.actions-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-lg {
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* ===== 响应式 ===== */
@media (max-width: 600px) {
  .exam-start-page {
    padding: 16px 0 32px;
  }

  .start-card {
    padding: 24px 18px;
  }

  .meta-item {
    padding: 0 14px;
  }

  .rules-card {
    padding: 20px 16px;
  }

  .actions-card {
    padding: 18px 16px;
  }

  .actions-buttons {
    flex-direction: column;
  }

  .btn-lg {
    width: 100%;
    justify-content: center;
  }
}
</style>
