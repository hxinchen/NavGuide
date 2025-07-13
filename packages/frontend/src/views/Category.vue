<template>
  <div class="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-all duration-300 ease-out">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
      <div class="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center gap-8">
        <div class="flex-shrink-0">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">
              <el-icon><House /></el-icon>
              首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>{{ category?.name || '加载中...' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="flex items-center gap-4 flex-1 justify-end">
          <el-input
            v-model="searchQuery"
            placeholder="搜索工具..."
            class="search-input max-w-xs"
            :prefix-icon="Search"
            clearable
          />
          
          <div class="flex items-center gap-2">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="grid">
                <el-icon><Grid /></el-icon>
              </el-radio-button>
              <el-radio-button label="list">
                <el-icon><List /></el-icon>
              </el-radio-button>
            </el-radio-group>
            
            <el-dropdown trigger="click" @command="handleSort">
              <el-button class="sort-btn border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <el-icon><Sort /></el-icon>
                排序
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="name">按名称</el-dropdown-item>
                  <el-dropdown-item command="popular">按热度</el-dropdown-item>
                  <el-dropdown-item command="recent">最近添加</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </header>

    <!-- 分类标题区域 -->
    <section class="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-8">
      <div class="max-w-6xl mx-auto px-8">
        <div class="flex items-center gap-6 animate-fade-in-up">
          <div class="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center flex-shrink-0">
            <el-icon :size="32"><FolderOpened /></el-icon>
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold mb-2 tracking-tight">{{ category?.name || '加载中...' }}</h1>
            <p class="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {{ category?.description || '精选优质工具，提升开发效率' }}
            </p>
            <div class="flex gap-6">
              <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">{{ filteredTools.length }} 个工具</span>
              <span class="text-sm text-gray-600 dark:text-gray-400 font-medium">{{ category?.tools?.length || 0 }} 总数</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 工具列表 -->
    <main class="py-8">
      <div class="max-w-6xl mx-auto px-8">
        <el-skeleton :loading="isLoading" animated :count="8" :throttle="500">
          <template #template>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="i in 8" :key="i" class="p-6 border border-gray-200 dark:border-gray-800 rounded-xl flex gap-4">
                <el-skeleton-item variant="image" class="w-12 h-12 rounded-lg flex-shrink-0" />
                <div class="flex-1">
                  <el-skeleton-item variant="h3" class="h-5 mb-2" />
                  <el-skeleton-item variant="text" class="h-4 mb-1" />
                  <el-skeleton-item variant="text" class="h-4" />
                </div>
              </div>
            </div>
          </template>
          
          <div v-if="filteredTools.length > 0" :class="[
            'animate-fade-in',
            viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'
          ]">
            <div
              v-for="(tool, index) in sortedTools"
              :key="tool.id"
              :class="[
                'relative bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-500 ease-out overflow-hidden group',
                'hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-400/50 dark:hover:border-blue-500/50',
                'hover:bg-white dark:hover:bg-gray-800',
                'transform-gpu will-change-transform',
                viewMode === 'list' ? 'flex items-center gap-6' : 'flex flex-col',
                'animate-slide-in-up'
              ]"
              :style="{ animationDelay: `${index * 0.05}s` }"
              @click="openTool(tool.url)"
            >
              <!-- 增强的悬停光效 -->
              <div class="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-blue-500/10 dark:via-blue-400/10 to-transparent transition-all duration-1000 ease-out group-hover:left-full"></div>
              
              <!-- 背景光晕效果 -->
              <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
              
              <!-- 图标容器优化 -->
              <div class="w-12 h-12 rounded-lg overflow-hidden bg-white dark:bg-black flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-800 relative z-10 group-hover:scale-110 group-hover:border-blue-400/50 transition-all duration-300">
                <el-image
                  style="transform: scale(0.7)"
                  :src="getFaviconUrl(tool.url)"
                  :alt="tool.name"
                  fit="contain"
                  class="w-full h-full transition-transform duration-300 group-hover:scale-110"
                >
                  <template #error>
                    <div class="text-gray-400 dark:text-gray-600 group-hover:text-blue-500 transition-colors duration-300">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
              </div>
              
              <div :class="['flex-1 relative z-10', viewMode === 'grid' ? 'mt-4' : '']">
                <h3 class="text-lg font-semibold mb-2 text-black dark:text-white group-hover:text-blue-100 dark:group-hover:text-blue-400 transition-colors duration-300">{{ tool.name }}</h3>
                <p :class="[
                  'text-gray-600 dark:text-gray-400 mb-4 leading-relaxed text-sm group-hover:text-gray-100 dark:group-hover:text-gray-300 transition-colors duration-300',
                  viewMode === 'list' ? 'line-clamp-2' : ''
                ]">{{ tool.description }}</p>
                <div class="flex flex-wrap gap-2 mb-4" v-if="tool.tags">
                  <span 
                    v-for="tag in tool.tags" 
                    :key="tag" 
                    class="px-2 py-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-600 dark:text-gray-400 font-medium group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:border-blue-200 dark:group-hover:border-blue-700 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all duration-300"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              
              <div :class="['relative z-10', viewMode === 'list' ? 'ml-auto' : '']">
                <el-button 
                  type="primary" 
                  text 
                  class="font-medium group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 transform group-hover:scale-105"
                >
                  访问
                  <el-icon class="group-hover:rotate-12 transition-transform duration-300"><Link /></el-icon>
                </el-button>
              </div>
              
              <!-- 优化的悬停遮罩 -->
              <div class="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-700/80 to-purple-600/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl backdrop-blur-sm z-20">
                <div class="transform scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 delay-100 bg-black/20 px-8 py-6 rounded-2xl backdrop-blur-md shadow-xl">
                  <el-icon :size="32" class="animate-pulse mx-auto"><Link /></el-icon>
                  <span class="font-semibold mt-3 text-lg block text-center">点击访问</span>
                  <div class="w-16 h-0.5 bg-white/70 mt-2 rounded-full mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
          
          <el-empty
            v-else-if="!isLoading"
            description="没有找到相关工具"
            :image-size="120"
            class="py-16"
          >
            <el-button type="primary" @click="$router.push('/')">
              返回首页
            </el-button>
          </el-empty>
        </el-skeleton>
      </div>
    </main>

    <!-- 返回顶部 -->
    <el-backtop :right="30" :bottom="30" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Search,
  Grid,
  List,
  Sort,
  House,
  FolderOpened,
  Picture,
  Link
} from '@element-plus/icons-vue'

const route = useRoute()
const category = ref(null)
const searchQuery = ref('')
const viewMode = ref('grid')
const sortBy = ref('name')
const isLoading = ref(true)

// 模拟获取分类数据
onMounted(() => {
  setTimeout(() => {
    category.value = {
      id: parseInt(route.params.id),
      name: '开发工具',
      description: '提升开发效率的必备工具集合',
      tools: [
        {
          id: 1,
          name: 'Visual Studio Code',
          description: '强大的代码编辑器，支持多种编程语言和丰富的插件生态系统，是现代开发者的首选工具。',
          icon: '/icons/vscode.png',
          url: 'https://code.visualstudio.com',
          tags: ['编辑器', '免费', '跨平台'],
          popular: 95
        },
        {
          id: 2,
          name: 'WebStorm',
          description: '专业的 Web 开发 IDE，提供智能代码补全、调试和测试工具，适合大型项目开发。',
          icon: '/icons/webstorm.png',
          url: 'https://www.jetbrains.com/webstorm/',
          tags: ['IDE', '付费', 'JavaScript'],
          popular: 85
        },
        {
          id: 3,
          name: 'GitHub',
          description: '全球最大的代码托管平台，提供版本控制和协作功能，是开源项目的首选平台。',
          icon: '/icons/github.png',
          url: 'https://github.com',
          tags: ['版本控制', '协作', '开源'],
          popular: 98
        },
        {
          id: 4,
          name: 'Docker Desktop',
          description: '容器化应用管理工具，简化应用部署和环境管理，提高开发效率。',
          icon: '/icons/docker.png',
          url: 'https://www.docker.com/products/docker-desktop',
          tags: ['容器', '部署', 'DevOps'],
          popular: 88
        },
        {
          id: 5,
          name: 'Postman',
          description: 'API 开发协作平台，提供接口测试、文档生成和团队协作功能。',
          icon: '/icons/postman.png',
          url: 'https://www.postman.com/',
          tags: ['API', '测试', '协作'],
          popular: 92
        },
        {
          id: 6,
          name: 'Figma',
          description: '协作界面设计工具，支持实时协作和原型设计，是UI/UX设计师的必备工具。',
          icon: '/icons/figma.png',
          url: 'https://www.figma.com/',
          tags: ['设计', '协作', '原型'],
          popular: 90
        }
      ]
    }
    isLoading.value = false
  }, 800)
})

// 计算属性
const filteredTools = computed(() => {
  if (!category.value) return []
  if (!searchQuery.value) return category.value.tools
  
  const query = searchQuery.value.toLowerCase()
  return category.value.tools.filter(tool =>
    tool.name.toLowerCase().includes(query) ||
    tool.description.toLowerCase().includes(query) ||
    (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(query)))
  )
})

const sortedTools = computed(() => {
  const tools = [...filteredTools.value]
  
  switch (sortBy.value) {
    case 'name':
      return tools.sort((a, b) => a.name.localeCompare(b.name))
    case 'popular':
      return tools.sort((a, b) => (b.popular || 0) - (a.popular || 0))
    case 'recent':
      return tools.sort((a, b) => b.id - a.id)
    default:
      return tools
  }
})

// 方法
const openTool = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const handleSort = (command) => {
  sortBy.value = command
}
function getEnhancedFaviconUrl(url) {
  try {
    const domain = new URL(url).origin;
    // 尝试多种可能的 favicon 路径
    return [
      `${domain}/favicon.ico`,
      `${domain}/favicon.png`,
      `${domain}/apple-touch-icon.png`,
      `https://www.google.com/s2/favicons?domain=${domain}` // Google 的 favicon 服务
    ];
  } catch (e) {
    console.error("Invalid URL:", url);
    return null;
  }
}
// 在 script setup 部分添加 getFaviconUrl 函数
function getFaviconUrl(url) { 
  try { 
    const domain = new URL(url).origin; // 获取域名 
    // return `${domain}/favicon.ico`; 
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
  } catch (e) { 
    console.error("Invalid URL:", url); 
    return null; 
  } 
}
</script>

<style scoped>
/* Element Plus 组件样式覆盖 */
.search-input :deep(.el-input__wrapper) {
  @apply rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900;
}

.sort-btn {
  @apply border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900;
}

/* 自定义动画 */
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}

.animate-slide-in-up {
  animation: slide-in-up 0.6s ease-out;
}

/* 文本截断工具类 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
