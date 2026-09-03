import { computed, onMounted, onUnmounted, shallowRef, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

/** 虚拟列表所需的最小配置，保持算法与具体业务数据解耦。 */
interface UseVirtualListOptions<T> {
  items: MaybeRefOrGetter<readonly T[]>
  itemHeight: number
  overscan: number
  getScrollElement: () => HTMLElement | null
}

export interface VirtualRow<T> {
  item: T
  index: number
}

/**
 * 根据滚动位置计算当前应渲染的数据窗口。
 * 页面仍保留完整滚动高度，但 DOM 中只创建可视行与上下缓冲行。
 */
export function useVirtualList<T>(options: UseVirtualListOptions<T>) {
  // 这里只跟踪计算窗口所需的两个原始值，其他结果均由 computed 派生。
  const scrollTop = shallowRef(0)
  const viewportHeight = shallowRef(0)
  let resizeObserver: ResizeObserver | undefined
  let animationFrameId: number | undefined
  let nextScrollTop = 0

  const itemCount = computed(() => toValue(options.items).length)
  // 占位层总高度让浏览器滚动条表现得像完整列表已经渲染。
  const totalHeight = computed(() => itemCount.value * options.itemHeight)
  const visibleCount = computed(() => {
    return Math.max(1, Math.ceil(viewportHeight.value / options.itemHeight))
  })

  const startIndex = computed(() => {
    if (itemCount.value === 0) return 0

    const rawStart = Math.max(
      0,
      Math.floor(scrollTop.value / options.itemHeight) - options.overscan,
    )
    // overscan 会在可视区上下多渲染几行，快速滚动时不容易看到空白。
    const windowSize = visibleCount.value + options.overscan * 2
    // 接近列表末尾时限制起点，确保最后一个窗口仍能铺满视口。
    const maximumStart = Math.max(0, itemCount.value - windowSize)

    return Math.min(rawStart, maximumStart)
  })

  const endIndex = computed(() => {
    return Math.min(
      itemCount.value,
      startIndex.value + visibleCount.value + options.overscan * 2,
    )
  })

  const offsetY = computed(() => startIndex.value * options.itemHeight)
  // 将局部数组索引还原为完整列表索引，供定位和无障碍属性使用。
  const visibleRows = computed<readonly VirtualRow<T>[]>(() => {
    return toValue(options.items)
      .slice(startIndex.value, endIndex.value)
      .map((item, localIndex) => ({
        item,
        index: startIndex.value + localIndex,
      }))
  })

  function measureViewport() {
    const element = options.getScrollElement()
    if (!element) return

    viewportHeight.value = element.clientHeight
    scrollTop.value = element.scrollTop
  }

  function onScroll(event: Event) {
    nextScrollTop = (event.currentTarget as HTMLElement).scrollTop
    if (animationFrameId !== undefined) return

    // 每一帧最多更新一次响应式滚动位置，避免滚动事件过于频繁地触发渲染。
    animationFrameId = window.requestAnimationFrame(() => {
      scrollTop.value = nextScrollTop
      animationFrameId = undefined
    })
  }

  // 搜索结果变化后回到顶部，同时取消可能还在等待执行的滚动帧。
  function resetScroll() {
    const element = options.getScrollElement()
    nextScrollTop = 0
    scrollTop.value = 0

    if (animationFrameId !== undefined) {
      window.cancelAnimationFrame(animationFrameId)
      animationFrameId = undefined
    }

    if (element) element.scrollTop = 0
  }

  onMounted(() => {
    const element = options.getScrollElement()
    measureViewport()

    // 列表高度可能随窗口断点变化，ResizeObserver 负责同步可视行数。
    if (element && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measureViewport)
      resizeObserver.observe(element)
    }

    window.addEventListener('resize', measureViewport)
  })

  onUnmounted(() => {
    // 清理所有原生监听和异步任务，避免组件卸载后的资源泄漏。
    resizeObserver?.disconnect()
    window.removeEventListener('resize', measureViewport)

    if (animationFrameId !== undefined) {
      window.cancelAnimationFrame(animationFrameId)
    }
  })

  return {
    totalHeight,
    startIndex,
    endIndex,
    offsetY,
    visibleRows,
    onScroll,
    resetScroll,
  }
}
