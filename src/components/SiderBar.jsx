import React from 'react';
import { Col, ListGroup, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaTrello, FaFileAlt, FaHome } from 'react-icons/fa';

export default function SiderBar() {
  const navigate = useNavigate();
  const location = useLocation();

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

      {/* Promo card */}
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

/* Styled components */
const StyledItem = styled(ListGroup.Item)`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  padding: 10px 12px;
  border: none;
  background-color: ${({ $isActive }) => ($isActive ? '#e0f3e0' : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? '#28A745' : '#333')};

  &:hover { background-color: #f4f5f7; }

  svg {
    margin-right: 8px;
    color: ${({ $isActive }) => ($isActive ? '#28A745' : '#666')};
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
