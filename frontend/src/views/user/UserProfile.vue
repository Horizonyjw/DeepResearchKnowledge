<template>
  <div class="user-profile">
    <!-- 页面标题 -->
    <h3 class="profile-title">个人资料</h3>
    
    <!-- 头像区域 -->
    <div class="profile-avatar">
      <div class="avatar-placeholder">
        <span class="avatar-initial">U</span>
      </div>
      <button class="btn btn-sm btn-outline-primary">
        更换头像
      </button>
      <input
        type="file"
        accept="image/*"
        class="avatar-upload"
        hidden
      />
    </div>

    <!-- 表单区域 -->
    <div class="profile-form">
      <!-- 用户名 -->
      <div class="form-group">
        <label class="label">ID</label>
        <input
          class="form-input"
          type="text"
          value="user_2024_001"
          disabled
        />
        <p class="form-hint">唯一标识符，创建后不可修改</p>
      </div>

      <!-- 邮箱 -->
      <div class="form-group">
        <label class="label">邮箱</label>
        <input
          class="form-input"
          type="email"
          value="user@example.com"
        />
        <p class="form-hint">请输入有效的邮箱地址</p>
      </div>

      <!-- 昵称 -->
      <div class="form-group">
        <label class="label">昵称</label>
        <input
          class="form-input"
          type="text"
          value="小明同学"
        />
        <p class="form-hint">2-20个字符，支持中英文、数字，可随时修改</p>
      </div>

      <!-- 手机号 -->
      <div class="form-group">
        <label class="label">手机号</label>
        <input
          class="form-input"
          type="tel"
          value="13800138000"
        />
        <p class="form-hint">11位手机号码</p>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="profile-actions">
      <button class="btn btn-primary">
        保存资料
      </button>
      <div class="save-message">
        <!-- 保存成功/失败信息区域 -->
      </div>
    </div>
  </div>
</template>


<style scoped lang="scss">
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

$color-primary: #3b82f6;
$color-secondary: #8b5cf6;
$color-white: #ffffff;
$color-gray-50: #f8fafc;
$color-gray-100: #f1f5f9;
$color-gray-200: #e2e8f0;
$color-gray-300: #cbd5e1;
$color-gray-400: #94a3b8;
$color-gray-500: #64748b;
$color-gray-600: #475569;
$color-gray-700: #334155;
$color-gray-800: #1e293b;
$color-gray-900: #0f172a;
$color-success: #10b981;
$color-error: #ef4444;
$color-info: #3b82f6;

$font-weight-light: 300;
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
$font-weight-extrabold: 800;

$border-radius-sm: 0.125rem;
$border-radius-base: 0.25rem;
$border-radius-md: 0.375rem;
$border-radius-lg: 0.5rem;
$border-radius-xl: 0.75rem;
$border-radius-2xl: 1rem;
$border-radius-3xl: 1.5rem;
$border-radius-4xl: 2rem;
$border-radius-5xl: 2.5rem;
$border-radius-6xl: 3rem;
$border-radius-full: 9999px;

$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
$shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
$shadow-3xl: 0 35px 60px -15px rgba(0, 0, 0, 0.3);

$transition-fast: 150ms ease;
$transition-base: 300ms ease;
$transition-slow: 500ms ease;

/* 主容器 */
.user-profile {
  width: 100%;
  max-width: 48rem; 
  margin: 2rem auto; 
  padding: $spacing-8; 
  background: $color-white;
  border-radius: $border-radius-xl; 
  border: 1px solid $color-gray-200; 
  min-height: auto; 
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: static; 
  top: auto;
}

/* 页面标题 */
.profile-title {
  font-size: $font-size-2xl; 
  font-weight: $font-weight-bold;
  color: $color-gray-900;
  margin-bottom: $spacing-6;
  text-align: center;
  position: relative;
  padding-bottom: $spacing-4;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4rem; 
    height: 3px;
    background: linear-gradient(90deg, $color-primary, $color-secondary);
    border-radius: $border-radius-full;
  }
}

/* 头像区域 */
.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-4; 
  margin-bottom: $spacing-6;
  padding-bottom: $spacing-6;
  border-bottom: 2px solid $color-gray-200;
}

.avatar-placeholder {
  width: 8rem; 
  height: 8rem;
  border-radius: $border-radius-full;
  overflow: hidden;
  border: 4px solid $color-white;
  box-shadow: $shadow-md;
  background: linear-gradient(135deg, $color-primary, $color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  
  .avatar-initial {
    color: $color-white;
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
  }
}

/* 表单区域 */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
  margin-bottom: $spacing-6;
  width: 100%;
  max-width: 100%; 
  margin-left: auto;
  margin-right: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  width: 100%;
}

.label {
  font-size: $font-size-sm; 
  font-weight: $font-weight-medium;
  color: $color-gray-800;
  margin-bottom: $spacing-1;
  
  &::after {
    content: ':';
    margin-left: $spacing-1;
  }
}

.form-input {
  padding: $spacing-2 $spacing-3; 
  font-size: $font-size-base; 
  font-weight: $font-weight-normal;
  color: $color-gray-900;
  background: $color-white;
  border: 1px solid $color-gray-300; 
  border-radius: $border-radius-lg;
  transition: all $transition-base;
  width: 100%; 
  max-width: 100%; 
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.1); 
  }
  
  &:disabled {
    background: $color-gray-100;
    color: $color-gray-500;
    cursor: not-allowed;
    border-color: $color-gray-200;
  }
}

.form-hint {
  font-size: $font-size-xs; 
  color: $color-gray-500;
  margin-top: $spacing-1;
  margin-left: $spacing-1;
  font-weight: $font-weight-normal;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-2 $spacing-4; 
  font-size: $font-size-base; 
  font-weight: $font-weight-medium; 
  border-radius: $border-radius-lg;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all $transition-base;
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  gap: $spacing-2;
  min-width: 8rem; 
  
  &:focus {
    outline: 3px solid rgba($color-primary, 0.3); 
    outline-offset: 2px;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  /* 小按钮 */
  &-sm {
    padding: $spacing-1.5 $spacing-3;
    font-size: $font-size-sm; 
    min-width: 6rem;
  }
  
  /* 主要按钮 */
  &-primary {
    background: linear-gradient(135deg, $color-primary, $color-secondary);
    color: $color-white;
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, darken($color-primary, 12%), darken($color-secondary, 12%));
      box-shadow: $shadow-md;
      transform: translateY(-2px);
    }
  }
  
  /* 轮廓按钮 */
  &-outline-primary {
    background: transparent;
    color: $color-primary;
    border-color: $color-primary;
    
    &:hover {
      background: rgba($color-primary, 0.12);
      border-color: darken($color-primary, 18%);
      transform: translateY(-1px);
    }
  }
}

/* 按钮容器 */
.profile-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-4;
  margin-top: $spacing-6;
}

/* 保存信息区域 */
.save-message {
  min-height: $font-size-base; 
  font-size: $font-size-sm; 
  text-align: center;
  padding: $spacing-2;
  
  &.success {
    color: $color-success;
  }
  
  &.error {
    color: $color-error;
  }
}

/* 文件上传input隐藏 */
.avatar-upload {
  display: none;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .user-profile {
    max-width: 42rem;
    padding: $spacing-6 $spacing-4;
    margin: 2rem auto;
  }
  
  .profile-title {
    font-size: $font-size-xl;
  }
  
  .avatar-placeholder {
    width: 6rem;
    height: 6rem;
  }
  
  .label {
    font-size: $font-size-sm;
  }
  
  .form-input {
    font-size: $font-size-sm;
    border-width: 1px;
  }
  
  .form-hint {
    font-size: $font-size-xs;
  }
  
  .btn {
    font-size: $font-size-sm;
    padding: $spacing-2 $spacing-3;
    
    &-sm {
      font-size: $font-size-xs;
    }
  }
}

@media (max-width: 768px) {
  .user-profile {
    max-width: 95%;
    padding: $spacing-4 $spacing-3;
    border-width: 1px;
    margin: 1rem auto;
  }
  
  .profile-title {
    font-size: $font-size-lg;
  }
  
  .avatar-placeholder {
    width: 5rem;
    height: 5rem;
  }
  
  .profile-form {
    width: 100%;
  }
  
  .label,
  .form-input,
  .btn,
  .form-hint {
    font-size: $font-size-sm;
  }
  
  .form-input {
    border-width: 1px;
    padding: $spacing-2 $spacing-3;
  }
  
  .btn {
    padding: $spacing-2 $spacing-3;
    border-width: 1px;
    min-width: 7rem;
    
    &-sm {
      padding: $spacing-1.5 $spacing-2;
      font-size: $font-size-xs;
      min-width: 5rem;
    }
  }
}

@media (max-width: 480px) {
  .user-profile {
    padding: $spacing-3 $spacing-2;
    border-width: 1px;
    margin: 1rem auto;
  }
  
  .profile-title {
    font-size: $font-size-base;
  }
  
  .avatar-placeholder {
    width: 4rem;
    height: 4rem;
  }
  
  .profile-form {
    width: 100%;
  }
  
  .label,
  .form-input,
  .btn,
  .form-hint {
    font-size: $font-size-xs;
  }
  
  .form-input {
    border-width: 1px;
    padding: $spacing-1.5 $spacing-2;
  }
  
  .btn {
    padding: $spacing-1.5 $spacing-2;
    border-width: 1px;
    min-width: 6rem;
    font-size: $font-size-xs;
    
    &-sm {
      padding: $spacing-1 $spacing-1.5;
      font-size: $font-size-xs;
      min-width: 4rem;
    }
  }
  
  .save-message {
    font-size: $font-size-xs;
  }
}

/* 加载动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading {
  display: inline-block;
  width: $spacing-4;
  height: $spacing-4;
  border: 2px solid rgba($color-gray-300, 0.3);
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>