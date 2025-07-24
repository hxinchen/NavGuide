<template>
  <div>
    <!-- 侧边导航栏 -->
    <v-navigation-drawer permanent>
      <v-list>
        <v-list-item
          to="/management/categories"
          :active="route.path === '/management/categories'"
          prepend-icon="mdi-shape"
          title="分类管理"
        ></v-list-item>
        <v-list-item
          to="/management/tools"
          :active="route.path === '/management/tools'"
          prepend-icon="mdi-tools"
          title="工具管理"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- 主内容区域 -->
    <v-main>
      <!-- 顶部导航栏 -->
      <v-app-bar flat>
        <v-breadcrumbs :items="breadcrumbItems"></v-breadcrumbs>
        <v-spacer></v-spacer>
        <v-btn color="primary" prepend-icon="mdi-arrow-left" @click="goBack">
          返回首页
        </v-btn>
      </v-app-bar>

      <!-- 内容区域 -->
      <v-container fluid class="pa-4">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// 面包屑导航
const breadcrumbItems = computed(() => [
  {
    title: '首页',
    disabled: false,
    href: '/',
  },
  {
    title: '管理中心',
    disabled: true,
  },
  {
    title: route.name === 'management-categories' ? '分类管理' : '工具管理',
    disabled: true,
  },
]);

function goBack() {
  router.push("/");
}
</script>

<style scoped>
/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>