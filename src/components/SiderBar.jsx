import React, { useContext } from 'react';
import { Col, ListGroup, Badge, Dropdown, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { WorkspaceContext } from '../contexts/WorkspaceContext';
import { FaTrello, FaFileAlt, FaHome, FaUsers, FaCog, FaCaretDown } from 'react-icons/fa';

export default function SiderBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaces, currentWorkspaceId } = useContext(WorkspaceContext);
  const currentWs = workspaces.find(w => w.id === currentWorkspaceId) || {};

  return (
    <Col xs={3} className="bg-white border-right p-3">
      {/* Top navigation */}
      <ListGroup variant="flush" className="mb-4">
        <StyledItem
          $isActive={location.pathname === '/boards'}
          onClick={() => navigate('/boards')}
        >
          <FaTrello className="mr-2" /> Boards
        </StyledItem>
        <StyledItem
          $isActive={location.pathname === '/templates'}
          onClick={() => navigate('/templates')}
        >
          <FaFileAlt className="mr-2" /> Templates
        </StyledItem>
        <StyledItem
          $isActive={location.pathname === '/home'}
          onClick={() => navigate('/home')}
        >
          <FaHome className="mr-2" /> Home
        </StyledItem>
      </ListGroup>

      {/* Workspaces dropdown */}
      <div className="text-uppercase text-muted small mb-2">Your Workspaces</div>
      <Dropdown className="mb-4">
        <Dropdown.Toggle
          as={CustomToggle}
          className="w-100 text-left"
          id="workspace-dropdown"
        >
          <div className="toggle-content">
            {currentWs.name ? (
              <>
                <Badge bg="success" className="mr-2">
                  {currentWs.name[0].toUpperCase()}
                </Badge>
                <span>{currentWs.name}</span>
              </>
            ) : (
              <span>Workspace</span>
            )}
          </div>
          <div className="caret-container">
            <FaCaretDown className="caret-icon" />
          </div>
        </Dropdown.Toggle>
        
        <Dropdown.Menu as={CustomMenu} className="w-100">
          <Dropdown.Item onClick={() => navigate('/boards')}>
            <FaTrello className="mr-2" /> Boards
          </Dropdown.Item>
          <Dropdown.Item onClick={() => navigate('/members')}>
            <FaUsers className="mr-2" /> Members
          </Dropdown.Item>
          <Dropdown.Item onClick={() => navigate('/settings')}>
            <FaCog className="mr-2" /> Settings
          </Dropdown.Item>
          <Dropdown.Item>
            <span style={{ color: '#6b46c1' }}>Upgrade</span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      {/* Premium promo card */}
      <div className="p-3 border rounded">
        <h6>Try TaskNest Premium</h6>
        <p className="mb-1 small">
          Get Planner (full access), advanced features, and more.
        </p>
        <SquareButton variant="outline-success" size="sm">
          Start free trial
        </SquareButton>
      </div>
    </Col>
  );
}

// Styled components
const StyledItem = styled(ListGroup.Item)`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  padding: 10px 12px;
  border: none;
  background-color: ${({ isActive }) => (isActive ? '#e0f3e0' : 'transparent')};
  color: ${({ isActive }) => (isActive ? '#28A745' : '#333')};

  &:hover {
    background-color: #f4f5f7;
  }

  svg {
    margin-right: 8px;
    color: ${({ isActive }) => (isActive ? '#28A745' : '#666')};
  }
`;

const CustomToggle = styled.div`
  background-color: #e2e4e6;
  border: 1px solid #dfe1e6;
  border-radius: 3px;
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background-color: #d3d6da;
  }

  .toggle-content {
    display: flex;
    align-items: center;
    flex-grow: 1;
  }

  .caret-container {
    display: flex;
    align-items: center;
  }
`;

const CustomMenu = styled(Dropdown.Menu)`
  border: 1px solid #dfe1e6;
  border-radius: 3px;
  padding: 4px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .dropdown-item {
    padding: 6px 12px;
    display: flex;
    align-items: center;

    svg {
      margin-right: 8px;
    }

    &:hover {
      background-color: #e2e4e6;
    }
  }
`;

const SquareButton = styled(Button)`
  background-color: ${props => (props.variant === 'outline-success' ? 'transparent' : '#28A745')};
  border-color: #28A745;
  color: ${props => (props.variant === 'outline-success' ? '#28A745' : 'white')};
  height: 32px;
  padding: 0 12px;
  border-radius: 4px;

  &:hover:not(:disabled) {
    background-color: ${props => (props.variant === 'outline-success' ? '#e0f3e0' : '#218838')};
    border-color: ${props => (props.variant === 'outline-success' ? '#28A745' : '#218838')};
    color: ${props => (props.variant === 'outline-success' ? '#28A745' : 'white')};
  }

  &:disabled {
    background-color: #1e7e34;
    border-color: #1e7e34;
    opacity: 0.65;
    color: white;
  }
`;
