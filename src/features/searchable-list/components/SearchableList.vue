<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useSearchableList } from '../composables/useSearchableList'
import { createMockItems } from '../data/mockItems'
import type { SearchableListItem } from '../types'
import ListStatus from './ListStatus.vue'
import SearchInput from './SearchInput.vue'
import VirtualList from './VirtualList.vue'

// 大型静态数组使用 shallowRef，避免 Vue 深度代理 10,000 个对象。
const allItems = shallowRef<readonly SearchableListItem[]>(createMockItems(10_000))
const { query, effectiveQuery, filteredItems, isFiltering, setQuery } =
  useSearchableList(allItems, 300)

// 将 composable 的只读 query 和显式 setQuery 动作适配为组件 v-model。
const searchModel = computed({
  get: () => query.value,
  set: (value: string) => setQuery(value),
})

const hasQuery = computed(() => effectiveQuery.value.length > 0)
</script>

<template>
  <main class="observatory">
    <!-- 背景网格和光晕仅用于营造数据观测台氛围。 -->
    <div class="observatory__grid" aria-hidden="true"></div>
    <div class="observatory__glow" aria-hidden="true"></div>

    <!-- 页面介绍区。 -->
    <header class="hero">
      <div class="hero__copy">
        <p class="hero__eyebrow"><span>INDEX / 10K</span> 前端数据观测台</p>
        <h1>从万条记录中，<br /><em>即刻定位。</em></h1>
        <p class="hero__description">
          只保留此刻需要看见的节点。搜索、滚动与渲染窗口，全部在浏览器本地完成。
        </p>
      </div>

      <div class="hero__diagram" aria-hidden="true">
        <span class="hero__diagram-label">RENDER WINDOW</span>
        <div class="hero__stack">
          <i v-for="index in 7" :key="index"></i>
        </div>
        <div class="hero__measure">
          <b>10,000</b>
          <span>SOURCE ROWS</span>
        </div>
      </div>
    </header>

    <!-- 搜索、状态和虚拟列表组成主操作台。 -->
    <section class="console" aria-labelledby="console-title" :aria-busy="isFiltering">
      <div class="console__header">
        <div>
          <span class="console__kicker">QUERY TERMINAL</span>
          <h2 id="console-title">档案检索</h2>
        </div>
        <p>尝试搜索：星港、稳定、10000</p>
      </div>

      <SearchInput v-model="searchModel" :is-filtering="isFiltering" />

      <ListStatus
        :total-count="allItems.length"
        :filtered-count="filteredItems.length"
        :has-query="hasQuery"
        :is-filtering="isFiltering"
      />

      <!-- 结果存在时挂载虚拟列表；无结果时切换为专用提示。 -->
      <VirtualList
        v-if="filteredItems.length > 0"
        :items="filteredItems"
        :reset-key="effectiveQuery"
        :item-height="84"
        :overscan="4"
      />

      <div v-else class="empty-state" role="status">
        <span class="empty-state__code">NO_MATCH</span>
        <div>
          <h2>索引中没有对应记录</h2>
          <p>换一个更短的关键词，或清空搜索后重新浏览全部档案。</p>
        </div>
      </div>

      <footer class="console__footer">
        <span>FIXED ROW 84PX</span>
        <span>OVERSCAN 04</span>
        <span>DEBOUNCE 300MS</span>
        <span class="console__footer-status">LOCAL / READY</span>
      </footer>
    </section>
  </main>
</template>

<style scoped>
/* 页面画布与环境背景。 */
.observatory {
  position: relative;
  isolation: isolate;
  width: min(1180px, calc(100% - 48px));
  min-height: 100vh;
  margin: 0 auto;
  padding: 70px 0 56px;
}

.observatory__grid {
  position: fixed;
  z-index: -2;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(to bottom, black, transparent 88%);
  pointer-events: none;
}

.observatory__glow {
  position: fixed;
  z-index: -1;
  top: -24vw;
  right: -16vw;
  width: 60vw;
  height: 60vw;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(213, 150, 61, 0.11), transparent 66%);
  pointer-events: none;
}

/* 顶部介绍区：左侧标题，右侧用图示表达虚拟渲染窗口。 */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  align-items: end;
  gap: 72px;
  margin-bottom: 54px;
}

.hero__copy {
  animation: reveal-up 680ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 13px;
  margin: 0 0 22px;
  color: var(--paper-500);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero__eyebrow span {
  padding: 5px 8px;
  border: 1px solid rgba(244, 185, 95, 0.48);
  color: var(--amber-300);
  background: rgba(244, 185, 95, 0.06);
}

.hero h1 {
  margin: 0;
  color: var(--paper-100);
  font-family: var(--font-display);
  font-size: clamp(48px, 6.2vw, 88px);
  font-stretch: condensed;
  font-weight: 520;
  letter-spacing: -0.055em;
  line-height: 0.97;
}

.hero h1 em {
  color: var(--amber-400);
  font-style: normal;
}

.hero__description {
  max-width: 620px;
  margin: 26px 0 0;
  color: var(--paper-500);
  font-size: 14px;
  letter-spacing: 0.035em;
  line-height: 1.85;
}

.hero__diagram {
  position: relative;
  height: 190px;
  padding: 22px;
  border-top: 1px solid var(--ink-600);
  border-bottom: 1px solid var(--ink-600);
  animation: reveal-up 680ms 100ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero__diagram::before,
.hero__diagram::after {
  position: absolute;
  width: 7px;
  height: 7px;
  border-color: var(--amber-500);
  content: '';
}

.hero__diagram::before {
  top: -1px;
  left: 0;
  border-top: 1px solid;
  border-left: 1px solid;
}

.hero__diagram::after {
  right: 0;
  bottom: -1px;
  border-right: 1px solid;
  border-bottom: 1px solid;
}

.hero__diagram-label {
  color: var(--paper-500);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.16em;
}

.hero__stack {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 116px;
  margin-top: 17px;
}

.hero__stack i {
  display: block;
  height: 3px;
  background: var(--ink-600);
}

.hero__stack i:nth-child(3),
.hero__stack i:nth-child(4),
.hero__stack i:nth-child(5) {
  background: var(--amber-400);
  box-shadow: 0 0 13px rgba(244, 185, 95, 0.28);
}

.hero__measure {
  position: absolute;
  right: 22px;
  bottom: 25px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.hero__measure b {
  color: var(--paper-100);
  font-family: var(--font-display);
  font-size: 34px;
  font-weight: 500;
  letter-spacing: -0.04em;
}

.hero__measure span {
  color: var(--paper-500);
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 0.15em;
}

/* 搜索控制台主体。 */
.console {
  position: relative;
  padding: 28px;
  border: 1px solid var(--ink-600);
  background: rgba(12, 13, 13, 0.88);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
  animation: reveal-up 700ms 160ms cubic-bezier(0.22, 1, 0.36, 1) both;
  backdrop-filter: blur(18px);
}

.console::before {
  position: absolute;
  inset: -1px -1px auto;
  height: 2px;
  background: linear-gradient(90deg, var(--amber-400) 0 90px, transparent 90px);
  content: '';
}

.console__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
}

.console__header div {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.console__kicker {
  color: var(--amber-400);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.14em;
}

.console__header h2 {
  margin: 0;
  color: var(--paper-100);
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 520;
  letter-spacing: -0.02em;
}

.console__header p {
  margin: 0 0 2px;
  color: var(--paper-500);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
}

.empty-state {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  align-items: center;
  gap: 28px;
  min-height: 300px;
  padding: 42px;
  border: 1px solid var(--ink-600);
  background:
    linear-gradient(135deg, rgba(239, 154, 132, 0.035), transparent 42%),
    var(--ink-900);
}

.empty-state__code {
  padding: 10px;
  border: 1px solid rgba(239, 154, 132, 0.38);
  color: var(--danger-400);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-align: center;
}

.empty-state h2 {
  margin: 0 0 10px;
  color: var(--paper-100);
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 520;
}

.empty-state p {
  margin: 0;
  color: var(--paper-500);
  font-size: 13px;
  line-height: 1.7;
}

.console__footer {
  display: flex;
  gap: 20px;
  padding-top: 18px;
  color: var(--paper-500);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.09em;
}

.console__footer span:not(:first-child)::before {
  margin-right: 20px;
  color: var(--ink-600);
  content: '/';
}

.console__footer-status {
  margin-left: auto;
  color: var(--green-400);
}

/* 页面首次进入时的统一揭示动效。 */
@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 平板及手机断点。 */
@media (max-width: 820px) {
  .observatory {
    width: min(100% - 32px, 720px);
    padding-top: 42px;
  }

  .hero {
    grid-template-columns: 1fr;
    gap: 32px;
    margin-bottom: 38px;
  }

  .hero__diagram {
    display: none;
  }
}

@media (max-width: 640px) {
  .observatory {
    width: min(100% - 20px, 560px);
    padding: 28px 0 24px;
  }

  .hero {
    margin-bottom: 28px;
  }

  .hero h1 {
    font-size: clamp(40px, 13vw, 60px);
  }

  .hero__description {
    margin-top: 20px;
    font-size: 13px;
  }

  .console {
    padding: 16px;
  }

  .console__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .console__header p {
    line-height: 1.6;
  }

  .empty-state {
    grid-template-columns: 1fr;
    gap: 20px;
    min-height: 280px;
    padding: 28px;
  }

  .empty-state__code {
    width: max-content;
  }

  .console__footer {
    flex-wrap: wrap;
    gap: 8px 14px;
  }

  .console__footer span:not(:first-child)::before {
    margin-right: 14px;
  }

  .console__footer-status {
    width: 100%;
    margin: 5px 0 0;
  }

  .console__footer-status::before {
    display: none;
  }
}
</style>
