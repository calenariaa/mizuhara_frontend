<template>
  <footer class="footer">
    <div class="inner">
      <span class="text">© {{ year }} Mizuhara</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: #1d4ed8;
  color: #ffffff;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
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
