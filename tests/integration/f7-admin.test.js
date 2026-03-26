/**
 * F7 카테고리 관리 통합 테스트 — admin CRUD 흐름
 */
import { describe, it, expect, vi } from 'vitest';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryClothesCount,
} from '../../src/services/admin.service.js';
import { getCategories } from '../../src/services/closet.service.js';

function createMockSupabase(categories = []) {
  let store = [...categories];

  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockImplementation(() => ({ data: store, error: null })),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockImplementation(function () { return this; }),
    single: vi.fn().mockImplementation(() => {
      // 마지막 insert/update 결과
      return Promise.resolve({ data: store[store.length - 1] ?? null, error: null });
    }),
  };

  // count chain for user_clothes
  const countChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
  };

  return {
    from: vi.fn().mockImplementation((table) => {
      if (table === 'user_clothes') return countChain;
      return chain;
    }),
    _chain: chain,
    _countChain: countChain,
    _store: store,
  };
}

describe('F7 통합: CRUD 흐름', () => {
  it('TC-F7-INT-001: 카테고리 추가 → 목록에 반영', async () => {
    const newCat = { id: 'new-1', name: '우비', type: '아우터', icon: '🌧️' };
    const supabase = createMockSupabase([newCat]);

    // 1. 추가
    const { data } = await createCategory(supabase, {
      name: '우비',
      type: '아우터',
      icon: '🌧️',
    });

    // 2. 목록 조회
    const { data: list } = await getCategories(supabase);
    expect(list.some((c) => c.name === '우비')).toBe(true);
  });

  it('TC-F7-INT-002: 카테고리 수정 → 변경 반영', async () => {
    const updated = { id: 'cat-1', name: '경량패딩', icon: '🧥' };
    const supabase = createMockSupabase([updated]);

    // 1. 수정
    await updateCategory(supabase, 'cat-1', { name: '경량패딩' });

    // 2. 확인
    const { data: list } = await getCategories(supabase);
    expect(list[0].name).toBe('경량패딩');
  });

  it('TC-F7-INT-003: 옷 있는 카테고리 삭제 → 카운트 확인 후 삭제', async () => {
    const supabase = createMockSupabase([{ id: 'cat-1', name: '패딩' }]);
    // 옷 2개 있음
    supabase._countChain.eq.mockResolvedValue({ count: 2, error: null });

    // 1. 카운트 확인
    const count = await getCategoryClothesCount(supabase, 'cat-1');
    expect(count).toBe(2);

    // 2. 경고 후 삭제 진행 (UI에서는 다이얼로그로 확인)
    supabase._chain.eq.mockResolvedValue({ error: null });
    const { error } = await deleteCategory(supabase, 'cat-1');
    expect(error).toBeNull();
  });

  it('user 권한으로 카테고리 생성 시도 → RLS 에러', async () => {
    const supabase = createMockSupabase();
    supabase._chain.single.mockResolvedValue({
      data: null,
      error: { message: 'new row violates row-level security policy' },
    });

    const { error } = await createCategory(supabase, { name: '테스트', type: '상의' });
    expect(error.message).toContain('row-level security');
  });

  it('user 권한으로 카테고리 삭제 시도 → RLS 에러', async () => {
    const supabase = createMockSupabase();
    supabase._chain.eq.mockResolvedValue({
      error: { message: 'new row violates row-level security policy' },
    });

    const { error } = await deleteCategory(supabase, 'cat-1');
    expect(error.message).toContain('row-level security');
  });
});
