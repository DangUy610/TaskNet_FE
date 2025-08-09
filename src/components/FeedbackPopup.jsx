// src/features/boards/FeedbackPopup.jsx
import React from 'react';
import styled from 'styled-components';

export default function FeedbackPopup({ onClose }) {
  return (
    <PopupContainer>
      <PopupHeader>
        <span>Feedback</span>
        <CloseButton onClick={onClose}>×</CloseButton>
      </PopupHeader>
      <PopupBody>
        <textarea placeholder="Tell us what you think..." />
        <SubmitButton>Send</SubmitButton>
      </PopupBody>
    </PopupContainer>
  );
}

const PopupContainer = styled.div`
  position: absolute;
  top: 60px;
  right: 16px;
  z-index: 1000;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 12px;
  width: 320px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
`;

const PopupBody = styled.div`
  display: flex;
  flex-direction: column;

  textarea {
    resize: none;
    height: 80px;
    padding: 8px;
    font-size: 14px;
    border-radius: 4px;
    border: 1px solid #ccc;
    margin-bottom: 8px;
  }
`;

const SubmitButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  align-self: flex-end;
  cursor: pointer;

  &:hover {
    background: #218838;
  }
`;

// ---------------------------

