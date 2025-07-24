<template>
  <div>
    <!-- 标题和添加按钮 -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h4 font-weight-bold">工具管理</h2>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openToolDialog('add')"
      >
        添加工具
      </v-btn>
    </div>

    <!-- 工具搜索和过滤 -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex flex-wrap gap-4">
          <v-text-field
            v-model="toolSearch"
            label="搜索工具名称或描述"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            class="max-width-300"
          ></v-text-field>

          <v-select
            v-model="toolCategoryFilter"
            label="按分类筛选"
            :items="categories"
            item-title="name"
            item-value="id"
            clearable
            hide-details
            class="max-width-200"
          ></v-select>

          <v-btn prepend-icon="mdi-refresh" @click="resetToolFilters">
            重置筛选
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 工具表格 -->
    <v-card>
      <v-data-table
        :loading="loading.tools"
        :items="paginatedTools"
        :headers="toolHeaders"
        :items-per-page="pageSize"
        :page="currentPage"
        @update:page="currentPage = $event"
        @update:items-per-page="handleSizeChange"
        item-value="id"
      >
        <!-- 自定义列 -->
        <template v-slot:item.icon="{ item }">
          <v-avatar size="32">
            <v-img :src="getFaviconUrl(item.url)" alt="icon">
              <template v-slot:placeholder>
                <v-icon>mdi-image</v-icon>
              </template>
            </v-img>
          </v-avatar>
        </template>
        <template v-slot:item.url="{ item }">
          <a :href="item.url" target="_blank" class="text-decoration-none">
            {{ item.url }}
          </a>
        </template>
        <template v-slot:item.category="{ item }">
          <v-chip color="primary" size="small">
            {{ item.category?.name || '未分类' }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            size="small"
            color="primary"
            class="mr-2"
            @click="openToolDialog('edit', item)"
          >
            <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
            编辑
          </v-btn>
          <v-btn
            size="small"
            color="error"
            @click="confirmDelete('tool', item)"
          >
            <v-icon size="small" class="mr-1">mdi-delete</v-icon>
            删除
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- 工具表单对话框 -->
    <v-dialog v-model="dialogs.tool" width="600">
      <v-card>
        <v-card-title>
          {{ formMode === 'add' ? '添加工具' : '编辑工具' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="toolFormRef" v-model="formValid">
            <v-text-field
              v-model="toolForm.name"
              label="名称"
              :rules="nameRules"
              required
            ></v-text-field>
            <v-textarea
              v-model="toolForm.description"
              label="描述"
              :rules="descriptionRules"
              required
              rows="3"
            ></v-textarea>
            <v-text-field
              v-model="toolForm.url"
              label="链接"
              :rules="urlRules"
              required
            ></v-text-field>
            <v-select
              v-model="toolForm.categoryId"
              label="分类"
              :items="categories"
              item-title="name"
              item-value="id"
              :rules="categoryRules"
              required
            ></v-select>
            <div>
              <label class="text-subtitle-1">标签</label>
              <div class="d-flex flex-wrap mt-2">
                <v-chip
                  v-for="tag in toolForm.tags"
                  :key="tag"
                  class="ma-1"
                  closable
                  @click:close="removeTag(tag)"
                >
                  {{ tag }}
                </v-chip>
                <v-text-field
                  v-if="inputTagVisible"
                  ref="tagInputRef"
                  v-model="inputTagValue"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="ml-1 max-width-150"
                  @keyup.enter="addTag"
                  @blur="addTag"
                ></v-text-field>
                <v-btn
                  v-else
                  size="small"
                  variant="text"
                  @click="showTagInput"
                >
                  <v-icon size="small">mdi-plus</v-icon>
                  添加标签
                </v-btn>
              </div>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="dialogs.tool = false">取消</v-btn>
          <v-btn
            color="primary"
            :loading="loading.save"
            @click="saveTool"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { getTools, getCategories } from '@/api/api';

// 数据表头
const toolHeaders = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: '图标', key: 'icon', width: '80px', align: 'center', sortable: false },
  { title: '工具名称', key: 'name', width: '150px' },
  { title: '描述', key: 'description' },
  { title: '链接', key: 'url', width: '200px' },
  { title: '分类', key: 'category', width: '120px' },
  { title: '操作', key: 'actions', width: '200px', sortable: false },
];

// 状态
const loading = ref({
  tools: false,
  save: false,
});
const dialogs = ref({
  tool: false,
});
const formMode = ref('add');
const formValid = ref(false);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 数据
const tools = ref([]);
const categories = ref([]);

// 筛选
const toolSearch = ref('');
const toolCategoryFilter = ref('');

// 计算属性
const filteredTools = computed(() => {
  let result = [...tools.value];
  if (toolSearch.value) {
    const searchLower = toolSearch.value.toLowerCase();
    result = result.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower)
    );
  }
  if (toolCategoryFilter.value) {
    result = result.filter((tool) => tool.categoryId === toolCategoryFilter.value);
  }
  return result;
});

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTools.value.slice(start, end);
});

// 表单数据
const toolForm = ref({
  id: null,
  name: '',
  description: '',
  url: '',
  categoryId: null,
  tags: [],
});

// 表单验证规则
const nameRules = [
  v => !!v || '请输入工具名称',
  v => (v && v.length >= 2 && v.length <= 50) || '长度在 2 到 50 个字符',
];
const descriptionRules = [
  v => !!v || '请输入工具描述',
];
const urlRules = [
  v => !!v || '请输入工具链接',
  v => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(v) || '请输入正确的URL格式',
];
const categoryRules = [
  v => !!v || '请选择分类',
];

// 标签输入
const tagInputRef = ref(null);
const inputTagVisible = ref(false);
const inputTagValue = ref('');

// 表单引用
const toolFormRef = ref(null);

// 方法
function resetToolFilters() {
  toolSearch.value = '';
  toolCategoryFilter.value = '';
}

function getFaviconUrl(url) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return '';
  }
}

function openToolDialog(mode, tool = null) {
  formMode.value = mode;
  if (mode === 'edit' && tool) {
    toolForm.value = { ...tool, categoryId: tool.category?.id || tool.categoryId };
    if (!Array.isArray(toolForm.value.tags)) {
      try {
        toolForm.value.tags = JSON.parse(tool.tags) || [];
      } catch (e) {
        toolForm.value.tags = [];
      }
    }
  } else {
    toolForm.value = {
      id: null,
      name: '',
      description: '',
      url: '',
      categoryId: categories.value.length > 0 ? categories.value[0].id : null,
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
  inputTagValue.value = '';
}

function removeTag(tag) {
  toolForm.value.tags = toolForm.value.tags.filter((t) => t !== tag);
}

function saveTool() {
  const { valid } = toolFormRef.value.validate();
  
  if (valid) {
    loading.value.save = true;
    // 模拟 API 调用
    setTimeout(() => {
      const payload = { ...toolForm.value, tags: JSON.stringify(toolForm.value.tags) };
      if (formMode.value === 'add') {
        const newId = Math.max(0, ...tools.value.map((t) => t.id)) + 1;
        tools.value.push({ ...payload, id: newId });
        // 成功提示
      } else {
        const index = tools.value.findIndex((t) => t.id === toolForm.value.id);
        if (index !== -1) {
          tools.value[index] = { ...tools.value[index], ...payload };
          // 成功提示
        }
      }
      loading.value.save = false;
      dialogs.value.tool = false;
    }, 500);
  }
}

function confirmDelete(type, item) {
  // 使用 Vuetify 的确认对话框
  if (confirm(`确定要删除工具 "${item.name}" 吗？`)) {
    tools.value = tools.value.filter((t) => t.id !== item.id);
    // 成功提示
  }
}

async function fetchTools() {
  loading.value.tools = true;
  try {
    tools.value = await getTools();
  } catch (error) {
    console.error('Failed to fetch tools:', error);
    // 错误提示
  } finally {
    loading.value.tools = false;
  }
}

async function fetchCategories() {
  try {
    categories.value = await getCategories();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // 错误提示
  }
}

function handleSizeChange(size) {
  pageSize.value = size;
  currentPage.value = 1; // 回到第一页
}

onMounted(() => {
  fetchTools();
  fetchCategories();
});
</script>

<style scoped>
.max-width-300 {
  max-width: 300px;
}
.max-width-200 {
  max-width: 200px;
}
.max-width-150 {
  max-width: 150px;
}
</style>