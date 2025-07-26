<template>
  <div class="category-management">
    <!-- 标题 -->
    <div class="header-section">
      <h2 class="page-title">分类管理</h2>
    </div>

    <!-- 搜索和操作 -->
    <v-card class="search-card">
      <v-card-text class="search-content">
        <div class="search-filters">
          <v-text-field
            v-model="search"
            label="搜索分类名称或描述"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            class="search-field"
            variant="outlined"
          ></v-text-field>

          <v-btn
            class="reset-btn"
            prepend-icon="mdi-refresh"
            @click="resetFilters"
            variant="outlined"
          >
            重置
          </v-btn>
          <v-btn
            class="add-btn"
            prepend-icon="mdi-plus"
            @click="openCategoryDialog('add')"
            elevation="2"
          >
            添加分类
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 分类表格 -->
    <v-card class="data-card">
      <v-data-table
        :loading="loading.categories"
        :items="filteredCategories"
        :headers="categoryHeaders"
        item-value="id"
        class="modern-table"
      >
        <!-- 自定义列 -->
        <template v-slot:[`item.tools`]="{ item }">
          <v-chip class="tool-count-chip" size="small">
            {{ item.tools?.length || 0 }}
          </v-chip>
        </template>
        <template v-slot:[`item.description`]="{ item }">
          <v-tooltip :text="item.description" location="top">
            <template v-slot:activator="{ props }">
              <div v-bind="props" class="description-text">
                {{ item.description || '-' }}
              </div>
            </template>
          </v-tooltip>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <div class="action-buttons">
            <v-btn
              size="small"
              class="edit-btn"
              @click="openCategoryDialog('edit', item)"
              variant="outlined"
            >
              <v-icon size="small">mdi-pencil</v-icon>
              编辑
            </v-btn>
            <v-btn
              size="small"
              class="delete-btn"
              @click="confirmDelete(item)"
              variant="outlined"
            >
              <v-icon size="small">mdi-delete</v-icon>
              删除
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- 分类表单对话框 -->
    <v-dialog v-model="dialogs.category" width="600" class="form-dialog">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <v-icon class="dialog-title-icon" color="teal">mdi-folder-multiple-outline</v-icon>
          {{ formMode === 'add' ? '添加分类' : '编辑分类' }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="dialog-content">
          <v-form ref="categoryFormRef" v-model="formValid">
            <v-text-field
              v-model="categoryForm.name"
              label="分类名称"
              :rules="nameRules"
              required
              variant="outlined"
              class="form-field"
            ></v-text-field>
            <v-textarea
              v-model="categoryForm.description"
              label="分类描述"
              :rules="descriptionRules"
              rows="3"
              variant="outlined"
              class="form-field"
              placeholder="请输入分类描述（可选）"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn class="cancel-btn" @click="dialogs.category = false" variant="outlined">
            取消
          </v-btn>
          <v-btn class="confirm-btn" :loading="loading.save" @click="saveCategory">
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
            您确定要删除分类 <strong class="item-name">"{{ deleteItem?.name }}"</strong> 吗？
          </p>
          <p class="delete-warning">
            此操作不可撤销，该分类下的所有工具将变为未分类。
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="delete-actions">
          <v-spacer></v-spacer>
          <v-btn class="cancel-btn" @click="cancelDelete" variant="outlined">
            取消
          </v-btn>
          <v-btn class="delete-confirm-btn" :loading="loading.categories" @click="handleDelete">
            确认删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/api';
import type { VForm } from "vuetify/components";

// --- 类型定义 ---
interface Tool {
  id: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  tools?: Tool[];
}

interface CategoryFormState {
  id: number | null;
  name: string;
  description?: string;
}

type FormMode = 'add' | 'edit';

// --- VDataTable 表头定义 ---
const categoryHeaders: any[] = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: '分类名称', key: 'name', width: '200px' },
  { title: '描述', key: 'description', sortable: false },
  { title: '工具数量', key: 'tools', width: '120px', align: 'center' },
  { title: '操作', key: 'actions', width: '200px', sortable: false, align: 'center' },
];

// --- 响应式状态 ---
const loading = ref({
  categories: false,
  save: false,
});

const dialogs = ref({
  category: false,
  deleteConfirm: false,
});

const deleteItem = ref<Category | null>(null);
const formMode = ref<FormMode>('add');
const formValid = ref(false);

const categories = ref<Category[]>([]);
const search = ref('');

const categoryFormRef = ref<InstanceType<typeof VForm> | null>(null);

// --- 计算属性 ---
const filteredCategories = computed(() => {
  if (!search.value) {
    return categories.value;
  }
  const searchLower = search.value.toLowerCase();
  return categories.value.filter(category =>
    category.name.toLowerCase().includes(searchLower) ||
    (category.description && category.description.toLowerCase().includes(searchLower))
  );
});

// --- 表单相关 ---
const defaultCategoryFormState: CategoryFormState = {
  id: null,
  name: '',
  description: '',
};

const categoryForm = ref<CategoryFormState>({ ...defaultCategoryFormState });

// 表单验证规则
const nameRules = [
  (v: string) => !!v || '请输入分类名称',
  (v: string) => (v && v.length >= 2 && v.length <= 20) || '长度在 2 到 20 个字符',
];
const descriptionRules = [
  (v: string) => !v || v.length <= 200 || '描述长度不能超过200个字符',
];

// --- 方法 ---
function resetFilters() {
  search.value = '';
}

function resetCategoryForm() {
  categoryForm.value = { ...defaultCategoryFormState };
  categoryFormRef.value?.resetValidation();
}

function openCategoryDialog(mode: FormMode, category: Category | null = null) {
  formMode.value = mode;
  if (mode === 'edit' && category) {
    categoryForm.value = {
      id: category.id,
      name: category.name,
      description: category.description || '',
    };
  } else {
    resetCategoryForm();
  }
  dialogs.value.category = true;
}

async function saveCategory() {
  if (!categoryFormRef.value) return;

  const { valid } = await categoryFormRef.value.validate();
  
  if (valid) {
    loading.value.save = true;
    const payload = {
      name: categoryForm.value.name,
      description: categoryForm.value.description,
    };
    
    try {
      if (formMode.value === 'edit' && categoryForm.value.id) {
        await updateCategory(categoryForm.value.id, payload);
      } else {
        await createCategory(payload);
      }
      await fetchCategories();
    } catch (error) {
      console.error('保存分类失败:', error);
      alert(formMode.value === 'edit' ? '更新分类失败' : '创建分类失败');
    } finally {
      loading.value.save = false;
      dialogs.value.category = false;
    }
  }
}

function confirmDelete(item: Category) {
  deleteItem.value = item;
  dialogs.value.deleteConfirm = true;
}

function cancelDelete() {
  dialogs.value.deleteConfirm = false;
  deleteItem.value = null;
}

async function handleDelete() {
  if (!deleteItem.value) return;
  
  loading.value.categories = true;
  try {
    await deleteCategory(deleteItem.value.id);
    await fetchCategories();
  } catch (error) {
    console.error('删除分类失败:', error);
    alert('删除分类失败');
  } finally {
    loading.value.categories = false;
    dialogs.value.deleteConfirm = false;
    deleteItem.value = null;
  }
}

async function fetchCategories() {
  loading.value.categories = true;
  try {
    categories.value = await getCategories();
  } catch (error) {
    console.error('获取分类列表失败:', error);
    alert('获取分类列表失败');
  } finally {
    loading.value.categories = false;
  }
}

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.category-management {
  @apply font-sans text-gray-800 bg-[#f8fafa] min-h-screen p-4;
}

.header-section {
  @apply flex justify-between items-center mb-4;
}

.page-title {
  @apply text-[2.5rem] font-semibold text-[#008080] -tracking-tighter;
}

.search-card {
  @apply rounded-xl mb-6 border;
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

.reset-btn {
  @apply text-[#008080] border-[#008080] rounded-md normal-case;
}

.reset-btn:hover {
  @apply border-[#006666];
}

.add-btn {
  @apply bg-gradient-to-br from-[#008080] to-[#20B2AA] text-white rounded-lg font-bold normal-case transition-all duration-300 ease-in-out;
}

.add-btn:hover {
  @apply bg-gradient-to-br from-[#006666] to-[#1a9999] -translate-y-0.5;
}

.data-card {
  @apply rounded-xl border overflow-hidden;
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

.tool-count-chip {
  @apply bg-gradient-to-br from-[#48D1CC] to-[#20B2AA] text-white font-medium rounded-md;
}

.action-buttons {
  @apply flex gap-2 justify-center;
}

.edit-btn {
  @apply text-[#008080] border-[#008080] rounded-md normal-case text-sm;
}

.edit-btn:hover {
  @apply border-[#006666];
}

.edit-btn :deep(.v-icon) {
  @apply mr-1;
}

.delete-btn {
  @apply text-[#d32f2f] border-[#d32f2f] rounded-md normal-case text-sm;
}

.delete-btn:hover {
  @apply border-[#b71c1c];
}

.delete-btn :deep(.v-icon) {
  @apply mr-1;
}

.description-text {
  @apply overflow-hidden text-ellipsis whitespace-nowrap text-gray-500;
  max-width: 300px; /* 限制最大宽度 */
}

.form-dialog :deep(.v-overlay__content) {
  @apply rounded-2xl;
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
  border-color: #008080 !important;
}

.form-field :deep(.v-label.v-field-label--floating) {
  color: #008080 !important;
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
  @apply bg-gradient-to-br from-[#006666] to-[#1a9999];
}

.delete-dialog :deep(.v-overlay__content) {
  @apply rounded-2xl;
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

.item-name {
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
  @apply bg-gradient-to-br from-[#b71c1c] to-[#d32f2f];
}

.v-tooltip > :deep(.v-overlay__content) {
  @apply bg-gray-700 text-white rounded-md text-sm py-2 px-3;
}

.v-data-table-progress :deep(th) {
  @apply border-b-0;
}

.v-progress-linear {
  @apply bg-transparent;
}

.v-progress-linear :deep(.v-progress-linear__determinate) {
  @apply bg-gradient-to-r from-[#008080] to-[#20B2AA];
}
</style>