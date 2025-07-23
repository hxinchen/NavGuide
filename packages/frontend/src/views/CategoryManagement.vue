<template>
    <div class="category-management">
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
          <el-table-column label="创建时间" min-width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="更新时间" min-width="180">
            <template #default="scope">
              {{ formatDateTime(scope.row.updatedAt) }}
            </template>
          </el-table-column>
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
                  size="small"
                  @click="openCategoryDialog('edit', scope.row)"
                >
                  <el-icon class="el-icon--left"><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="confirmDelete('category', scope.row)"
                >
                  <el-icon class="el-icon--left"><Delete /></el-icon>
                  删除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
  
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
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { getCategories } from '@/api/api';
  import { ElMessage, ElMessageBox } from 'element-plus';
  
  // 状态
  const loading = ref({
    categories: false,
    save: false,
  });
  const dialogs = ref({
    category: false,
  });
  const formMode = ref('add'); // 'add' 或 'edit'
  
  // 数据
  const categories = ref([]);
  
  // 表单数据
  const categoryForm = ref({
    id: null,
    name: '',
    description: '',
  });
  
  // 表单验证规则
  const categoryRules = {
    name: [
      { required: true, message: '请输入分类名称', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
    ],
    description: [{ required: true, message: '请输入分类描述', trigger: 'blur' }],
  };
  
  // 表单引用
  const categoryFormRef = ref(null);
  
  // 方法
  function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    try {
      return new Intl.DateTimeFormat('zh-CN', options).format(new Date(dateString));
    } catch (e) {
      return 'Invalid Date';
    }
  }
  
  function openCategoryDialog(mode, category = null) {
    formMode.value = mode;
    if (mode === 'edit' && category) {
      categoryForm.value = { ...category };
    } else {
      categoryForm.value = {
        id: null,
        name: '',
        description: '',
      };
    }
    dialogs.value.category = true;
  }
  
  function saveCategory() {
    categoryFormRef.value.validate((valid) => {
      if (valid) {
        loading.value.save = true;
        // 模拟API调用
        setTimeout(() => {
          if (formMode.value === 'add') {
            const newId = Math.max(0, ...categories.value.map((c) => c.id)) + 1;
            categories.value.push({ ...categoryForm.value, id: newId, tools: [] });
            ElMessage.success('分类添加成功');
          } else {
            const index = categories.value.findIndex((c) => c.id === categoryForm.value.id);
            if (index !== -1) {
              categories.value[index] = { ...categories.value[index], ...categoryForm.value };
              ElMessage.success('分类更新成功');
            }
          }
          loading.value.save = false;
          dialogs.value.category = false;
        }, 500);
      }
    });
  }
  
  function confirmDelete(type, item) {
    ElMessageBox.confirm(`确定要删除分类 "${item.name}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        categories.value = categories.value.filter((c) => c.id !== item.id);
        ElMessage.success('分类删除成功');
      })
      .catch(() => {
        // 取消删除
      });
  }
  
  async function fetchCategories() {
    loading.value.categories = true;
    try {
      const res = await getCategories();
      categories.value = res;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      ElMessage.error('获取分类列表失败');
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
    padding: 20px;
  }
  </style>