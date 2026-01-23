<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" @click="emit('close')" />

    <aside class="drawer" :class="{ open }" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="drawerHeader">
        <div class="drawerTitle">Menü</div>
        <button class="close" type="button" aria-label="Close menu" @click="emit('close')">
          ✕
        </button>
      </div>

      <nav class="nav">
        <NuxtLink class="link" to="/" @click="emit('close')">Home</NuxtLink>
      </nav>
    </aside>
  </Teleport>
</template>

<script setup lang="ts">
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
  background: rgba(0, 0, 0, 0.45);
  z-index: 60;
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: min(320px, 86vw);
  background: #ffffff;
  z-index: 70;
  transform: translateX(-100%);
  transition: transform 180ms ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.24);
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
  border-bottom: 1px solid #e5e7eb;
}

.drawerTitle {
  font-weight: 700;
  font-size: 16px;
}

.close {
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
}

.close:active {
  background: #f3f4f6;
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
  color: #111827;
  background: #f3f4f6;
}

.link:hover {
  background: #e5e7eb;
}
</style>
