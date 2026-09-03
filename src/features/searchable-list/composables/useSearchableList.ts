import { computed, onUnmounted, readonly, shallowRef, toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";
import { debounce } from "../../../utils/debounce";
import type { SearchableListItem } from "../types";

// 统一处理首尾空格和大小写，避免不同输入形式影响匹配结果。
function normalizeKeyword(value: string) {
  return value.trim().toLocaleLowerCase("zh-CN");
}

export function useSearchableList(
  items: MaybeRefOrGetter<readonly SearchableListItem[]>,
  delay = 300,
) {
  // query 立即同步输入框；effectiveQuery 在防抖完成后才参与筛选。
  const query = shallowRef("");
  const effectiveQuery = shallowRef("");
  const isFiltering = shallowRef(false);

  // 防抖结束后提交真正用于检索的关键词，并关闭等待状态。
  const applyQuery = debounce<[value: string]>(value => {
    effectiveQuery.value = normalizeKeyword(value);
    isFiltering.value = false;
  }, delay);

  // 筛选结果属于派生状态，使用 computed 避免手动维护两份列表。
  const filteredItems = computed(() => {
    const keyword = effectiveQuery.value;
    const source = toValue(items);

    if (!keyword) return source;

    // searchText 已在数据生成时标准化，这里只需完成一次字符串匹配。
    return source.filter(item => item.searchText.includes(keyword));
  });

  function setQuery(value: string) {
    query.value = value;
    const normalizedValue = normalizeKeyword(value)

    // 清空搜索立即恢复完整列表
    if (!normalizedValue) {
      applyQuery.cancel();
      effectiveQuery.value = "";
      isFiltering.value = false;
      return;
    }

    // 规范化后的关键词没有变化时，不需要重新遍历 10,000 条数据。
    if (normalizedValue === effectiveQuery.value) {
      applyQuery.cancel();
      isFiltering.value = false;
      return;
    }

    isFiltering.value = true;
    applyQuery(value);
  }

  // 组件销毁时取消尚未触发的防抖任务。
  onUnmounted(() => applyQuery.cancel());

  return {
    // 对外暴露只读状态，统一通过 setQuery 修改原始输入。
    query: readonly(query),
    effectiveQuery: readonly(effectiveQuery),
    filteredItems,
    isFiltering: readonly(isFiltering),
    setQuery,
  };
}
