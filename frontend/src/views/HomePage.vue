<template>
  <div class="home-page">
    <!-- 标语区域 -->
    <div class="slogan-section">
      <div class="slogan-container">
        <h2 class="slogan-text">Make in-depth research accessible to all</h2>
        <div class="slogan-decoration">
          <span class="decoration-line"></span>
          <i class="decoration-icon"></i>
          <span class="decoration-line"></span>
        </div>
      </div>
    </div>

    <!-- 搜索区域 - 置于页面最下方 -->
    <div class="search-section">
      <div class="search-wrapper">
        <!-- 搜索框容器 -->
        <div class="search-container">
          <!-- 搜索图标 -->
          <i class="search-icon"></i>
          <!-- 搜索输入框 -->
          <input 
            type="text" 
            class="search-input" 
            placeholder="输入关键词搜索..." 
          />
          <!-- 搜索按钮 -->
          <button class="search-button">
            搜索
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 首页组件逻辑
</script>

<style scoped lang="scss">
/* ====================标语区域样式 ==================== */
.slogan-section {
  width: 100%;
  padding: 0;
  margin-top: 0;
  margin-bottom: 0;
  position: relative; 
  top: 0; 
  left: 0; 
  transform: none; 
  z-index: 1;
  height: 70vh; 
  display: flex; 
  align-items: center;
  justify-content: center;
  margin-top: -60px;
}

.slogan-container {
  text-align: center;
  padding: 0;
  position: relative;
  width: 100%;
  max-width: 3600px;
  margin: 0 auto;
  padding: 0 72px;
  box-sizing: border-box;
}

.slogan-text {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 7.6rem; 
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  line-height: 1.2;
  margin-bottom: 12px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  opacity: 0.15; 
  width: 100%;
  pointer-events: none;
}

.slogan-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 8px;
  margin-bottom: 12px;
  position: relative;
  z-index: 2;
}

.decoration-line {
  flex: 1;
  height: 3px;
  background: linear-gradient(90deg, transparent, #06b6d4, transparent);
  border-radius: 9999px;
  opacity: 0.5; 
}

.decoration-icon {
  font-size: 2.8rem;
  color: #06b6d4;
  animation: pulse 2s infinite;
  opacity: 0.5; 
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); } 
  50% { opacity: 0.6; transform: scale(1.1); } 
}

/* ==================== 搜索区域样式 ==================== */

/* 搜索区域容器 */
.search-section {
  width: 100%;
  padding: 0;
  margin-top: auto; 
  margin-bottom: 0; 
  position: relative;
  z-index: 10;
  padding-bottom: 0;
  margin-bottom: 0;
  transform: translateY(12rem);
}

.search-wrapper {
  width: 100%;
  max-width: 4200px;
  margin: 0 auto;
  padding: 0 72px;
  box-sizing: border-box;
}

/* 搜索框整体容器 */
.search-container {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 5px solid #3b82f6;
  border-radius: 4rem;
  padding: 32px 65px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transition: all 300ms ease;
  height: auto;
  position: relative; 
  width: 100%;
  
  &:hover {
    border-color: #1d4ed8;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    transform: translateY(-6px);
  }
  
  &:focus-within {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 6px rgba(139, 92, 246, 0.2);
  }
}

/* 搜索图标 */
.search-icon {
  font-size: 4.2rem;
  color: #94a3b8;
  margin-right: 48px;
  flex-shrink: 0;
}

/* 搜索输入框 */
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 3.6rem;
  padding: 24px 280px 24px 0; 
  color: #0f172a;
  min-width: 0;
  background-color: transparent;
  font-weight: 500;
  letter-spacing: 0.8px;
  height: 8rem;
  
  &::placeholder {
    color: #94a3b8;
    font-size: 4rem; 
    font-weight: 400;
  }
}

/* 搜索按钮 */
.search-button {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: #ffffff;
  border: none;
  padding: 28px 80px;
  border-radius: 2.5rem;
  font-size: 4rem; 
  font-weight: 600;
  cursor: pointer;
  transition: all 300ms ease;
  white-space: nowrap;
  letter-spacing: 1px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: absolute; 
  right: 20px; 
  bottom: 20px; 
  overflow: hidden;
  height: 10rem; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-2px);
  }
}

/* ==================== 响应式设计 ==================== */

/* 平板设备适配（宽度 ≤ 768px） */
@media (max-width: 768px) {
  .slogan-section {
    padding: 0;
    margin-top: 0;
    margin-bottom: 0;
    position: relative;
    top: 0;
    left: 0;
    transform: none;
    height: 50vh; 
    margin-top: -30px;
  }
  
  .slogan-container {
    padding: 0 1rem;
    max-width: 100%;
  }
  
  .slogan-text {
    font-size: 3.8rem; 
    opacity: 0.1; 
  }
  
  .decoration-icon {
    font-size: 1.5rem;
  }
  
  .slogan-decoration {
    gap: 0.75rem;
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
  }
  
  .search-section {
    padding: 0;
    margin-bottom: 0; 
    padding-bottom: 0;
    margin-bottom: 0;
    transform: translateY(5rem);
  }
  
  .search-wrapper {
    padding: 0 1rem;
    max-width: 100%;
  }
  
  .search-container {
    padding: 0.75rem 1rem;
    border-radius: 2.5rem;
  }
  
  .search-icon {
    font-size: 1.25rem;
    margin-right: 0.75rem;
  }
  
  .search-input {
    font-size: 1.125rem;
    height: auto; 
    padding: 0.5rem 1.5rem 0.5rem 0.5rem;
    
    &::placeholder {
      font-size: 1.125rem;
    }
  }
  
  .search-button {
    position: static; 
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    margin-left: 0.75rem;
    height: auto; 
  }
}

/* 手机设备适配（宽度 ≤ 480px） */
@media (max-width: 480px) {
  .slogan-section {
    height: 40vh;
    margin-top: -20px;
  }
  
  .slogan-container {
    padding: 0 0.75rem;
  }
  
  .slogan-text {
    font-size: 2.5rem; 
    opacity: 0.08; 
  }
  
  .slogan-decoration {
    gap: 0.5rem;
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
  }
  
  .search-section {
    padding: 0; 
    margin-bottom: 0; 
    padding-bottom: 0;
    margin-bottom: 0;
    transform: translateY(3rem);
  }
  
  .search-wrapper {
    padding: 0 0.75rem;
  }
  
  .search-container {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.75rem;
  }
  
  .search-icon {
    display: none;
  }
  
  .search-input {
    text-align: center;
    padding: 0.5rem;
    height: auto; 
    
    &::placeholder {
      font-size: 1rem; 
    }
  }
  
  .search-button {
    width: 100%;
    margin-left: 0;
    border-radius: 0.5rem;
    height: auto; 
    position: static; 
    font-size: 1rem;
  }
}
</style>
