import React from 'react';
import styled from 'styled-components';
import { FiUserPlus, FiZap, FiFilter, FiShare2, FiMoreHorizontal } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { GoOrganization } from 'react-icons/go';
import { Dropdown } from 'react-bootstrap';

export default function BoardSubHeaderRight({ setShowFilter, filterButtonRef, onOpenInvite, onCloseBoard}) {

  const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <IconButton
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      title="More"
    >
      {children}
    </IconButton>
  ));

  return (
    <Wrapper>
      <RightSpan>
        <Avatar title="Hải Huỳnh" src="https://i.imgur.com/4ZQZ4Zl.png" />
        <ActionButton><FiZap /> Power-Ups</ActionButton>
        <IconButton title="Automation"><FiZap /></IconButton>
        <IconButton
          title="Filter cards"
          ref={filterButtonRef}
          onClick={() => setShowFilter((prev) => !prev)}
        >
          <FiFilter />
        </IconButton>
        <IconButton title="Star board"><FaStar color="#e2b203" /></IconButton>
        <IconButton title="Workspace visible"><GoOrganization /></IconButton>
        <ActionButton onClick={onOpenInvite}><FiShare2 /> Share</ActionButton>

        <Dropdown>
          <Dropdown.Toggle as={CustomToggle}>
            <FiMoreHorizontal />
          </Dropdown.Toggle>

          <Dropdown.Menu align="end">
            <Dropdown.Header>Board Actions</Dropdown.Header>
            <Dropdown.Item>About this board</Dropdown.Item>
            <Dropdown.Item>Activity</Dropdown.Item>
            <Dropdown.Divider />

            {/* ✅ NÚT QUAN TRỌNG NHẤT */}
            <Dropdown.Item className="text-danger" onClick={onCloseBoard}>
              Close board...
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </RightSpan>
    </Wrapper>
  );
}

// (Styled components giữ nguyên)

const Wrapper = styled.div`
  display: flex;
  flex: 1 1 auto;
  align-items: flex-start;
  justify-content: flex-end;
  min-height: 32px;
  gap: 4px;
  margin-left: auto;
`;

const RightSpan = styled.span`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
`;

const Avatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 1px white;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.36);
  }

  svg {
    stroke: currentColor;
    width: 16px;
    height: 16px;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
  color: #ffffff;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;
