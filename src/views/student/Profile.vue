<template>
  <div class="profile-page">
    <div class="container">


      <!-- 个人信息卡片 -->
      <div class="profile-card card">
        <div class="profile-avatar">
          <div class="avatar-circle">{{ userName.charAt(0) }}</div>
          <h2>{{ userName }}</h2>
          <p class="user-role">学生</p>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalExams }}</span>
            <span class="stat-label">参加考试</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.avgScore }}</span>
            <span class="stat-label">平均分</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.wrongCount }}</span>
            <span class="stat-label">错题数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.studyDays }}</span>
            <span class="stat-label">学习天数</span>
          </div>
        </div>
      </div>

      <!-- 学习统计 -->
      <div class="stats-section">
        <h3>学习统计</h3>
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.completedExams }}</span>
              <span class="stat-text">已完成考试</span>
            </div>
            <div class="stat-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progressExam + '%' }"></div>
              </div>
              <span class="progress-text">{{ progressExam }}%</span>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5db872" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.masteredQuestions }}</span>
              <span class="stat-text">已掌握错题</span>
            </div>
            <div class="stat-progress">
              <div class="progress-bar">
                <div class="progress-fill green" :style="{ width: progressMastered + '%' }"></div>
              </div>
              <span class="progress-text">{{ progressMastered }}%</span>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-teal)" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.correctRate }}%</span>
              <span class="stat-text">正确率</span>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.totalHours }}h</span>
              <span class="stat-text">学习时长</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 学习活跃度热力图 -->
      <StudyHeatmap :studyData="studyData" />

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StudyHeatmap from '@/components/StudyHeatmap.vue'
import request from '@/utils/request'

const router = useRouter()
const userName = ref(localStorage.getItem('student_userName') || '同学')
const loading = ref(true)

const stats = ref({
  totalExams: 0,
  avgScore: 0,
  wrongCount: 0,
  studyDays: 0,
  completedExams: 0,
  masteredQuestions: 0,
  correctRate: 0,
  totalHours: 0
})

const studyData = ref([])

const progressExam = computed(() => {
  if (stats.value.totalExams === 0) return 0
  return Math.round((stats.value.completedExams / stats.value.totalExams) * 100)
})

const progressMastered = computed(() => {
  if (stats.value.wrongCount === 0) return 100
  return Math.round((stats.value.masteredQuestions / stats.value.wrongCount) * 100)
})

async function fetchProfileData() {
  try {
    const res = await request({
      url: '/student/profile/',
      method: 'get'
    })
    stats.value = {
      totalExams: res.total_exams || 0,
      avgScore: res.avg_score || 0,
      wrongCount: res.total_wrong || 0,
      studyDays: res.study_days || 0,
      completedExams: res.total_exams || 0,
      masteredQuestions: res.mastered_wrong || 0,
      correctRate: res.correct_rate || 0,
      totalHours: res.study_hours || 0
    }
    studyData.value = []
  } catch {
    // keep default zeros on error
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfileData()
})
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}

.container { display: flex; flex-direction: column; gap: 20px; }

/* ===== 个人信息卡片 ===== */
.profile-card {
  padding: 30px;
  text-align: center;
}

.profile-avatar {
  margin-bottom: 20px;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary, #d97757) 0%, var(--primary-active, #c46a4a) 100%);
  color: white;
  font-size: 28px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 4px 12px rgba(217, 119, 87, 0.2);
}

.profile-avatar h2 { margin: 0 0 4px; font-size: 1.3em; color: var(--ink, #2a2a2a); }
.user-role { margin: 0; color: var(--muted, #6b655c); font-size: 13px; }

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--hairline, #e3dbd0);
}

.profile-stats .stat-item { display: flex; flex-direction: column; align-items: center; }
.profile-stats .stat-value { font-size: 1.4em; font-weight: 700; color: var(--primary, #d97757); }
.profile-stats .stat-label { font-size: 12px; color: var(--muted, #6b655c); margin-top: 4px; }

/* ===== 学习统计 ===== */
.stats-section h3 {
  margin: 0 0 12px 0;
  font-size: 1.05em;
  color: var(--ink, #2a2a2a);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.stat-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-num {
  font-size: 1.4em;
  font-weight: 700;
  color: var(--ink, #2a2a2a);
}

.stat-text {
  font-size: 12px;
  color: var(--muted, #6b655c);
}

.stat-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--hairline, #e3dbd0);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary, #d97757);
  border-radius: 3px;
  transition: width 0.6s;
}

.progress-fill.green { background: #5db872; }

.progress-fill + .progress-text {
  font-size: 11px;
  color: var(--muted-soft, #9f988e);
  min-width: 32px;
  text-align: right;
}

@media (max-width: 768px) {
  .profile-stats { gap: 16px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>