<template>
  <div class="management">
    <!-- 顶部导航 -->
    <header
      class="sticky top-0 z-50 bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md w-full"
    >
      <div
        class="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center gap-8"
      >
        <div class="flex-shrink-0">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">
              <el-icon><House /></el-icon>
              首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>管理中心</el-breadcrumb-item>
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

    <!-- 主要内容区域 -->
    <main class="py-8 w-full mx-auto px-36">
      <el-tabs v-model="activeTab" class="management-tabs">
        <el-tab-pane label="分类管理" name="categories">
          <div class="mb-4 flex justify-between items-center">
            <h2 class="text-2xl font-bold">分类管理</h2>
            <el-button type="primary" @click="openCategoryDialog('add')">
              <el-icon><Plus /></el-icon>
              添加分类
            </el-button>
          </div>

          <!-- 分类表格 -->
          <el-card class="mb-6">
            <el-table
              v-loading="loading.categories"
              :data="categories"
              stripe
              style="width: 100%"
              row-key="id"
              border
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="分类名称" min-width="150" />
              <el-table-column
                prop="description"
                label="描述"
                min-width="250"
              />
              <el-table-column label="工具数量" width="120" align="center">
                <template #default="scope">
                  <el-tag type="info">{{
                    scope.row.tools?.length || 0
                  }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button-group>
                    <el-button
                      type="primary"
                      :icon="Edit"
                      size="small"
                      @click="openCategoryDialog('edit', scope.row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      :icon="Delete"
                      size="small"
                      @click="confirmDelete('category', scope.row)"
                    >
                      删除
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>

        <el-tab-pane label="工具管理" name="tools">
          <div class="mb-4 flex justify-between items-center">
            <h2 class="text-2xl font-bold">工具管理</h2>
            <el-button type="primary" @click="openToolDialog('add')">
              <el-icon><Plus /></el-icon>
              添加工具
            </el-button>
          </div>

          <!-- 工具搜索和过滤 -->
          <el-card class="mb-4">
            <div class="flex flex-wrap gap-4 items-end">
              <el-input
                v-model="toolSearch"
                placeholder="搜索工具名称或描述"
                class="w-64"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <el-select
                v-model="toolCategoryFilter"
                placeholder="按分类筛选"
                clearable
                class="w-48"
              >
                <el-option
                  v-for="category in categories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>

              <el-button @click="resetToolFilters">
                <el-icon><RefreshRight /></el-icon>
                重置筛选
              </el-button>
            </div>
          </el-card>

          <!-- 工具表格 -->
          <el-card>
            <el-table
              v-loading="loading.tools"
              :data="filteredTools"
              stripe
              style="width: 100%"
              row-key="id"
              border
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column label="图标" width="80" align="center">
                <template #default="scope">
                  <el-avatar :size="32" :src="getFaviconUrl(scope.row.url)">
                    <el-icon><Picture /></el-icon>
                  </el-avatar>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="工具名称" min-width="150" />
              <el-table-column
                prop="description"
                label="描述"
                min-width="250"
                show-overflow-tooltip
              />
              <el-table-column
                prop="url"
                label="链接"
                min-width="200"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <el-link type="primary" :href="scope.row.url" target="_blank">
                    {{ scope.row.url }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column label="分类" width="120">
                <template #default="scope">
                  <el-tag>{{ getCategoryName(scope.row.category) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button-group>
                    <el-button
                      type="primary"
                      :icon="Edit"
                      size="small"
                      @click="openToolDialog('edit', scope.row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      :icon="Delete"
                      size="small"
                      @click="confirmDelete('tool', scope.row)"
                    >
                      删除
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>

            <div class="flex justify-center mt-4">
              <el-pagination
                v-model="currentPage"
                :page-size="pageSize"
                @update:page-size="pageSize = $event"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="filteredTools.length"
                background
              />
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </main>

    <!-- 分类表单对话框 -->
    <el-dialog
      v-model="dialogs.category"
      :title="formMode === 'add' ? '添加分类' : '编辑分类'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入分类描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogs.category = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveCategory"
            :loading="loading.save"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 工具表单对话框 -->
    <el-dialog
      v-model="dialogs.tool"
      :title="formMode === 'add' ? '添加工具' : '编辑工具'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="toolFormRef"
        :model="toolForm"
        :rules="toolRules"
        label-width="80px"
        label-position="left"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="toolForm.name" placeholder="请输入工具名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="toolForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入工具描述"
          />
        </el-form-item>
        <el-form-item label="链接" prop="url">
          <el-input v-model="toolForm.url" placeholder="请输入工具链接" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select
            v-model="toolForm.category"
            placeholder="请选择分类"
            class="w-full"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-tag
            v-for="tag in toolForm.tags"
            :key="tag"
            class="mx-1"
            closable
            @close="removeTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputTagVisible"
            ref="tagInputRef"
            v-model="inputTagValue"
            class="ml-1 w-20"
            size="small"
            @keyup.enter="addTag"
            @blur="addTag"
          />
          <el-button v-else size="small" @click="showTagInput">
            <el-icon><Plus /></el-icon>
            添加标签
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogs.tool = false">取消</el-button>
          <el-button type="primary" @click="saveTool" :loading="loading.save">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import {
  House,
  Back,
  Edit,
  Delete,
  Plus,
  Search,
  Picture,
  Link,
  RefreshRight,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();

// 页面状态
const activeTab = ref("categories");
const loading = ref({
  categories: false,
  tools: false,
  save: false,
});
const dialogs = ref({
  category: false,
  tool: false,
});
const formMode = ref("add"); // 'add' 或 'edit'

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 数据
const categories = ref([
  { id: 1, name: "开发工具", description: "提升开发效率的必备工具", tools: [] },
  { id: 2, name: "AI 工具", description: "人工智能相关工具", tools: [] },
  { id: 3, name: "设计资源", description: "设计师必备资源和工具", tools: [] },
]);

const tools = ref([
  {
    id: 1,
    name: "Visual Studio Code",
    description: "强大的代码编辑器，支持多种编程语言",
    url: "https://code.visualstudio.com",
    category: 1,
    tags: ["编辑器", "开发"],
  },
  {
    id: 2,
    name: "ChatGPT",
    description: "OpenAI 开发的对话式 AI 模型",
    url: "https://chat.openai.com",
    category: 2,
    tags: ["AI", "对话"],
  },
  {
    id: 3,
    name: "Figma",
    description: "基于浏览器的协作设计工具",
    url: "https://www.figma.com",
    category: 3,
    tags: ["设计", "UI/UX"],
  },
]);

// 工具筛选
const toolSearch = ref("");
const toolCategoryFilter = ref("");

const filteredTools = computed(() => {
  let result = [...tools.value];

  // 搜索过滤
  if (toolSearch.value) {
    const searchLower = toolSearch.value.toLowerCase();
    result = result.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower)
    );
  }

  // 分类过滤
  if (toolCategoryFilter.value) {
    result = result.filter(
      (tool) => tool.category === toolCategoryFilter.value
    );
  }

  return result;
});

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTools.value.slice(start, end);
});

// 表单数据
const categoryForm = ref({
  id: null,
  name: "",
  description: "",
});

const toolForm = ref({
  id: null,
  name: "",
  description: "",
  url: "",
  category: null,
  tags: [],
});

// 表单验证规则
const categoryRules = {
  name: [
    { required: true, message: "请输入分类名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" },
  ],
  description: [{ required: true, message: "请输入分类描述", trigger: "blur" }],
};

const toolRules = {
  name: [
    { required: true, message: "请输入工具名称", trigger: "blur" },
    { min: 2, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" },
  ],
  description: [{ required: true, message: "请输入工具描述", trigger: "blur" }],
  url: [
    { required: true, message: "请输入工具链接", trigger: "blur" },
    { type: "url", message: "请输入正确的 URL 格式", trigger: "blur" },
  ],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
};

// 标签输入
const tagInputRef = ref(null);
const inputTagVisible = ref(false);
const inputTagValue = ref("");

// 表单引用
const categoryFormRef = ref(null);
const toolFormRef = ref(null);

// 方法
function goBack() {
  router.push("/");
}

function resetToolFilters() {
  toolSearch.value = "";
  toolCategoryFilter.value = "";
}

function getCategoryName(categoryId) {
  const category = categories.value.find((c) => c.id === categoryId);
  return category ? category.name : "未分类";
}

function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return "";
  }
}

function openCategoryDialog(mode, category = null) {
  formMode.value = mode;
  if (mode === "edit" && category) {
    categoryForm.value = { ...category };
  } else {
    categoryForm.value = {
      id: null,
      name: "",
      description: "",
    };
  }
  dialogs.value.category = true;
}

function openToolDialog(mode, tool = null) {
  formMode.value = mode;
  if (mode === "edit" && tool) {
    toolForm.value = { ...tool };
    // 确保 tags 是数组
    if (!Array.isArray(toolForm.value.tags)) {
      toolForm.value.tags = [];
    }
  } else {
    toolForm.value = {
      id: null,
      name: "",
      description: "",
      url: "",
      category: categories.value.length > 0 ? categories.value[0].id : null,
      tags: [],
    };
  }
  dialogs.value.tool = true;
}

function showTagInput() {
  inputTagVisible.value = true;
  nextTick(() => {
    tagInputRef.value.focus();
  });
}

function addTag() {
  if (inputTagValue.value) {
    if (!toolForm.value.tags.includes(inputTagValue.value)) {
      toolForm.value.tags.push(inputTagValue.value);
    }
  }
  inputTagVisible.value = false;
  inputTagValue.value = "";
}

function removeTag(tag) {
  toolForm.value.tags = toolForm.value.tags.filter((t) => t !== tag);
}

function saveCategory() {
  categoryFormRef.value.validate((valid) => {
    if (valid) {
      loading.value.save = true;

      // 模拟保存操作
      setTimeout(() => {
        if (formMode.value === "add") {
          // 生成新的 ID
          const newId = Math.max(0, ...categories.value.map((c) => c.id)) + 1;
          categories.value.push({
            ...categoryForm.value,
            id: newId,
            tools: [],
          });
          ElMessage.success("分类添加成功");
        } else {
          // 更新已有分类
          const index = categories.value.findIndex(
            (c) => c.id === categoryForm.value.id
          );
          if (index !== -1) {
            categories.value[index] = {
              ...categories.value[index],
              ...categoryForm.value,
            };
            ElMessage.success("分类更新成功");
          }
        }

        loading.value.save = false;
        dialogs.value.category = false;
      }, 500);
    }
  });
}

function saveTool() {
  toolFormRef.value.validate((valid) => {
    if (valid) {
      loading.value.save = true;

      // 模拟保存操作
      setTimeout(() => {
        if (formMode.value === "add") {
          // 生成新的 ID
          const newId = Math.max(0, ...tools.value.map((t) => t.id)) + 1;
          tools.value.push({
            ...toolForm.value,
            id: newId,
          });
          ElMessage.success("工具添加成功");
        } else {
          // 更新已有工具
          const index = tools.value.findIndex(
            (t) => t.id === toolForm.value.id
          );
          if (index !== -1) {
            tools.value[index] = {
              ...toolForm.value,
            };
            ElMessage.success("工具更新成功");
          }
        }

        loading.value.save = false;
        dialogs.value.tool = false;
      }, 500);
    }
  });
}

function confirmDelete(type, item) {
  ElMessageBox.confirm(
    `确定要删除${type === "category" ? "分类" : "工具"} "${item.name}" 吗？`,
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      if (type === "category") {
        categories.value = categories.value.filter((c) => c.id !== item.id);
        ElMessage.success("分类删除成功");
      } else {
        tools.value = tools.value.filter((t) => t.id !== item.id);
        ElMessage.success("工具删除成功");
      }
    })
    .catch(() => {
      // 取消删除
    });
}

// 页面加载
onMounted(() => {
  // 模拟数据加载
  loading.value.categories = true;
  loading.value.tools = true;

  setTimeout(() => {
    loading.value.categories = false;
    loading.value.tools = false;
  }, 800);
});
</script>

<style scoped>
.management {
  margin: 0 auto;
  width: 100%; /* 改为 100% 而不是 100dvw */
  height: 100%;
  background-color: #f0f2f5;
  overflow-x: hidden; /* 防止横向滚动 */
}

.management-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.management-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  padding: 0 20px;
}

/* 添加过渡动画 */
.el-table :deep(.el-table__row) {
  transition: all 0.3s ease;
}

.el-table :deep(.el-table__row:hover) {
  background-color: #f0f7ff !important;
}

/* 标签输入样式 */
.el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
