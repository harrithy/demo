/** 列表中每条模拟档案的统一数据结构。 */
export interface ListItem {
  id: number
  name: string
  description: string
}

/** 在展示字段之外，额外保存预先标准化的搜索索引。 */
export interface SearchableListItem extends ListItem {
  searchText: string
}
