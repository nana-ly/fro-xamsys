<template>
  <canvas ref="particleCanvas" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const particleCanvas = ref(null)
let particles = []
let pAnimationId = null
let mouseX = -1000
let mouseY = -1000

const getIsDark = () => {
  return document.documentElement.getAttribute('data-theme') === 'dark'
}

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
    const isDark = getIsDark()

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
      const particleColor = isDark ? '255,255,255' : '0,0,0'
      const particleAlpha = isDark ? '0.15' : '0.12'
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
          const lineColor = isDark ? '255,255,255' : '0,0,0'
          const lineAlpha = isDark ? '0.2' : '0.15'
          ctx.strokeStyle = `rgba(${lineColor},${lineAlpha})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    pAnimationId = requestAnimationFrame(draw)
  }

  draw()
}

const onMouseMove = (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
}

onMounted(() => {
  initParticles()
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  if (pAnimationId) cancelAnimationFrame(pAnimationId)
  particles = []
})
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
