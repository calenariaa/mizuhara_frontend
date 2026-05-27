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

      <NuxtLink class="title" to="/">
        <slot name="title">{{ t('app.title') }}</slot>
      </NuxtLink>

      <div class="actions">
        <button
          class="themeButton"
          type="button"
          :aria-label="t('header.aria.toggleTheme')"
          @click="toggleColorMode"
        >
          <Icon :name="colorMode === 'dark' ? 'lucide:sun' : 'lucide:moon'" size="18" />
        </button>

        <select v-model="selectedLocale" class="langSelect" :aria-label="t('header.aria.language')">
          <option v-for="option in localeOptions" :key="option.code" :value="option.code">
            {{ option.label }}
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
import { useColorMode } from '@/composables/useColorMode'

type LocaleCode = 'de' | 'en'

const localeCodes = ['en', 'de'] as const

const emit = defineEmits<{ (e: 'toggle-menu'): void }>()

const { t, locale, setLocale } = useI18n()
const { colorMode, toggleColorMode } = useColorMode()

const localeOptions = computed(() =>
  localeCodes.map((code) => ({
    code,
    label: t(`locales.${code}`),
  })),
)

const selectedLocale = computed<LocaleCode>({
  get: () => locale.value as LocaleCode,
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
    var(--color-primary) 0%,
    color-mix(in srgb, var(--color-primary) 82%, var(--color-bg-light)) 46%,
    color-mix(in srgb, var(--color-primary) 38%, var(--color-bg-light)) 78%,
    var(--color-bg-light) 100%
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
  background: rgb(255 255 255 / 0.18);
}

.burger:active .burgerIcon {
  transform: scale(0.95);
}

.title {
  color: var(--color-bg-white);
  font-weight: 800;
  letter-spacing: 0.3px;
  text-decoration: none;
  width: fit-content;
}

.title:focus {
  outline: 2px solid rgb(255 255 255 / 0.55);
  outline-offset: 4px;
  border-radius: 4px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.themeButton,
.langSelect {
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgb(255 255 255 / 0.28);
  background: rgb(255 255 255 / 0.16);
  color: var(--color-bg-white);
  padding: 0 10px;
  cursor: pointer;
  font-weight: 800;
  letter-spacing: 0.2px;
  outline: none;
}

.themeButton {
  width: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.langSelect option {
  color: var(--color-text-primary);
  background: var(--color-bg-white);
}

.themeButton:focus,
.langSelect:focus {
  border-color: rgb(255 255 255 / 0.55);
}
</style>
