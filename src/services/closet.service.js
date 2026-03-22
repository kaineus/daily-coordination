const CLOTHES_SELECT = `
  id, color, color_name, nickname, created_at,
  category:clothing_categories (id, name, type, icon, sort_order)
`;

export async function getCategories(supabase) {
  const { data, error } = await supabase
    .from('clothing_categories')
    .select('*')
    .order('sort_order');
  return { data, error };
}

export async function getUserClothes(supabase) {
  const { data, error } = await supabase
    .from('user_clothes')
    .select(CLOTHES_SELECT)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function addClothing(supabase, { categoryId, color, colorName }) {
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase
    .from('user_clothes')
    .insert({
      user_id: session.user.id,
      category_id: categoryId,
      color,
      color_name: colorName,
    })
    .select(CLOTHES_SELECT)
    .single();
  return { data, error };
}

export async function deleteClothing(supabase, id) {
  const { error } = await supabase
    .from('user_clothes')
    .delete()
    .eq('id', id);
  return { error };
}
