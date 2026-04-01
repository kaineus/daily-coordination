import { describe, it, expect, vi } from 'vitest';
import { getCategories, getUserClothes, addClothing, deleteClothing } from '../../src/services/closet.service.js';

function createMockSupabase({ session = null, selectData = [], insertData = null, error = null } = {}) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: selectData, error }),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: insertData, error }),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error }),
  };
  return {
    from: vi.fn().mockReturnValue(chain),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session } }),
    },
    _chain: chain,
  };
}

describe('getCategories', () => {
  it('clothing_categories에서 sort_order로 정렬 조회', async () => {
    const mockData = [{ id: '1', name: '패딩' }];
    const supabase = createMockSupabase({ selectData: mockData });

    const { data } = await getCategories(supabase);
    expect(supabase.from).toHaveBeenCalledWith('clothing_categories');
    expect(data).toEqual(mockData);
  });
});

describe('getUserClothes', () => {
  it('user_clothes 조회 + created_at 내림차순', async () => {
    const session = { user: { id: 'user-1' } };
    const supabase = createMockSupabase({ session, selectData: [] });
    await getUserClothes(supabase);
    expect(supabase.from).toHaveBeenCalledWith('user_clothes');
  });

  it('세션 없으면 인증 필요 에러 반환', async () => {
    const supabase = createMockSupabase({ session: null });
    const { data, error } = await getUserClothes(supabase);
    expect(data).toBeNull();
    expect(error.message).toBe('인증 필요');
  });
});

describe('addClothing', () => {
  it('세션 있을 때 insert 호출', async () => {
    const session = { user: { id: 'user-1' } };
    const supabase = createMockSupabase({ session, insertData: { id: 'new-1' } });

    await addClothing(supabase, {
      categoryId: 'cat-1',
      color: '#333333',
      colorName: '검정',
    });

    expect(supabase._chain.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      category_id: 'cat-1',
      color: '#333333',
      color_name: '검정',
    });
  });

  it('세션 없으면 인증 필요 에러 반환', async () => {
    const supabase = createMockSupabase({ session: null });
    const { data, error } = await addClothing(supabase, {
      categoryId: 'cat-1', color: '#333', colorName: '검정',
    });
    expect(data).toBeNull();
    expect(error.message).toBe('인증 필요');
  });
});

describe('deleteClothing', () => {
  it('해당 id로 delete 호출', async () => {
    const session = { user: { id: 'user-1' } };
    const supabase = createMockSupabase({ session });
    await deleteClothing(supabase, 'item-1');
    expect(supabase.from).toHaveBeenCalledWith('user_clothes');
    expect(supabase._chain.eq).toHaveBeenCalledWith('id', 'item-1');
  });

  it('세션 없으면 인증 필요 에러 반환', async () => {
    const supabase = createMockSupabase({ session: null });
    const { error } = await deleteClothing(supabase, 'item-1');
    expect(error.message).toBe('인증 필요');
  });
});
