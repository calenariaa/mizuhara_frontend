<template>
  <ClientOnly>
    <Teleport to="body">
      <div v-if="open" class="overlay" @click="emit('close')" />

      <aside class="drawer" :class="{ open }" :aria-label="t('drawer.aria.menu')" @click.stop>
        <div class="brand">
          <img class="brandLogo" src="/mizuharaIcon.png" alt="" />
          <span>{{ t('app.title') }}</span>
          <button
            class="close"
            type="button"
            :aria-label="t('drawer.aria.close')"
            @click="emit('close')"
          >
            <Icon name="lucide:x" size="18" aria-hidden="true" />
          </button>
        </div>

        <nav class="nav">
          <template v-for="item in sidebarItems" :key="item.labelKey">
            <NuxtLink
              v-if="item.path"
              class="link"
              :to="localePath(item.path)"
              active-class=""
              exact-active-class="linkActive"
              @click="emit('close')"
            >
              <Icon class="linkIcon" :name="item.icon" size="18" aria-hidden="true" />
              <span>{{ t(item.labelKey) }}</span>
              <Icon
                v-if="item.expandable"
                class="chevron"
                name="lucide:chevron-down"
                size="15"
                aria-hidden="true"
              />
            </NuxtLink>

            <div v-else class="link muted" aria-disabled="true">
              <Icon class="linkIcon" :name="item.icon" size="18" aria-hidden="true" />
              <span>{{ t(item.labelKey) }}</span>
              <Icon
                v-if="item.expandable"
                class="chevron"
                name="lucide:chevron-down"
                size="15"
                aria-hidden="true"
              />
            </div>
          </template>
        </nav>

        <div class="premium">
          <div class="premiumArt" aria-hidden="true">
            <img class="premiumLogo" src="/mizuharaWorldLogo.png" alt="" />
          </div>
          <div class="premiumTitle">Mizuhara Premium</div>
          <p>Mehr Funktionen, Backup, Updates und Support.</p>
          <NuxtLink class="premiumButton" :to="localePath('/')">Mehr erfahren</NuxtLink>
        </div>

        <div class="profile">
          <div class="avatar" aria-hidden="true">K</div>
          <div class="profileText">
            <strong>Kira</strong>
            <span>Administrator</span>
          </div>
          <button class="profileMenu" type="button" aria-label="Profilmenu">
            <Icon name="lucide:more-vertical" size="18" aria-hidden="true" />
          </button>
        </div>
      </aside>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'

import { useI18n, useLocalePath } from '#imports'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { t } = useI18n()
const localePath = useLocalePath()

const sidebarItems = [
  { labelKey: 'nav.items.dashboard', path: '/', icon: 'lucide:layout-dashboard' },
  {
    labelKey: 'nav.items.shopping',
    path: '/shopping-lists',
    icon: 'lucide:shopping-basket',
    expandable: true,
  },
  { labelKey: 'nav.items.inventory', icon: 'lucide:archive' },
  { labelKey: 'nav.items.recipes', icon: 'lucide:utensils' },
  { labelKey: 'nav.items.planning', icon: 'lucide:calendar-days', expandable: true },
  { labelKey: 'nav.items.tasks', path: '/tasks', icon: 'lucide:square-check' },
  { labelKey: 'nav.items.household', icon: 'lucide:home' },
  { labelKey: 'nav.items.finance', icon: 'lucide:badge-euro' },
  { labelKey: 'nav.items.documents', icon: 'lucide:file-text' },
  { labelKey: 'nav.items.smartHome', icon: 'lucide:house-plug' },
  { labelKey: 'nav.items.devices', icon: 'lucide:brackets' },
  { labelKey: 'nav.items.family', path: '/users', icon: 'lucide:users' },
  { labelKey: 'nav.items.reminders', icon: 'lucide:shield-alert' },
] as const

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
  inset: var(--mock-banner-offset, 0px) 0 0;
  z-index: 60;
  background: var(--overlay);
  backdrop-filter: blur(3px);
}

.drawer {
  position: fixed;
  top: var(--mock-banner-offset, 0px);
  left: 0;
  z-index: 70;
  width: min(270px, 86vw);
  height: calc(100vh - var(--mock-banner-offset, 0px));
  padding: 27px 16px 24px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: var(--color-bg-white);
  box-shadow: var(--shadow-elevated);
  transform: translateX(-100%);
  transition: transform 180ms ease;
}

.drawer.open {
  transform: translateX(0);
}

.brand {
  min-height: 54px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--color-text-primary);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.brandLogo {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  object-fit: cover;
  object-position: center;
}

.close {
  width: 34px;
  height: 34px;
  margin-left: auto;
  border: 0;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
}

.close:hover {
  background: var(--color-bg-light);
}

.nav {
  margin-top: 28px;
  display: grid;
  gap: 5px;
}

.link {
  min-height: 42px;
  padding: 0 12px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: 22px 1fr auto;
  align-items: center;
  gap: 10px;
  color: #8b98aa;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}

.link:hover,
.linkActive {
  color: var(--color-primary-dark);
  background: color-mix(in srgb, var(--color-primary-soft) 82%, var(--color-bg-white));
}

.link.muted {
  cursor: default;
}

.link.muted:hover {
  color: #8b98aa;
  background: transparent;
}

.linkIcon,
.chevron {
  color: currentColor;
}

.premium {
  margin-top: auto;
  padding: 24px 20px 20px;
  border: 1px solid color-mix(in srgb, var(--color-primary-soft) 62%, var(--color-border));
  border-radius: 10px;
  background:
    radial-gradient(circle at 48% 8%, rgb(251 113 133 / 0.08), transparent 32%),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--color-primary-soft) 46%, #ffffff),
      var(--color-bg-white)
    );
  text-align: center;
  box-shadow: 0 16px 38px rgb(15 23 42 / 0.08);
}

.premiumArt {
  position: relative;
  width: 124px;
  height: 82px;
  margin: 0 auto 14px;
  overflow: hidden;
  border-radius: 12px;
}

.premiumLogo {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: 60% 58%;
  filter: saturate(0.95) contrast(1.04);
}

.premiumTitle {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 900;
}

.premium p {
  margin: 9px 0 17px;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.premiumButton {
  width: 100%;
  min-height: 42px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: linear-gradient(135deg, #8b5cf6, #c026d3);
  font-size: 12px;
  font-weight: 900;
  text-decoration: none;
  box-shadow: 0 10px 24px rgb(168 85 247 / 0.28);
}

.profile {
  min-height: 66px;
  margin-top: 22px;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  display: grid;
  grid-template-columns: 42px 1fr 28px;
  align-items: center;
  gap: 10px;
  background: var(--color-bg-white);
  box-shadow: 0 10px 30px rgb(15 23 42 / 0.05);
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #fda4af, #8b5cf6);
  color: #ffffff;
  font-weight: 900;
}

.profileText {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.profileText strong {
  color: var(--color-text-primary);
  font-size: 13px;
}

.profileText span {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.profileMenu {
  width: 28px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
}

@media (min-width: 1024px) {
  .overlay {
    display: none;
  }

  .drawer {
    width: 230px;
    box-shadow: none;
    border-right: 1px solid color-mix(in srgb, var(--color-border) 68%, transparent);
    transform: translateX(0);
  }

  .close {
    display: none;
  }
}
</style>
