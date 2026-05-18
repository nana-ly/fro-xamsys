---
version: 1.0
name: platform-design-system
description: 智学平台设计规范。基于 Claude 温暖风格（暖橙/奶油），覆盖浅色/深色双主题，适用于前端学生端和教师端 UI 开发。
---

## 设计理念

温暖、专业、舒适，适合长时间学习使用。Claude 式的暖橙/奶油配色 + Notion 式简洁卡片的结合。

- 主色系：暖橙 `#d97757`、陶土 `#c46a4a`、鼠尾草绿 `#86b3a3`
- 背景色：暖白奶油 `#f8f4ee`
- 氛围：柔和、自然、有呼吸感
- 不使用高饱和度蓝紫色渐变
- 不使用 emoji

---

## 字体

### Font Family
```css
font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
```

### 层级

| 用途 | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| 英雄大标题 (title-line-lg) | 56px | 800 | 1.05 | -1.5px |
| 英雄小标题 (title-line-sm) | 32px | 600 | 1.2 | -0.5px |
| 页面标题 / section-title | 36px | 700 | 1.2 | -0.5px |
| 卡片标题 / feature-title | 18px | 600 | 1.3 | 0 |
| 详情标题 / detail-title | 20px | 600 | 1.3 | 0 |
| 正文 body | 15-16px | 400 | 1.55 | 0 |
| 次要正文 body-sm | 14px | 400 | 1.55 | 0 |
| 标签/按钮 | 14px | 500 | 1.3 | 0 |
| 微标注 | 13px | 500 | 1.4 | 0 |

---

## 颜色

### 浅色模式（默认）

#### 品牌色
| Token | Value | 用途 |
|-------|-------|------|
| `--primary` | `#d97757` | 主按钮背景、品牌 Logo、链接、强调色 |
| `--primary-active` | `#c46a4a` | 主按钮悬停/按下 |
| `--primary-bg` | `rgba(217,119,87,0.12)` | 标签/徽章/弱化背景 |
| `--accent-teal` | `#86b3a3` | 鼠尾草绿，辅助色（图标/装饰） |
| `--accent-yellow` | `#f5d76e` | 柔和黄，辅助色 |

#### 背景色
| Token | Value | 用途 |
|-------|-------|------|
| `--canvas` | `#f8f4ee` | 页面主背景（暖白奶油） |
| `--surface` | `#ffffff` | 白色区块背景（功能卡片区域） |
| `--card-bg` | `#ffffff` | 卡片背景（白色） |
| `--hero-end` | `#eee8df` | 英雄区渐变的终点 |
| `--footer-bg` | `#2c2c2c` | 底部深色背景 |

#### 边框
| Token | Value | 用途 |
|-------|-------|------|
| `--hairline` | `#e3dbd0` | 卡片边框、分割线 |
| `--hairline-strong` | `#ccc2b4` | 输入框边框、二级按钮边框 |

#### 文字
| Token | Value | 用途 |
|-------|-------|------|
| `--ink` | `#2a2a2a` | 主标题、正文 |
| `--muted` | `#6b655c` | 次要文字、副标题 |
| `--muted-soft` | `#9f988e` | 占位符、禁用文字 |

#### 阴影
| Token | Value |
|-------|-------|
| `--shadow` | `0 4px 12px rgba(0,0,0,0.06)` |
| `--shadow-hover` | `0 12px 32px rgba(0,0,0,0.1)` |

### 深色模式

| Token | Value |
|-------|-------|
| `--canvas` | `#101010` |
| `--surface` | `#181818` |
| `--card-bg` | `#222222` |
| `--hairline` | `#3a3a3a` |
| `--hairline-strong` | `#555555` |
| `--ink` | `#e8e4e0` |
| `--muted` | `#aaa6a0` |
| `--muted-soft` | `#888480` |
| `--primary` | `#e0805f` |
| `--primary-active` | `#d97757` |
| `--primary-bg` | `rgba(217,119,87,0.2)` |

### 语义色（浅深通用）
| 状态 | 颜色 |
|------|------|
| 成功 | `#5db872` |
| 错误 | `#c64545` |
| 警告 | `#d4a017` |

---

## 圆角

| Token | Value | 用途 |
|-------|-------|------|
| xs | 4px | 装饰小方块 |
| sm | 6px | — |
| **md** | **8px** | **按钮、输入框、标签** |
| **lg** | **12px** | **卡片、弹窗** |
| xl | 16px | 大装饰卡片、CTA 卡片 |
| xxl | 20px | — |
| full | 9999px | 徽章（Pill）|

> 按钮使用 8px 圆角（矩形），非 pill 风格。卡片统一 12px。

---

## 间距

| Token | Value |
|-------|-------|
| xxs | 4px |
| xs | 8px |
| sm | 12px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| xxl | 48px |
| section | 96px（区块间距）|

---

## 组件规范

### 按钮

**主按钮 (`.btn-primary`)**
- 背景 `--primary`（#d97757），白色文字
- 圆角 8px，高度 44px
- 内边距 12px 24px
- 悬停：背景 `--primary-active`（#c46a4a），上浮 2px
- 大型（`.btn-lg`）：高度 48px，内边距 14px 32px

**次按钮 (`.btn-secondary`)**
- 透明背景，`--ink` 文字，`--hairline-strong` 边框
- 圆角 8px，高度 44px
- 悬停：`--hairline` 背景，上浮 2px

**导航栏登录按钮 (`.nav-btn`)**
- 高度 38px，透明背景，`--hairline-strong` 边框
- 悬停：背景加深

### 卡片

**功能卡片 (`.feature-card`)**
- 白色背景，12px 圆角，1px 边框（`--hairline`）
- 内边距 32px 28px
- 悬停：上浮 4px，阴影加深，边框变 `--primary`

**评价卡片 (`.tm-card`)**
- 白色背景，12px 圆角，1px 边框
- 内边距 32px
- 悬停：上浮 4px，阴影加深

**详情卡片 (`.detail-item`)**
- 白色背景，12px 圆角，1px 边框
- 双列布局：左侧 72px 图标区 + 右侧内容
- 内边距 36px
- 悬停：上浮 2px

**身份选择卡片 (`.role-card`)**
- 宽 280px，12px 圆角，1px 边框
- 内边距 40px 32px
- 悬停：上浮 4px，边框变 `--primary`

**认证卡片 (`.auth-card`)**
- 最大宽度 420px，居中
- 12px 圆角，1px 边框
- 内边距 36px 32px
- 轻微阴影 `0 4px 12px rgba(0,0,0,0.04)`

### 输入框

- 高度 44px，8px 圆角
- 边框 `--hairline-strong`，背景 `--card-bg`
- 占位符颜色 `--muted-soft`
- 聚焦：边框 `#d97757`，外发光 `0 0 0 3px rgba(217,119,87,0.12)`

### 导航栏

- 固定顶部，毛玻璃背景（backdrop-filter: blur(14px)）
- 高度 64px，最大宽度 1200px 居中
- 浅色模式：`--nav-bg`（`rgba(248,244,238,0.95)`）
- 滚动后：`--nav-bg-scrolled`（`rgba(255,255,255,0.98)`）+ 底部分隔线
- 深色模式对应深色值
- 左侧：Logo + 品牌名；中间：导航链接（间距 32px）；右侧：主题切换 + 登录按钮

### 底部

- 深色背景 `--footer-bg`（`#2c2c2c`）
- 内边距 48px top / 32px bottom
- 多列链接（3列） + 底部版权
- 文字色 `--footer-text`

---

## 动效

| 元素 | 动画 | 时长 | Timing |
|------|------|------|--------|
| 卡片悬停 | translateY(-4px) + shadow | 200ms | ease |
| 按钮悬停 | translateY(-1px/-2px) + bg | 200ms | ease |
| 滚动淡入 | translateY(28px) -> 0 + opacity 0->1 | 600ms | ease-out |
| 主题切换 | background / color / border-color | 300ms | ease |
| 导航栏滚动 | background + box-shadow | 300ms | ease |

### 粒子特效

- Canvas 实现，`z-index: 9999`，`pointer-events: none`
- 最多 80-100 个粒子，半径 1-3px
- 浅色模式：黑色 `rgba(0,0,0,0.12)`
- 深色模式：白色 `rgba(255,255,255,0.15)`
- 相邻粒子连线（距离 < 100px），线宽 0.5px
- 鼠标靠近时粒子受排斥力

### CTA 鼠标跟随光晕

- `radial-gradient` 跟随鼠标位置
- 浅色模式：`rgba(217,119,87,0.15)`
- 深色模式：`rgba(217,119,87,0.35)`

---

## 深色/浅色模式

通过给 `<html>` 设置 `data-theme="dark"` 或 `data-theme="light"` 切换。

- 模式状态持久化在 `document.documentElement.getAttribute('data-theme')`
- CSS 变量在 `:root` 和 `:root[data-theme="dark"]` 中定义（全局非 scoped `<style>` 块）
- 组件使用 `var(--xxx)` 引用变量
- 深色模式背景 `#101010`，文字 `#e8e4e0`，所有元素颜色随变量切换

---

## 响应式断点

| 名称 | 宽度 | 变化 |
|------|------|------|
| 手机 | < 640px | 1列布局，导航链接隐藏，section padding 64px |
| 平板 | 640-860px | 2列卡片，hero 单列 |
| 桌面 | 860-1024px | hero 双列，4列卡片收缩为2列 |
| 宽屏 | > 1024px | 全面展示，1200px 容器 |

---

## 组件对照表（用于学生端/教师端）

以下 CSS token 已在 `:root` 中全局定义，可直接使用 `var(--xxx)`：

| 变量名 | 浅色值 | 深色值 | 用途 |
|--------|--------|--------|------|
| `--canvas` | `#f8f4ee` | `#101010` | 页面背景 |
| `--surface` | `#ffffff` | `#181818` | 区块背景 |
| `--card-bg` | `#ffffff` | `#222222` | 卡片背景 |
| `--hairline` | `#e3dbd0` | `#3a3a3a` | 边框/分割线 |
| `--hairline-strong` | `#ccc2b4` | `#555555` | 输入框/按钮边框 |
| `--ink` | `#2a2a2a` | `#e8e4e0` | 主文字 |
| `--muted` | `#6b655c` | `#aaa6a0` | 次要文字 |
| `--muted-soft` | `#9f988e` | `#888480` | 更弱文字 |
| `--primary` | `#d97757` | `#e0805f` | 主色 |
| `--primary-active` | `#c46a4a` | `#d97757` | 主色悬停 |
| `--primary-bg` | `rgba(217,119,87,0.12)` | `rgba(217,119,87,0.2)` | 主色弱背景 |
| `--shadow` | `0 4px 12px rgba(0,0,0,0.06)` | `0 4px 12px rgba(0,0,0,0.4)` | 默认阴影 |
| `--shadow-hover` | `0 12px 32px rgba(0,0,0,0.1)` | `0 12px 32px rgba(0,0,0,0.6)` | 悬停阴影 |

---

## 注意事项

1. 不要使用 `<style scoped>` 定义 `:root` 内的 CSS 变量 —— 它们不会全局生效。CSS 变量请在独立的 `<style>`（非 scoped）块中定义
2. 页面根容器使用 `background: var(--canvas)` + `color: var(--ink)` + `transition` 实现主题切换
3. 所有卡片组件使用 12px 圆角，8px 圆角仅用于按钮和输入框
4. 不使用 emoji，所有图标使用 SVG
5. 深色模式不需要单独实现切换逻辑，只需在 `<html>` 上设置 `data-theme` 属性
