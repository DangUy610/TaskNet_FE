import React from 'react';
import styled from 'styled-components';

export default function BoardTitle({ title }) {
  return <StyledTile>{title}</StyledTile>;
}

const StyledTile = styled.div`
  background-color: #dfe1e6;
  border: 2px solid #28A745; // Thêm viền xanh lá
  border-radius: 3px;
  width: 200px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  &:hover {
    background-color: #e0f3e0; // Hiệu ứng hover với màu xanh nhạt
  }
`;