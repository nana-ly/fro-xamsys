<template>
  <div class="profile-page">
    <div class="container">
      <!-- 返回按钮 -->
      <button class="btn btn-back" @click="$router.push('/student/home')">
        ← 返回主页
      </button>

      <!-- 个人信息卡片 -->
      <div class="profile-card card">
        <div class="profile-avatar">
          <div class="avatar-circle">👨‍🎓</div>
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
        <h3>📊 学习统计</h3>
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon">📝</div>
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
            <div class="stat-icon">✅</div>
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
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.correctRate }}%</span>
              <span class="stat-text">正确率</span>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">⏱</div>
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
const userName = ref(localStorage.getItem('userName') || '同学')
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
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.container { display: flex; flex-direction: column; gap: 20px; }

.btn-back {
  align-self: flex-start;
  padding: 8px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  color: #666;
  transition: all 0.2s;
}

.btn-back:hover {
  border-color: #409eff;
  color: #409eff;
  background: #ecf5ff;
}

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
  background: #545c64;
  color: white;
  font-size: 2.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.profile-avatar h2 { margin: 0 0 4px; font-size: 1.3em; }
.user-role { margin: 0; color: #999; font-size: 0.85em; }

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-value { font-size: 1.4em; font-weight: 700; color: #409eff; }
.stat-label { font-size: 0.8em; color: #999; margin-top: 4px; }

.stats-section h3 {
  margin: 0 0 12px 0;
  font-size: 1.05em;
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

.stat-icon { font-size: 1.5em; }

.stat-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-num {
  font-size: 1.4em;
  font-weight: 700;
  color: #333;
}

.stat-text {
  font-size: 0.8em;
  color: #999;
}

.stat-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #409eff;
  border-radius: 3px;
  transition: width 0.6s;
}

.progress-fill.green { background: #27ae60; }

.progress-text {
  font-size: 0.75em;
  color: #999;
}

@media (max-width: 768px) {
  .profile-page { padding: 12px; }
  .profile-stats { gap: 16px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
</style>