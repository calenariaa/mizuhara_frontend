<script setup lang="ts">
import type { ShoppingListCollection } from '@/types/api/shoppingList/shoppingListCollection'
import type { Task } from '@/types/api/tasks/task'
import type { User } from '@/types/api/users/user'

import { useHead, useI18n } from '#imports'
import { CLIENT_STORAGE_KEYS } from '@/config/clientStorage'
import { shoppingListCollectionService } from '@/modules/shoppingList/services/shoppingListCollectionService'
import {
  formatTaskDueDate,
  getTaskDueDateInfo,
  getTaskDueDateStateClass,
  TASK_DUE_DATE_HOME_LIMIT,
  TASK_DUE_DATE_SOON_DAYS,
} from '@/modules/tasks/services/dueDate'
import { isTaskOpen } from '@/modules/tasks/services/status'
import { taskService } from '@/modules/tasks/services/taskService'
import { userService } from '@/modules/user/services/userService'

const KO_FI_DONATION_URL = 'https://ko-fi.com/I4N620AYLT'

const { t } = useI18n()

const collections = ref<ShoppingListCollection[]>([])
const tasks = ref<Task[]>([])
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
  tasks.value.filter((task) => isTaskOpen(task)).length,
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

const relativeDueDateLabel = (daysRemaining: number): string => {
  if (daysRemaining < 0) return t('home.expiring.overdue')
  if (daysRemaining === 0) return t('home.expiring.dueToday')
  if (daysRemaining === 1) return t('home.expiring.dueTomorrow')

  return t('home.expiring.dueIn', { count: daysRemaining })
}

type ExpiringTaskCard = {
  key: string
  title: string
  dueDateDisplay: string
  dueDateLabel: string
  dueDateState: string
  daysRemaining: number
}

const expiringTasks = computed<ExpiringTaskCard[]>(() =>
  tasks.value
    .filter((task) => isTaskOpen(task))
    .map((task) => {
      const dueDateInfo = getTaskDueDateInfo(task.dueDate)
      if (!dueDateInfo || dueDateInfo.daysRemaining > TASK_DUE_DATE_SOON_DAYS) return null

      return {
        key: task['@id'] || task.title || String(task.id ?? task['@id'] ?? 'task'),
        title: task.title?.trim() || t('home.expiring.untitledTask'),
        dueDateDisplay: formatTaskDueDate(task.dueDate, t('tasks.fields.notSet')),
        dueDateLabel: relativeDueDateLabel(dueDateInfo.daysRemaining),
        dueDateState: getTaskDueDateStateClass(task.dueDate),
        daysRemaining: dueDateInfo.daysRemaining,
      }
    })
    .filter((task): task is ExpiringTaskCard => task !== null)
    .sort((left, right) => left.daysRemaining - right.daysRemaining)
    .slice(0, TASK_DUE_DATE_HOME_LIMIT),
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
  localStorage.setItem(CLIENT_STORAGE_KEYS.homeIntroHidden, 'true')
}

const loadDashboard = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const [collectionList, taskList, userList] = await Promise.all([
      shoppingListCollectionService().getAll(),
      taskService().getAll(),
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
  isIntroHidden.value = localStorage.getItem(CLIENT_STORAGE_KEYS.homeIntroHidden) === 'true'
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
          <a
            class="koFiLink"
            :href="KO_FI_DONATION_URL"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              class="koFiImage"
              src="https://storage.ko-fi.com/cdn/kofi4.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
            />
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

    <section v-if="expiringTasks.length" class="expiringSection">
      <div class="expiringHeader">
        <div>
          <p class="eyebrow">{{ t('home.expiring.eyebrow') }}</p>
          <h2 class="sectionTitle">{{ t('home.expiring.title') }}</h2>
          <p class="sectionText">{{ t('home.expiring.subtitle') }}</p>
        </div>
        <div class="expiringCount">{{ t('home.expiring.count', { count: expiringTasks.length }) }}</div>
      </div>

      <div class="expiringList">
        <NuxtLink v-for="task in expiringTasks" :key="task.key" class="expiringItem" to="/tasks">
          <div class="expiringItemMain">
            <div class="expiringItemTitle">{{ task.title }}</div>
            <div class="expiringItemMeta">
              <span class="metaChip" :class="task.dueDateState">{{ task.dueDateLabel }}</span>
              <span class="metaText">{{ task.dueDateDisplay }}</span>
            </div>
          </div>

          <Icon name="lucide:arrow-right" size="18" />
        </NuxtLink>
      </div>
    </section>
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

.expiringSection {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgb(249 115 22 / 0.22);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgb(249 115 22 / 0.08), rgb(244 63 94 / 0.04)),
    var(--color-bg-white);
  box-shadow: var(--shadow-elevated);
}

.expiringHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.expiringCount {
  flex: none;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgb(249 115 22 / 0.12);
  color: #9a3412;
  font-size: 12px;
  font-weight: 800;
}

.expiringList {
  display: grid;
  gap: 10px;
}

.expiringItem {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-white);
  color: inherit;
  text-decoration: none;
}

.expiringItem:hover {
  border-color: rgb(249 115 22 / 0.4);
}

.expiringItemMain {
  min-width: 0;
  display: grid;
  gap: 6px;
}

.expiringItemTitle {
  font-weight: 800;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expiringItemMeta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.metaChip {
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 800;
}

.metaText {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.dueDateSoon {
  border-color: #f59e0b;
  color: #b45309;
  background: #fef3c7;
}

.dueDateUrgent {
  border-color: #ea580c;
  color: #9a3412;
  background: #ffedd5;
}

.dueDateOverdue {
  border-color: #be123c;
  color: #9f1239;
  background: #ffe4e6;
}

.dueDateNeutral {
  border-color: var(--color-border);
  color: var(--color-text-secondary);
  background: var(--color-bg-soft);
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

.koFiLink {
  display: inline-flex;
  align-items: center;
  height: 36px;
}

.koFiImage {
  height: 36px;
  border: 0;
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
