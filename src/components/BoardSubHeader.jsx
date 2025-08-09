import React from 'react';
import styled from 'styled-components';
import BoardSubHeaderLeft from './BoardSubHeaderLeft';
import BoardSubHeaderRight from './BoardSubHeaderRight';
import ShareBoardPopup from './member/ShareBoardPopup';

export default function BoardSubHeader({ boardName = 'Untitled Board', setShowFilter, filterButtonRef, onOpenInvite,onCloseBoard  }) {
  return (
    <HeaderContainer>
      <InnerWrapper>
        <LeftSpan>
          <BoardSubHeaderLeft boardName={boardName} />
        </LeftSpan>

        <RightSpan>
          <BoardSubHeaderRight 
          setShowFilter={setShowFilter} 
          filterButtonRef={filterButtonRef}
          onOpenInvite={onOpenInvite}
          onCloseBoard={onCloseBoard}
           />
          
        </RightSpan>
      </InnerWrapper>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
  justify-content: space-between;
  gap: 12px;
`;

const LeftSpan = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
`;

const RightSpan = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

