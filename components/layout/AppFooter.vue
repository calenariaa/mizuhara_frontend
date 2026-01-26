<template>
  <footer class="footer">
    <div class="inner">
      <span class="text">{{ t('footer.copyright', { year }) }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: var(--color-primary);
  color: var(--color-bg-white);
  box-shadow: var(--shadow-footer);
  position: relative;
}

.footer::before {
  content: '';
  position: absolute;
  top: -14px;
  left: 0;
  right: 0;
  height: 14px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), var(--color-primary));
}

.inner {
  min-height: 56px;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.text {
  font-size: 14px;
  opacity: 0.9;
}
</style>
