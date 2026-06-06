<template>
  <div class="ai-modal-overlay" v-if="visible" @click.self="close">
    <div class="ai-modal card" :class="{ 'ai-modal--mobile': isMobile }">
      <div class="ai-modal-header">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:6px">
            <rect x="2" y="2" width="20" height="20" rx="4"/>
            <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
            <path d="M9 16c1 .5 2 1 3 1s2-.5 3-1"/>
          </svg>
          AI 答疑助手
        </h3>
        <button class="ai-modal-close" @click="close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="ai-modal-body">
        <!-- 题目信息 -->
        <div class="question-info" v-if="questionContent">
          <p class="question-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            题目内容：
          </p>
          <p class="question-text">{{ questionContent }}</p>
          <div v-if="questionOptions" class="question-options">
            <span v-for="(opt, key) in parsedOptions" :key="key" class="option-tag">
              {{ key }}. {{ opt }}
            </span>
          </div>
        </div>

        <!-- 对话区域 -->
        <div class="chat-area" ref="chatArea">
          <div class="chat-messages">
            <div v-for="(msg, index) in messages" :key="index" 
                 :class="['chat-message', msg.role === 'user' ? 'chat-message--user' : 'chat-message--ai']">
              <div class="chat-avatar">
                {{ msg.role === 'user' ? '👨‍🎓' : '🤖' }}
              </div>
              <div class="chat-bubble">
                <div class="chat-content" v-html="formatMessage(msg.content)"></div>
                <div class="chat-time">{{ msg.time }}</div>
              </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="isLoading" class="chat-message chat-message--ai">
              <div class="chat-avatar">🤖</div>
              <div class="chat-bubble">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="ai-modal-footer">
        <!-- 快捷提问 -->
        <div class="quick-questions" v-if="quickQuestions.length > 0 && messages.length === 0">
          <span class="quick-label">快捷提问：</span>
          <button v-for="(q, i) in quickQuestions" :key="i" 
                  class="quick-btn" @click="sendQuick(q)">
            {{ q }}
          </button>
        </div>
        <div class="input-area">
          <input 
            ref="inputRef"
            v-model="inputText" 
            type="text" 
            placeholder="输入你的问题..."
            class="chat-input"
            @keyup.enter="sendMessage"
            :disabled="isLoading"
          />
          <button class="send-btn" @click="sendMessage" :disabled="isLoading || !inputText.trim()">
            📤 发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import { aiAskQuestion } from '@/api/student'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  questionId: {
    type: [Number, String],
    default: null
  },
  questionContent: {
    type: String,
    default: ''
  },
  questionOptions: {
    type: [String, Object],
    default: ''
  },
  sourceType: {
    type: String,
    default: 'main'
  }
})

const emit = defineEmits(['close', 'update:visible'])

const inputText = ref('')
const messages = ref([])
const isLoading = ref(false)
const inputRef = ref(null)
const chatArea = ref(null)

const isMobile = computed(() => window.innerWidth <= 768)

const parsedOptions = computed(() => {
  if (!props.questionOptions) return {}
  if (typeof props.questionOptions === 'object') return props.questionOptions
  try {
    return JSON.parse(props.questionOptions)
  } catch {
    return {}
  }
})

const quickQuestions = [
  '这道题的解题思路是什么？',
  '能详细解释一下正确答案吗？',
  '我错在哪里了？',
  '这个知识点还有哪些重点？'
]

function formatMessage(content) {
  if (!content) return ''
  // 转义HTML，保留换行（先转&，再转<和>）
  return content
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/\n/g, '<br/>')
}

function getCurrentTime() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return
  if (!props.questionId) {
    messages.value.push({
      role: 'ai',
      content: '题目信息不存在，请重新打开此功能。',
      time: getCurrentTime()
    })
    return
  }

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: text,
    time: getCurrentTime()
  })
  inputText.value = ''

  await scrollToBottom()

  // 调用AI接口
  isLoading.value = true
  try {
    const res = await aiAskQuestion(props.questionId, text, props.sourceType)
    messages.value.push({
      role: 'ai',
      content: res.data?.answer || '抱歉，AI暂时无法回答这个问题。',
      time: getCurrentTime()
    })
  } catch (error) {
    const errMsg = error.response?.data?.error || '网络请求失败，请稍后重试'
    messages.value.push({
      role: 'ai',
      content: `抱歉，${errMsg}`,
      time: getCurrentTime()
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

function sendQuick(text) {
  inputText.value = text
  sendMessage()
}

async function scrollToBottom() {
  await nextTick()
  if (chatArea.value) {
    chatArea.value.scrollTop = chatArea.value.scrollHeight
  }
}

function close() {
  emit('update:visible', false)
  emit('close')
}

// 弹窗打开时聚焦输入框
watch(() => props.visible, async (val) => {
  if (val) {
    messages.value = []
    inputText.value = ''
    await nextTick()
    inputRef.value?.focus()
  }
})

// ESC关闭
function handleKeydown(e) {
  if (e.key === 'Escape' && props.visible) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.ai-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.ai-modal {
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--card-bg, #ffffff);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.ai-modal--mobile {
  max-height: 90vh;
  margin: 0;
  border-radius: 16px 16px 0 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.ai-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--hairline, #f0f0f0);
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: white;
}

.ai-modal-header h3 {
  margin: 0;
  font-size: 1.1em;
}

.ai-modal-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.ai-modal-close:hover {
  background: rgba(255, 255, 255, 0.4);
}

.ai-modal-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.question-info {
  padding: 12px 16px;
  background: #ecf5ff;
  border-bottom: 1px solid #e8e8ff;
  max-height: 120px;
  overflow-y: auto;
}

.question-label {
  margin: 0 0 6px 0;
  font-size: 0.85em;
  color: #409eff;
  font-weight: 600;
}

.question-text {
  margin: 0;
  font-size: 0.9em;
  color: #333;
  line-height: 1.5;
}

.question-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.option-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #d9ecff;
  border-radius: 4px;
  font-size: 0.8em;
  color: #555;
}

.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 200px;
  max-height: 350px;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  display: flex;
  gap: 8px;
}

.chat-message--user {
  flex-direction: row-reverse;
}

.chat-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  flex-shrink: 0;
}

.chat-message--user .chat-avatar {
  background: #e8f5e9;
}

.chat-message--ai .chat-avatar {
  background: #ede7f6;
}

.chat-bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
}

.chat-message--user .chat-bubble {
  background: #409eff;
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-message--ai .chat-bubble {
  background: var(--canvas, #f5f5f5);
  color: var(--ink, #333);
  border-bottom-left-radius: 4px;
}

.chat-content {
  font-size: 0.9em;
  line-height: 1.6;
  word-break: break-word;
}

.chat-time {
  font-size: 0.7em;
  margin-top: 4px;
  opacity: 0.6;
  text-align: right;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.ai-modal-footer {
  border-top: 1px solid #f0f0f0;
  padding: 12px 16px;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
  align-items: center;
}

.quick-label {
  font-size: 0.8em;
  color: var(--muted, #999);
}

.quick-btn {
  padding: 4px 10px;
  border: 1px solid var(--hairline, #ddd);
  border-radius: 16px;
  background: var(--card-bg, #ffffff);
  color: #409eff;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.quick-btn:hover {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.input-area {
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--hairline-strong, #e0e0e0);
  border-radius: 24px;
  outline: none;
  font-size: 0.9em;
  transition: border-color 0.2s;
  background: var(--card-bg, #ffffff);
  color: var(--ink, #333);
}

.chat-input:focus {
  border-color: #409eff;
}

.chat-input:disabled {
  background: var(--hairline, #f5f5f5);
}

.send-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-size: 0.9em;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .ai-modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  
  .ai-modal {
    max-width: 100%;
    border-radius: 16px 16px 0 0;
  }
  
  .chat-area {
    max-height: 40vh;
  }
  
  .chat-bubble {
    max-width: 80%;
  }
}
</style>