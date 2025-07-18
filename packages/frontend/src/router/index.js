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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router 