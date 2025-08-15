import React from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import CardItem from './Card/CardItem';
import { Dropdown } from 'react-bootstrap';
import { BsThreeDots } from 'react-icons/bs';

function ListColumn({
  list,
  $background, 
  $textColor,
  textColor,
  cardInput,
  setCardInputs,
  activeCardInput,
  setActiveCardInput,
  onAddCard,
  onEditClick,
  onCheckClick,
  onCardClick,
  onListDeleted,
  hideEmptyCards = false,
}) {
  const handleInputChange = (e) => {
    setCardInputs((prev) => ({ ...prev, [list.id]: e.target.value }));
  };

  const handleAddCard = (e) => {
    e.preventDefault(); // ✅ ngăn reload khi submit form
    onAddCard(list.id); // giữ nguyên logic của bạn
  };


  const isInputActive = activeCardInput === list.id;
  const hasCards = Array.isArray(list.cards) && list.cards.length > 0;

  return (
    <Wrapper $background={$background}>
      <Header $textColor={$textColor}>
        <HeaderTitle>{list.name}</HeaderTitle>

        <Dropdown align="end" flip={false}>
          <Dropdown.Toggle as={MenuButton} id={`dropdown-list-${list.id}`}>
            <BsThreeDots />
          </Dropdown.Toggle>
          <Menu
            container={document.body}
            renderOnMount
            popperConfig={{ strategy: 'fixed' }}
          >
            <MenuHeader>
              List actions
              <CloseX onClick={(e)=> {
                // đóng menu khi bấm X
                const btn = document.getElementById(`dropdown-list-${list.id}`);
                btn && btn.click();
              }}>×</CloseX>
            </MenuHeader>

            <MenuItem onClick={() => setActiveCardInput(list.id)}>Add card</MenuItem>
            <MenuItem onClick={() => {/* TODO: copy */}}>Copy list</MenuItem>
            <MenuItem onClick={() => {/* TODO: move */}}>Move list</MenuItem>
            <MenuItem onClick={() => {/* TODO: watch */}}>Watch</MenuItem>

            <Divider />

            <MenuSectionTitle>Change list color</MenuSectionTitle>
            <UpsellCard>
              <strong>Upgrade to change list colors</strong>
              <div>List colors can make your board fun and help organize your board visually.</div>
              <a href="#">Start free trial</a>
            </UpsellCard>

            <Divider />

            <MenuSectionTitle>Automation</MenuSectionTitle>
            <MenuItem onClick={() => {/* TODO */}}>When a card is added to the list…</MenuItem>
            <MenuItem onClick={() => {/* TODO sort modal */}}>Every day, sort list by…</MenuItem>
            <MenuItem onClick={() => {/* TODO */}}>Every Monday, sort list by…</MenuItem>
            <MenuItem onClick={() => {/* TODO rule modal */}}>Create a rule</MenuItem>

            <Divider />

            <MenuItem onClick={() => {/* TODO: archive */}}>Archive this list</MenuItem>
            <MenuItem
              className="text-danger"
              onClick={() => onListDeleted(list.id, list.name, list.cards)}
            >
              Delete this list…
            </MenuItem>
          </Menu>
        </Dropdown>
      </Header>

      {/* ✅ Vùng thả cho các card */}
      <Droppable droppableId={`list-${list.id}`} type="CARD">
        {(provided, snapshot) => (
          <CardList
            ref={provided.innerRef}
            {...provided.droppableProps}
            $isDraggingOver={snapshot.isDraggingOver} // dùng transient prop
          >
            {list.cards?.map((card, index) => {
              const safeId = card?.id ?? `temp-${index}`;
              return (
                <Draggable
                  key={`card-${safeId}`}
                  draggableId={`card-${safeId}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <CardItem
                        draggingOver={snapshot.draggingOver}
                        card={card}
                        index={index}
                        isDragging={snapshot.isDragging}
                        onEditClick={(e) => onEditClick(e, card, index)}
                        onCheckClick={() => onCheckClick(card.id)}
                        onCardClick={onCardClick}
                      />
                    </li>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
            
            {/* ✅ Thêm card mới */}
            {isInputActive ? (
              <li>
                <CardComposerForm onSubmit={handleAddCard}>
                  <StyledTextarea
                    value={cardInput}
                    onChange={handleInputChange}
                    placeholder="Enter a title or paste a link"
                    autoFocus
                  />
                  <CardComposerActions>
                    <AddCardButton type="submit">Add card</AddCardButton>
                    <CancelButton type="button" onClick={() => setActiveCardInput(null)}>✕</CancelButton>
                  </CardComposerActions>
                </CardComposerForm>
              </li>
            ) : (
              <AddCardBtn onClick={() => setActiveCardInput(list.id)}>+ Add a card</AddCardBtn>
            )}
          </CardList>
        )}
      </Droppable>
    </Wrapper>
  );
}

export default React.memo(ListColumn);

// 💅 Styled components
const HeaderTitle = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  padding: 4px 8px;
  flex-grow: 1; /* Cho phép tiêu đề co giãn để chiếm không gian thừa */
  /* Thêm các thuộc tính để xử lý nếu tên cột quá dài */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MenuButton = styled.button`
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: inherit; /* Kế thừa màu từ Header */
  flex-shrink: 0; /* Ngăn nút bị co lại nếu tiêu đề quá dài */
  
  &:hover {
    background: rgba(0,0,0,0.1);
  }

  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: inherit; /* Kế thừa màu từ Header */
  flex-shrink: 0; /* Ngăn nút bị co lại nếu tiêu đề quá dài */
  
  &:hover {
    background: rgba(0,0,0,0.1);
  }

  /* Căn chỉnh lại icon */
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div`
  min-width: 260px;
  background:  ${({ $background }) => $background || 'rgba(255, 255, 255, 0.3)'};
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.h3`
  display: flex;              
  justify-content: space-between; 
  align-items: center;        
  margin-bottom: 12px;
  color: ${({ $textColor }) => $textColor};
`;

const CardList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 40px; // Ensure droppable area is visible even when empty

  background: ${({ $isDraggingOver }) =>
    $isDraggingOver ? 'rgba(12, 102, 228, 0.1)' : 'transparent'};

  border-radius: 6px;
  transition: background 0.2s ease;
  width: 100%; // Ensure full width within container
  overflow: hidden; // Prevent overflow during dragging
`;



const AddCardBtn = styled.button`
  margin-top: 8px;
  background: transparent;
  border: none;
  color: #172b4d;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  padding: 6px 8px;
  border-radius: 4px;
  width: 100%;

  &:hover {
    background-color: rgba(9, 30, 66, 0.08); /* màu hover Trello */
    color: #172b4d;
  }
`;


const CardComposerForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 56px;
  padding: 8px;
  font-size: 14px;
  border: none;
  border-radius: 3px;
  resize: none;
  box-shadow: inset 0 0 0 2px #28a745;
  outline: none;
`;

const CardComposerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AddCardButton = styled.button`
  background-color: #28a745;
  color: white;
  padding: 6px 12px;
  font-size: 14px;
  border: none;
  border-radius: 3px;
  font-weight: 500;
  cursor: pointer;
`;

const CancelButton = styled.button`
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #44546f;

  &:hover {
    color: #172b4d;
  }
`;



// đặt gần cuối file ListColumn.jsx, chung chỗ các styled components khác
const Menu = styled(Dropdown.Menu)`
  min-width: 304px;
  padding: 0;
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(9,30,66,.25), 0 0 0 1px rgba(9,30,66,.08);
  overflow: hidden;
`;

const MenuHeader = styled.div`
  position: sticky; top: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 12px 16px;
  background: #f7f8f9;
  font-weight: 600; color: #172b4d; font-size: 14px;
  border-bottom: 1px solid #e4e6ea;
`;

const CloseX = styled.button`
  position: absolute; right: 8px; top: 8px;
  background: transparent; border: 0; border-radius: 6px; padding: 6px;
  cursor: pointer; color: #44546f;
  &:hover { background: #091e4214; }
`;

const MenuSectionTitle = styled.div`
  padding: 10px 12px 4px;
  font-size: 12px; font-weight: 600; color: #44546f;
  text-transform: uppercase;
`;

const Divider = styled.div`
  height: 1px; background: #091e4224; margin: 8px 0;
`;

const MenuItem = styled(Dropdown.Item)`
  padding: 8px 12px; font-size: 14px; color: #172b4d;
  &:hover, &:focus { background: #091e4214; color: #172b4d; }
`;

const UpsellCard = styled.div`
  margin: 4px 12px 8px; padding: 12px;
  background: #f7f8f9; border-radius: 8px; color: #44546f;
  font-size: 12px; line-height: 1.4;
  a { color: #0c66e4; text-decoration: underline; }
`;
