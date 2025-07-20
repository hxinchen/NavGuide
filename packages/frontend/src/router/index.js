import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/category/:id',
        name: 'Category',
        component: () => import('../views/Category.vue')
    },
    {
        path: '/management',
        name: 'Management',
        component: () => import('../views/Management.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router 