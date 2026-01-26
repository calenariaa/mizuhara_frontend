<script setup lang="ts">
import { useI18n } from '#imports'

type Crumb = { label: string; to?: string }

defineProps<{ items: Crumb[] }>()

const { t } = useI18n()
</script>

<template>
  <nav class="wrap" :aria-label="t('a11y.breadcrumb')">
    <ol class="list">
      <li v-for="(crumb, index) in items" :key="`${crumb.label}-${index}`" class="item">
        <NuxtLink v-if="crumb.to" class="link" :to="crumb.to">{{ crumb.label }}</NuxtLink>
        <span v-else class="current">{{ crumb.label }}</span>
        <span v-if="index < items.length - 1" class="sep">/</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.wrap {
  display: block;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 700;
}

.link {
  text-decoration: none;
  color: var(--color-text-secondary);
}

.link:hover {
  color: var(--color-text-primary);
}

.current {
  color: var(--color-text-primary);
}

.sep {
  opacity: 0.7;
}
</style>
