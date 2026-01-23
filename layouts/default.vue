<template>
  <div class="appShell">
    <AppHeader @toggle-menu="toggleMenu" />
    <AppDrawer :open="isMenuOpen" @close="closeMenu" />
    <main class="appMain">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppDrawer from '~/components/layout/AppDrawer.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import { useMenu } from '~/stores/menu'

const menu = useMenu()
const isMenuOpen = computed(() => menu.isOpen)

const toggleMenu = () => menu.toggle()
const closeMenu = () => menu.close()
</script>

<style scoped>
.appShell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.appMain {
  flex: 1;
  background: #ffffff;
  padding: 16px;
}
</style>
