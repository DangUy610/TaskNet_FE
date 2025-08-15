// src/api/boardApi.js
import api from './apiClient';
import { boards } from './apiRoutes';

/**
 * Board Management APIs
 */
export const fetchBoards = () =>
  api.get(boards.list());

export const createBoard = (data) =>
  api.post(boards.list(), data);

export const getBoard = (boardId) =>
  api.get(boards.detail(boardId));

export const updateBoard = (boardId, data) =>
  api.patch(boards.detail(boardId), data);

export const deleteBoard = (boardId) =>
  api.delete(boards.detail(boardId));

export const getClosedBoards = () =>
  api.get(boards.closed());

/**
 * Board Members Management APIs
 */
export const fetchBoardMembers = (boardId) =>
  api.get(boards.members(boardId));

export const addMemberToBoard = (boardId, userId, role = 'member') =>
  api.post(boards.members(boardId), { 
    user_id: userId,
    role: role 
  });

export const updateMemberRole = (boardId, userId, role) => 
  api.patch(boards.members(boardId), { 
    user_id: userId, 
    role 
  });

export const removeMember = (boardId, userId) =>
  api.delete(boards.members(boardId), { 
    data: { user_id: userId } 
  });

/**
 * Board Labels Management APIs  
 */
export const fetchBoardLabels = (boardId) =>
  api.get(boards.labels(boardId));

export const createBoardLabel = (boardId, labelData) =>
  api.post(boards.labels(boardId), labelData);

/**
 * Board Share Link Management APIs
 */
export const createShareLink = (boardId, role = 'member') => 
  api.post(`/boards/${boardId}/share-link/`, { role });

export const getShareLink = (boardId) => 
  api.get(`/boards/${boardId}/share-link/`);

export const deleteShareLink = (boardId) => 
  api.delete(`/boards/${boardId}/share-link/`);

export const joinBoardByToken = (token) => 
  api.post(`/boards/join/${token}/`);

// Deprecated: Use createShareLink instead
export const generateShareLink = (boardId, role = 'member') => 
  createShareLink(boardId, role);

/**
 * Board Activity & Analytics APIs (if needed)
 */
export const getBoardActivity = (boardId, limit = 50) =>
  api.get(`/boards/${boardId}/activity/?limit=${limit}`);

export const getBoardStats = (boardId) =>
  api.get(`/boards/${boardId}/stats/`);