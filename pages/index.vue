<script setup lang="ts">
import type { ShoppingListCollection } from '@/types/api/shoppingList/shoppingListCollection'
import type { GenericTask } from '@/types/api/tasks/genericTask'
import type { User } from '@/types/api/users/user'

import { useHead, useI18n } from '#imports'
import { shoppingListCollectionService } from '@/modules/shoppingList/services/shoppingListCollectionService'
import { genericTaskService } from '@/modules/tasks/services/genericTaskService'
import { userService } from '@/modules/user/services/userService'

const HOME_INTRO_STORAGE_KEY = 'mizuhara.homeIntroHidden'
const PAYPAL_DONATION_URL =
  'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=kira.reitz%40gmx.de&currency_code=EUR'

const { t } = useI18n()

const collections = ref<ShoppingListCollection[]>([])
const tasks = ref<GenericTask[]>([])
const users = ref<User[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const isIntroHidden = ref(false)

const totalShoppingLists = computed(() =>
  collections.value.reduce((count, collection) => count + (collection.shoppingLists?.length ?? 0), 0),
)

const openShoppingLists = computed(() =>
  collections.value.reduce((listCount, collection) => {
    const collectionLists = collection.shoppingLists ?? []

    return (
      listCount +
      collectionLists.filter((shoppingList) => {
        if (typeof shoppingList === 'string') return true

        const entries = shoppingList.shoppingListEntries ?? []
        if (entries.length === 0) return true

        return entries.some((entry) => typeof entry === 'string' || !entry.acquired)
      }).length
    )
  }, 0),
)

const openTasks = computed(() =>
  tasks.value.filter((task) => !['completed', 'done'].includes(task.status ?? '')).length,
)

const completedTasks = computed(() => tasks.value.length - openTasks.value)

const shoppingProgress = computed(() =>
  totalShoppingLists.value === 0
    ? 0
    : Math.round(((totalShoppingLists.value - openShoppingLists.value) / totalShoppingLists.value) * 100),
)

const taskProgress = computed(() =>
  tasks.value.length === 0 ? 0 : Math.round((completedTasks.value / tasks.value.length) * 100),
)

const dashboardCards = computed(() => [
  {
    key: 'shopping',
    icon: 'lucide:shopping-basket',
    title: t('home.dashboard.shopping.title'),
    value: openShoppingLists.value,
    meta: t('home.dashboard.shopping.meta', { total: totalShoppingLists.value }),
    path: '/shopping-lists',
    progress: shoppingProgress.value,
  },
  {
    key: 'tasks',
    icon: 'lucide:list-checks',
    title: t('home.dashboard.tasks.title'),
    value: openTasks.value,
    meta: t('home.dashboard.tasks.meta', { total: tasks.value.length }),
    path: '/tasks',
    progress: taskProgress.value,
  },
  {
    key: 'users',
    icon: 'lucide:users',
    title: t('home.dashboard.users.title'),
    value: users.value.length,
    meta: t('home.dashboard.users.meta'),
    path: '/users',
    progress: 100,
  },
])

const hideIntro = (): void => {
  isIntroHidden.value = true
  localStorage.setItem(HOME_INTRO_STORAGE_KEY, 'true')
}

const loadDashboard = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const [collectionList, taskList, userList] = await Promise.all([
      shoppingListCollectionService().getAll(),
      genericTaskService().getAll(),
      userService().getAll(),
    ])

    collections.value = collectionList
    tasks.value = taskList
    users.value = userList
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : t('errors.unknown')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  isIntroHidden.value = localStorage.getItem(HOME_INTRO_STORAGE_KEY) === 'true'
  void loadDashboard()
})

useHead(() => ({
  title: t('home.meta.title'),
}))
</script>

<template>
  <div class="page">
    <section v-if="!isIntroHidden" class="intro">
      <div class="introContent">
        <p class="eyebrow">{{ t('home.intro.eyebrow') }}</p>
        <h1 class="h1">{{ t('home.intro.title') }}</h1>
        <p class="introText">{{ t('home.intro.text') }}</p>
        <p class="introText">{{ t('home.intro.makers') }}</p>
        <p class="introText">{{ t('home.intro.opensource') }}</p>

        <div class="introActions">
          <a class="primaryLink" :href="PAYPAL_DONATION_URL" target="_blank" rel="noopener noreferrer">
            <Icon name="lucide:coffee" size="18" />
            <span>{{ t('home.intro.coffee') }}</span>
          </a>

          <button class="hideButton" type="button" @click="hideIntro">
            <Icon name="lucide:check" size="18" />
            <span>{{ t('home.intro.hide') }}</span>
          </button>
        </div>
      </div>
    </section>

    <header class="dashboardHeader">
      <div>
        <h2 class="sectionTitle">{{ t('home.dashboard.title') }}</h2>
        <p class="sectionText">{{ t('home.dashboard.subtitle') }}</p>
      </div>

      <button class="refreshButton" type="button" :disabled="isLoading" @click="loadDashboard">
        <Icon :name="isLoading ? 'ph:spinner-gap' : 'ph:arrow-clockwise'" class="refreshIcon" />
      </button>
    </header>

    <div v-if="errorMessage" class="stateCard">
      <div class="stateTitle">{{ t('home.dashboard.errorTitle') }}</div>
      <div class="sectionText">{{ errorMessage }}</div>
    </div>

    <div class="statsGrid">
      <NuxtLink v-for="card in dashboardCards" :key="card.key" class="statCard" :to="card.path">
        <div class="statHeader">
          <div class="iconWrap">
            <Icon :name="card.icon" size="22" />
          </div>
          <Icon name="lucide:arrow-right" size="18" />
        </div>

        <div>
          <div class="statValue">{{ card.value }}</div>
          <div class="statTitle">{{ card.title }}</div>
          <div class="statMeta">{{ card.meta }}</div>
        </div>

        <div class="bar" aria-hidden="true">
          <div class="barFill" :style="{ width: `${card.progress}%` }" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  gap: 18px;
}

.intro,
.stateCard,
.statCard {
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: var(--shadow-elevated);
}

.intro {
  overflow: hidden;
}

.introContent {
  display: grid;
  gap: 12px;
  padding: 20px;
  background:
    linear-gradient(135deg, rgb(192 132 252 / 0.18), rgb(251 113 133 / 0.1)),
    var(--color-bg-white);
}

.eyebrow {
  margin: 0;
  color: var(--color-primary-dark);
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
}

.h1,
.sectionTitle {
  margin: 0;
  color: var(--color-text-primary);
}

.h1 {
  font-size: 28px;
}

.sectionTitle {
  font-size: 21px;
}

.introText,
.sectionText,
.statMeta {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.55;
}

.introActions,
.dashboardHeader,
.statHeader {
  display: flex;
  align-items: center;
}

.introActions {
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.dashboardHeader,
.statHeader {
  justify-content: space-between;
  gap: 12px;
}

.primaryLink,
.hideButton,
.refreshButton {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-weight: 900;
}

.primaryLink,
.hideButton {
  min-height: 40px;
  padding: 9px 11px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.primaryLink {
  background: var(--color-primary-soft);
  color: var(--color-text-primary);
}

.hideButton,
.refreshButton {
  background: var(--color-bg-light);
  color: var(--color-text-primary);
  cursor: pointer;
}

.refreshButton {
  width: 44px;
  height: 44px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.refreshButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refreshButton:disabled .refreshIcon {
  animation: spin 0.9s linear infinite;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.statCard {
  min-height: 176px;
  padding: 16px;
  display: grid;
  align-content: space-between;
  gap: 18px;
  color: inherit;
  text-decoration: none;
}

.statCard:hover {
  border-color: rgb(from var(--color-primary) r g b / 0.55);
}

.iconWrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--color-primary-soft);
  color: var(--color-primary-dark);
}

.statValue {
  color: var(--color-text-primary);
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
}

.statTitle {
  margin-top: 6px;
  color: var(--color-text-primary);
  font-weight: 900;
}

.bar {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-bg-light);
}

.barFill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-primary-dark), var(--color-accent));
}

.stateCard {
  padding: 16px;
}

.stateTitle {
  color: var(--color-text-primary);
  font-weight: 900;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
