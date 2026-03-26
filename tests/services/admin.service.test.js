import { describe, it, expect, vi } from 'vitest';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryClothesCount,
} from '../../src/services/admin.service.js';

function createMockSupabase({ data = null, error = null, count = null } = {}) {
  const chain = {
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockImplementation(function () {
      // delete + eq → resolves { error }
      // select + eq → resolves { count, error }
      return this;
    }),
    single: vi.fn().mockResolvedValue({ data, error }),
  };
  // For getCategoryClothesCount: select returns { count, error }
  // We need eq to resolve with count for the count query
  const countChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ count, error }),
  };
  const fromFn = vi.fn().mockImplementation((table) => {
    if (table === 'user_clothes') return countChain;
    return chain;
  });
  return { from: fromFn, _chain: chain, _countChain: countChain };
}

// --- createCategory ---

describe('createCategory', () => {
  it('TC-F7-001: 전체 필드 → insert 호출', async () => {
    const supabase = createMockSupabase({ data: { id: 'new-1' } });
    const params = {
      name: '패딩',
      type: '아우터',
      icon: '🧥',
      tempMin: -5,
      tempMax: 10,
      sortOrder: 1,
    };

    const { data } = await createCategory(supabase, params);
    expect(supabase._chain.insert).toHaveBeenCalledWith({
      name: '패딩',
      type: '아우터',
      icon: '🧥',
      temp_min: -5,
      temp_max: 10,
      sort_order: 1,
    });
    expect(data).toEqual({ id: 'new-1' });
  });

  it('TC-F7-002: 옵션 필드 누락 → 기본값', async () => {
    const supabase = createMockSupabase({ data: { id: 'new-2' } });
    await createCategory(supabase, { name: '테스트', type: '상의' });

    expect(supabase._chain.insert).toHaveBeenCalledWith({
      name: '테스트',
      type: '상의',
      icon: '',
      temp_min: null,
      temp_max: null,
      sort_order: 0,
    });
  });

  it('TC-F7-003: tempMin=0, tempMax=0 → null이 아닌 0', async () => {
    const supabase = createMockSupabase({ data: {} });
    await createCategory(supabase, {
      name: '테스트',
      type: '상의',
      tempMin: 0,
      tempMax: 0,
      sortOrder: 0,
    });

    expect(supabase._chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ temp_min: 0, temp_max: 0, sort_order: 0 }),
    );
  });

  it('에러 발생 → error 반환', async () => {
    const supabase = createMockSupabase({ error: { message: 'RLS denied' } });
    const { error } = await createCategory(supabase, { name: 'x', type: 'y' });
    expect(error.message).toBe('RLS denied');
  });
});

// --- updateCategory ---

describe('updateCategory', () => {
  it('TC-F7-004: 단일 필드 업데이트', async () => {
    const supabase = createMockSupabase({ data: { id: 'cat-1', name: '새이름' } });
    await updateCategory(supabase, 'cat-1', { name: '새이름' });

    expect(supabase._chain.update).toHaveBeenCalledWith({ name: '새이름' });
    expect(supabase._chain.eq).toHaveBeenCalledWith('id', 'cat-1');
  });

  it('TC-F7-005: 복수 필드 업데이트', async () => {
    const supabase = createMockSupabase({ data: {} });
    await updateCategory(supabase, 'cat-1', { name: '새이름', icon: '🧶' });

    expect(supabase._chain.update).toHaveBeenCalledWith({ name: '새이름', icon: '🧶' });
  });

  it('TC-F7-006: undefined 필드 → payload 제외', async () => {
    const supabase = createMockSupabase({ data: {} });
    await updateCategory(supabase, 'cat-1', { name: '이름', tempMin: undefined });

    expect(supabase._chain.update).toHaveBeenCalledWith({ name: '이름' });
  });

  it('TC-F7-007: 빈 updates → 빈 payload', async () => {
    const supabase = createMockSupabase({ data: {} });
    await updateCategory(supabase, 'cat-1', {});

    expect(supabase._chain.update).toHaveBeenCalledWith({});
  });

  it('tempMin/tempMax → temp_min/temp_max 매핑', async () => {
    const supabase = createMockSupabase({ data: {} });
    await updateCategory(supabase, 'cat-1', { tempMin: -10, tempMax: 5 });

    expect(supabase._chain.update).toHaveBeenCalledWith({ temp_min: -10, temp_max: 5 });
  });

  it('sortOrder → sort_order 매핑', async () => {
    const supabase = createMockSupabase({ data: {} });
    await updateCategory(supabase, 'cat-1', { sortOrder: 3 });

    expect(supabase._chain.update).toHaveBeenCalledWith({ sort_order: 3 });
  });
});

// --- deleteCategory ---

describe('deleteCategory', () => {
  it('TC-F7-008: 정상 삭제', async () => {
    const supabase = createMockSupabase();
    // delete chain needs eq to resolve with { error: null }
    supabase._chain.eq.mockResolvedValue({ error: null });
    const { error } = await deleteCategory(supabase, 'cat-1');

    expect(supabase.from).toHaveBeenCalledWith('clothing_categories');
    expect(supabase._chain.delete).toHaveBeenCalled();
    expect(supabase._chain.eq).toHaveBeenCalledWith('id', 'cat-1');
    expect(error).toBeNull();
  });

  it('TC-F7-009: 에러 시 error 반환', async () => {
    const supabase = createMockSupabase();
    supabase._chain.eq.mockResolvedValue({ error: { message: 'FK constraint' } });
    const { error } = await deleteCategory(supabase, 'cat-1');
    expect(error.message).toBe('FK constraint');
  });
});

// --- getCategoryClothesCount ---

describe('getCategoryClothesCount', () => {
  it('TC-F7-010: 옷 3개 → 3 반환', async () => {
    const supabase = createMockSupabase({ count: 3 });
    const result = await getCategoryClothesCount(supabase, 'cat-1');
    expect(result).toBe(3);
    expect(supabase.from).toHaveBeenCalledWith('user_clothes');
  });

  it('TC-F7-011: 옷 0개 → 0 반환', async () => {
    const supabase = createMockSupabase({ count: 0 });
    expect(await getCategoryClothesCount(supabase, 'cat-1')).toBe(0);
  });

  it('TC-F7-012: 쿼리 에러 → 0 반환', async () => {
    const supabase = createMockSupabase({ error: { message: 'err' } });
    supabase._countChain.eq.mockResolvedValue({ count: null, error: { message: 'err' } });
    expect(await getCategoryClothesCount(supabase, 'cat-1')).toBe(0);
  });

  it('TC-F7-013: count null → 0 반환', async () => {
    const supabase = createMockSupabase({ count: null });
    supabase._countChain.eq.mockResolvedValue({ count: null, error: null });
    expect(await getCategoryClothesCount(supabase, 'cat-1')).toBe(0);
  });
});
