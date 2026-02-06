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
* {
  transform: scale(1) !important;
  zoom: 100% !important;
}
/* ====================标语区域样式 ==================== */
.slogan-section {
  width: 100%;
  padding: 0;
  margin: 0;
  position: relative;
  top: 0;
  left: 0;
  transform: none;
  z-index: 1;
  height: auto;
  min-height: 65vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
}

.slogan-container {
  text-align: center;
  padding: 0;
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 18px;
  box-sizing: border-box;
}

.slogan-text {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 1.9rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.125px;
  line-height: 1.2;
  margin-bottom: 3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  opacity: 0.15; 
  width: 100%;
  pointer-events: none;
}

.slogan-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 2px;
  margin-bottom: 3px;
  position: relative;
  z-index: 2;
}

.decoration-line {
  flex: 1;
  height: 0.75px;
  background: linear-gradient(90deg, transparent, #06b6d4, transparent);
  border-radius: 9999px;
  opacity: 0.5; 
}

.decoration-icon {
  font-size: 0.7rem;
  color: #06b6d4;
  animation: pulse 2s infinite;
  opacity: 0.5; 
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); } 
  50% { opacity: 0.6; transform: scale(1.1); } 
}

/* ==================== 搜索区域样式 ==================== */

.search-section {
  width: 100%;
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 10;
  position: relative;
  top: -60vh;
  left: 0;
  display: block;
}

.search-wrapper {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1.25px solid #3b82f6;
  border-radius: 1rem;
  padding: 8px 16.25px;
  box-shadow: 0 5px 6.25px -1.25px rgba(0, 0, 0, 0.1), 0 2.5px 2.5px -1.25px rgba(0, 0, 0, 0.04);
  transition: all 300ms ease;
  height: auto;
  width: 70vw;
  max-width: 1200px;
  min-width: 500px;
  margin: 0 auto;
  
  &:hover {
    border-color: #1d4ed8;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    transform: translateY(-1.5px);
  }
  
  &:focus-within {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 1.5px rgba(139, 92, 246, 0.2);
  }
}

.search-icon {
  font-size: 1.05rem;
  color: #94a3b8;
  margin-right: 12px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  padding: 3px 70px 3px 0;
  color: #0f172a;
  min-width: 0;
  background-color: transparent;
  font-weight: 500;
  letter-spacing: 0.2px;
  height: 1.8rem;
  
  &::placeholder {
    color: #94a3b8;
    font-size: 1rem;
    font-weight: 400;
  }
}

.search-button {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: #ffffff;
  border: none;
  padding: 7px 20px;
  border-radius: 0.625rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 300ms ease;
  white-space: nowrap;
  letter-spacing: 0.25px;
  box-shadow: 0 2.5px 3.75px -0.75px rgba(0, 0, 0, 0.1), 0 1px 1.5px -0.5px rgba(0, 0, 0, 0.05);
  position: absolute; 
  right: 5px;
  bottom: 5px;
  overflow: hidden;
  height: 2.2rem;
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
    transform: translateY(-1px);
    box-shadow: 0 3.75px 7.5px rgba(0, 0, 0, 0.25);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-0.5px);
  }
}

/* ==================== 响应式设计 ==================== */

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
    margin-top: -7.5px;
  }
  
  .slogan-container {
    padding: 0 0.25rem;
    max-width: 100%;
  }
  
  .slogan-text {
    font-size: 0.95rem;
    opacity: 0.1; 
  }
  
  .decoration-icon {
    font-size: 0.375rem;
  }
  
  .slogan-decoration {
    gap: 0.1875rem;
    margin-top: 0.0625rem;
    margin-bottom: 0.125rem;
  }
  
  .search-section {
    padding: 0;
    margin-bottom: 0; 
    padding-bottom: 0;
    margin-bottom: 0;
    transform: translateY(20rem);
  }
  
  .search-wrapper {
    padding: 0 0.25rem;
    max-width: 100%;
  }
  
  .search-container {
    padding: 0.1875rem 0.25rem;
    border-radius: 0.625rem;
  }
  
  .search-icon {
    font-size: 0.3125rem;
    margin-right: 0.1875rem;
  }
  
  .search-input {
    font-size: 0.28125rem;
    height: auto; 
    padding: 0.125rem 0.375rem 0.125rem 0.125rem;
    
    &::placeholder {
      font-size: 0.28125rem;
    }
  }
  
  .search-button {
    position: static; 
    padding: 0.125rem 0.375rem;
    font-size: 0.25rem;
    margin-left: 0.1875rem;
    height: auto; 
  }
}

@media (max-width: 480px) {
  .slogan-section {
    height: 40vh;
    margin-top: -5px;
  }
  
  .slogan-container {
    padding: 0 0.1875rem;
  }
  
  .slogan-text {
    font-size: 0.625rem;
    opacity: 0.08; 
  }
  
  .slogan-decoration {
    gap: 0.125rem;
    margin-top: 0.0625rem;
    margin-bottom: 0.125rem;
  }
  
  .search-section {
    padding: 0; 
    margin-bottom: 0; 
    padding-bottom: 0;
    margin-bottom: 0;
    transform: translateY(12rem);
  }
  
  .search-wrapper {
    padding: 0 0.1875rem;
  }
  
  .search-container {
    flex-direction: column;
    gap: 0.1875rem;
    padding: 0.25rem;
    border-radius: 0.1875rem;
  }
  
  .search-icon {
    display: none;
  }
  
  .search-input {
    text-align: center;
    padding: 0.125rem;
    height: auto; 
    
    &::placeholder {
      font-size: 0.25rem;
    }
  }
  
  .search-button {
    width: 100%;
    margin-left: 0;
    border-radius: 0.125rem;
    height: auto; 
    position: static; 
    font-size: 0.25rem;
  }
}
</style>
