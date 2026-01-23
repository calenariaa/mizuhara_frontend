import { createRouter, createWebHistory } from 'vue-router'
import ShoppingListView from '../views/ShoppingListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/shopping-lists'
    },
    {
      path: '/shopping-lists',
      name: 'shopping-lists',
      component: ShoppingListView
    }
  ]
})

export default router