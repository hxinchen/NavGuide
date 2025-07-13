<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo-icon">
            <el-icon :size="24"><Tools /></el-icon>
          </div>
          <h1 class="logo-text">DevKit</h1>
        </div>

        <div class="search-section">
          <el-input
            v-model="searchQuery"
            placeholder="搜索开发工具..."
            class="search-input"
            :prefix-icon="Search"
            clearable
            @focus="onSearchFocus"
            @blur="onSearchBlur"
          />
        </div>

        <div>
          <el-switch
            v-model="isDarkMode"
            :active-icon="Moon"
            :inactive-icon="Sunny"
            @change="toggleTheme"
          />
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 欢迎区域 -->
        <section v-if="!searchQuery" class="welcome-section">
          <h2 class="welcome-title">开发者工具导航</h2>
          <p class="welcome-subtitle">精选优质开发工具，提升您的开发效率</p>
          <div class="stats-container">
            <div v-for="(stat, index) in stats" :key="index" class="stat-item">
              <span class="stat-number">{{ stat.number }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </section>

        <!-- 分类过滤器 -->
        <section v-if="!searchQuery" class="filter-section">
          <div class="filter-container">
            <button
              v-for="category in allCategories"
              :key="category.id"
              :class="[
                'filter-button',
                activeCategory === category.id
                  ? 'filter-button-active'
                  : 'filter-button-inactive',
              ]"
              @click="setActiveCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </section>

        <!-- 工具分类展示 -->
        <section>
          <div
            v-if="filteredCategories.length > 0"
            class="categories-container"
          >
            <div
              v-for="category in displayedCategories"
              :key="category.id"
              class="category-card"
            >
              <div class="category-header">
                <div class="category-title">
                  <el-icon :size="20"><FolderOpened /></el-icon>
                  <h3 class="category-name">{{ category.name }}</h3>
                </div>
                <router-link
                  :to="{ name: 'Category', params: { id: category.id } }"
                  class="view-all-link"
                >
                  查看全部
                  <el-icon><ArrowRight /></el-icon>
                </router-link>
              </div>

              <div class="tools-grid">
                <div
                  v-for="(tool, index) in category.tools.slice(0, 8)"
                  :key="tool.id"
                  class="tool-card group"
                  :style="{ animationDelay: `${index * 0.1}s` }"
                  @click="openTool(tool.url)"
                >
                  <div class="tool-card-shine"></div>

                  <div class="tool-icon">
                    <el-image
                      style="transform: scale(0.75)"
                      :src="getEnhancedFaviconUrl(tool.url)"
                      :alt="tool.name"
                      fit="contain"
                    >
                      <template #error>
                        <div class="tool-icon-fallback">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>

                  <div class="tool-content">
                    <h4 class="tool-name">{{ tool.name }}</h4>
                    <p class="tool-description">
                      {{ tool.description }}
                    </p>
                  </div>

                  <div class="tool-link-icon">
                    <el-icon><Link /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <el-empty
            v-else-if="searchQuery"
            description="未找到相关工具"
            :image-size="120"
          />
        </section>
      </div>
    </main>

    <!-- 返回顶部 -->
    <el-backtop :right="30" :bottom="30" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  Search,
  Tools,
  FolderOpened,
  ArrowRight,
  Picture,
  Link,
  Moon,
  Sunny,
} from "@element-plus/icons-vue";

// 路由
const router = useRouter();

// 状态和变量
const searchQuery = ref("");
const activeCategory = ref("all");
const isDarkMode = ref(false);
const isSearchFocused = ref(false);

// 统计数据
const stats = ref([
  { number: "100+", label: "开发工具" },
  { number: "10+", label: "分类" },
  { number: "1000+", label: "开发者使用" },
]);

// 分类数据
const categories = ref([
  {
    id: 1,
    name: "开发工具",
    description: "提升开发效率的必备工具",
    tools: [
      {
        id: 1,
        name: "Visual Studio Code",
        description: "强大的代码编辑器，支持多种编程语言",
        icon: "/icons/vscode.png",
        url: "https://code.visualstudio.com",
        category: 1,
      },
      {
        id: 2,
        name: "WebStorm",
        description: "专业的 Web 开发 IDE",
        icon: "/icons/webstorm.png",
        url: "https://www.jetbrains.com/webstorm/",
        category: 1,
      },
      {
        id: 3,
        name: "GitHub",
        description: "全球最大的代码托管平台",
        icon: "/icons/github.png",
        url: "https://github.com",
        category: 1,
      },
      {
        id: 4,
        name: "Docker Desktop",
        description: "容器化应用管理工具",
        icon: "/icons/docker.png",
        url: "https://www.docker.com/products/docker-desktop",
        category: 1,
      },
    ],
  },
  {
    id: 2,
    name: "设计工具",
    description: "UI/UX 设计必备工具",
    tools: [
      {
        id: 5,
        name: "Figma",
        description: "协作界面设计工具",
        icon: "/icons/figma.png",
        url: "https://www.figma.com/",
        category: 2,
      },
      {
        id: 6,
        name: "Adobe XD",
        description: "用户体验设计工具",
        icon: "/icons/xd.png",
        url: "https://www.adobe.com/products/xd.html",
        category: 2,
      },
    ],
  },
  {
    id: 3,
    name: "测试工具",
    description: "软件测试和调试工具",
    tools: [
      {
        id: 7,
        name: "Postman",
        description: "API 开发协作平台",
        icon: "/icons/postman.png",
        url: "https://www.postman.com/",
        category: 3,
      },
    ],
  },
]);

function getEnhancedFaviconUrl(url) {
  try {
    const domain = new URL(url).origin;
    // 尝试多种可能的 favicon 路径
    // return [
    //   `${domain}/favicon.ico`,
    //   `${domain}/favicon.png`,
    //   `${domain}/apple-touch-icon.png`,
    //   `https://www.google.com/s2/favicons?domain=${domain}` // Google 的 favicon 服务
    // ];
    // return `${domain}/favicon.ico`;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch (e) {
    console.error("Invalid URL:", url);
    return null;
  }
}

// 计算属性
const allCategories = computed(() => [
  { id: "all", name: "全部" },
  ...categories.value,
]);

const filteredCategories = computed(() => {
  if (activeCategory.value === "all") {
    return categories.value;
  }
  return categories.value.filter((cat) => cat.id === activeCategory.value);
});

const displayedCategories = computed(() => {
  if (searchQuery.value) {
    // 搜索逻辑
    const query = searchQuery.value.toLowerCase();
    return categories.value
      .map((category) => ({
        ...category,
        tools: category.tools.filter(
          (tool) =>
            tool.name.toLowerCase().includes(query) ||
            tool.description.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.tools.length > 0);
  }
  return filteredCategories.value;
});

// 方法
const setActiveCategory = (categoryId) => {
  activeCategory.value = categoryId;
};

const openTool = (url) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const onSearchFocus = () => {
  isSearchFocused.value = true;
};

const onSearchBlur = () => {
  isSearchFocused.value = false;
};

const toggleTheme = () => {
  document.documentElement.classList.toggle("dark", isDarkMode.value);
  localStorage.setItem("theme", isDarkMode.value ? "dark" : "light");
};

onMounted(() => {
  console.log("路由：", router.getRoutes());

  // 检查系统偏好
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark" || (savedTheme === null && prefersDark)) {
    isDarkMode.value = true;
    document.documentElement.classList.add("dark");
  }
});
</script>

<style scoped>
/* 页面容器 */
.page-container {
  @apply min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300;
}

/* 顶部导航栏 */
.header {
  @apply sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300;
}

.header-content {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between;
}

.logo-section {
  @apply flex items-center gap-3;
}

.logo-icon {
  @apply w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center transition-transform hover:rotate-3 hover:scale-105;
}

.logo-text {
  @apply text-xl font-bold tracking-tight;
}

.search-section {
  @apply flex-1 max-w-md mx-8;
}

/* 主要内容区域 */
.main-content {
  @apply py-8;
}

.container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

/* 欢迎区域 */
.welcome-section {
  @apply text-center py-12 mb-12 animate-fade-in;
}

.welcome-title {
  @apply text-4xl font-bold mb-3;
}

.welcome-subtitle {
  @apply text-lg text-gray-600 dark:text-gray-400 mb-8;
}

.stats-container {
  @apply flex justify-center gap-12;
}

.stat-item {
  @apply flex flex-col items-center;
}

.stat-number {
  @apply text-3xl font-bold;
}

.stat-label {
  @apply text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider;
}

/* 分类过滤器 */
.filter-section {
  @apply mb-12;
}

.filter-container {
  @apply flex flex-wrap justify-center gap-2;
}

.filter-button {
  @apply px-5 py-2 rounded-full border transition-all duration-200;
}

.filter-button-active {
  @apply bg-black text-white dark:bg-white dark:text-black border-transparent;
}

.filter-button-inactive {
  @apply bg-white dark:bg-black text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600;
}

/* 工具分类展示 */
.categories-container {
  @apply space-y-12;
}

.category-card {
  @apply bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg;
}

.category-header {
  @apply flex justify-between items-center pb-4 mb-6 border-b border-gray-200 dark:border-gray-800;
}

.category-title {
  @apply flex items-center gap-3;
}

.category-name {
  @apply text-xl font-semibold;
}

.view-all-link {
  @apply flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all duration-200 hover:translate-x-1 text-sm font-medium;
}

.tools-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4;
}

.tool-card {
  @apply bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md hover:border-gray-400 dark:hover:border-gray-600 relative overflow-hidden;
}

.tool-card-shine {
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out;
}

.tool-icon {
  @apply w-12 h-12 mb-4 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700;
}

.tool-icon-fallback {
  @apply text-gray-400;
}

.tool-content {
  @apply relative z-10;
}

.tool-name {
  @apply font-medium mb-1;
}

.tool-description {
  @apply text-sm text-gray-500 dark:text-gray-400 line-clamp-2;
}

.tool-link-icon {
  @apply absolute top-3 right-3 w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300;
}

/* Element Plus 组件样式覆盖 */
.search-input :deep(.el-input__wrapper) {
  @apply rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900;
}

/* 文本截断工具类 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeInUp 0.6s ease-out;
}
</style>
