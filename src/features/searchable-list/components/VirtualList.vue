<script setup lang="ts">
import { computed, toRef, useTemplateRef, watch } from 'vue'
import { useVirtualList } from '../composables/useVirtualList'
import type { ListItem } from '../types'

const props = withDefaults(
  defineProps<{
    items: readonly ListItem[]
    itemHeight?: number
    overscan?: number
    resetKey?: string
  }>(),
  {
    itemHeight: 84,
    overscan: 4,
    resetKey: '',
  },
)

// Vue 3.5 的模板引用，用来读取滚动容器的尺寸和位置。
const viewport = useTemplateRef<HTMLElement>('viewport')
const items = toRef(props, 'items')

const {
  totalHeight,
  startIndex,
  endIndex,
  offsetY,
  visibleRows,
  onScroll,
  resetScroll,
} = useVirtualList({
  items,
  itemHeight: props.itemHeight,
  overscan: props.overscan,
  getScrollElement: () => viewport.value,
})

// 样式对象使用 computed 派生，模板只负责声明绑定关系。
const spacerStyle = computed(() => ({ height: `${totalHeight.value}px` }))
const rowsStyle = computed(() => ({ transform: `translateY(${offsetY.value}px)` }))
const rowStyle = computed(() => ({ height: `${props.itemHeight}px` }))

const rangeLabel = computed(() => {
  // 固定为五位编号，方便观察滚动窗口的移动。
  if (props.items.length === 0) return '00000—00000'

  const start = String(startIndex.value + 1).padStart(5, '0')
  const end = String(endIndex.value).padStart(5, '0')
  return `${start}—${end}`
})

watch(
  () => props.resetKey,
  // 有效搜索词变化时重置滚动位置，避免停留在旧列表的深处。
  () => resetScroll(),
)
</script>

<template>
  <section class="virtual-list" aria-label="虚拟列表观测窗口">
    <!-- 将虚拟窗口范围和真实 DOM 数量直接展示出来，便于验证。 -->
    <div class="virtual-list__telemetry" aria-hidden="true">
      <span>LIVE WINDOW</span>
      <strong>{{ rangeLabel }}</strong>
      <i></i>
      <span>DOM ROWS</span>
      <strong>{{ visibleRows.length }}</strong>
    </div>

    <div
      id="virtual-record-list"
      ref="viewport"
      class="virtual-list__viewport"
      role="list"
      tabindex="0"
      aria-label="档案搜索结果"
      @scroll.passive="onScroll"
    >
      <!-- 占位层制造完整列表高度，内部只放当前可见的数据窗口。 -->
      <div class="virtual-list__spacer" :style="spacerStyle">
        <div class="virtual-list__rows" :style="rowsStyle">
          <!-- 虚拟行直接使用原生元素，减少高频列表中的组件实例开销。 -->
          <article
            v-for="row in visibleRows"
            :key="row.item.id"
            class="record-row"
            :style="rowStyle"
            role="listitem"
            :aria-posinset="row.index + 1"
            :aria-setsize="props.items.length"
          >
            <div class="record-row__index">
              <span>{{ String(row.item.id).padStart(5, '0') }}</span>
              <small>ENTRY</small>
            </div>

            <div class="record-row__content">
              <h2>{{ row.item.name }}</h2>
              <p>{{ row.item.description }}</p>
            </div>

            <span class="record-row__signal" aria-hidden="true"></span>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 虚拟列表外框和实时指标栏。 */
.virtual-list {
  overflow: hidden;
  border: 1px solid var(--ink-600);
  background: var(--ink-900);
}

.virtual-list__telemetry {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 16px;
  border-bottom: 1px solid var(--ink-700);
  color: var(--paper-500);
  background: var(--ink-850);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.13em;
}

.virtual-list__telemetry strong {
  color: var(--amber-300);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.virtual-list__telemetry i {
  width: 1px;
  height: 12px;
  margin-inline: 3px;
  background: var(--ink-600);
}

.virtual-list__viewport {
  position: relative;
  height: clamp(378px, 55vh, 588px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-color: var(--amber-500) var(--ink-850);
  scrollbar-width: thin;
}

.virtual-list__viewport:focus-visible {
  outline: 1px solid var(--amber-400);
  outline-offset: -2px;
}

.virtual-list__viewport::-webkit-scrollbar {
  width: 8px;
}

.virtual-list__viewport::-webkit-scrollbar-track {
  background: var(--ink-850);
}

.virtual-list__viewport::-webkit-scrollbar-thumb {
  border: 2px solid var(--ink-850);
  background: var(--amber-500);
}

/* 占位层提供完整滚动高度，行容器通过 translateY 移动到正确位置。 */
.virtual-list__spacer {
  position: relative;
  width: 100%;
}

.virtual-list__rows {
  position: absolute;
  inset: 0 0 auto;
  will-change: transform;
}

/* 固定高度的数据行；高度必须与虚拟滚动配置保持一致。 */
.record-row {
  position: relative;
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 18px;
  padding: 12px 20px;
  overflow: hidden;
  border-bottom: 1px solid var(--ink-700);
  background: var(--ink-900);
  transition: background-color 150ms ease;
}

.record-row::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: var(--amber-400);
  content: '';
  opacity: 0;
  transform: scaleY(0.2);
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.record-row:hover {
  background: #151815;
}

.record-row:hover::before {
  opacity: 1;
  transform: scaleY(1);
}

.record-row__index {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding-right: 16px;
  border-right: 1px solid var(--ink-700);
  font-family: var(--font-mono);
}

.record-row__index span {
  color: var(--amber-300);
  font-size: 13px;
  letter-spacing: 0.06em;
}

.record-row__index small {
  color: var(--paper-500);
  font-size: 8px;
  letter-spacing: 0.18em;
}

.record-row__content {
  min-width: 0;
}

.record-row__content h2,
.record-row__content p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-row__content h2 {
  margin: 0 0 5px;
  color: var(--paper-100);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 560;
  letter-spacing: 0.035em;
}

.record-row__content p {
  margin: 0;
  color: var(--paper-500);
  font-size: 11px;
  line-height: 1.5;
}

.record-row__signal {
  width: 6px;
  height: 6px;
  border: 1px solid var(--green-400);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(143, 200, 155, 0.06);
}

@media (max-width: 640px) {
  .virtual-list__telemetry {
    padding-inline: 12px;
  }

  .virtual-list__viewport {
    height: min(56vh, 504px);
    min-height: 336px;
  }

  .record-row {
    grid-template-columns: 58px minmax(0, 1fr) 8px;
    gap: 12px;
    padding-inline: 13px;
  }

  .record-row__index {
    padding-right: 10px;
  }

  .record-row__index span {
    font-size: 11px;
  }

  .record-row__content h2 {
    font-size: 13px;
  }
}
</style>
