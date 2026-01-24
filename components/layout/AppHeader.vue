<template>
  <header class="header">
    <div class="inner">
      <button class="burger" type="button" aria-label="Open menu" @click="$emit('toggle-menu')">
        <Icon class="burgerIcon" name="ph:list" mode="svg" aria-hidden="true" />
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
  height: 100px;
  color: var(--color-bg-white);
  background: linear-gradient(
    to bottom,
    rgba(192, 132, 252, 1) 0%,
    rgba(192, 132, 252, 0.9) 10%,
    rgba(192, 132, 252, 0.8) 20%,
    rgba(192, 132, 252, 0.7) 30%,
    rgba(192, 132, 252, 0.6) 40%,
    rgba(192, 132, 252, 0.5) 50%,
    rgba(192, 132, 252, 0.4) 60%,
    rgba(192, 132, 252, 0.3) 70%,
    rgba(192, 132, 252, 0.2) 80%,
    rgba(192, 132, 252, 0.1) 90%,
    rgba(192, 132, 252, 0) 100%
  );
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

.burgerIcon {
  width: 26px;
  height: 26px;
  display: block;
  color: var(--color-bg-white);
  background: transparent;
}

.burgerIcon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
  background: transparent;
}

.burger:active {
  background: rgba(255, 255, 255, 0.18);
}

.burger:active .burgerIcon {
  transform: scale(0.95);
}

.title {
  font-weight: 800;
  letter-spacing: 0.3px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
