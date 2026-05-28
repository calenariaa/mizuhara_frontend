<script setup lang="ts">
import type { ShoppingListCollection } from '@/types/api/shoppingList/shoppingListCollection'
import type { ShoppingListEntry } from '@/types/api/shoppingList/shoppingListEntry'
import type { Task } from '@/types/api/tasks/task'

import { useHead, useI18n } from '#imports'
import { CLIENT_STORAGE_KEYS } from '@/config/clientStorage'
import { shoppingListCollectionService } from '@/modules/shoppingList/services/shoppingListCollectionService'
import { isTaskOpen } from '@/modules/tasks/services/status'
import { taskService } from '@/modules/tasks/services/taskService'

const KO_FI_DONATION_URL = 'https://ko-fi.com/I4N620AYLT'

const { t } = useI18n()
const isIntroReady = ref(false)
const isIntroHidden = ref(false)
const tasks = ref<Task[]>([])
const shoppingCollections = ref<ShoppingListCollection[]>([])
const currentYear = new Date().getFullYear()

const fallbackTasks = [
  { title: 'Wohnung aufräumen', time: '20:00', badge: 'Heute' },
  { title: 'Einkaufsliste überprüfen', time: '-', badge: 'Heute' },
  { title: 'Wäsche waschen', time: '-', badge: 'Heute' },
  { title: 'Müll rausbringen', time: '-', badge: 'Heute' },
  { title: 'Rechnung prüfen', time: '-', badge: 'Morgen' },
]

const fallbackShoppingItems = ['Haferflocken', 'Milch', 'Tomaten']

const weekDays = [
  { day: 'Mo', date: '25' },
  { day: 'Di', date: '26' },
  { day: 'Mi', date: '27' },
  { day: 'Do', date: '28', active: true },
  { day: 'Fr', date: '29' },
  { day: 'Sa', date: '30' },
  { day: 'So', date: '31' },
]

const quickAccessItems = [
  {
    titleKey: 'home.quickAccess.items.shopping.title',
    subtitleKey: 'home.quickAccess.items.shopping.subtitle',
    icon: 'lucide:shopping-basket',
    path: '/shopping-lists',
    tone: 'purple',
  },
  {
    titleKey: 'home.quickAccess.items.inventory.title',
    subtitleKey: 'home.quickAccess.items.inventory.subtitle',
    icon: 'lucide:briefcase-business',
    path: '/',
    tone: 'blue',
  },
  {
    titleKey: 'home.quickAccess.items.recipes.title',
    subtitleKey: 'home.quickAccess.items.recipes.subtitle',
    icon: 'lucide:utensils',
    path: '/',
    tone: 'orange',
  },
  {
    titleKey: 'home.quickAccess.items.tasks.title',
    subtitleKey: 'home.quickAccess.items.tasks.subtitle',
    icon: 'lucide:list-checks',
    path: '/tasks',
    tone: 'pink',
  },
  {
    titleKey: 'home.quickAccess.items.household.title',
    subtitleKey: 'home.quickAccess.items.household.subtitle',
    icon: 'lucide:home',
    path: '/',
    tone: 'purple',
  },
  {
    titleKey: 'home.quickAccess.items.finance.title',
    subtitleKey: 'home.quickAccess.items.finance.subtitle',
    icon: 'lucide:badge-euro',
    path: '/',
    tone: 'green',
  },
  {
    titleKey: 'home.quickAccess.items.smartHome.title',
    subtitleKey: 'home.quickAccess.items.smartHome.subtitle',
    icon: 'lucide:house-plug',
    path: '/',
    tone: 'purple',
  },
  {
    titleKey: 'home.quickAccess.items.documents.title',
    subtitleKey: 'home.quickAccess.items.documents.subtitle',
    icon: 'lucide:file-text',
    path: '/',
    tone: 'violet',
  },
]

const hideIntro = (): void => {
  isIntroHidden.value = true
  localStorage.setItem(CLIENT_STORAGE_KEYS.homeIntroHidden, 'true')
}

const formatTaskTime = (dueDate?: string | null): string => {
  if (!dueDate) return '-'

  const date = new Date(dueDate)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const getTaskBadge = (dueDate?: string | null): string => {
  if (!dueDate) return 'Heute'

  const due = new Date(dueDate)
  if (Number.isNaN(due.getTime())) return 'Heute'

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime()
  const diffDays = Math.round((dueStart - todayStart) / 86_400_000)

  if (diffDays <= 0) return 'Heute'
  if (diffDays === 1) return 'Morgen'
  return `${diffDays} Tage`
}

const taskPreviewItems = computed(() => {
  const openTasks = tasks.value
    .filter((task) => isTaskOpen(task))
    .slice(0, 5)
    .map((task) => ({
      title: task.title?.trim() || 'Unbenannte Aufgabe',
      time: formatTaskTime(task.dueDate),
      badge: getTaskBadge(task.dueDate),
    }))

  return openTasks.length > 0 ? openTasks : fallbackTasks
})

const shoppingPreviewItems = computed(() => {
  const items = shoppingCollections.value.flatMap((collection) =>
    (collection.shoppingLists ?? []).flatMap((shoppingList) => {
      if (typeof shoppingList === 'string') return []

      return (shoppingList.shoppingListEntries ?? [])
        .filter((entry): entry is ShoppingListEntry => typeof entry !== 'string' && !entry.acquired)
        .map((entry) => {
          if (typeof entry.productInformation === 'string') return 'Produkt'
          return entry.productInformation.productName?.trim() || 'Produkt'
        })
    }),
  )

  return items.length > 0 ? items.slice(0, 3) : fallbackShoppingItems
})

const loadOverview = async (): Promise<void> => {
  try {
    const [taskList, collectionList] = await Promise.all([
      taskService().getAll(),
      shoppingListCollectionService().getAll(),
    ])

    tasks.value = taskList
    shoppingCollections.value = collectionList
  } catch {
    tasks.value = []
    shoppingCollections.value = []
  }
}

onMounted(() => {
  isIntroHidden.value = localStorage.getItem(CLIENT_STORAGE_KEYS.homeIntroHidden) === 'true'
  isIntroReady.value = true
  void loadOverview()
})

useHead(() => ({
  title: t('home.meta.title'),
}))
</script>

<template>
  <div class="page">
    <section v-if="isIntroReady && !isIntroHidden" class="intro">
      <div class="introTextBlock">
        <p class="eyebrow">{{ t('home.intro.eyebrow') }}</p>
        <h2>{{ t('home.intro.title') }}</h2>
        <p>{{ t('home.intro.text') }}</p>
      </div>

      <div class="introActions">
        <a class="koFiLink" :href="KO_FI_DONATION_URL" target="_blank" rel="noopener noreferrer">
          <img
            class="koFiImage"
            src="https://storage.ko-fi.com/cdn/kofi4.png?v=6"
            alt="Buy Me a Coffee at ko-fi.com"
          />
        </a>

        <button class="hideButton" type="button" @click="hideIntro">
          <Icon name="lucide:x" size="17" />
          <span>{{ t('home.intro.hide') }}</span>
        </button>
      </div>
    </section>

    <section class="dashboardTop">
      <div class="welcomeCard">
        <div class="welcomeCopy">
          <p class="eyebrow">{{ t('home.welcome.eyebrow') }}</p>
          <h1>{{ t('home.welcome.title') }}</h1>
          <p>{{ t('home.welcome.subtitle') }}</p>

          <div class="welcomeActions">
            <button class="primaryButton" type="button">
              <Icon name="lucide:plus" size="18" />
              <span>{{ t('home.welcome.quickAdd') }}</span>
            </button>

            <button class="secondaryButton" type="button">
              <Icon name="lucide:line-chart" size="17" />
              <span>{{ t('home.welcome.customize') }}</span>
            </button>
          </div>
        </div>

        <div class="welcomeArt" aria-hidden="true">
          <img class="welcomeWorldLogo" src="/mizuharaWorldLogo.png" alt="" />
        </div>
      </div>

      <aside class="weatherCard">
        <div>
          <p class="eyebrow">{{ t('home.weather.eyebrow') }}</p>
          <div class="weatherMain">
            <div>
              <div class="temperature">16&deg;C</div>
              <p class="weatherState">{{ t('home.weather.state') }}</p>
            </div>
            <Icon class="weatherIcon" name="lucide:cloud-sun" size="58" />
          </div>
        </div>

        <div class="weatherMeta">
          <span>
            <Icon name="lucide:thermometer" size="15" />
            18&deg;C / 9&deg;C
          </span>
          <span>
            <Icon name="lucide:wind" size="15" />
            10 km/h
          </span>
        </div>

        <button class="detailsButton" type="button">
          <span>{{ t('home.weather.details') }}</span>
          <Icon name="lucide:arrow-right" size="15" />
        </button>
      </aside>
    </section>

    <section class="overviewGrid">
      <article class="overviewCard">
        <div class="cardHeader">
          <div>
            <p class="eyebrow">{{ t('home.overview.tasks.eyebrow') }}</p>
            <h2>{{ t('home.overview.tasks.title') }}</h2>
          </div>
        </div>

        <div class="taskList">
          <div v-for="task in taskPreviewItems" :key="task.title" class="taskRow">
            <span class="checkCircle" aria-hidden="true" />
            <span class="rowTitle">{{ task.title }}</span>
            <span class="rowTime">{{ task.time }}</span>
            <span class="dateBadge" :class="{ tomorrow: task.badge !== 'Heute' }">{{
              task.badge
            }}</span>
          </div>
        </div>

        <NuxtLink class="cardLink" to="/tasks">
          <span>{{ t('home.overview.tasks.link') }}</span>
          <Icon name="lucide:arrow-right" size="16" />
        </NuxtLink>
      </article>

      <article class="overviewCard">
        <div class="cardHeader">
          <div>
            <p class="eyebrow">{{ t('home.overview.shopping.eyebrow') }}</p>
            <h2>
              {{ t('home.overview.shopping.subtitle', { count: shoppingPreviewItems.length }) }}
            </h2>
          </div>
        </div>

        <div class="shoppingList">
          <div v-for="item in shoppingPreviewItems" :key="item" class="shoppingRow">
            <span class="checkCircle" aria-hidden="true" />
            <span class="rowTitle">{{ item }}</span>
          </div>

          <div class="newEntry">
            <Icon name="lucide:plus" size="17" />
            <span>{{ t('home.overview.shopping.newEntry') }}</span>
          </div>
        </div>

        <NuxtLink class="cardLink" to="/shopping-lists">
          <span>{{ t('home.overview.shopping.link') }}</span>
          <Icon name="lucide:arrow-right" size="16" />
        </NuxtLink>
      </article>

      <article class="overviewCard">
        <div class="cardHeader">
          <div>
            <p class="eyebrow">{{ t('home.overview.week.eyebrow') }}</p>
            <h2>{{ t('home.overview.week.subtitle') }}</h2>
          </div>
        </div>

        <div class="weekDays">
          <div
            v-for="day in weekDays"
            :key="day.day"
            class="weekDay"
            :class="{ active: day.active }"
          >
            <span>{{ day.day }}</span>
            <strong>{{ day.date }}</strong>
          </div>
        </div>

        <div class="weekEvent">
          <strong>{{ t('home.overview.week.today') }}</strong>
          <div class="eventRow">
            <span>20:00</span>
            <span class="eventDot" />
            <span>{{ t('home.overview.week.event') }}</span>
          </div>
        </div>

        <a class="cardLink" href="#" @click.prevent>
          <span>{{ t('home.overview.week.link') }}</span>
          <Icon name="lucide:arrow-right" size="16" />
        </a>
      </article>
    </section>

    <section class="quickAccessSection">
      <div>
        <h2>{{ t('home.quickAccess.title') }}</h2>
        <p>{{ t('home.quickAccess.subtitle') }}</p>
      </div>

      <div class="quickAccessGrid">
        <NuxtLink
          v-for="item in quickAccessItems"
          :key="item.titleKey"
          class="quickCard"
          :to="item.path"
        >
          <span class="quickIcon" :class="item.tone">
            <Icon :name="item.icon" size="24" />
          </span>

          <span class="quickText">
            <strong>{{ t(item.titleKey) }}</strong>
            <span>{{ t(item.subtitleKey) }}</span>
          </span>

          <Icon class="quickArrow" name="lucide:chevron-right" size="20" />
        </NuxtLink>
      </div>
    </section>

    <footer class="homeFooter">
      <span>&copy; {{ currentYear }} Mizuhara v0.1.0</span>
      <span aria-hidden="true">•</span>
      <span>Open Source</span>
      <span aria-hidden="true">•</span>
      <span>Mit <span class="heart">♥</span> von Kikimika IT UG</span>
    </footer>
  </div>
</template>

<style scoped>
.page {
  width: min(100%, 1300px);
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.intro {
  padding: 18px 20px;
  border: 1px solid color-mix(in srgb, var(--color-primary-soft) 70%, var(--color-border));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  background:
    radial-gradient(circle at 8% 0%, rgb(192 132 252 / 0.18), transparent 32%),
    var(--color-bg-white);
  box-shadow: 0 16px 38px rgb(15 23 42 / 0.07);
}

.introTextBlock {
  min-width: 0;
  display: grid;
  gap: 5px;
}

.intro h2,
.intro p,
.welcomeCard h1,
.welcomeCard p,
.weatherCard p {
  margin: 0;
}

.intro h2 {
  color: var(--color-text-primary);
  font-size: 18px;
}

.introTextBlock p:not(.eyebrow) {
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.45;
}

.eyebrow {
  margin: 0;
  color: var(--color-primary-dark);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.introActions,
.welcomeActions,
.weatherMeta,
.detailsButton {
  display: flex;
  align-items: center;
}

.introActions {
  flex: none;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.koFiLink {
  display: inline-flex;
  align-items: center;
  height: 36px;
}

.koFiImage {
  height: 36px;
  border: 0;
}

.hideButton,
.primaryButton,
.secondaryButton,
.detailsButton {
  border: 1px solid var(--color-border);
  border-radius: 9px;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
}

.hideButton {
  min-height: 36px;
  padding: 8px 10px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: var(--color-bg-white);
  color: var(--color-text-primary);
}

.dashboardTop {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
}

.welcomeCard,
.weatherCard {
  min-width: 0;
  border: 1px solid color-mix(in srgb, var(--color-primary-soft) 54%, transparent);
  border-radius: 12px;
  background: var(--color-bg-white);
  box-shadow: 0 18px 44px rgb(15 23 42 / 0.1);
}

.welcomeCard {
  position: relative;
  min-height: 205px;
  padding: 34px 30px;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  background: linear-gradient(110deg, var(--color-bg-white), #fff1f7 58%, #fff6fb);
}

.welcomeCopy {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 14px;
}

.welcomeCard h1 {
  color: var(--color-text-primary);
  font-size: clamp(30px, 4vw, 42px);
  line-height: 1.1;
  letter-spacing: 0;
}

.welcomeCard p:not(.eyebrow) {
  color: var(--color-text-secondary);
  font-size: 16px;
  font-weight: 700;
}

.welcomeActions {
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 6px;
}

.primaryButton,
.secondaryButton {
  min-height: 42px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.primaryButton {
  border-color: transparent;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #ffffff;
  box-shadow: 0 14px 28px rgb(124 58 237 / 0.24);
}

.secondaryButton {
  background: var(--color-bg-white);
  color: var(--color-text-primary);
}

.welcomeArt {
  display: none;
}

.welcomeWorldLogo {
  display: block;
}

.weatherCard {
  min-height: 205px;
  padding: 26px 26px 0;
  overflow: hidden;
  display: grid;
  align-content: space-between;
  background:
    radial-gradient(circle at 80% 14%, rgb(251 113 133 / 0.17), transparent 28%),
    linear-gradient(145deg, var(--color-bg-white), #fff4fb 58%, var(--color-primary-soft));
}

.weatherMain {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.temperature {
  color: var(--color-text-primary);
  font-size: 36px;
  font-weight: 900;
  line-height: 1;
}

.weatherState {
  margin-top: 10px;
  color: var(--color-text-secondary);
  font-size: 15px;
  font-weight: 800;
}

.weatherIcon {
  color: #f59e0b;
}

.weatherMeta {
  gap: 26px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 800;
}

.weatherMeta span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.detailsButton {
  min-height: 46px;
  margin: 22px -26px 0;
  padding: 0 26px;
  border: 0;
  border-top: 1px solid color-mix(in srgb, var(--color-primary-soft) 80%, transparent);
  border-radius: 0;
  justify-content: flex-end;
  gap: 8px;
  background: color-mix(in srgb, var(--color-primary-soft) 62%, transparent);
  color: var(--color-primary-dark);
}

.overviewGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 18px;
}

.overviewCard {
  min-height: 300px;
  padding: 22px 18px 18px;
  border: 1px solid color-mix(in srgb, var(--color-border) 82%, transparent);
  border-radius: 12px;
  display: grid;
  align-content: space-between;
  gap: 18px;
  background: var(--color-bg-white);
  box-shadow: 0 14px 34px rgb(15 23 42 / 0.07);
}

.cardHeader h2 {
  margin: 6px 0 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 800;
}

.taskList,
.shoppingList {
  display: grid;
  gap: 14px;
}

.taskRow,
.shoppingRow {
  display: grid;
  align-items: center;
  gap: 10px;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 800;
}

.taskRow {
  grid-template-columns: 18px minmax(0, 1fr) 52px auto;
}

.shoppingRow {
  grid-template-columns: 18px minmax(0, 1fr);
}

.checkCircle {
  width: 18px;
  height: 18px;
  border: 2px solid color-mix(in srgb, var(--color-primary) 58%, #ffffff);
  border-radius: 999px;
}

.rowTitle {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rowTime {
  color: var(--color-text-secondary);
  text-align: right;
}

.dateBadge {
  min-width: 54px;
  padding: 5px 9px;
  border-radius: 8px;
  background: #ffedd5;
  color: #ea580c;
  font-size: 12px;
  font-weight: 900;
  text-align: center;
}

.dateBadge.tomorrow {
  background: #fee2e2;
  color: #fb7185;
}

.newEntry {
  min-height: 38px;
  padding: 0 13px;
  border: 1px solid var(--color-border);
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #9aa6b7;
  font-size: 14px;
  font-weight: 800;
}

.weekDays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.weekDay {
  min-width: 0;
  display: grid;
  justify-items: center;
  gap: 10px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 900;
}

.weekDay strong {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: var(--color-text-primary);
}

.weekDay.active strong {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #ffffff;
  box-shadow: 0 12px 22px rgb(124 58 237 / 0.22);
}

.weekEvent {
  min-height: 102px;
  padding: 18px 16px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  display: grid;
  gap: 16px;
  color: var(--color-text-primary);
  font-size: 14px;
  box-shadow: 0 10px 26px rgb(15 23 42 / 0.04);
}

.eventRow {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--color-text-secondary);
  font-weight: 800;
}

.eventDot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--color-primary-dark);
}

.cardLink {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--color-primary-dark);
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
}

.quickAccessSection {
  display: grid;
  gap: 22px;
}

.quickAccessSection h2,
.quickAccessSection p {
  margin: 0;
}

.quickAccessSection h2 {
  color: var(--color-text-primary);
  font-size: 22px;
  line-height: 1.2;
}

.quickAccessSection p {
  margin-top: 6px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 700;
}

.quickAccessGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
}

.quickCard {
  min-height: 88px;
  padding: 18px;
  border: 1px solid color-mix(in srgb, var(--color-border) 82%, transparent);
  border-radius: 12px;
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  background: var(--color-bg-white);
  color: inherit;
  text-decoration: none;
  box-shadow: 0 12px 30px rgb(15 23 42 / 0.06);
}

.quickCard:hover {
  border-color: color-mix(in srgb, var(--color-primary) 42%, var(--color-border));
  transform: translateY(-1px);
}

.quickIcon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: grid;
  place-items: center;
}

.quickIcon.purple,
.quickIcon.violet {
  background: #f3e8ff;
  color: #8b5cf6;
}

.quickIcon.blue {
  background: #eaf1ff;
  color: #3b82f6;
}

.quickIcon.orange {
  background: #ffedd5;
  color: #ea580c;
}

.quickIcon.pink {
  background: #ffe4ef;
  color: #fb7185;
}

.quickIcon.green {
  background: #dcfce7;
  color: #22c55e;
}

.quickText {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.quickText strong {
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 900;
}

.quickText span {
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.quickArrow {
  color: var(--color-text-secondary);
}

.homeFooter {
  padding: 18px 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 700;
}

.heart {
  color: #fb7185;
}

@media (max-width: 720px) {
  .intro {
    align-items: flex-start;
    flex-direction: column;
  }

  .introActions {
    justify-content: flex-start;
  }
}

@media (min-width: 1120px) {
  .dashboardTop {
    grid-template-columns: minmax(0, 1fr) 330px;
  }

  .welcomeCard {
    grid-template-columns: minmax(0, 1fr) 280px;
  }

  .welcomeArt {
    position: relative;
    min-height: 165px;
    display: block;
  }

  .welcomeWorldLogo {
    position: absolute;
    inset: -42px -52px -44px -78px;
    width: 430px;
    height: 250px;
    max-width: none;
    object-fit: cover;
    object-position: 58% 52%;
    opacity: 0.9;
    mix-blend-mode: multiply;
    pointer-events: none;
  }
}

@media (min-width: 1180px) {
  .overviewGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .quickAccessGrid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
