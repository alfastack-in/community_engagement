import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('./pages/Home.vue')
  },
  {
    path: '/login',
    component: () => import('./pages/LoginPage.vue')
  },
  {
    path: '/announcements',
    component: () => import('./pages/AnnouncementPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router 