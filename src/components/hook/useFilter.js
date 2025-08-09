import { useState, useCallback, useRef  } from 'react';

const DEFAULT_STATE = {
  keyword: '',
  members: [],
  labels: [],
  status: 'all',
  due: 'all',
  
};

export function useFilter(initialState = {}) {
    const initialRef = useRef({ ...DEFAULT_STATE, ...initialState });
  
    const mergedState = { ...DEFAULT_STATE, ...initialState };
    const [filter, setFilter] = useState(mergedState);

  // ✅ Update keyword (search box)
  const updateKeyword = useCallback((keyword) => {
    setFilter(prev => ({ ...prev, keyword }));
  }, []);

  // ✅ Toggle array fields (members, labels, ...)
  const toggleArrayItem = useCallback((key, itemId) => {
    setFilter(prev => {
      const current = prev[key] || [];
      const newItems = current.includes(itemId)
        ? current.filter(id => id !== itemId)
        : [...current, itemId];
      return { ...prev, [key]: newItems };
    });
  }, []);

  // ✅ Handle radio-style select (status, due, etc.)
  const handleSingleSelectChange = useCallback((key, value) => {
    setFilter(prev => ({
      ...prev,
      [key]: prev[key] === value ? 'all' : value,
    }));
  }, []);

  // ✅ Reset to default
  const resetFilter = useCallback(() => {
    setFilter(initialRef.current);
  }, []);

  return {
    filter,
    setFilter, // optional if needed externally
    updateKeyword,
    toggleArrayItem,
    handleSingleSelectChange,
    resetFilter,
  };
}
