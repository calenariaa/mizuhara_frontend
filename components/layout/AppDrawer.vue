<template>
  <ClientOnly>
    <Teleport to="body">
      <div v-if="open" class="overlay" @click="emit('close')" />

      <aside
        class="drawer"
        :class="{ open }"
        role="dialog"
        :aria-label="t('drawer.aria.menu')"
        @click.stop
        @touchstart.stop
      >
        <div class="drawerHeader">
          <div class="drawerTitle">{{ t('drawer.title') }}</div>
          <button
            class="close"
            type="button"
            :aria-label="t('drawer.aria.close')"
            @click="emit('close')"
          >
            ✕
          </button>
        </div>

        <nav class="nav">
          <div v-for="group in groups" :key="group.category.id" class="navGroup">
            <div class="navGroupTitle">{{ t(group.category.labelKey) }}</div>

            <div class="navGroupLinks">
              <NuxtLink
                v-for="item in group.items"
                :key="item.path"
                class="link"
                :to="localePath(item.path)"
                @click="emit('close')"
              >
                {{ t(item.labelKey) }}
              </NuxtLink>
            </div>
          </div>
        </nav>
      </aside>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'

import { useI18n, useLocalePath } from '#imports'
import { navGroups } from '@/config/navigation'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()
const localePath = useLocalePath()

const groups = navGroups

const onKeydown = (event: KeyboardEvent) => {
  if (!props.open) return
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return
    document.body.style.overflow = isOpen ? 'hidden' : ''
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (!import.meta.client) return
  document.body.style.overflow = ''
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: var(--overlay);
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
  background: rgb(from var(--color-text-primary) r g b / 0.06);
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
