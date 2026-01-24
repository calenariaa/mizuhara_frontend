<template>
  <header class="header">
    <div class="inner">
      <button
        class="burger"
        type="button"
        :aria-label="t('header.aria.openMenu')"
        @click="emit('toggle-menu')"
      >
        <Icon class="burgerIcon" name="ph:list" mode="svg" aria-hidden="true" />
      </button>

      <div class="title">
        <slot name="title">Mizuhara</slot>
      </div>

      <div class="actions">
        <select v-model="selectedLocale" class="langSelect" :aria-label="t('header.aria.language')">
          <option v-for="o in localeOptions" :key="o.code" :value="o.code">
            {{ o.label }}
          </option>
        </select>

        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useI18n } from '#imports'

const emit = defineEmits<{ (e: 'toggle-menu'): void }>()

const { t, locale, locales, setLocale } = useI18n()

type LocaleCode = typeof locale.value
type LocaleEntry = { code: LocaleCode; name?: string }

const localeOptions = computed(() => {
  return (locales.value as readonly LocaleEntry[]).map((l) => ({
    code: l.code,
    label: l.name ?? String(l.code).toUpperCase(),
  }))
})

const selectedLocale = computed<LocaleCode>({
  get: () => locale.value,
  set: (code) => {
    void setLocale(code)
  },
})
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

.langSelect {
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background: rgba(255, 255, 255, 0.16);
  color: var(--color-bg-white);
  padding: 0 10px;
  cursor: pointer;
  font-weight: 800;
  letter-spacing: 0.2px;
  outline: none;
}

.langSelect option {
  color: var(--color-text-primary);
  background: var(--color-bg-white);
}

.langSelect:focus {
  border-color: rgba(255, 255, 255, 0.55);
}
</style>
