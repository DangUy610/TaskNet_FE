import React, { useState } from 'react';
import styled from 'styled-components';

export default function CardItem({
  card,
  index,
  isDragging,
  draggingOver,
  onEditClick,
  onCheckClick,
  onCardClick = () => {},
}) {
  const [hovered, setHovered] = useState(false);
  
  // ✅ Nếu đang kéo → xác định vùng hiện tại bằng draggingOver
  // ❌ Nếu không kéo → giữ nguyên chiều rộng (auto fit theo list/inbox layout)
  // CardItem.jsx
  const forceWidth = isDragging ? '240px' : 'auto'; 

  return (
    <CardWrapper
      className={`drag-preview-${draggingOver || 'none'}`}
      $isDragging={isDragging}
      $forceWidth={forceWidth}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onCardClick(card)}
      role="button"
      aria-label={`Thẻ ${card.name || card.title || 'không tiêu đề'}`}
    >
      {card.labels?.length > 0 && (
        <LabelContainer>
          {card.labels.map((label) => (
            <LabelBar key={label.id} color={label.color} aria-label={`Nhãn ${label.name || 'không tên'}`} />
          ))}
        </LabelContainer>
      )}
      <CardContent>
        <CheckCircle
          $visible={hovered || card.completed}
          $completed={card.completed}
          onClick={(e) => {
            e.stopPropagation();
            onCheckClick(index);
          }}
          aria-label={card.completed ? 'Bỏ hoàn thành thẻ' : 'Đánh dấu thẻ hoàn thành'}
        >
          {card.completed ? (
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m12.326-2.52-1.152-.96L6.75 9.828 4.826 7.52l-1.152.96 2.5 3a.75.75 0 0 0 1.152 0z" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" fill="none" />
            </svg>
          )}
        </CheckCircle>

        <CardText $hovered={hovered} $completed={card.completed}>
          {card.name || card.title || '(Không tiêu đề)'}
        </CardText>

        <EditIcon
          $visible={hovered}
          aria-label="Chỉnh sửa thẻ"
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            onEditClick(e, card, index, rect);
          }}
        >
          <svg viewBox="0 0 16 16" role="presentation">
            <path
              fill="currentColor"
              d="M11.586.854a2 2 0 0 1 2.828 0l.732.732a2 2 0 0 1 0 2.828L10.01 9.551a2 2 0 0 1-.864.51l-3.189.91a.75.75 0 0 1-.927-.927l.91-3.189a2 2 0 0 1 .51-.864zm1.768 1.06a.5.5 0 0 0-.708 0l-.585.586L13.5 3.94l.586-.586a.5.5 0 0 0 0-.707zM12.439 5 11 3.56 7.51 7.052a.5.5 0 0 0-.128.217l-.54 1.89 1.89-.54a.5.5 0 0 0 .217-.127zM3 2.501a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5v-3H15v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h3v1.5z"
            />
          </svg>
        </EditIcon>
      </CardContent>
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  width: ${({ $forceWidth }) => $forceWidth || '100%'}; // Default to 100% for flexibility
  background: #fff;
  padding: 8px 12px 4px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: ${({ $isDragging }) =>
    $isDragging ? '2px solid #0c66e4' : '1px solid transparent'};
  box-shadow: ${({ $isDragging }) =>
    $isDragging ? '0 4px 12px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)'};
  cursor: pointer;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.8 : 1)};
  transform: ${({ $isDragging }) => ($isDragging ? 'scale(1.02)' : 'none')}; // Slight scale for visual feedback
  transition: box-shadow 0.2s ease, transform 0.2s ease; // Remove width from transition

  &:hover {
    border: 2px solid #0c66e4;
  }
`;

const LabelContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
`;

const LabelBar = styled.div`
  height: 8px;
  width: 40px;
  background-color: ${({ color }) => color};
  border-radius: 4px;
`;

const CardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
`;

const CheckCircle = styled.button`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: none;
  color: ${({ $completed }) => ($completed ? '#22A06B' : '#626F86')};
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
    border-radius: 50%;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CardText = styled.div`
  flex: 1;
  font-size: 14px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #172b4d;

  transform: ${({ $hovered, $completed }) =>
    !$completed && $hovered ? 'translateX(4px)' : 'translateX(0)'};
  transition: transform 0.3s ease, padding-left 0.2s ease;
  ${({ $completed }) => $completed && 'text-decoration: line-through; opacity: 0.6;'}
  will-change: transform;
`;

const EditIcon = styled.button`
  width: 28px;
  height: 28px;
  padding: 0;
  background: #f4f5f7;
  border-radius: 50%;
  border: none;
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  color: #172b4d;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`;