/** 带有取消能力的防抖函数，参数类型与原回调保持一致。 */
export interface DebouncedFunction<TArgs extends unknown[]> {
  (...args: TArgs): void
  cancel: () => void
}

/**
 * 创建一个尾随执行的防抖函数。
 * 每次调用都会重新计时，只有持续 delay 毫秒没有新调用时才执行回调。
 */
export function debounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number,
): DebouncedFunction<TArgs> {
  let timerId: ReturnType<typeof setTimeout> | undefined
  const wait = Math.max(0, delay)

  const debounced = (...args: TArgs) => {
    // 新输入到来时清除旧任务，保证最终只执行最后一次调用。
    if (timerId !== undefined) clearTimeout(timerId)

    timerId = setTimeout(() => {
      timerId = undefined
      callback(...args)
    }, wait)
  }

  // 组件卸载时可主动取消任务，避免回调在销毁后继续修改状态。
  debounced.cancel = () => {
    if (timerId === undefined) return

    clearTimeout(timerId)
    timerId = undefined
  }

  return debounced
}
