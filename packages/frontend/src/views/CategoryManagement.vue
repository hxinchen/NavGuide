<template>
  <div>
    <!-- 标题和添加按钮 -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h4 font-weight-bold">分类管理</h2>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCategoryDialog('add')"
      >
        添加分类
      </v-btn>
    </div>

    <!-- 分类表格 -->
    <v-card class="mb-6">
      <v-data-table
        :loading="loading.categories"
        :items="categories"
        :headers="categoryHeaders"
        item-value="id"
      >
        <!-- 自定义列 -->
        <template v-slot:item.createdAt="{ item }">
          {{ formatDateTime(item.createdAt) }}
        </template>
        <template v-slot:item.updatedAt="{ item }">
          {{ formatDateTime(item.updatedAt) }}
        </template>
        <template v-slot:item.tools="{ item }">
          <v-chip color="info" size="small">
            {{ item.tools?.length || 0 }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            size="small"
            color="primary"
            class="mr-2"
            @click="openCategoryDialog('edit', item)"
          >
            <v-icon size="small" class="mr-1">mdi-pencil</v-icon>
            编辑
          </v-btn>
          <v-btn
            size="small"
            color="error"
            @click="confirmDelete('category', item)"
          >
            <v-icon size="small" class="mr-1">mdi-delete</v-icon>
            删除
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- 分类表单对话框 -->
    <v-dialog v-model="dialogs.category" width="500">
      <v-card>
        <v-card-title>
          {{ formMode === 'add' ? '添加分类' : '编辑分类' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="categoryFormRef" v-model="formValid">
            <v-text-field
              v-model="categoryForm.name"
              label="名称"
              :rules="nameRules"
              required
            ></v-text-field>
            <v-textarea
              v-model="categoryForm.description"
              label="描述"
              :rules="descriptionRules"
              required
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="dialogs.category = false">取消</v-btn>
          <v-btn
            color="primary"
            :loading="loading.save"
            @click="saveCategory"
          >
            确认
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getCategories } from '@/api/api';

// 数据表头
const categoryHeaders = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: '分类名称', key: 'name', width: '150px' },
  { title: '描述', key: 'description' },
  { title: '创建时间', key: 'createdAt', width: '180px' },
  { title: '更新时间', key: 'updatedAt', width: '180px' },
  { title: '工具数量', key: 'tools', width: '120px', align: 'center' },
  { title: '操作', key: 'actions', width: '200px', sortable: false },
];

// 状态
const loading = ref({
  categories: false,
  save: false,
});
const dialogs = ref({
  category: false,
});
const formMode = ref('add');
const formValid = ref(false);

// 数据
const categories = ref([]);

// 表单数据
const categoryForm = ref({
  id: null,
  name: '',
  description: '',
});

// 表单验证规则
const nameRules = [
  v => !!v || '请输入分类名称',
  v => (v && v.length >= 2 && v.length <= 20) || '长度在 2 到 20 个字符',
];
const descriptionRules = [
  v => !!v || '请输入分类描述',
];

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
  const { valid } = categoryFormRef.value.validate();
  
  if (valid) {
    loading.value.save = true;
    // 模拟API调用
    setTimeout(() => {
      if (formMode.value === 'add') {
        const newId = Math.max(0, ...categories.value.map((c) => c.id)) + 1;
        categories.value.push({ ...categoryForm.value, id: newId, tools: [] });
        // 成功提示
      } else {
        const index = categories.value.findIndex((c) => c.id === categoryForm.value.id);
        if (index !== -1) {
          categories.value[index] = { ...categories.value[index], ...categoryForm.value };
          // 成功提示
        }
      }
      loading.value.save = false;
      dialogs.value.category = false;
    }, 500);
  }
}

function confirmDelete(type, item) {
  // 使用 Vuetify 的确认对话框
  if (confirm(`确定要删除分类 "${item.name}" 吗？`)) {
    categories.value = categories.value.filter((c) => c.id !== item.id);
    // 成功提示
  }
}

async function fetchCategories() {
  loading.value.categories = true;
  try {
    const res = await getCategories();
    categories.value = res;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // 错误提示
  } finally {
    loading.value.categories = false;
  }
}

onMounted(() => {
  fetchCategories();
});
</script>