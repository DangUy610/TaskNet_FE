
// Component phụ để render thông tin user, giúp code chính sạch hơn
const UserInfo = ({ user }) => {
  // Lấy tên hiển thị từ 'display_name', nếu không có thì trích xuất từ username/email
  const displayName = user?.display_name || user?.username?.split('@')[0] || 'User';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <strong>{displayName}</strong>
      <small style={{ fontSize: '11px', color: '#5e6c84' }}>{user?.email}</small>
    </div>
  );
};

export const getUserMenuConfig = ({ user, logout, openModal }) => {
  // Tính toán các giá trị cần thiết một lần ở đây
  const displayName = user?.display_name || user?.username?.split('@')[0] || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  // URL placeholder mới, an toàn
  const safeAvatar = user?.avatar || `https://placehold.co/32x32/28a745/FFFFFF?text=${userInitial}`;

  return [
    { section: 'ACCOUNT' },
    {
      // Sử dụng component UserInfo để render label
      label: <UserInfo user={user} />,
      // Sử dụng avatar đã được xử lý an toàn
      avatar: safeAvatar,
      disabled: true, // Giữ nguyên vì item này không thể click
    },
    {
      label: 'Switch accounts',
      onClick: () => openModal('switchAccounts', { onSwitch: () => console.log('Account switched') }),
    },
    {
      label: 'Manage account',
      href: '/manage-account',
    },
    { divider: true },
    { section: 'TASKNEST' },
    {
      label: 'Profile and visibility',
      href: '/profile',
    },
    {
      label: 'Activity',
      href: '/activity',
    },
    {
      label: 'Cards',
      href: '/cards',
    },
    {
      label: 'Settings',
      href: '/settings',
    },
    {
      label: 'Theme',
      href: '#theme',
    },
    { divider: true },
    {
      label: 'Create Workspace',
      onClick: () => openModal('createWorkspace', { onCreate: () => console.log('Workspace created') }),
    },
    {
      label: 'Help',
      href: '/help',
    },
    {
      label: 'Shortcuts',
      href: '#shortcuts',
    },
    {
      label: 'Log out',
      onClick: logout,
    },
  ];
};