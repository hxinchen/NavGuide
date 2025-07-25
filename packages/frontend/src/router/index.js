import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/Home.vue')
        },
        // {
        //     path: '/about',
        //     name: 'about',
        //     // route level code-splitting
        //     // this generates a separate chunk (About.[hash].js) for this route
        //     // which is lazy-loaded when the route is visited.
        //     component: () => import('../views/AboutView.vue')
        // },
        {
            path: '/management',
            name: 'management',
            component: () => import('../views/Management.vue'),
            redirect: '/management/categories',
            children: [
                {
                    path: 'categories',
                    name: 'management-categories',
                    component: () => import('../views/CategoryManagement.vue')
                },
                {
                    path: 'tools',
                    name: 'management-tools',
                    component: () => import('../views/ToolManagement.vue')
                }
            ]
        }
    ]
})

export default router 