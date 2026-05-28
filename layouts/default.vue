<template>
  <div class="appShell">
    <AppDrawer :open="isMenuOpen" @close="closeMenu" />

    <div class="topBar">
      <button
        class="mobileMenuButton"
        type="button"
        :aria-label="t('header.aria.openMenu')"
        @click="toggleMenu"
      >
        <Icon name="lucide:menu" size="21" aria-hidden="true" />
      </button>

      <label class="searchBox">
        <Icon name="lucide:search" size="19" aria-hidden="true" />
        <span class="srOnly">{{ t('header.search.label') }}</span>
        <input type="search" :placeholder="t('header.search.placeholder')" />
        <kbd>Ctrl K</kbd>
      </label>

      <div class="topActions">
        <button
          class="iconButton"
          type="button"
          :aria-label="t('header.aria.toggleTheme')"
          @click="toggleColorMode"
        >
          <Icon :name="colorMode === 'dark' ? 'lucide:sun' : 'lucide:moon'" size="18" />
        </button>

        <button class="iconButton notificationButton" type="button" aria-label="Benachrichtigungen">
          <Icon name="lucide:bell" size="18" aria-hidden="true" />
          <span class="notificationBadge">3</span>
        </button>

        <details class="langMenu">
          <summary :aria-label="t('header.aria.language')">
            <span>{{ selectedLocaleLabel }}</span>
            <Icon name="lucide:chevron-down" size="16" aria-hidden="true" />
          </summary>

          <div class="langOptions">
            <button
              v-for="option in localeOptions"
              :key="option.code"
              type="button"
              :class="{ active: option.code === selectedLocale }"
              @click="selectedLocale = option.code"
            >
              {{ option.label }}
              <Icon v-if="option.code === selectedLocale" name="lucide:check" size="15" />
            </button>
          </div>
        </details>
      </div>
    </div>

    <main class="appMain">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import { useI18n } from '#imports'
import AppDrawer from '@/components/layout/AppDrawer.vue'
import { useColorMode } from '@/composables/useColorMode'
import { useMenu } from '@/stores/menu'

type LocaleCode = 'de' | 'en'

const localeCodes = ['en', 'de'] as const

const menu = useMenu()
const { isOpen: isMenuOpen } = storeToRefs(menu)
const { t, locale, setLocale } = useI18n()
const { colorMode, toggleColorMode } = useColorMode()

const localeOptions = computed(() =>
  localeCodes.map((code) => ({
    code,
    label: t(`locales.${code}`),
  })),
)

const selectedLocaleLabel = computed(
  () =>
    localeOptions.value.find((option) => option.code === selectedLocale.value)?.label ??
    String(locale.value),
)

const selectedLocale = computed<LocaleCode>({
  get: () => locale.value as LocaleCode,
  set: (code) => {
    void setLocale(code)
  },
})

const toggleMenu = () => menu.toggle()
const closeMenu = () => menu.close()
</script>

<style scoped>
.appShell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-light);
}

.appMain {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
  background: var(--color-bg-light);
  padding: 96px 16px 16px;
}

.topBar {
  position: fixed;
  top: var(--mock-banner-offset, 0px);
  left: 0;
  right: 0;
  z-index: 45;
  min-height: 78px;
  padding: 18px 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  background: var(--color-bg-light);
}

.mobileMenuButton,
.iconButton,
.langMenu summary,
.searchBox {
  border: 1px solid var(--color-border);
  background: var(--color-bg-white);
  color: var(--color-text-primary);
  box-shadow: 0 10px 26px rgb(15 23 42 / 0.05);
}

.mobileMenuButton,
.iconButton {
  width: 42px;
  height: 42px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
}

.searchBox {
  width: min(100%, 354px);
  height: 40px;
  padding: 0 10px 0 13px;
  border-radius: 9px;
  display: none;
  align-items: center;
  gap: 10px;
  color: var(--color-text-secondary);
}

.searchBox input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
}

.searchBox input::placeholder {
  color: #8b98aa;
}

.searchBox kbd {
  min-width: 32px;
  height: 23px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-light);
  color: var(--color-text-secondary);
  font: inherit;
  font-size: 12px;
  font-weight: 900;
}

.srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.topActions {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-self: end;
}

.notificationButton {
  position: relative;
}

.notificationBadge {
  position: absolute;
  top: -8px;
  right: -7px;
  min-width: 20px;
  height: 20px;
  border: 2px solid var(--color-bg-white);
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-dark);
  color: #ffffff;
  font-size: 11px;
  font-weight: 900;
}

.langMenu {
  position: relative;
}

.langMenu summary {
  height: 42px;
  min-width: 128px;
  border-radius: 12px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  outline: none;
  list-style: none;
}

.langMenu summary::-webkit-details-marker {
  display: none;
}

.langOptions {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 80;
  min-width: 152px;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  display: grid;
  gap: 2px;
  background: var(--color-bg-white);
  box-shadow: 0 18px 42px rgb(15 23 42 / 0.14);
}

.langOptions button {
  min-height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: transparent;
  color: var(--color-text-primary);
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.langOptions button:hover,
.langOptions button.active {
  background: var(--color-primary-soft);
  color: var(--color-primary-dark);
}

.iconButton:focus,
.langMenu summary:focus,
.mobileMenuButton:focus,
.searchBox:focus-within {
  outline: 3px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  outline-offset: 2px;
}

@media (min-width: 1024px) {
  .topBar {
    left: 230px;
    min-height: 78px;
    padding: 20px 36px 18px 42px;
    grid-template-columns: minmax(260px, 354px) 1fr auto;
  }

  .mobileMenuButton {
    display: none;
  }

  .searchBox {
    display: flex;
  }

  .appMain {
    padding: 110px 36px 32px 272px;
  }
}
</style>
