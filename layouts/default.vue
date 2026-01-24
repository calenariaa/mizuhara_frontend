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
import { computed } from 'vue'

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
  background: var(--color-bg-white);
}

.appMain {
  flex: 1;
  background: var(--color-bg-light);
  padding: 16px;
}

@media (min-width: 768px) {
  .appMain {
    padding: 20px;
  }
}

@media (min-width: 1024px) {
  .appMain {
    padding: 24px;
  }
}
</style>
