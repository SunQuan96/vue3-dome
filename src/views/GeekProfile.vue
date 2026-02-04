<template>
  <div class="geek-profile">
    <!-- 导航栏 -->
    <van-nav-bar 
      title="极客名片" 
      left-arrow 
      @click-left="goBack"
      fixed
    />

    <!-- 极客名片卡片 -->
    <div class="profile-container">
      <!-- 卡片主体 -->
      <div 
        class="profile-card"
        :class="{ collapsed: isCollapsed }"
        @mouseenter="showHandle = true"
        @mouseleave="showHandle = false"
      >
        <!-- 卡片手柄（悬停显示） -->
        <div 
          v-if="showHandle"
          class="card-handle"
          @click="toggleCard"
        >
          <i class="handle-icon">{{ isCollapsed ? '▼' : '▲' }}</i>
        </div>

        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                alt="极客头像"
                class="avatar"
              />
              <div class="avatar-glow"></div>
            </div>
            <div class="name-title">
              <h1 class="name">代码狂人</h1>
              <p class="title">全栈工程师 & AI 探索者</p>
            </div>
          </div>
          
          <!-- 社交链接 -->
          <div class="social-links">
            <a 
              v-for="link in socialLinks"
              :key="link.name"
              :href="link.url"
              class="social-link"
              target="_blank"
              @mouseenter="createParticles($event)"
            >
              <i :class="link.icon"></i>
              <span class="link-text">{{ link.name }}</span>
            </a>
          </div>
        </div>

        <!-- 卡片内容（可折叠） -->
        <div class="card-content">
          <!-- 个人简介 -->
          <div class="section">
            <h2 class="section-title">
              <i class="fas fa-user"></i>
              关于我
            </h2>
            <p class="section-content">
              一个热爱技术的全栈开发者，专注于 Vue.js、React、Node.js 和人工智能领域。
              喜欢探索新技术，解决复杂问题，并热衷于开源贡献。
            </p>
          </div>

          <!-- 技能展示 -->
          <div class="section">
            <h2 class="section-title">
              <i class="fas fa-code"></i>
              技术栈
            </h2>
            <div class="skills">
              <div 
                v-for="skill in skills"
                :key="skill.name"
                class="skill-item"
              >
                <div class="skill-info">
                  <span class="skill-name">{{ skill.name }}</span>
                  <span class="skill-percent">{{ skill.percent }}%</span>
                </div>
                <div class="skill-bar">
                  <div 
                    class="skill-progress"
                    :style="{ width: skill.percent + '%', backgroundColor: skill.color }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 项目经验 -->
          <div class="section">
            <h2 class="section-title">
              <i class="fas fa-rocket"></i>
              项目经验
            </h2>
            <div class="projects">
              <div 
                v-for="project in projects"
                :key="project.name"
                class="project-item"
              >
                <h3 class="project-name">{{ project.name }}</h3>
                <p class="project-desc">{{ project.description }}</p>
                <div class="project-tech">
                  <span 
                    v-for="tech in project.technologies"
                    :key="tech"
                    class="tech-tag"
                  >
                    {{ tech }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 联系信息 -->
          <div class="section">
            <h2 class="section-title">
              <i class="fas fa-envelope"></i>
              联系我
            </h2>
            <div class="contact-info">
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>geek@example.com</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-phone"></i>
                <span>+86 138 0013 8000</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>中国 · 北京</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 卡片底部 -->
        <div class="card-footer">
          <div class="quote">
            <i class="fas fa-quote-left"></i>
            <span class="quote-text">代码改变世界，技术创造未来</span>
            <i class="fas fa-quote-right"></i>
          </div>
        </div>
      </div>

      <!-- 粒子效果容器 -->
      <div class="particles-container" ref="particlesContainer"></div>
    </div>
    
    <!-- 底部导航 -->
    <BottomNavigation current-tab="profile" @tab-change="onTabChange" />
  </div>
</template>

<script>
import BottomNavigation from '@/components/BottomNavigation.vue'

export default {
  name: 'GeekProfile',
  components: {
    BottomNavigation
  },
  data() {
    return {
      isCollapsed: false,
      showHandle: false,
      socialLinks: [
        { name: 'GitHub', icon: 'fab fa-github', url: 'https://github.com' },
        { name: '掘金', icon: 'fas fa-gem', url: 'https://juejin.cn' },
        { name: '知乎', icon: 'fab fa-zhihu', url: 'https://zhihu.com' },
        { name: '博客', icon: 'fas fa-blog', url: 'https://blog.example.com' },
        { name: '领英', icon: 'fab fa-linkedin', url: 'https://linkedin.com' }
      ],
      skills: [
        { name: 'Vue.js', percent: 95, color: '#42b883' },
        { name: 'React', percent: 88, color: '#61dafb' },
        { name: 'Node.js', percent: 92, color: '#68a063' },
        { name: 'TypeScript', percent: 85, color: '#3178c6' },
        { name: 'Python', percent: 90, color: '#3776ab' },
        { name: 'Docker', percent: 80, color: '#2496ed' }
      ],
      projects: [
        {
          name: '智能数据分析平台',
          description: '基于 Vue 3 + ECharts 构建的数据可视化平台，支持实时数据分析和报表生成。',
          technologies: ['Vue.js', 'ECharts', 'Node.js', 'MongoDB']
        },
        {
          name: 'AI 代码助手',
          description: '使用机器学习技术开发的智能代码补全和错误检测工具。',
          technologies: ['Python', 'TensorFlow', 'FastAPI', 'React']
        },
        {
          name: '微服务架构系统',
          description: '基于 Docker 和 Kubernetes 的分布式微服务架构，支持高并发场景。',
          technologies: ['Docker', 'Kubernetes', 'Spring Boot', 'Redis']
        }
      ]
    }
  },
  mounted() {
    // 加载 Font Awesome
    this.loadFontAwesome()
    // 加载 Tailwind CSS
    this.loadTailwindCSS()
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    
    toggleCard() {
      this.isCollapsed = !this.isCollapsed
    },
    
    createParticles(event) {
      const container = this.$refs.particlesContainer
      if (!container) return
      
      const rect = event.target.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      
      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div')
        particle.className = 'particle'
        
        // 随机颜色
        const colors = ['#00ff88', '#0088ff', '#ff0088', '#ff8800', '#8800ff']
        const color = colors[Math.floor(Math.random() * colors.length)]
        
        // 随机位置和动画
        const angle = Math.random() * Math.PI * 2
        const distance = 20 + Math.random() * 30
        const duration = 0.5 + Math.random() * 0.5
        
        particle.style.cssText = `
          position: fixed;
          left: ${x}px;
          top: ${y}px;
          width: 4px;
          height: 4px;
          background-color: ${color};
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
          animation: particleMove ${duration}s ease-out forwards;
        `
        
        // 定义动画
        const keyframes = `
          @keyframes particleMove {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0);
              opacity: 0;
            }
          }
        `
        
        // 添加动画样式
        const style = document.createElement('style')
        style.textContent = keyframes
        document.head.appendChild(style)
        
        container.appendChild(particle)
        
        // 动画结束后移除粒子
        setTimeout(() => {
          particle.remove()
          style.remove()
        }, duration * 1000)
      }
    },
    
    loadFontAwesome() {
      // 检查是否已加载 Font Awesome
      if (!document.querySelector('link[href*="font-awesome"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
        document.head.appendChild(link)
      }
    },
    
    loadTailwindCSS() {
      // 检查是否已加载 Tailwind CSS
      if (!document.querySelector('link[href*="tailwind"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'
        document.head.appendChild(link)
      }
    },
    
    onTabChange(tabName) {
      // 当标签页变化时，可以在这里处理一些逻辑
      console.log('标签页切换到:', tabName)
    }
  }
}
</script>

<style lang="scss" scoped>
.geek-profile {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding-top: 46px; // 导航栏高度
  padding-bottom: 50px; // 为底部导航栏留出空间
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.profile-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 30px;
  position: relative;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  &.collapsed {
    .card-content {
      max-height: 0;
      opacity: 0;
      margin-top: 0;
      padding-top: 0;
      padding-bottom: 0;
    }
    
    .card-footer {
      opacity: 0.5;
    }
  }
}

.card-handle {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    
    .handle-icon {
      transform: scale(1.2);
    }
  }
  
  .handle-icon {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    transition: all 0.3s ease;
  }
}

.card-header {
  margin-bottom: 30px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  
  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 2;
  }
  
  .avatar-glow {
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    background: linear-gradient(45deg, #00ff88, #0088ff, #ff0088);
    border-radius: 50%;
    filter: blur(10px);
    opacity: 0.5;
    z-index: 1;
    animation: glowRotate 3s linear infinite;
  }
}

@keyframes glowRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.name-title {
  .name {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(45deg, #00ff88, #0088ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 5px;
  }
  
  .title {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 300;
  }
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    color: #fff;
    
    &::before {
      transform: translateX(100%);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: transform 0.6s ease;
  }
  
  i {
    font-size: 18px;
  }
  
  .link-text {
    font-size: 14px;
    font-weight: 500;
  }
}

.card-content {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 2000px;
  opacity: 1;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.section {
  margin-bottom: 30px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 15px;
  
  i {
    color: #00ff88;
    font-size: 18px;
  }
}

.section-content {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}

.skills {
  .skill-item {
    margin-bottom: 15px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .skill-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    
    .skill-name {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }
    
    .skill-percent {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
  
  .skill-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .skill-progress {
    height: 100%;
    border-radius: 4px;
    transition: width 1s ease-in-out;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      animation: shimmer 2s infinite;
    }
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.projects {
  .project-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .project-name {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 8px;
  }
  
  .project-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
    margin-bottom: 10px;
  }
  
  .project-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .tech-tag {
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }
}

.contact-info {
  .contact-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    i {
      color: #00ff88;
      font-size: 16px;
      width: 20px;
    }
    
    span {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.card-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: opacity 0.3s ease;
}

.quote {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  i {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }
  
  .quote-text {
    font-size: 16px;
    font-style: italic;
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
  }
}

.particles-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
}

// 响应式设计
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
  
  .profile-card {
    padding: 20px;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .name-title {
    .name {
      font-size: 28px;
    }
    
    .title {
      font-size: 14px;
    }
  }
  
  .social-links {
    gap: 8px;
  }
  
  .social-link {
    padding: 8px 15px;
    
    .link-text {
      font-size: 12px;
    }
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .section-content {
    font-size: 14px;
  }
}
</style>