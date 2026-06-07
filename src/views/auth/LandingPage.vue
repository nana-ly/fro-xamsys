<template>
  <div class="landing-page" ref="pageRef">
    <ParticlesBackground />

    <header class="navbar" :class="{ scrolled: isScrolled }">
      <div class="navbar-inner">
        <div class="navbar-left">
          <svg class="brand-logo" width="26" height="26" viewBox="0 0 28 28" fill="none">
            <rect x="2" y="2" width="24" height="24" rx="6" fill="currentColor"/>
            <path d="M8 20V8h6c2 0 3.5 1.5 3.5 3.5S16 15 14 15h-2.5v5H8z" fill="var(--canvas)"/>
            <circle cx="20" cy="18" r="4" fill="var(--canvas)"/>
          </svg>
          <span class="brand-text">智学平台</span>
        </div>
        <nav class="navbar-center">
          <a href="javascript:void(0)" class="nav-link" @click="scrollTo('features')">功能介绍</a>
          <a href="javascript:void(0)" class="nav-link" @click="scrollTo('testimonials')">用户反馈</a>
        </nav>
        <div class="navbar-right">
          <ThemeToggle />
          <router-link to="/role-select" class="nav-btn">登录</router-link>
        </div>
      </div>
    </header>

    <section class="hero">
      <div class="hero-decoration">
        <div class="hero-glow glow-1"></div>
        <div class="hero-glow glow-2"></div>
        <div class="hero-glow glow-3"></div>
        <div class="hero-glow glow-4"></div>
      </div>
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-header">
            <h1 class="title-cn">知识聚合智学平台</h1>
            <p class="title-en">Knowledge Hub · Smart Exam Platform</p>
          </div>
          <p class="hero-subtitle">AI 智能出题 · 自动阅卷 · 错题本 · 学习分析</p>
          <div class="hero-actions">
            <router-link to="/role-select" class="btn btn-primary">开始使用</router-link>
            <a href="javascript:void(0)" class="btn btn-secondary" @click="scrollTo('features')">了解更多</a>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="section features" ref="sectionFeatures">
      <div class="section-inner">
        <div class="section-header animate-fade" data-delay="0">
          <h2 class="section-title">核心功能</h2>
          <p class="section-desc">强大的工具组合，覆盖教与学全流程</p>
        </div>
        <div class="features-grid">
          <div class="feature-card animate-fade" :data-delay="100 * i" v-for="(f, i) in features" :key="i">
            <div class="feature-icon" :class="'fi-' + i">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path :d="f.svg"/>
              </svg>
            </div>
            <h3 class="feature-title">{{ f.title }}</h3>
            <p class="feature-desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="testimonials" class="section testimonials" ref="sectionTestimonials">
      <div class="section-inner">
        <div class="section-header animate-fade" data-delay="0">
          <h2 class="section-title">他们正在使用</h2>
          <p class="section-desc">来自一线教师和学生的真实反馈</p>
        </div>
        <div class="testimonials-grid">
          <div class="tm-card animate-fade" :data-delay="100 * i" v-for="(t, i) in testimonials" :key="i">
            <div class="tm-avatar" :style="{ background: t.color }">
              <span>{{ t.initial }}</span>
            </div>
            <div class="tm-body">
              <p class="tm-text">{{ t.text }}</p>
              <div class="tm-author">
                <span class="tm-name">{{ t.name }}</span>
                <span class="tm-role">{{ t.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section details" ref="sectionDetails">
      <div class="section-inner">
        <div class="section-header animate-fade" data-delay="0">
          <h2 class="section-title">功能详解</h2>
          <p class="section-desc">深入了解每个功能如何提升教与学效率</p>
        </div>
        <div class="details-list">
          <div class="detail-item animate-fade" :data-delay="100 * i" v-for="(d, i) in details" :key="i">
            <div class="detail-visual" :style="{ background: d.bg }">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path :d="d.svg"/>
              </svg>
            </div>
            <div class="detail-content">
              <h3 class="detail-title">{{ d.title }}</h3>
              <p class="detail-text">{{ d.text }}</p>
              <ul class="detail-features">
                <li v-for="(item, j) in d.items" :key="j">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section cta" ref="sectionCta">
      <div class="section-inner">
        <div class="cta-card" ref="ctaCardRef" @mousemove="onCtaMouseMove" @mouseleave="onCtaMouseLeave">
          <div class="cta-glow" :style="ctaGlowStyle"></div>
          <h2 class="cta-title">准备好开始了吗？</h2>
          <p class="cta-desc">加入智学平台，开启智能教学新体验</p>
          <router-link to="/role-select" class="btn btn-primary btn-lg">立即注册</router-link>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-links">
          <div class="footer-col">
            <h4>产品</h4>
            <a href="javascript:void(0)">功能介绍</a>
            <a href="javascript:void(0)">更新日志</a>
            <a href="javascript:void(0)">价格方案</a>
          </div>
          <div class="footer-col">
            <h4>帮助</h4>
            <a href="javascript:void(0)">使用指南</a>
            <a href="javascript:void(0)">常见问题</a>
            <a href="javascript:void(0)">联系我们</a>
          </div>
          <div class="footer-col">
            <h4>法律</h4>
            <a href="javascript:void(0)">用户协议</a>
            <a href="javascript:void(0)">隐私政策</a>
          </div>
        </div>
        <div class="footer-divider"></div>
        <div class="footer-bottom">
          <div class="footer-brand">
            <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="6" fill="currentColor"/>
              <path d="M8 20V8h6c2 0 3.5 1.5 3.5 3.5S16 15 14 15h-2.5v5H8z"/>
              <circle cx="20" cy="18" r="4"/>
            </svg>
            <span>智学平台</span>
          </div>
          <p class="footer-copy">&copy; 2026 智学平台 — 知识聚合与智能考试系统</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ParticlesBackground from '@/components/ParticlesBackground.vue'

const isDark = ref(false)

const isScrolled = ref(false)

const onScroll = () => {
  isScrolled.value = window.scrollY > 60
}

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const ctaCardRef = ref(null)
const ctaGlowX = ref(50)
const ctaGlowY = ref(50)
const ctaGlowVisible = ref(false)

const onCtaMouseMove = (e) => {
  const rect = ctaCardRef.value?.getBoundingClientRect()
  if (!rect) return
  ctaGlowX.value = ((e.clientX - rect.left) / rect.width) * 100
  ctaGlowY.value = ((e.clientY - rect.top) / rect.height) * 100
  ctaGlowVisible.value = true
}

const onCtaMouseLeave = () => {
  ctaGlowVisible.value = false
}

const ctaGlowStyle = computed(() => {
  const alpha = isDark.value ? '0.35' : '0.15'
  return {
    opacity: ctaGlowVisible.value ? 1 : 0,
    background: `radial-gradient(600px circle at ${ctaGlowX.value}% ${ctaGlowY.value}%, rgba(217,119,87,${alpha}), transparent 60%)`
  }
})

let fadeObserver = null

const setupAnimations = () => {
  const els = document.querySelectorAll('.animate-fade')
  if (!els.length) return

  fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0
        setTimeout(() => entry.target.classList.add('visible'), delay)
        fadeObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })

  els.forEach((el) => fadeObserver.observe(el))
}

onMounted(() => {
  const theme = document.documentElement.getAttribute('data-theme')
  if (theme === 'dark') isDark.value = true

  window.addEventListener('scroll', onScroll, { passive: true })
  setTimeout(setupAnimations, 100)

  const mo = new MutationObserver(() => setupAnimations())
  const container = document.querySelector('.landing-page')
  if (container) mo.observe(container, { childList: true, subtree: true })
  setTimeout(() => mo.disconnect(), 2000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (fadeObserver) fadeObserver.disconnect()
})

const features = [
  { title: 'AI 智能出题', desc: '输入知识点，AI 自动生成高质量题目，省去大量出题时间', svg: 'M12 2a10 10 0 1 0 10 10H12V2z M20 12a8 8 0 0 0-8-8v8h8z' },
  { title: '智能阅卷', desc: '客观题自动批改，主观题辅助评分，成绩实时统计导出', svg: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
  { title: '错题本', desc: '自动收录错题，按知识点分类，针对性复习巩固薄弱环节', svg: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z M8 7h8 M8 11h8 M8 15h5' },
  { title: '学习分析', desc: '学习热力图、成绩趋势图表，数据驱动的精准教学决策', svg: 'M18 20V10M12 20V4M6 20v-6' }
]

const testimonials = [
  { text: 'AI 出题太方便了，输入知识点就能自动生成题目，省去大量出题时间，让我能更专注教学。', name: '李老师', role: '数学教师', color: '#d97757', initial: '李' },
  { text: '错题本功能帮我找到了知识盲点，针对性练习后成绩提升很明显。', name: '王同学', role: '高三学生', color: '#86b3a3', initial: '王' },
  { text: '学习分析图表很直观，班级整体情况和学生个体差异都看得见，教学更有针对性。', name: '张老师', role: '英语教师', color: '#e8a55a', initial: '张' }
]

const details = [
  { title: 'AI 智能出题引擎', text: '基于自然语言处理技术，输入知识点描述即可自动生成多种题型，支持选择题、填空题、简答题等。', bg: 'rgba(217,119,87,0.06)', svg: 'M12 2a10 10 0 1 0 10 10H12V2z M20 12a8 8 0 0 0-8-8v8h8z', items: ['支持选择题、填空题、简答题等多种题型', '自动标注知识点和难度等级', '可批量生成试卷，一键导出'] },
  { title: '错题本系统', text: '每次考试后自动收录错题，按知识点维度分类整理，支持精准复习和针对性练习。', bg: 'rgba(134,179,163,0.06)', svg: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z M8 7h8 M8 11h8 M8 15h5', items: ['自动收录错题，按知识点分类', '支持错题重做和相似题推荐', '随时查看错题统计和趋势'] },
  { title: '数据分析看板', text: '多维度学习数据可视化，包括班级成绩分布、知识点掌握热力图、个人学习趋势等。', bg: 'rgba(232,165,90,0.06)', svg: 'M18 20V10M12 20V4M6 20v-6', items: ['班级平均分、最高分、及格率统计', '各题正确率详细分析', '个人学习趋势图，进步看得见'] }
]
</script>

<!-- 全局 CSS 变量 -- un-scoped，登陆页专用变量（共享变量在 App.vue） -->
<style>
/* LandingPage 专用浅色变量 */
:root {
  --hero-end: #eeeee5;
  --footer-text: rgba(255,255,255,0.55);
  --footer-hairline: rgba(255,255,255,0.07);
  --nav-bg: rgba(248,244,238,0.95);
  --nav-bg-scrolled: rgba(255,255,255,0.98);
}

/* LandingPage 专用深色变量 */
:root[data-theme="dark"] {
  --hero-end: #181818;
  --footer-text: rgba(255,255,255,0.45);
  --footer-hairline: rgba(255,255,255,0.05);
  --nav-bg: rgba(16,16,16,0.95);
  --nav-bg-scrolled: rgba(24,24,24,0.98);
}
body { margin: 0; background: var(--canvas); }
</style>

<style scoped>
.landing-page {
  position: relative;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  color: var(--ink);
  overflow-x: hidden;
  min-height: 100vh;
  transition: background 300ms ease, color 300ms ease;
}

.landing-page :deep(.particle-canvas) {
  z-index: 9999;
}


.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--nav-bg);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: background 300ms ease, box-shadow 300ms ease;
}

.navbar.scrolled {
  background: var(--nav-bg-scrolled);
  box-shadow: 0 1px 0 var(--hairline);
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 25px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.brand-logo { flex-shrink: 0; color: var(--primary); }
.brand-text { font-size: 18px; font-weight: 600; color: var(--ink); letter-spacing: -0.3px; }

.navbar-center { display: flex; gap: 30px; margin-left: 850px;flex-shrink: 0; }

.nav-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  cursor: pointer;
  transition: color 200ms ease;
}
.nav-link:hover { color: var(--ink); }

.navbar-right { display: flex; align-items: center; gap: 20px; margin-left: 60px;;flex-shrink: 0;}

.theme-btn {
  width: 36px; height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--hairline);
  border-radius: 8px;
  color: var(--muted);
  cursor: pointer;
  transition: all 200ms ease;
}
.theme-btn:hover {
  background: var(--hairline);
  color: var(--ink);
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--hairline-strong);
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 200ms ease;
}
.nav-btn:hover {
  background: var(--hairline);
  transform: translateY(-1px);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  border-radius: 8px;
  text-decoration: none;
  cursor: pointer;
  transition: all 200ms ease;
  line-height: 1;
  height: 44px;
  position: relative;
  z-index: 2;
}
.btn-primary { background: var(--primary); color: #ffffff; border: none; }
.btn-primary:hover { background: var(--primary-active); transform: translateY(-2px); }
.btn-secondary { background: transparent; color: var(--ink); border: 1px solid var(--hairline-strong); }
.btn-secondary:hover { background: var(--hairline); transform: translateY(-2px); }
.btn-lg { padding: 14px 32px; height: 48px; font-size: 15px; }

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 120px 24px 80px;
  background: linear-gradient(180deg, var(--canvas) 0%, var(--hero-end) 100%);
  overflow: hidden;
}
.hero-decoration { position: absolute; inset: 0; pointer-events: none; }
.hero-glow { position: absolute; border-radius: 50%; }
.glow-1 { width: 500px; height: 500px; top: -200px; right: -100px; background: radial-gradient(circle, rgba(217,119,87,0.05), transparent 70%); }
.glow-2 { width: 400px; height: 400px; bottom: -150px; left: -80px; background: radial-gradient(circle, rgba(217,119,87,0.05), transparent 70%); }
.glow-3 { width: 300px; height: 300px; top: 10%; right: 5%; background: radial-gradient(circle, rgba(217,119,87,0.05), transparent 60%); }
.glow-4 { width: 350px; height: 350px; bottom: 5%; left: 5%; background: radial-gradient(circle, rgba(217,119,87,0.05), transparent 60%); }

.hero-inner {
  position: relative; z-index: 2; max-width: 900px; margin: 0 auto; width: 100%;
  padding: 0 24px;
}
.hero-content {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.hero-header {
  text-align: center;
  margin-bottom: 28px;
}

.title-cn {
  font-size: 56px;
  font-weight: 700;
  font-weight: bold; 
  color:#d97757;
  margin: 0;
  letter-spacing: 4px;
  line-height: 1.2;
}

.title-en {
  font-family: 'Segoe Script', 'Comic Sans MS', 'Snell Roundhand', cursive;
  font-size: 20px;
  color:#d97757;
  margin: 4px 0 0 0;
  text-align: right;
  text-align: center;
}

.hero-subtitle { font-size: 17px; color: var(--muted); line-height: 1.6; margin-bottom: 36px; }
.hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

.section { padding: 96px 0; position: relative; z-index: 2; }
.section-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.section-header { text-align: center; margin-bottom: 56px; }
.section-title { font-size: 36px; font-weight: 700; color: var(--ink); margin-bottom: 12px; letter-spacing: -0.5px; line-height: 1.2; }
.section-desc { font-size: 16px; color: var(--muted); line-height: 1.6; }

.features { background: var(--surface); }
.features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.feature-card { padding: 32px 28px; background: var(--card-bg); border-radius: 12px; border: 1px solid var(--hairline); transition: all 200ms ease; }
.feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-hover); border-color: var(--primary); }
.feature-icon { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; border-radius: 12px; margin-bottom: 20px; color: #ffffff; }
.fi-0 { background: #d97757; } .fi-1 { background: #86b3a3; } .fi-2 { background: #e8a55a; } .fi-3 { background: #5db8a6; }
.feature-title { font-size: 18px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
.feature-desc { font-size: 14px; color: var(--muted); line-height: 1.6; }

.testimonials { background: var(--surface); }
.testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.tm-card { padding: 32px; background: var(--card-bg); border-radius: 12px; border: 1px solid var(--hairline); transition: all 200ms ease; }
.tm-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-hover); }
.tm-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.tm-text { font-size: 14px; color: var(--ink); line-height: 1.7; margin-bottom: 20px; font-style: italic; }
.tm-author { display: flex; flex-direction: column; gap: 2px; }
.tm-name { font-size: 14px; font-weight: 600; color: var(--ink); }
.tm-role { font-size: 13px; color: var(--muted); }

.details { background: var(--canvas); }
.details-list { display: flex; flex-direction: column; gap: 32px; max-width: 900px; margin: 0 auto; }
.detail-item { display: grid; grid-template-columns: 72px 1fr; gap: 28px; padding: 36px; background: var(--card-bg); border-radius: 12px; border: 1px solid var(--hairline); transition: all 200ms ease; }
.detail-item:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
.detail-visual { width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; border-radius: 14px; color: var(--primary); flex-shrink: 0; margin-top: 4px; }
.detail-title { font-size: 20px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
.detail-text { font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 16px; }
.detail-features { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.detail-features li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--muted); }

.cta { background: var(--surface); position: relative; z-index: 2; }
.cta-card { position: relative; text-align: center; padding: 80px 40px; background: var(--card-bg); border-radius: 16px; border: 1px solid var(--hairline); overflow: hidden; }
.cta-glow { position: absolute; inset: 0; pointer-events: none; transition: opacity 200ms ease; }
.cta-title { position: relative; z-index: 2; font-size: 36px; font-weight: 700; color: var(--ink); margin-bottom: 12px; letter-spacing: -0.5px; }
.cta-desc { position: relative; z-index: 2; font-size: 16px; color: var(--muted); margin-bottom: 32px; }
.cta-card .btn-primary { position: relative; z-index: 2; }

.footer { position: relative; z-index: 2; padding: 48px 0 32px; background: var(--footer-bg); color: var(--footer-text); }
.footer-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.footer-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-bottom: 32px; }
.footer-col h4 { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
.footer-col a { display: block; font-size: 14px; color: var(--footer-text); text-decoration: none; padding: 4px 0; transition: color 200ms ease; }
.footer-col a:hover { color: rgba(255,255,255,0.9); }
.footer-divider { height: 1px; background: var(--footer-hairline); margin-bottom: 24px; }
.footer-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.footer-brand { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: var(--primary); }
.footer-copy { font-size: 13px; color: var(--footer-text); }

.animate-fade { opacity: 0; transform: translateY(28px); transition: all 600ms ease-out; }
.animate-fade.visible { opacity: 1; transform: translateY(0); }

@media (max-width: 1024px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .title-cn { font-size: 46px; }
}
@media (max-width: 860px) {
  .navbar-center { display: none; }
  .title-cn { font-size: 40px; }
}
@media (max-width: 640px) {
  .title-cn { font-size: 34px; letter-spacing: 2px; }
  .title-en { font-size: 20px; max-width: 70%; }
  .hero { min-height: auto; padding: 100px 20px 60px; }
  .section { padding: 64px 0; }
  .section-title { font-size: 28px; }
  .features-grid { grid-template-columns: 1fr; }
  .testimonials-grid { grid-template-columns: 1fr; }
  .detail-item { grid-template-columns: 1fr; text-align: center; padding: 28px 20px; }
  .detail-visual { margin: 0 auto 16px; }
  .detail-features li { justify-content: center; }
  .cta-card { padding: 48px 24px; }
  .cta-title { font-size: 28px; }
  .footer-links { grid-template-columns: 1fr; gap: 24px; }
  .footer-bottom { flex-direction: column; text-align: center; }
  .section-header { margin-bottom: 40px; }
}
@media (max-width: 480px) {
  .hero-actions { flex-direction: column; align-items: center; }
  .btn-lg { width: 100%; }
}
</style>
