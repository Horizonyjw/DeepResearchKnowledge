<template>
  <!-- 偏好设置容器 -->
  <div class="preferences-container">
    <!-- 设置卡片 -->
    <div class="preferences-card">
      <!-- 设置头部 -->
      <div class="preferences-header">
        <h2 class="preferences-title">偏好设置</h2>
        <p class="preferences-subtitle">个性化您的使用体验</p>
      </div>

      <!-- 设置内容 -->
      <div class="preferences-content">
        <!-- 界面设置 -->
        <div class="preference-section">
          <h3 class="section-title">
            <i class="section-icon"></i>
            界面设置
          </h3>
          
          <!-- 主题模式 -->
          <div class="preference-item">
            <div class="preference-label">
              <span class="preference-name">主题模式</span>
              <span class="preference-description">选择您喜欢的界面主题</span>
            </div>
            <div class="preference-control">
              <div class="theme-options">
                <button class="theme-option active">
                  <div class="theme-preview light-theme"></div>
                  <span class="theme-name">浅色</span>
                </button>
                <button class="theme-option">
                  <div class="theme-preview dark-theme"></div>
                  <span class="theme-name">深色</span>
                </button>
                <button class="theme-option">
                  <div class="theme-preview auto-theme"></div>
                  <span class="theme-name">自动</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 语言选择 -->
          <div class="preference-item">
            <div class="preference-label">
              <span class="preference-name">语言</span>
              <span class="preference-description">选择界面显示语言</span>
            </div>
            <div class="preference-control">
              <select class="language-select">
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
                <option value="ja-JP">日本語</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="preference-section">
          <h3 class="section-title">
            <i class="section-icon"></i>
            通知设置
          </h3>
          
          <!-- 邮件通知 -->
          <div class="preference-item">
            <div class="preference-label">
              <span class="preference-name">邮件通知</span>
              <span class="preference-description">接收重要更新和提醒邮件</span>
            </div>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- 推送通知 -->
          <div class="preference-item">
            <div class="preference-label">
              <span class="preference-name">推送通知</span>
              <span class="preference-description">接收实时推送通知</span>
            </div>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 隐私设置 -->
        <div class="preference-section">
          <h3 class="section-title">
            <i class="section-icon"></i>
            隐私设置
          </h3>
          
          <!-- 搜索历史 -->
          <div class="preference-item">
            <div class="preference-label">
              <span class="preference-name">保存搜索历史</span>
              <span class="preference-description">保存您的搜索记录以便快速访问</span>
            </div>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- 个性化推荐 -->
          <div class="preference-item">
            <div class="preference-label">
              <span class="preference-name">个性化推荐</span>
              <span class="preference-description">基于您的兴趣推荐内容</span>
            </div>
            <div class="preference-control">
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="preferences-actions">
        <button class="action-button save-button">
          <i class="button-icon"></i>
          <span>保存设置</span>
        </button>
        <button class="action-button reset-button">
          <i class="button-icon"></i>
          <span>恢复默认</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 这个文件只负责样式，不需要JavaScript逻辑
</script>

<style lang="scss" scoped>
@import '../../assets/styles/variables.scss';
// 间距系统 (基于8px网格)
$spacing-1: 0.25rem;     
$spacing-2: 0.5rem;      
$spacing-3: 0.75rem;    
$spacing-4: 1rem;       
$spacing-5: 1.25rem;     
$spacing-6: 1.5rem;      
$spacing-8: 2rem;        
$spacing-10: 2.5rem;     
$spacing-12: 3rem;       
$spacing-16: 4rem;       
$spacing-20: 5rem;       
$spacing-24: 6rem;       
$spacing-32: 8rem;       

// 🎨 主色调 - 蓝紫色系
$color-primary: #3b82f6;        // 主蓝色 - 用于主要按钮、重要元素
$color-primary-light: #60a5fa;   // 浅蓝色 - 用于悬停、高亮状态
$color-primary-dark: #1d4ed8;    // 深蓝色 - 用于激活状态

$color-secondary: #8b5cf6;       // 紫色 - 用于辅助元素、强调色
$color-secondary-light: #a78bfa;  // 浅紫色 - 用于背景、渐变
$color-secondary-dark: #7c3aed;   // 深紫色 - 用于深色主题

$color-accent: #06b6d4;          // 蓝绿色 - 点缀色，用于图标、小元素

// ⚪ 中性色 - 白色系
$color-white: #ffffff;           // 纯白色 - 背景、文字反色
$color-gray-50: #f8fafc;         // 最浅灰 - 页面背景
$color-gray-100: #f1f5f9;        // 浅灰 - 卡片背景
$color-gray-200: #e2e8f0;        // 中浅灰 - 边框、分隔线
$color-gray-300: #cbd5e1;        // 中等灰 - 禁用状态
$color-gray-400: #94a3b8;        // 中深灰 - 次要文字
$color-gray-500: #64748b;        // 深灰 - 正文文字
$color-gray-600: #475569;        // 更深灰 - 标题文字
$color-gray-700: #334155;        // 接近黑 - 重要标题
$color-gray-800: #1e293b;        // 深黑灰 - 强调文字
$color-gray-900: #0f172a;        // 接近纯黑 - 极少使用

// ✅ 功能色
$color-success: #10b981;         // 成功绿色 - 完成状态
$color-warning: #f59e0b;         // 警告黄色 - 提醒状态
$color-error: #ef4444;           // 错误红色 - 错误状态
$color-info: #3b82f6;            // 信息蓝色 - 提示信息

// 字体系统
$font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
$font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;

$font-size-xs: 0.75rem;      // 12px
$font-size-sm: 0.875rem;     // 14px 
$font-size-base: 1rem;       // 16px
$font-size-lg: 1.125rem;     // 18px
$font-size-xl: 1.25rem;      // 20px
$font-size-2xl: 1.5rem;      // 24px
$font-size-3xl: 1.875rem;    // 30px
$font-size-4xl: 2.25rem;     // 36px
$font-size-5xl: 3rem;        // 48px 
$font-size-6xl: 3.75rem;     // 60px 
$font-size-7xl: 4.5rem;      // 72px 
$font-size-8xl: 5.25rem;     // 84px 

$font-weight-light: 300;
$font-weight-normal: 400;    // 常规
$font-weight-medium: 500;    // 中等
$font-weight-semibold: 600;  // 半粗
$font-weight-bold: 700;      // 粗体
$font-weight-extrabold: 800; // 特粗

// 圆角系统
$border-radius-none: 0;
$border-radius-sm: 0.125rem;   // 2px
$border-radius-base: 0.25rem;  // 4px 
$border-radius-md: 0.375rem;   // 6px  
$border-radius-lg: 0.5rem;     // 8px 
$border-radius-xl: 0.75rem;    // 12px
$border-radius-2xl: 1rem;      // 16px 
$border-radius-3xl: 1.5rem;    // 24px
$border-radius-4xl: 2rem;      // 32px
$border-radius-5xl: 2.5rem;    // 40px 
$border-radius-6xl: 3rem;      // 48px 
$border-radius-full: 9999px;   // 完全圆形

// 阴影系统
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
$shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
$shadow-3xl: 0 35px 60px -15px rgba(0, 0, 0, 0.3);

// 动画
$transition-fast: 150ms ease;      // 快速过渡
$transition-base: 300ms ease;      // 基础过渡
$transition-slow: 500ms ease;      // 慢速过渡

// 布局尺寸
$navbar-height: 4rem;              // 64px  - 导航栏高度
$container-max-width: 80rem;       // 1280px - 容器最大宽度
$search-box-max-width: 50rem;      // 800px  - 搜索框最大宽度
$sidebar-width: 16rem;             // 256px - 侧边栏宽度

/* 偏好设置容器 */
.preferences-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $color-gray-50 0%, $color-gray-100 100%);
  padding: $spacing-24;
  /* 移除向下平移：transform: translateY(240px); */
}

/* 设置卡片 */
.preferences-card {
  width: 100%;
  max-width: 144rem;
  background: $color-white;
  border-radius: $border-radius-5xl;
  padding: $spacing-32;
  box-shadow: $shadow-3xl;
  border: 3px solid $color-gray-200;
}

/* 设置头部 */
.preferences-header {
  text-align: center;
  margin-bottom: $spacing-32;
  padding-bottom: $spacing-24;
  border-bottom: 3px solid $color-gray-200;
  
  .preferences-title {
    font-size: $font-size-7xl;
    font-weight: $font-weight-bold;
    color: $color-gray-900;
    margin-bottom: $spacing-8;
  }
  
  .preferences-subtitle {
    font-size: $font-size-5xl;
    color: $color-gray-600;
  }
}

/* 设置内容 */
.preferences-content {
  margin-bottom: $spacing-32;
}

/* 设置区块 */
.preference-section {
  margin-bottom: $spacing-32;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: $spacing-12;
  font-size: $font-size-5xl;
  font-weight: $font-weight-semibold;
  color: $color-gray-900;
  margin-bottom: $spacing-24;
  padding-bottom: $spacing-12;
  border-bottom: 4px solid $color-gray-200;
}

.section-icon {
  font-size: $font-size-5xl;
}

/* 设置项 */
.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-16 $spacing-8;
  margin-bottom: $spacing-16;
  border-radius: $border-radius-3xl;
  transition: all $transition-base;
  
  &:hover {
    background: $color-gray-50;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
}

.preference-label {
  flex: 1;
  max-width: 60%;
}

.preference-name {
  display: block;
  font-size: $font-size-5xl;
  font-weight: $font-weight-semibold;
  color: $color-gray-900;
  margin-bottom: $spacing-4;
}

.preference-description {
  display: block;
  font-size: $font-size-5xl;
  color: $color-gray-600;
  line-height: 1.4;
}

.preference-control {
  flex-shrink: 0;
}

/* 主题选项 */
.theme-options {
  display: flex;
  gap: $spacing-12;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-8;
  padding: $spacing-8;
  background: $color-white;
  border: 4px solid $color-gray-300;
  border-radius: $border-radius-3xl;
  cursor: pointer;
  transition: all $transition-base;
  
  &:hover {
    border-color: $color-primary;
    transform: translateY(-8px);
  }
  
  &.active {
    border-color: $color-primary;
    background: $color-gray-50;
  }
}

.theme-preview {
  width: 9rem;
  height: 6rem;
  border-radius: $border-radius-2xl;
  border: 3px solid $color-gray-300;
}

.light-theme {
  background: linear-gradient(to right, $color-white 50%, $color-gray-100 50%);
}

.dark-theme {
  background: linear-gradient(to right, $color-gray-800 50%, $color-gray-900 50%);
}

.auto-theme {
  background: linear-gradient(to right, $color-white 33%, $color-gray-800 33%, $color-gray-800 66%, $color-gray-900 66%);
}

.theme-name {
  font-size: $font-size-4xl;
  font-weight: $font-weight-medium;
  color: $color-gray-700;
}

/* 语言选择 */
.language-select {
  padding: $spacing-8 $spacing-16;
  font-size: $font-size-5xl;
  color: $color-gray-900;
  background: $color-white;
  border: 4px solid $color-gray-300;
  border-radius: $border-radius-3xl;
  cursor: pointer;
  transition: all $transition-base;
  min-width: 30rem;
  
  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 12px rgba($color-primary, 0.1);
  }
}

/* 切换开关 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 10.5rem;
  height: 6rem;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $color-gray-300;
  border-radius: $border-radius-full;
  transition: all $transition-base;
  
  &:before {
    position: absolute;
    content: "";
    height: 4.5rem;
    width: 4.5rem;
    left: 0.75rem;
    bottom: 0.75rem;
    background-color: $color-white;
    border-radius: $border-radius-full;
    transition: all $transition-base;
  }
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, $color-primary 0%, $color-secondary 100%);
}

input:checked + .toggle-slider:before {
  transform: translateX(4.5rem);
}

/* 操作按钮 */
.preferences-actions {
  display: flex;
  gap: $spacing-16;
  justify-content: center;
}

.action-button {
  display: flex;
  align-items: center;
  gap: $spacing-8;
  padding: $spacing-12 $spacing-24;
  font-size: $font-size-5xl;
  font-weight: $font-weight-medium;
  border-radius: $border-radius-3xl;
  cursor: pointer;
  transition: all $transition-base;
  border: none;
}

.save-button {
  background: linear-gradient(135deg, $color-primary 0%, $color-secondary 100%);
  color: $color-white;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: $shadow-3xl;
  }
}

.reset-button {
  background: $color-white;
  color: $color-primary;
  border: 4px solid $color-primary;
  
  &:hover {
    background: $color-primary;
    color: $color-white;
    transform: translateY(-8px);
    box-shadow: $shadow-3xl;
  }
}

.button-icon {
  font-size: $font-size-5xl;
}
</style>