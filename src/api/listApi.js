// src/api/listApi.js
import api from './apiClient';
import { boards, lists } from './apiRoutes';

export const fetchLists = (boardId) => api.get(boards.lists(boardId));

export const createList = (boardId, data) =>
  api.post(boards.lists(boardId), data);

export const updateList = (listId, data) =>
  api.patch(lists.detail(listId), data);

export const deleteList = (listId) =>
  api.delete(lists.detail(listId));