import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FixedSizeList } from 'react-window';

// Grid container for all boards and create-tile
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  padding: 16px;
`;

// Common tile styles
const Tile = styled.div`
  background-color: #f4f5f7;
  border-radius: 6px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #e2e4e6;
  }
`;

// Special "Create new board" tile
const CreateTile = styled(Tile)`
  font-size: 24px;
  font-weight: bold;
  color: #5e6c84;
`;

export default function BoardList({ boards, onCreate }) {
  const navigate = useNavigate();

  return (
    <Grid>
      <CreateTile onClick={onCreate}>+ Create new board</CreateTile>
      {boards.map(board => (
        <Tile key={board.id} onClick={() => navigate(`/boards/${board.id}`)}>
          {board.name}
        </Tile>
      ))}
    </Grid>
  );
}
