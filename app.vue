<script setup lang="ts">
import { useHead, useI18n } from '#imports'

const { t } = useI18n()

useHead(() => ({
  title: t('app.title'),
  meta: [{ name: 'description', content: t('app.description') }],
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
