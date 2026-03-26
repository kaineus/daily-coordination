export async function createCategory(supabase, { name, type, icon, tempMin, tempMax, sortOrder }) {
  const { data, error } = await supabase
    .from('clothing_categories')
    .insert({
      name,
      type,
      icon: icon || '',
      temp_min: tempMin ?? null,
      temp_max: tempMax ?? null,
      sort_order: sortOrder ?? 0,
    })
    .select()
    .single();
  return { data, error };
}

export async function updateCategory(supabase, id, updates) {
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.icon !== undefined) payload.icon = updates.icon;
  if (updates.tempMin !== undefined) payload.temp_min = updates.tempMin;
  if (updates.tempMax !== undefined) payload.temp_max = updates.tempMax;
  if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

  const { data, error } = await supabase
    .from('clothing_categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteCategory(supabase, id) {
  const { error } = await supabase
    .from('clothing_categories')
    .delete()
    .eq('id', id);
  return { error };
}

export async function getCategoryClothesCount(supabase, categoryId) {
  const { count, error } = await supabase
    .from('user_clothes')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId);
  if (error) return 0;
  return count ?? 0;
}
