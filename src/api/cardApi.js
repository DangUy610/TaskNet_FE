// src/api/cardApi.js
import api from './apiClient';
import { cards, lists as listRoutes } from './apiRoutes';
 
/**
 * Lấy danh sách card thuộc về MỘT CỘT (List) cụ thể.
 * @param {string | number} listId ID của cột cần lấy card.
 * @returns {Promise}
 */
export const fetchCardsByList = (listId) => 
  api.get(listRoutes.cards(listId));

/**
 * Lấy danh sách card trong INBOX của người dùng hiện tại (card không có list).
 * @returns {Promise}
 */
export const fetchInboxCards = () => 
  api.get(cards.inbox());

/**
 * Tạo một card mới BÊN TRONG một cột (list) cụ thể.
 * @param {string | number} listId ID của cột.
 * @param {object} data Dữ liệu của card (ví dụ: { name: 'New Task' }).
 * @returns {Promise}
 */
export const createCardInList = (listId, data) => 
  api.post(listRoutes.cards(listId), data);

/**
 * Tạo một card mới vào INBOX (không thuộc cột nào).
 * @param {object} data Dữ liệu của card (ví dụ: { name: 'Inbox Task' }).
 * @returns {Promise}
 */
export const createInboxCard = (cardData) => {
  // Đảm bảo cardData là một object và được truyền vào
  console.log('API call: createInboxCard with data:', cardData); 
  return api.post(cards.inbox(), cardData);
};

/**
 * Cập nhật thông tin chi tiết cho một card.
 * @param {string | number} cardId ID của card cần cập nhật.
 * @param {object} data Dữ liệu cần cập nhật (ví dụ: { description: '...' }).
 * @returns {Promise}
 */
export const updateCard = (cardId, data) =>
  api.patch(cards.detail(cardId), data);

/**
 * Cập nhật hàng loạt thông tin của nhiều card.
 * Dùng cho tính năng kéo-thả để cập nhật `position` và `list`.
 * @param {Array<object>} updateData Mảng các object cần cập nhật. 
 *   Ví dụ: [{ id: 1, position: 0, list: 2 }, { id: 2, position: 1, list: 2 }]
 * @returns {Promise}
 */
export const batchUpdateCards = (updateData) =>
  api.patch(cards.batchUpdate(), updateData);

/**
 * Xóa một card.
 * @param {string | number} cardId ID của card cần xóa.
 * @returns {Promise}
 */
export const deleteCard = (cardId) =>
  api.delete(cards.detail(cardId));



// ----- Comments -----
export async function getCardComments(cardId) {
  // api.get sẽ tự động thêm baseURL, nên chỉ cần đường dẫn tương đối
  const { data } = await api.get(`/cards/${cardId}/comments/`);
  return data;
}

export async function createComment(cardId, content) {
  const { data } = await api.post(`/cards/${cardId}/comments/`, { content });
  return data;
}

export async function updateComment(commentId, content) {
  const { data } = await api.patch(`/comments/${commentId}/`, { content });
  return data;
}

export async function deleteComment(commentId) {
  await api.delete(`/comments/${commentId}/`);
}

// ----- Card description -----
export async function updateCardDescription(cardId, description) {
  // Hàm này thực chất giống hệt updateCard, bạn có thể gộp lại,
  // nhưng để riêng cũng không sao.
  const { data } = await api.patch(`/cards/${cardId}/`, { description });
  return data;
}