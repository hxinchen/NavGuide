<template>
    <div class="tool-management">
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
              <Search />
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
          :data="paginatedTools"
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
              <el-tag>{{ getCategoryName(scope.row.categoryId) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button-group>
                <el-button
                  type="primary"
                  size="small"
                  @click="openToolDialog('edit', scope.row)"
                >
                  <el-icon class="el-icon--left"><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="confirmDelete('tool', scope.row)"
                >
                  <el-icon class="el-icon--left"><Delete /></el-icon>
                  删除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
  
         <div class="flex justify-center mt-4">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredTools.length"
            background
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </el-card>
  
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
          <el-form-item label="分类" prop="categoryId">
            <el-select
              v-model="toolForm.categoryId"
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
  import { ref, computed, onMounted, nextTick } from 'vue';
  import { getTools, getCategories } from '@/api/api';
  import { ElMessage, ElMessageBox } from 'element-plus';
  
  // 状态
  const loading = ref({
    tools: false,
    save: false,
  });
  const dialogs = ref({
    tool: false,
  });
  const formMode = ref('add'); // 'add' 或 'edit'
  
  // 分页
  const currentPage = ref(1);
  const pageSize = ref(10);
  
  // 数据
  const tools = ref([]);
  const categories = ref([]);
  
  // 筛选
  const toolSearch = ref('');
  const toolCategoryFilter = ref('');
  
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
  
  const toolRules = {
    name: [ { required: true, message: '请输入工具名称', trigger: 'blur' }, { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }, ],
    description: [{ required: true, message: '请输入工具描述', trigger: 'blur' }],
    url: [ { required: true, message: '请输入工具链接', trigger: 'blur' }, { type: 'url', message: '请输入正确的 URL 格式', trigger: 'blur' }, ],
    categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  };
  
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
  
  function getCategoryName(categoryId) {
    const category = categories.value.find((c) => c.id === categoryId);
    return category ? category.name : '未分类';
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
    toolFormRef.value.validate((valid) => {
      if (valid) {
        loading.value.save = true;
        // 模拟 API 调用
        setTimeout(() => {
          const payload = { ...toolForm.value, tags: JSON.stringify(toolForm.value.tags) };
          if (formMode.value === 'add') {
            const newId = Math.max(0, ...tools.value.map((t) => t.id)) + 1;
            tools.value.push({ ...payload, id: newId });
            ElMessage.success('工具添加成功');
          } else {
            const index = tools.value.findIndex((t) => t.id === toolForm.value.id);
            if (index !== -1) {
              tools.value[index] = { ...tools.value[index], ...payload };
              ElMessage.success('工具更新成功');
            }
          }
          loading.value.save = false;
          dialogs.value.tool = false;
        }, 500);
      }
    });
  }
  
  function confirmDelete(type, item) {
    ElMessageBox.confirm(`确定要删除工具 "${item.name}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        tools.value = tools.value.filter((t) => t.id !== item.id);
        ElMessage.success('工具删除成功');
      })
      .catch(() => { /* 取消删除 */ });
  }
  
  async function fetchTools() {
    loading.value.tools = true;
    try {
      tools.value = await getTools();
    } catch (error) {
      console.error('Failed to fetch tools:', error);
      ElMessage.error('获取工具列表失败');
    } finally {
      loading.value.tools = false;
    }
  }
  
  async function fetchCategories() {
    try {
      categories.value = await getCategories();
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      ElMessage.error('获取分类列表失败');
    }
  }
  
  function handlePageChange(page) {
    currentPage.value = page;
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
  .tool-management {
    padding: 20px;
  }
  .el-tag {
    margin-right: 8px;
    margin-bottom: 8px;
  }
  </style>