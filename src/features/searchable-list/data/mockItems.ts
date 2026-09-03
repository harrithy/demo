import type { SearchableListItem } from '../types'

const regions = ['星港', '深海', '北境', '晨雾', '远岫', '林野', '赤原', '苍穹']
const subjects = ['脉冲信号', '环境样本', '轨迹记录', '能量读数', '观测日志']
const states = ['稳定', '活跃', '待复核', '已归档']

/**
 * 在前端确定性生成模拟数据。
 * 不使用随机数，因此刷新页面后相同 ID 的名称和描述始终一致，便于检索和验收。
 */
export function createMockItems(count = 10_000): readonly SearchableListItem[] {
  const safeCount = Math.max(0, Math.floor(count))

  return Array.from({ length: safeCount }, (_, index) => {
    // 通过取模循环组合不同区域、主题和状态，构造出可搜索的内容。
    const id = index + 1
    const region = regions[index % regions.length]
    const subject = subjects[(index * 3) % subjects.length]
    const state = states[(index * 5) % states.length]
    const serial = String(id).padStart(5, '0')
    const name = `${region}节点 · ${subject} ${serial}`
    const description = `记录 ${serial}：${region}区域的${subject}，当前状态为${state}。用于检索与虚拟滚动性能观测。`

    return {
      id,
      name,
      description,
      // 搜索索引只在数据创建时转换一次，避免每次搜索重复处理名称和描述。
      searchText: `${id} ${name} ${description}`.toLocaleLowerCase('zh-CN'),
    }
  })
}
