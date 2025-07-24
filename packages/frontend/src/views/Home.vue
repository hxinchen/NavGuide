<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <v-app-bar
      flat
      class="px-0 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md"
    >
      <v-container class="d-flex align-center">
        <div class="d-flex align-center gap-3">
          <div class="logo-icon">
            <v-icon size="24">mdi-tools</v-icon>
          </div>
          <h1 class="text-xl font-bold tracking-tight">DevKit</h1>
        </div>

        <v-spacer></v-spacer>

        <v-text-field
          v-model="searchQuery"
          density="compact"
          variant="outlined"
          placeholder="搜索开发工具..."
          prepend-inner-icon="mdi-magnify"
          class="mx-8 max-w-md"
          hide-details
          clearable
          @focus="onSearchFocus"
          @blur="onSearchBlur"
        ></v-text-field>

        <v-btn color="primary" class="mr-4" @click="router.push('/management')">
          管理
        </v-btn>
        <v-switch
          v-model="isDarkMode"
          :prepend-icon="isDarkMode ? 'mdi-weather-night' : 'mdi-weather-sunny'"
          hide-details
          @update:model-value="toggleTheme"
        ></v-switch>
      </v-container>
    </v-app-bar>

    <!-- 主要内容区域 -->
    <v-main class="py-8">
      <v-container>
        <!-- 欢迎区域 -->
        <section
          v-if="!searchQuery"
          class="text-center py-12 mb-12 animate-fade-in"
        >
          <h2 class="text-4xl font-bold mb-3">开发者工具导航</h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            精选优质开发工具，提升您的开发效率
          </p>
          <div class="d-flex justify-center gap-12">
            <div
              v-for="(stat, index) in stats"
              :key="index"
              class="d-flex flex-column align-center"
            >
              <span class="text-3xl font-bold">{{ stat.number }}</span>
              <span
                class="text-sm text-gray-500 dark:text-gray-400 text-uppercase"
                >{{ stat.label }}</span
              >
            </div>
          </div>
        </section>

        <!-- 分类过滤器 -->
        <section v-if="!searchQuery" class="mb-12">
          <div class="d-flex flex-wrap justify-center gap-2">
            <v-btn
              v-for="category in allCategories"
              :key="category.id"
              :variant="activeCategory === category.id ? 'flat' : 'outlined'"
              :color="activeCategory === category.id ? 'primary' : 'default'"
              rounded="pill"
              @click="setActiveCategory(category.id)"
            >
              {{ category.name }}
            </v-btn>
          </div>
        </section>

        <!-- 工具分类展示 -->
        <section>
          <div v-if="filteredCategories.length > 0" class="space-y-12">
            <v-card
              v-for="category in displayedCategories"
              :key="category.id"
              class="bg-gray-50 dark:bg-gray-900 rounded-xl pa-6 transition-all hover:translate-y-[-4px]"
              variant="outlined"
            >
              <div
                class="d-flex justify-space-between align-center pb-4 mb-6 border-b border-gray-200 dark:border-gray-800"
              >
                <div class="d-flex align-center gap-3">
                  <v-icon>mdi-folder-open</v-icon>
                  <h3 class="text-xl font-semibold">{{ category.name }}</h3>
                </div>
                <v-btn
                  variant="text"
                  :to="{ name: 'management-categories' }"
                  class="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                  查看全部
                  <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
              </div>

              <v-row>
                <v-col
                  v-for="(tool, index) in category.tools.slice(0, 8)"
                  :key="tool.id"
                  cols="12"
                  sm="6"
                  lg="3"
                  :style="{ animationDelay: `${index * 0.1}s` }"
                >
                  <v-card
                    class="tool-card position-relative overflow-hidden"
                    variant="outlined"
                    @click="openTool(tool.url)"
                  >
                    <div class="tool-card-shine"></div>

                    <v-card-item>
                      <div class="tool-icon mb-4">
                        <v-img
                          :src="getEnhancedFaviconUrl(tool.url)"
                          :alt="tool.name"
                          contain
                          width="32"
                          height="32"
                        >
                          <template v-slot:error>
                            <v-icon class="text-gray-400">mdi-image</v-icon>
                          </template>
                        </v-img>
                      </div>

                      <v-card-title class="font-medium pa-0 mb-1">{{
                        tool.name
                      }}</v-card-title>
                      <v-card-text
                        class="text-sm text-gray-500 dark:text-gray-400 pa-0 line-clamp-2"
                      >
                        {{ tool.description }}
                      </v-card-text>
                    </v-card-item>

                    <div class="tool-link-icon">
                      <v-icon>mdi-link</v-icon>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </div>

          <v-sheet
            v-else-if="searchQuery"
            class="d-flex flex-column align-center justify-center pa-8"
          >
            <v-icon size="x-large" class="mb-4">mdi-magnify-off</v-icon>
            <span class="text-h6">未找到相关工具</span>
          </v-sheet>
        </section>
      </v-container>
    </v-main>

    <!-- 返回顶部 -->
    <v-btn
      icon
      color="primary"
      class="position-fixed"
      style="bottom: 30px; right: 30px"
      @click="scrollToTop"
    >
      <v-icon>mdi-arrow-up</v-icon>
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

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

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
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
.logo-icon {
  @apply w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center transition-transform hover:rotate-3 hover:scale-105;
}

/* 工具卡片 */
.tool-card {
  @apply bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md hover:border-gray-400 dark:hover:border-gray-600;
}

.tool-card-shine {
  @apply absolute inset-0 bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out;
}

.tool-icon {
  @apply w-12 h-12 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700;
}

.tool-link-icon {
  @apply absolute top-3 right-3 w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center opacity-0 scale-90 hover:opacity-100 hover:scale-100 transition-all duration-300;
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

/* 空间间隔 */
.space-y-12 > * + * {
  margin-top: 3rem;
}
</style>
