<template>
  <ClientOnly>
    <Teleport to="body">
      <div v-if="open" class="overlay" @click="emit('close')" @touchstart="emit('close')" />

      <aside
        class="drawer"
        :class="{ open }"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        @click.stop
        @touchstart.stop
      >
        <div class="drawerHeader">
          <div class="drawerTitle">Menü</div>
          <button class="close" type="button" aria-label="Close menu" @click="emit('close')">
            ✕
          </button>
        </div>

        <nav class="nav">
          <div v-for="cat in categories" :key="cat.id" class="navGroup">
            <div class="navGroupTitle">{{ cat.label }}</div>

            <div class="navGroupLinks">
              <NuxtLink
                v-for="item in itemsByCategory.get(cat.id) ?? []"
                :key="item.to"
                class="link"
                :to="item.to"
                @click="emit('close')"
              >
                {{ item.label }}
              </NuxtLink>
            </div>
          </div>
        </nav>
      </aside>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { navCategories, navItems, type NavCategoryId } from '~/config/navigation'

const categories = navCategories

const itemsByCategory = computed(() => {
  const map = new Map<NavCategoryId, typeof navItems>()
  for (const item of navItems) {
    const arr = map.get(item.category) ?? []
    arr.push(item)
    map.set(item.category, arr)
  }
  return map
})

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const onKeydown = (e: KeyboardEvent) => {
  if (!props.open) return
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  watch(
    () => props.open,
    (isOpen) => {
      document.body.style.overflow = isOpen ? 'hidden' : ''
    },
    { immediate: true },
  )

  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(2px);
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: min(320px, 86vw);
  background: var(--color-bg-white);
  z-index: 70;
  transform: translateX(-100%);
  transition: transform 180ms ease;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-elevated);
}

.drawer.open {
  transform: translateX(0);
}

.drawerHeader {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-primary-soft);
  color: var(--color-text-primary);
}

.drawerTitle {
  font-weight: 800;
  font-size: 16px;
}

.close {
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  color: var(--color-text-primary);
}

.close:active {
  background: rgba(15, 23, 42, 0.06);
}

.nav {
  padding: 12px;
  display: grid;
  gap: 8px;
}

.link {
  padding: 12px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--color-text-primary);
  background: var(--color-bg-light);
  border: 1px solid var(--color-border);
}

.link:hover {
  background: var(--color-primary-soft);
}

.navGroup {
  display: grid;
  gap: 8px;
}

.navGroupTitle {
  padding: 6px 4px 0;
  font-size: 12px;
  font-weight: 800;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.navGroupLinks {
  display: grid;
  gap: 8px;
}
</style>
