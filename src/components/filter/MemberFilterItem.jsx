import styled from 'styled-components';
import { FaUser } from 'react-icons/fa';

export default function MemberFilterItem({ member, checked, onToggle }) {
  return (
    <ItemWrapper onClick={onToggle} $checked={checked}>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      {member.avatarUrl ? (
        <Avatar style={{ backgroundImage: `url(${member.avatarUrl})` }} />
      ) : (
        <IconWrapper><FaUser size={16} /></IconWrapper>
      )}
      <Name>{member.fullName || member.username}</Name>
    </ItemWrapper>
  );
}

const ItemWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  background: ${({ $checked }) => ($checked ? '#e9f2ff' : 'transparent')};

  &:hover {
    background: #f1f2f4;
  }

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #0c66e4;
  }
`;

const IconWrapper = styled.div`
  color: var(--ds-icon-subtle, #44546f);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Avatar = styled.div`
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
`;

const Name = styled.div`
  font-size: 14px;
  color: var(--ds-text-subtle, #172b4d);
`;
