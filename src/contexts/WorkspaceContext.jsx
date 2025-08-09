// src/contexts/WorkspaceContext.jsx
import  React, { createContext, useState, useEffect, useContext } from 'react';
import * as workspaceApi from '../api/workspaceApi';
import { AuthContext } from './AuthContext';

export const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const { user } = useContext(AuthContext)

  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);
  const [searchNav, setSearchNav] = useState('');
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  const refreshWorkspaces = async () => {
    setLoadingWorkspaces(true);
    try {
      const res = await workspaceApi.fetchWorkspaces();
      setWorkspaces(res.data || []);
      if (res.data && res.data.length > 0) {
        setCurrentWorkspaceId(res.data[0].id);
        console.log('✅ Auto-set workspaceId =', res.data[0].id);
      } else {
        console.warn('⚠️ No workspaces found');
      }
    } catch (err) {
      console.error('❌ Failed to fetch workspaces:', err);
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    // Chỉ tải workspaces khi `user` đã được xác định (tức là đã đăng nhập thành công)
    if (user) {
      refreshWorkspaces();
    } else {
      // Nếu không có user (logout hoặc chưa login), đảm bảo state được dọn dẹp
      setWorkspaces([]);
      setCurrentWorkspaceId(null);
      setLoadingWorkspaces(false); // Quan trọng: dừng trạng thái loading
    }
  }, [user]); // 5. Lắng nghe sự thay đổi của `user`


  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspaceId,
        setCurrentWorkspaceId,
        searchNav,
        setSearchNav,
        loadingWorkspaces,
        refreshWorkspaces, // 👈 để gọi lại sau khi tạo workspace
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
