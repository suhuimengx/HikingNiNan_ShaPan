<template>
  <el-config-provider namespace="ep">
    <div class="flex main-container">
      <BaseSide />
      <div w="full" py="4">
        <BMap/>
      </div>
    </div>
  </el-config-provider>
</template>

<script setup>
import BMap from "./components/BMap.vue"
</script>

<style>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
}

.main-container {
  height: calc(100vh - var(--ep-menu-item-height) - 3px);
}
</style>
