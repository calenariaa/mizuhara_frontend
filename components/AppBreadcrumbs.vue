<script setup lang="ts">
import { useI18n } from '#imports'

type Crumb = { label: string; to?: string }

defineProps<{ items: Crumb[] }>()

const { t } = useI18n()
</script>

<template>
  <nav class="wrap" :aria-label="t('a11y.breadcrumb')">
    <ol class="list">
      <li v-for="(c, i) in items" :key="`${c.label}-${i}`" class="item">
        <NuxtLink v-if="c.to" class="link" :to="c.to">{{ c.label }}</NuxtLink>
        <span v-else class="current">{{ c.label }}</span>
        <span v-if="i < items.length - 1" class="sep">/</span>
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
