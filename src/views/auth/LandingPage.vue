<template>
  <div class="landing-page" ref="pageRef">
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

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
          <button class="theme-btn" @click="toggleDark" :title="isDark ? '切换浅色模式' : '切换深色模式'">
            <svg v-if="!isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          </button>
          <router-link to="/role-select" class="nav-btn">登录</router-link>
        </div>
      </div>
    </header>

    <section class="hero">
      <div class="hero-decoration">
        <div class="hero-glow glow-1"></div>
        <div class="hero-glow glow-2"></div>
      </div>
      <div class="hero-inner">
        <div class="hero-left">
          <div class="hero-badge">AI 驱动 · 智能教学</div>
          <h1 class="hero-title">
            <span class="title-line-sm">知识聚合</span>
            <span class="title-line-lg">智能考试平台</span>
          </h1>
          <p class="hero-subtitle">AI 智能出题 · 自动阅卷 · 错题本 · 学习分析</p>
          <div class="hero-actions">
            <router-link to="/role-select" class="btn btn-primary">开始使用</router-link>
            <a href="javascript:void(0)" class="btn btn-secondary" @click="scrollTo('features')">了解更多</a>
          </div>
        </div>
        <div class="hero-right">
          <div class="hero-geo">
            <div class="geo-grid">
              <div class="geo-cell" v-for="n in 25" :key="n"></div>
            </div>
            <div class="geo-ring ring-1"></div>
            <div class="geo-ring ring-2"></div>
            <div class="geo-dots">
              <span class="gdot" v-for="n in 12" :key="n"></span>
            </div>
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

const isDark = ref(false)

const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

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

const particleCanvas = ref(null)
let particles = []
let pAnimationId = null
let mouseX = -1000
let mouseY = -1000

const initParticles = () => {
  const canvas = particleCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resize()
  window.addEventListener('resize', resize)

  const count = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 15000))
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 2 + 1.1
  }))

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const p of particles) {
      const dx = p.x - mouseX
      const dy = p.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 120) {
        const force = (120 - dist) / 120 * 0.5
        p.vx += (dx / dist) * force
        p.vy += (dy / dist) * force
      }

      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.98
      p.vy *= 0.98

      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      const particleColor = isDark.value ? '255,255,255' : '0,0,0'
      const particleAlpha = isDark.value ? '0.15' : '0.12'
      ctx.fillStyle = `rgba(${particleColor},${particleAlpha})`
      ctx.fill()
    }

    // 相邻粒子连线
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          const lineColor = isDark.value ? '255,255,255' : '0,0,0'
          const lineAlpha = isDark.value ? '0.2' : '0.15'
          ctx.strokeStyle = `rgba(${lineColor},${lineAlpha})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    pAnimationId = requestAnimationFrame(draw)
  }

  draw()
  return resize
}

const onMouseMoveGlobal = (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
}

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
  window.addEventListener('mousemove', onMouseMoveGlobal)
  initParticles()
  setTimeout(setupAnimations, 100)

  const mo = new MutationObserver(() => setupAnimations())
  const container = document.querySelector('.landing-page')
  if (container) mo.observe(container, { childList: true, subtree: true })
  setTimeout(() => mo.disconnect(), 2000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('mousemove', onMouseMoveGlobal)
  if (pAnimationId) cancelAnimationFrame(pAnimationId)
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

<!-- 全局 CSS 变量 -- un-scoped，确保 :root 在所有页面生效 -->
<style>
/* 浅色模式：明亮暖白 */
:root {
  --canvas: #f8f4ee;
  --surface: #ffffff;
  --card-bg: #ffffff;
  --hairline: #e3dbd0;
  --hairline-strong: #ccc2b4;
  --ink: #2a2a2a;
  --muted: #6b655c;
  --muted-soft: #9f988e;
  --primary: #d97757;
  --primary-active: #c46a4a;
  --primary-bg: rgba(217,119,87,0.12);
  --hero-end: #eee8df;
  --footer-bg: #2c2c2c;
  --footer-text: rgba(255,255,255,0.55);
  --footer-hairline: rgba(255,255,255,0.07);
  --shadow: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-hover: 0 12px 32px rgba(0,0,0,0.1);
  --nav-bg: rgba(248,244,238,0.95);
  --nav-bg-scrolled: rgba(255,255,255,0.98);
}
/* 深色模式：深黑灰，文字高对比 */
:root[data-theme="dark"] {
  --canvas: #101010;
  --surface: #181818;
  --card-bg: #222222;
  --hairline: #3a3a3a;
  --hairline-strong: #555555;
  --ink: #e8e4e0;
  --muted: #aaa6a0;
  --muted-soft: #888480;
  --primary: #e0805f;
  --primary-active: #d97757;
  --primary-bg: rgba(217,119,87,0.2);
  --hero-end: #181818;
  --footer-bg: #080808;
  --footer-text: rgba(255,255,255,0.45);
  --footer-hairline: rgba(255,255,255,0.05);
  --shadow: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-hover: 0 12px 32px rgba(0,0,0,0.6);
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
  background: var(--canvas);
  overflow-x: hidden;
  min-height: 100vh;
  transition: background 300ms ease, color 300ms ease;
}

.particle-canvas {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
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
.glow-1 { width: 500px; height: 500px; top: -200px; right: -100px; background: radial-gradient(circle, rgba(217,119,87,0.08), transparent 70%); }
.glow-2 { width: 400px; height: 400px; bottom: -150px; left: -80px; background: radial-gradient(circle, rgba(134,179,163,0.07), transparent 70%); }

.hero-inner {
  position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; width: 100%;
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
}
.hero-left { max-width: 560px; }

.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--primary);
  background: var(--primary-bg);
  border-radius: 20px;
  margin-bottom: 24px;
}
.hero-title { margin-bottom: 20px; }
.title-line-sm { display: block; font-size: 32px; font-weight: 600; color: var(--muted); line-height: 1.2; letter-spacing: -0.5px; }
.title-line-lg { display: block; font-size: 56px; font-weight: 800; color: var(--ink); line-height: 1.05; letter-spacing: -1.5px; }
.hero-subtitle { font-size: 17px; color: var(--muted); line-height: 1.6; margin-bottom: 36px; }
.hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }

.hero-right { display: flex; justify-content: center; align-items: center; }
.hero-geo { position: relative; width: 340px; height: 340px; display: flex; align-items: center; justify-content: center; }
.geo-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; width: 180px; height: 180px; position: relative; z-index: 2; }
.geo-cell { background: var(--hairline); border-radius: 4px; }
.geo-cell:nth-child(1),.geo-cell:nth-child(3),.geo-cell:nth-child(7),.geo-cell:nth-child(9),.geo-cell:nth-child(13),.geo-cell:nth-child(15),.geo-cell:nth-child(19),.geo-cell:nth-child(21),.geo-cell:nth-child(25) { background: var(--primary); opacity: 0.12; }
.geo-cell:nth-child(5),.geo-cell:nth-child(11),.geo-cell:nth-child(17),.geo-cell:nth-child(23) { background: #86b3a3; opacity: 0.15; }
.geo-ring { position: absolute; border: 1px solid var(--hairline); border-radius: 50%; }
.ring-1 { width: 280px; height: 280px; opacity: 0.4; }
.ring-2 { width: 200px; height: 200px; opacity: 0.25; }
.geo-dots { position: absolute; inset: 0; z-index: 1; }
.gdot { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: var(--primary); opacity: 0.2; }
.gdot:nth-child(1) { top:10%;left:80%; } .gdot:nth-child(2) { top:20%;left:10%; } .gdot:nth-child(3) { top:45%;left:90%; }
.gdot:nth-child(4) { top:60%;left:5%; } .gdot:nth-child(5) { top:80%;left:75%; } .gdot:nth-child(6) { top:15%;left:55%; }
.gdot:nth-child(7) { top:70%;left:30%; } .gdot:nth-child(8) { top:35%;left:40%; } .gdot:nth-child(9) { top:90%;left:50%; }
.gdot:nth-child(10) { top:5%;left:30%; } .gdot:nth-child(11) { top:50%;left:15%; } .gdot:nth-child(12) { top:25%;left:70%; }

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
  .hero-title .title-line-lg { font-size: 44px; }
  .hero-inner { gap: 40px; }
}
@media (max-width: 860px) {
  .hero-inner { grid-template-columns: 1fr; gap: 48px; }
  .hero-left { max-width: 100%; text-align: center; }
  .hero-actions { justify-content: center; }
  .hero-right { display: none; }
  .navbar-center { display: none; }
  .title-line-lg { font-size: 40px; }
}
@media (max-width: 640px) {
  .hero-title .title-line-sm { font-size: 24px; }
  .hero-title .title-line-lg { font-size: 34px; }
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
