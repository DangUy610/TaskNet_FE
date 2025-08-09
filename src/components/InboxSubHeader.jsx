// src/components/InboxSubHeader.jsx
import React from 'react';
import styled from 'styled-components';
import { MdOutlineFeedback, MdFilterList, MdMoreHoriz, MdInbox } from 'react-icons/md';

export default function InboxSubHeader({ setShowFeedback, setShowFilter,filterButtonRef }) {
  return (
    <HeaderWrapper>
      <Wrapper>
        <Left>
          <MdInbox size={20} style={{ marginRight: 6 }} />
          <Title>Inbox</Title>
        </Left>
        <Right>
          <IconButton title="Feedback" onClick={() => setShowFeedback(true)}>
            <MdOutlineFeedback size={20} />
          </IconButton>
          <IconButton
          ref={filterButtonRef} 
          title="Filter" 
          onClick={() => setShowFilter(prev => !prev)}>
            <MdFilterList size={20} />
          </IconButton>
          <IconButton title="More options">
            <MdMoreHoriz size={24} />
          </IconButton>
        </Right>
      </Wrapper>
    </HeaderWrapper>
  );
}

const HeaderWrapper = styled.div`
  width: 100%;
  min-height: 56px;
  flex-shrink: 0;
  background: var(--board-header-background-color, #ffffff3d);
  border-bottom: 1px solid #dcdfe4;
  display: flex;
  align-items: center;
  padding: 0 16px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;

  @media (max-width: 400px) {
    display: none;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 8px 12px 16px;
  font-size: 14px;
  font-weight: 500;

  &:hover ${Right} {
    opacity: 1;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  color: var(--ds-text, #172b4d);
`;

const Title = styled.span`
  font-size: 16px;
  font-weight: 600;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--ds-icon, #5e6c84);
  cursor: pointer;
  padding: 4px;
  font-size: 16px;

  &:hover {
    color: var(--ds-text, #172b4d);
    background: var(--dynamic-button-hovered, rgba(0, 0, 0, 0.16));
    border-radius: 4px;
  }
`;
