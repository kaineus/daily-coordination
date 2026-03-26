import { TYPE_ORDER, TYPE_ICONS, TYPE_EMOJI } from '../constants/clothing.js';

export function groupByCategory(clothes, filterType = '전체') {
  const filtered = filterType === '전체'
    ? clothes
    : clothes.filter((c) => c.category?.type === filterType);

  const groups = {};
  for (const item of filtered) {
    const type = item.category?.type ?? '기타';
    if (!groups[type]) groups[type] = [];
    groups[type].push(item);
  }

  return TYPE_ORDER
    .filter((t) => groups[t]?.length > 0)
    .map((t) => ({
      type: t,
      icon: TYPE_ICONS[t],
      emoji: TYPE_EMOJI[t],
      items: groups[t],
      subGroups: groupItemsByName(groups[t]),
    }));
}

function groupItemsByName(items) {
  const map = {};
  for (const item of items) {
    const name = item.category?.name ?? '기타';
    if (!map[name]) map[name] = [];
    map[name].push(item);
  }
  return Object.entries(map).map(([name, list]) => ({ name, items: list }));
}

export function groupByColor(clothes) {
  const groups = {};
  for (const item of clothes) {
    const key = item.color_name ?? '기타';
    if (!groups[key]) groups[key] = { color: item.color, items: [] };
    groups[key].items.push(item);
  }

  return Object.entries(groups).map(([name, g]) => ({
    type: name,
    icon: '',
    emoji: '',
    colorHex: g.color,
    items: g.items,
  }));
}
