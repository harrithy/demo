<script setup lang="ts">
// defineModel 提供类型安全的双向绑定，父组件仍是搜索值的唯一数据源。
const model = defineModel<string>({ required: true })

const props = withDefaults(
  defineProps<{
    isFiltering?: boolean
  }>(),
  {
    isFiltering: false,
  },
)

function clearSearch() {
  // 清空搜索会立即恢复完整列表，不需要等待防抖。
  model.value = ''
}
</script>

<template>
  <div class="search-field" :class="{ 'search-field--busy': props.isFiltering }">
    <!-- 搜索图标仅作装饰，不进入无障碍树。 -->
    <svg class="search-field__icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>

    <label class="sr-only" for="archive-search">搜索档案</label>
    <input
      id="archive-search"
      v-model="model"
      class="search-field__input"
      type="search"
      placeholder="输入 ID、名称或描述关键词…"
      autocomplete="off"
      spellcheck="false"
      aria-controls="virtual-record-list"
      aria-describedby="search-instructions"
    />

    <!-- 防抖等待状态与清空按钮独立展示，等待时仍可立即清空搜索。 -->
    <span v-if="props.isFiltering" class="search-field__pending" aria-hidden="true">
      <i></i><i></i><i></i>
    </span>

    <button
      v-if="model"
      class="search-field__clear"
      type="button"
      aria-label="清空搜索"
      @click="clearSearch"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="m5 5 10 10M15 5 5 15" />
      </svg>
    </button>

    <span id="search-instructions" class="sr-only">
      停止输入三百毫秒后，将按编号、名称和描述筛选列表。
    </span>
  </div>
</template>

<style scoped>
/* 输入框主体与右下角定位标记。 */
.search-field {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 62px;
  border: 1px solid var(--ink-600);
  background: rgba(8, 9, 9, 0.76);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.search-field::after {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 18px;
  height: 18px;
  border-right: 1px solid var(--amber-500);
  border-bottom: 1px solid var(--amber-500);
  content: '';
  pointer-events: none;
}

.search-field:focus-within {
  border-color: rgba(244, 185, 95, 0.72);
  background: rgba(12, 13, 13, 0.96);
  box-shadow: 0 0 0 3px rgba(244, 185, 95, 0.09);
}

.search-field__icon {
  width: 22px;
  height: 22px;
  margin-left: 20px;
  color: var(--amber-400);
  fill: none;
  stroke: currentColor;
  stroke-linecap: square;
  stroke-width: 1.5;
}

.search-field__input {
  width: 100%;
  min-width: 0;
  padding: 18px 52px 18px 14px;
  border: 0;
  outline: 0;
  color: var(--paper-100);
  background: transparent;
  font-family: var(--font-body);
  font-size: 15px;
  letter-spacing: 0.02em;
}

/* 筛选等待期间为状态圆点和清空按钮同时预留空间。 */
.search-field--busy .search-field__input {
  padding-right: 92px;
}

.search-field__input::placeholder {
  color: var(--paper-500);
}

.search-field__input::-webkit-search-cancel-button {
  display: none;
}

/* 使用自定义清空按钮，保证各浏览器视觉和可访问名称一致。 */
.search-field__clear {
  position: absolute;
  right: 12px;
  display: grid;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease;
}

.search-field__clear:hover,
.search-field__clear:focus-visible {
  border-color: var(--ink-600);
  outline: 0;
  color: var(--amber-300);
  background: var(--ink-800);
}

.search-field__clear svg {
  width: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
}

.search-field__pending {
  position: absolute;
  right: 62px;
  display: flex;
  gap: 4px;
}

.search-field__pending i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--amber-400);
  animation: pending 900ms ease-in-out infinite;
}

.search-field__pending i:nth-child(2) {
  animation-delay: 120ms;
}

.search-field__pending i:nth-child(3) {
  animation-delay: 240ms;
}

/* 三个圆点依次上浮，表示关键词仍在等待防抖提交。 */
@keyframes pending {
  0%,
  70%,
  100% {
    opacity: 0.28;
    transform: translateY(0);
  }

  35% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@media (max-width: 640px) {
  .search-field {
    min-height: 56px;
  }

  .search-field__icon {
    margin-left: 16px;
  }

  .search-field__input {
    padding-block: 15px;
    font-size: 14px;
  }
}
</style>
