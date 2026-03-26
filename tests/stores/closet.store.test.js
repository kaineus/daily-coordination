import { describe, it, expect, beforeEach } from 'vitest';
import { closetStore } from '../../src/store/closet.store.js';

const mockItem = { id: 'item-1', color: '#333333', color_name: '검정', category: { name: '패딩', type: '아우터' } };
const mockItem2 = { id: 'item-2', color: '#1E3A8A', color_name: '네이비', category: { name: '슬랙스', type: '하의' } };
const mockCategories = [
  { id: 'cat-1', name: '패딩', type: '아우터' },
  { id: 'cat-2', name: '슬랙스', type: '하의' },
];

describe('closetStore', () => {
  beforeEach(() => {
    closetStore.setState({ categories: [], clothes: [], loading: false, error: null, groupBy: 'category' });
  });

  it('setCategories', () => {
    closetStore.actions.setCategories(mockCategories);
    expect(closetStore.getState().categories).toEqual(mockCategories);
  });

  it('setClothes', () => {
    closetStore.actions.setClothes([mockItem]);
    expect(closetStore.getState().clothes).toHaveLength(1);
  });

  it('addItem → clothes 앞에 추가', () => {
    closetStore.actions.setClothes([mockItem]);
    closetStore.actions.addItem(mockItem2);
    const { clothes } = closetStore.getState();
    expect(clothes).toHaveLength(2);
    expect(clothes[0].id).toBe('item-2'); // 앞에 추가
  });

  it('removeItem → 해당 id 제거', () => {
    closetStore.actions.setClothes([mockItem, mockItem2]);
    closetStore.actions.removeItem('item-1');
    const { clothes } = closetStore.getState();
    expect(clothes).toHaveLength(1);
    expect(clothes[0].id).toBe('item-2');
  });

  it('removeItem — 존재하지 않는 id → 변화 없음', () => {
    closetStore.actions.setClothes([mockItem]);
    closetStore.actions.removeItem('nonexistent');
    expect(closetStore.getState().clothes).toHaveLength(1);
  });

  it('setGroupBy', () => {
    closetStore.actions.setGroupBy('color');
    expect(closetStore.getState().groupBy).toBe('color');
  });

  it('setLoading / setError', () => {
    closetStore.actions.setLoading(true);
    expect(closetStore.getState().loading).toBe(true);
    closetStore.actions.setError('에러');
    expect(closetStore.getState().error).toBe('에러');
  });
});
