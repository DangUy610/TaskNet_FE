// src/hooks/useSimpleFilter.js

import { useState, useCallback, useRef } from 'react';

const DEFAULT_STATE = {
  keyword: '',
  created: 'all',
  status: 'all',
  due: 'all',
};

export function useSimpleFilter(initialState = {}) {
  const initialRef = useRef({ ...DEFAULT_STATE, ...initialState });
  const [filter, setFilter] = useState(initialRef.current);

  // 🔍 Cập nhật keyword search
  const updateKeyword = useCallback((keyword) => {
    setFilter(prev => ({ ...prev, keyword }));
  }, []);

  // ✅ Chọn 1 trong các trường (radio-like toggle)
  const handleSingleSelectChange = useCallback((key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: prev[key] === value ? 'all' : value,
    }));
  }, []);

  // 🔁 Reset về mặc định
  const resetFilter = useCallback(() => {
    setFilter(initialRef.current);
  }, []);

  // 🔍 Kiểm tra xem có đang lọc không (để hiện badge/toggle)
  const isActive = useCallback(() => {
    return Object.entries(initialRef.current).some(([key, def]) => filter[key] !== def);
  }, [filter]);

  return {
    filter,
    updateKeyword,
    handleSingleSelectChange,
    resetFilter,
    isActive,
  };
}
