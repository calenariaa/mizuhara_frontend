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
        <slot name="title">{{ t('app.title') }}</slot>
      </div>

      <div class="actions">
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

type LocaleCode = 'de' | 'en'

const localeCodes = ['en', 'de'] as const

const emit = defineEmits<{ (e: 'toggle-menu'): void }>()

const { t, locale, setLocale } = useI18n()

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
    rgb(from var(--color-primary) r g b / 1) 0%,
    rgb(from var(--color-primary) r g b / 0.9) 10%,
    rgb(from var(--color-primary) r g b / 0.8) 20%,
    rgb(from var(--color-primary) r g b / 0.7) 30%,
    rgb(from var(--color-primary) r g b / 0.6) 40%,
    rgb(from var(--color-primary) r g b / 0.5) 50%,
    rgb(from var(--color-primary) r g b / 0.4) 60%,
    rgb(from var(--color-primary) r g b / 0.3) 70%,
    rgb(from var(--color-primary) r g b / 0.2) 80%,
    rgb(from var(--color-primary) r g b / 0.1) 90%,
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
  border: 1px solid rgb(255 255 255 / 0.28);
  background: rgb(255 255 255 / 0.16);
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
  border-color: rgb(255 255 255 / 0.55);
}
</style>
