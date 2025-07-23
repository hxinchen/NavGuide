<template>
  <div class="management-layout">
    <!-- 侧边栏导航 -->
    <aside class="sidebar">
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical-demo"
        router
      >
        <el-menu-item index="/management/categories">
          <el-icon><Grid /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/management/tools">
          <el-icon><Tools /></el-icon>
          <span>工具管理</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 右侧内容 -->
    <div class="content-wrapper">
      <!-- 顶部导航 -->
      <header
        class="sticky top-0 z-50 bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md w-full"
      >
        <div
          class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center"
        >
          <div class="flex-shrink-0">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">
                <el-icon><House /></el-icon>
                首页
              </el-breadcrumb-item>
              <el-breadcrumb-item>管理中心</el-breadcrumb-item>
              <el-breadcrumb-item :to="route.path">{{
                route.name === "management-categories" ? "分类管理" : "工具管理"
              }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="flex items-center gap-4">
            <el-button type="primary" @click="goBack">
              <el-icon><Back /></el-icon>
              返回首页
            </el-button>
          </div>
        </div>
      </header>

      <!-- 内容区域 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
function goBack() {
  router.push("/");
}
</script>

<style scoped>
.management-layout {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%; /* 继承来自 #app-root 的100%高度 */
  background-color: #f0f2f5;
}

.sidebar {
  width: 15dvw;
  flex-shrink: 0;
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
}

.el-menu {
  height: 100%;
  border-right: none;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1; /* 占据剩余的所有宽度 */
  min-width: 0; /* flex 布局下的一个健壮性设置，防止内容溢出 */
}

header {
  flex-shrink: 0; /* 防止 header 被压缩 */
}

.main-content {
  /* flex: 1; 占据 content-wrapper 垂直方向的剩余空间 */
  overflow-y: auto; /* 关键：只在这里应用滚动条 */
  flex-grow: 1;
  padding: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
