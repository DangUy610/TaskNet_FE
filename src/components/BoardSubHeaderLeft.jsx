import React, { useState } from 'react';
import styled from 'styled-components';
import { BsList } from 'react-icons/bs';
import { FiChevronDown } from 'react-icons/fi';

export default function BoardSubHeaderLeft({ boardName, setBoardName }) {
  const [editing, setEditing] = useState(false);

  return (
    <Wrapper>
      <LeftSpan>
        <BoardNameContainer
          onClick={() => setEditing(true)}
          role="textbox"
          aria-label="Board name"
          tabIndex={0}
        >
          {editing ? (
            <BoardNameInput
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              onBlur={() => setEditing(false)}
              autoFocus
            />
          ) : (
            <BoardNameText>{boardName || 'Untitled Board'}</BoardNameText>
          )}
        </BoardNameContainer>

        <ViewSwitcher>
          <BsList />
          <FiChevronDown />
        </ViewSwitcher>
      </LeftSpan>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex: 1 1 20%;
  align-items: flex-start;
  max-width: 100%;
  min-height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LeftSpan = styled.span`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
`;

const BoardNameContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  max-width: 300px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const BoardNameText = styled.h1`
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BoardNameInput = styled.input`
  font-size: 18px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  outline: none;
  color: #172b4d;
`;

const ViewSwitcher = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #ffffff;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;
