const MOCK_MEMBERS = [
  { id: 1, username: 'admin', email: 'admin@example.com', is_you: true, role: 'Admin' },
  { id: 2, username: 'user1', email: 'user1@example.com', is_you: false, role: 'Member' },
];

const MOCK_USERS = [
  { id: 1, username: 'admin', email: 'admin@example.com' },
  { id: 2, username: 'user1', email: 'user1@example.com' },
  { id: 3, username: 'user2', email: 'user2@example.com' },
  { id: 4, username: 'demo123', email: 'demo123@example.com' },
];

export const mockFetchBoardMembers = async (boardId) => {
  return { data: MOCK_MEMBERS };
};

export const mockFetchUsers = async () => {
  return { data: MOCK_USERS };
};

export const mockAddMemberToBoard = async (boardId, userId) => {
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user) throw new Error('User not found');
  if (!MOCK_MEMBERS.some((m) => m.id === userId)) {
    MOCK_MEMBERS.push({ ...user, is_you: false, role: 'Member' });
  }
  return { data: { message: 'User added' } };
};
