<template>
  <header class="header">
    <div class="inner">
      <button class="burger" type="button" aria-label="Open menu" @click="$emit('toggle-menu')">
        <span class="line" />
        <span class="line" />
        <span class="line" />
      </button>

      <div class="title">
        <slot name="title">Mizuhara</slot>
      </div>

      <div class="actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'toggle-menu'): void
}>()
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #1d4ed8;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.inner {
  height: 56px;
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
}

.burger {
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  display: grid;
  place-items: center;
  border-radius: 10px;
  cursor: pointer;
}

.burger:active {
  background: rgba(255, 255, 255, 0.12);
}

.line {
  width: 20px;
  height: 2px;
  background: #ffffff;
  display: block;
  border-radius: 999px;
}

.burger .line + .line {
  margin-top: 4px;
}

.title {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
