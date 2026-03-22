export function normalizeOutfitItems(recommendation) {
  if (!recommendation) return [];

  return [...(recommendation.items ?? []), ...(recommendation.accessories ?? [])].map((item) => ({
    category: item.type,
    name: item.category,
    colorHex: item.color,
    colorName: item.colorName,
    reason: item.reason,
  }));
}
