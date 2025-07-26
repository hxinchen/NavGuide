<template>
  <div class="tool-management">
    <!-- 标题和添加按钮 -->
    <div class="header-section">
      <h2 class="page-title">工具管理</h2>


    </div>

    <!-- 工具搜索和过滤 -->
    <v-card class="search-card">
      <v-card-text class="search-content">
        <div class="search-filters">
          <v-text-field v-model="toolSearch" label="搜索工具名称或描述"  prepend-inner-icon="mdi-magnify" clearable hide-details
            class="search-field" variant="outlined"></v-text-field>

          <v-select v-model="toolCategoryFilter" label="按分类筛选" :items="categories"  item-title="name" item-value="id"
            clearable hide-details class="filter-select" variant="outlined"></v-select>

          <v-btn class="reset-btn" prepend-icon="mdi-refresh" @click="resetToolFilters" variant="outlined">
            重置筛选
          </v-btn>
          <v-btn class="add-btn" prepend-icon="mdi-plus" @click="openToolDialog('add')" elevation="2">
            添加工具
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 工具表格 -->
    <v-card class="data-card">
      <v-data-table :loading="loading.tools" :items="paginatedTools" :headers="toolHeaders" :items-per-page="pageSize"
        :page="currentPage" @update:page="currentPage = $event" @update:items-per-page="handleSizeChange" 
        item-value="id" class="modern-table">
        <!-- 自定义列 -->
        <template v-slot:[`item.icon`]="{ item }">
          <div class="icon-container">
            <v-avatar size="36" class="tool-avatar">
              <v-img :src="getFaviconUrl(item.url)" alt="icon">
                <template v-slot:placeholder>
                  <v-icon color="teal-lighten-1">mdi-image</v-icon>
                </template>
              </v-img>
            </v-avatar>
          </div>
        </template>
        <template v-slot:[`item.url`]="{ item }">
          <a :href="item.url" target="_blank" class="url-link">
            {{ item.url }}
          </a>
        </template>
        <template v-slot:[`item.category`]="{ item }">
          <v-chip class="category-chip" size="small">
            {{ item.category?.name || "未分类" }}
          </v-chip>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <div class="action-buttons">
            <v-btn size="small" class="edit-btn" @click="openToolDialog('edit', item)" variant="outlined">
              <v-icon size="small">mdi-pencil</v-icon>
              编辑
            </v-btn>
            <v-btn size="small" class="delete-btn" @click="confirmDelete('tool', item)" variant="outlined">
              <v-icon size="small">mdi-delete</v-icon>
              删除
            </v-btn>
          </div>
        </template>
        <template v-slot:[`item.description`]="{ item }">
          <v-tooltip :text="item.description" location="top">
            <template v-slot:activator="{ props }">
              <div v-bind="props" class="description-text">
                {{ item.description }}
              </div>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- 工具表单对话框 -->
    <v-dialog v-model="dialogs.tool" width="650" class="form-dialog">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon class="dialog-title-icon" color="teal">mdi-tools</v-icon>
          {{ formMode === "add" ? "添加工具" : "编辑工具" }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="dialog-content">
          <v-form ref="toolFormRef" v-model="formValid">
            <v-text-field v-model="toolForm.name" label="工具名称" :rules="nameRules" required variant="outlined"
              class="form-field"></v-text-field>
            <v-textarea v-model="toolForm.description" label="工具描述" :rules="descriptionRules" rows="3"
              variant="outlined" class="form-field"></v-textarea>
            <v-text-field v-model="toolForm.url" label="工具链接" :rules="urlRules" required variant="outlined"
              class="form-field"></v-text-field>
            <v-select v-model="toolForm.categoryId" label="选择分类" :items="categories" item-title="name" item-value="id"
              :rules="categoryRules" required variant="outlined" class="form-field"></v-select>
            <div class="tags-section">
              <label class="tags-label">标签</label>
              <div class="tags-container">
                <v-chip v-for="tag in toolForm.tags" :key="tag" class="tag-chip" closable @click:close="removeTag(tag)">
                  {{ tag }}
                </v-chip>
                <v-text-field v-if="inputTagVisible" ref="tagInputRef" v-model="inputTagValue" variant="outlined"
                  density="compact" hide-details class="tag-input" @keyup.enter="addTag" @blur="addTag"></v-text-field>
                <v-btn v-else size="small" variant="outlined" class="add-tag-btn" @click="showTagInput">
                  <v-icon size="small">mdi-plus</v-icon>
                  添加标签
                </v-btn>
              </div>
            </div>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn class="cancel-btn" @click="dialogs.tool = false" variant="outlined">
            取消
          </v-btn>
          <v-btn class="confirm-btn" :loading="loading.save" @click="saveTool">
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="dialogs.deleteConfirm" width="450" class="delete-dialog">
      <v-card class="delete-card">
        <v-card-title class="delete-title">
          <v-icon class="delete-title-icon" color="warning">mdi-alert-circle</v-icon>
          确认删除
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="delete-content">
          <p class="delete-message">
            您确定要删除工具 <strong class="tool-name">"{{ deleteItem?.name }}"</strong> 吗？
          </p>
          <p class="delete-warning">
            此操作不可撤销，请谨慎操作。
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="delete-actions">
          <v-spacer></v-spacer>
          <v-btn class="cancel-btn" @click="cancelDelete" variant="outlined">
            取消
          </v-btn>
          <v-btn class="delete-confirm-btn" :loading="loading.tools" @click="handleDelete">
            确认删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { getTools, getCategories, createTool, updateTool, deleteTool } from "../api/api";
import type { VForm, VTextField } from "vuetify/components";

// --- 类型定义 ---

interface Category {
  id: number;
  name: string;
}

// 后端返回的工具数据结构
interface Tool {
  id: number;
  name: string;
  description?: string;
  url: string;
  tags: string; // 后端返回的是 JSON 字符串
  categoryId: number;
  category?: Category;
}

// 工具表单状态
interface ToolFormState {
  id: number | null;
  name: string;
  description?: string;
  url: string;
  categoryId: number | null;
  tags: string[];
}

type FormMode = "add" | "edit";

// --- VDataTable 表头定义 ---
const toolHeaders: any[] = [
  { title: "ID", key: "id", width: "60px" },
  {
    title: "图标",
    key: "icon",
    width: "80px",
    align: "center",
    sortable: false,
  },
  { title: "工具名称", key: "name", width: "150px" },
  { title: "描述", key: "description", maxWidth: "200px", sortable: false },
  { title: "链接", key: "url", width: "200px" },
  { title: "分类", key: "category", width: "120px" },
  { title: "操作", key: "actions", width: "200px", sortable: false },
];

// --- 响应式状态 ---

const loading = ref({
  tools: false,
  save: false,
});

const dialogs = ref({
  tool: false,
  deleteConfirm: false,
});

// 删除确认对话框相关状态
const deleteItem = ref<Tool | null>(null);

const formMode = ref<FormMode>("add");
const formValid = ref(false);

const currentPage = ref(1);
const pageSize = ref(10);

const tools = ref<Tool[]>([]);
const categories = ref<Category[]>([]);

const toolSearch = ref("");
const toolCategoryFilter = ref<number | null>(null);

// --- 计算属性 ---

const filteredTools = computed<Tool[]>(() => {
  let result = [...tools.value];
  if (toolSearch.value) {
    const searchLower = toolSearch.value.toLowerCase();
    result = result.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchLower) ||
        (tool.description &&
          tool.description.toLowerCase().includes(searchLower))
    );
  }
  if (toolCategoryFilter.value !== null) {
    result = result.filter(
      (tool) => tool.categoryId === toolCategoryFilter.value
    );
  }
  return result;
});

const paginatedTools = computed<Tool[]>(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTools.value.slice(start, end);
});

// --- 表单相关 ---

const defaultToolFormState: ToolFormState = {
  id: null,
  name: "",
  description: "",
  url: "",
  categoryId: null,
  tags: [],
};

const toolForm = ref<ToolFormState>({ ...defaultToolFormState });

// 表单验证规则
const nameRules = [
  (v: string) => !!v || "请输入工具名称",
  (v: string) =>
    (v && v.length >= 2 && v.length <= 50) || "长度在 2 到 50 个字符",
];
const descriptionRules = [
  (v: string) => v.length <= 200 || "描述长度不能超过200个字符",
];
const urlRules = [
  (v: string) => !!v || "请输入工具链接",
  (v: string) => {
    const urlPattern = new RegExp(
      "^" +
      // 协议（必填），http或https
      "(https?:\\/\\/)" +
      // 域名或IP地址
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // 域名，如：example.com
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // 或 IPv4 地址
      // 可选端口
      "(\\:\\d+)?" +
      // 路径，可选
      "(\\/[-a-z\\d%_.~+]*)*" +
      // 查询字符串，可选
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      // 哈希，可选
      "(\\#[-a-z\\d_]*)?" +
      "$",
      "i"
    );
    return urlPattern.test(v) || "请输入正确的URL格式";
  },
];

const categoryRules = [(v: number) => !!v || "请选择分类"];

const tagInputRef = ref<InstanceType<typeof VTextField> | null>(null);
const inputTagVisible = ref(false);
const inputTagValue = ref("");

const toolFormRef = ref<InstanceType<typeof VForm> | null>(null);

// --- 方法 ---

function resetToolForm() {
  toolForm.value = {
    ...defaultToolFormState,
    categoryId: categories.value.length > 0 ? categories.value[0].id : null,
  };
  toolFormRef.value?.resetValidation();
}

function resetToolFilters() {
  toolSearch.value = "";
  toolCategoryFilter.value = null;
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return "";
  }
}

function openToolDialog(mode: FormMode, tool: Tool | null = null) {
  formMode.value = mode;
  if (mode === "edit" && tool) {
    toolForm.value.id = tool.id;
    toolForm.value.name = tool.name;
    toolForm.value.description = tool.description || "";
    toolForm.value.url = tool.url;
    toolForm.value.categoryId = tool.category?.id || tool.categoryId;

    // 修复标签解析问题
    try {
      if (tool.tags && tool.tags.trim() !== '' && tool.tags !== 'null' && tool.tags !== 'undefined') {
        const parsedTags = JSON.parse(tool.tags);
        // 确保解析出来的是数组，并且过滤掉空字符串
        toolForm.value.tags = Array.isArray(parsedTags) ? parsedTags.filter(tag => tag && tag.trim() !== '') : [];
      } else {
        toolForm.value.tags = [];
      }
    } catch (e) {
      console.warn('解析标签失败:', e);
      toolForm.value.tags = [];
    }
  } else {
    resetToolForm();
  }
  dialogs.value.tool = true;
}

function showTagInput() {
  inputTagVisible.value = true;
  nextTick(() => {
    tagInputRef.value?.focus();
  });
}

function addTag() {
  if (
    inputTagValue.value &&
    !toolForm.value.tags.includes(inputTagValue.value)
  ) {
    toolForm.value.tags.push(inputTagValue.value);
  }
  inputTagVisible.value = false;
  inputTagValue.value = "";
}

function removeTag(tag: string) {
  toolForm.value.tags = toolForm.value.tags.filter((t) => t !== tag);
}

async function saveTool() {
  if (!toolFormRef.value) return;

  const { valid } = await toolFormRef.value.validate();

  if (valid) {
    loading.value.save = true;
    const payload = {
      name: toolForm.value.name,
      description: toolForm.value.description,
      url: toolForm.value.url,
      categoryId: toolForm.value.categoryId,
      tags: toolForm.value.tags,
    };

    try {
      if (formMode.value === 'edit' && toolForm.value.id) {
        // 编辑模式
        await updateTool(toolForm.value.id, payload);
        console.log('工具更新成功');
      } else {
        // 添加模式
        await createTool(payload);
        console.log('工具创建成功');
      }
      await fetchTools();
    } catch (error) {
      console.error("保存工具失败:", error);
      alert(formMode.value === 'edit' ? '更新工具失败，请稍后重试' : '创建工具失败，请稍后重试');
    } finally {
      loading.value.save = false;
      dialogs.value.tool = false;
    }
  }
}

function confirmDelete(type: "tool", item: Tool) {
  deleteItem.value = item;
  dialogs.value.deleteConfirm = true;
}

async function handleDelete() {
  if (!deleteItem.value) return;

  loading.value.tools = true;
  try {
    await deleteTool(deleteItem.value.id);
    await fetchTools();
    console.log(`工具 "${deleteItem.value.name}" 删除成功`);
  } catch (error) {
    console.error("删除工具失败:", error);
    alert("删除工具失败，请稍后重试");
  } finally {
    loading.value.tools = false;
    dialogs.value.deleteConfirm = false;
    deleteItem.value = null;
  }
}

function cancelDelete() {
  dialogs.value.deleteConfirm = false;
  deleteItem.value = null;
}

async function fetchTools() {
  loading.value.tools = true;
  try {
    tools.value = await getTools();
  } catch (error) {
    console.error("Failed to fetch tools:", error);
  } finally {
    loading.value.tools = false;
  }
}

async function fetchCategories() {
  try {
    categories.value = await getCategories();
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }
}

function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
}

onMounted(() => {
  fetchTools();
  fetchCategories();
});
</script>

<style scoped>
.tool-management {
  @apply font-sans text-gray-800 bg-[#f8fafa] min-h-screen p-4;
}

.header-section {
  @apply flex justify-between items-center;
}

.title-container {
  @apply flex-1;
}

.page-title {
  @apply text-[2.5rem] font-semibold text-[#008080] mb-2 -tracking-tighter;
}

.page-subtitle {
  @apply text-[1.1rem] text-gray-500 m-0 font-normal;
}

.add-btn {
  @apply bg-gradient-to-br from-[#008080] to-[#20B2AA] text-white rounded-lg font-bold normal-case transition-all duration-300 ease-in-out;
}

.add-btn:hover {
  @apply bg-gradient-to-br from-[#006666] to-[#1a9999] -translate-y-0.5;
}

.search-card {
  @apply rounded-xl  mb-6 border ;
}

.search-content {
  @apply p-6;
}

.search-filters {
  @apply flex gap-5 items-center flex-wrap;
}

.search-field {
  @apply min-w-[300px] flex-1;
}

.filter-select {
  @apply min-w-[200px];
}

.reset-btn {
  @apply text-[#008080] border-[#008080] rounded-md normal-case;
}

.reset-btn:hover {
  @apply  border-[#006666];
}

.data-card {
  @apply rounded-xl  border  overflow-hidden;
}

.modern-table {
  @apply bg-white;
}

.modern-table :deep(.v-data-table__wrapper) {
  @apply rounded-xl;
}

.modern-table :deep(th) {
  @apply bg-[#f0fffe] text-[#008080] font-semibold border-b-2 border-[#e0f7f7];
}

.modern-table :deep(tr:hover) {
  @apply bg-[#e0f7f7];
}

.icon-container {
  @apply flex justify-center items-center;
}

.tool-avatar {
  @apply border-2 border-[#e0f7f7] ;
}

.url-link {
  @apply text-[#008080] no-underline font-medium transition-colors duration-300 ease-in-out;
}

.url-link:hover {
  @apply text-[#006666] underline;
}

.category-chip {
  @apply bg-gradient-to-br from-[#48D1CC] to-[#20B2AA] text-white font-medium rounded-md;
}

.action-buttons {
  @apply flex gap-2;
}

.edit-btn {
  @apply text-[#008080] border-[#008080] rounded-md normal-case text-sm;
}

.edit-btn:hover {
  @apply  border-[#006666];
}

.edit-btn :deep(.v-icon) {
  @apply mr-1;
}

.delete-btn {
  @apply text-[#d32f2f] border-[#d32f2f] rounded-md normal-case text-sm;
}

.delete-btn:hover {
  @apply  border-[#b71c1c];
}

.delete-btn :deep(.v-icon) {
  @apply mr-1;
}

.description-text {
  @apply  overflow-hidden text-ellipsis whitespace-nowrap text-gray-500;
}

.form-dialog :deep(.v-overlay__content) {
  @apply rounded-2xl ;
}

.dialog-card {
  @apply rounded-2xl overflow-hidden;
}

.dialog-title {
  @apply bg-gradient-to-br from-[#f0fffe] to-[#e6fffd] text-[#008080] text-2xl font-semibold p-5 px-6 flex items-center;
}

.dialog-title-icon {
  @apply mr-3;
}

.dialog-content {
  @apply py-8 px-6 bg-white;
}

.form-field {
  @apply mb-5;
}

.form-field :deep(.v-field--focused .v-field__outline) {
  @apply border-[#008080] !important;
}

.form-field :deep(.v-label.v-field-label--floating) {
  @apply text-[#008080] !important;
}

.tags-section {
  @apply mt-6;
}

.tags-label {
  @apply text-base font-medium text-gray-800 mb-3 block;
}

.tags-container {
  @apply flex flex-wrap gap-2 items-center p-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[56px];
}

.tag-chip {
  @apply bg-gradient-to-br from-[#48D1CC] to-[#20B2AA] text-white font-medium rounded-md;
}

.tag-input {
  @apply max-w-[150px] ml-2;
}

.add-tag-btn {
  @apply text-[#008080] border-[#008080] rounded-md normal-case text-sm;
}

.add-tag-btn:hover {
  @apply  bg-green-100
}

.dialog-actions {
  @apply p-4 px-6 bg-[#f8fafa];
}

.cancel-btn {
  @apply text-gray-500 border-gray-300 rounded-md normal-case mr-3;
}

.cancel-btn:hover {
  @apply bg-gray-100;
}

.confirm-btn {
  @apply bg-gradient-to-br from-[#008080] to-[#20B2AA] text-white rounded-md normal-case font-medium;
}

.confirm-btn:hover {
  @apply bg-gradient-to-br from-[#006666] to-[#1a9999] ;
}

.delete-dialog :deep(.v-overlay__content) {
  @apply rounded-2xl ;
}

.delete-card {
  @apply rounded-2xl overflow-hidden;
}

.delete-title {
  @apply bg-gradient-to-br from-[#fff3f3] to-[#ffebee] text-[#d32f2f] text-xl font-semibold p-5 px-6 flex items-center;
}

.delete-title-icon {
  @apply mr-3;
}

.delete-content {
  @apply p-6 bg-white;
}

.delete-message {
  @apply text-lg text-gray-800 mb-3;
}

.tool-name {
  @apply text-[#008080];
}

.delete-warning {
  @apply text-base text-gray-500 m-0;
}

.delete-actions {
  @apply p-4 px-6 bg-[#f8fafa];
}

.delete-confirm-btn {
  @apply bg-gradient-to-br from-[#d32f2f] to-[#f44336] text-white rounded-md normal-case font-medium;
}

.delete-confirm-btn:hover {
  @apply bg-gradient-to-br from-[#b71c1c] to-[#d32f2f] ;
}

@media (max-width: 768px) {
  .header-section {
    @apply flex-col gap-4 items-stretch;
  }

  .search-filters {
    @apply flex-col gap-4;
  }

  .search-field,
  .filter-select {
    @apply min-w-0 w-full;
  }

  .action-buttons {
    @apply flex-col gap-1;
  }

  .tags-container {
    @apply min-h-0;
  }
}

.v-tooltip> :deep(.v-overlay__content) {
  @apply  text-white rounded-md text-sm py-2 px-3;
}

.v-data-table-progress :deep(th) {
  @apply border-b-0;
}

.v-progress-linear {
  @apply  bg-transparent;
}

.v-progress-linear :deep(.v-progress-linear__determinate) {
  @apply bg-gradient-to-r from-[#008080] to-[#20B2AA];
}
</style>
