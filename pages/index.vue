<script setup lang="ts">
import { useHead, useI18n } from '#imports'

const { t } = useI18n()

useHead(() => ({
  title: t('home.meta.title'),
}))
</script>

<template>
  <div class="page">
    <h1 class="h1">{{ t('home.title') }}</h1>
    <p class="p">{{ t('home.subtitle') }}</p>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
}

.h1 {
  margin: 12px 0 8px;
  font-size: 22px;
  color: var(--color-text-primary);
}

.p {
  margin: 0;
  color: var(--color-text-secondary);
}
</style>
