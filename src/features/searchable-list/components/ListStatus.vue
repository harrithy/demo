<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalCount: number
  filteredCount: number
  hasQuery: boolean
  isFiltering: boolean
}>()

// 数字展示统一使用中文区域格式，例如 10000 显示为 10,000。
const formattedTotal = computed(() => props.totalCount.toLocaleString('zh-CN'))
const formattedFiltered = computed(() => props.filteredCount.toLocaleString('zh-CN'))

const statusMessage = computed(() => {
  // 等待状态优先，避免在防抖期间误报旧结果数量。
  if (props.isFiltering) return '正在校准搜索索引…'
  if (!props.hasQuery) return `全部 ${formattedTotal.value} 条档案已就绪`
  return `找到 ${formattedFiltered.value} 条匹配档案`
})
</script>

<template>
  <!-- aria-live 会在筛选完成后向辅助技术播报结果数量。 -->
  <div class="list-status" role="status" aria-live="polite" aria-atomic="true">
    <div class="list-status__message">
      <span class="list-status__light" :class="{ 'list-status__light--busy': props.isFiltering }"></span>
      {{ statusMessage }}
    </div>

    <div class="list-status__legend" aria-hidden="true">
      <span>检索范围</span>
      <b>ID / 名称 / 描述</b>
    </div>
  </div>
</template>

<style scoped>
/* 搜索结果状态栏。 */
.list-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 50px;
  padding: 0 2px;
  color: var(--paper-300);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.05em;
}

.list-status__message,
.list-status__legend {
  display: flex;
  align-items: center;
  gap: 9px;
}

.list-status__light {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green-400);
  box-shadow: 0 0 12px rgba(143, 200, 155, 0.48);
}

.list-status__light--busy {
  background: var(--amber-400);
  box-shadow: 0 0 12px rgba(244, 185, 95, 0.55);
  animation: status-pulse 900ms ease-in-out infinite;
}

.list-status__legend {
  color: var(--paper-500);
}

.list-status__legend b {
  color: var(--paper-300);
  font-weight: 500;
}

@keyframes status-pulse {
  50% {
    opacity: 0.35;
  }
}

@media (max-width: 640px) {
  .list-status {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
    justify-content: center;
    padding-block: 10px;
  }
}
</style>
