import styled from 'styled-components';

export default function LabelFilterItem({ label, checked, onToggle }) {
  return (
    <LabelWrapper onClick={onToggle} $checked={checked}>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <LabelColor $color={label.color}>{label.name}</LabelColor>
    </LabelWrapper>
  );
}

const LabelWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
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

const LabelColor = styled.div`
  background-color: ${({ $color }) => $color};
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
`;
