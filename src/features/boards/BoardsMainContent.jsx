import React, { useContext, useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { fetchBoards,createBoard } from '../../api/boardApi'; 
import { Link } from 'react-router-dom';

import * as boardApi from '../../api/boardApi'; 
import styled from 'styled-components';
import BoardThemeDrawer from './BoardThemeDrawer';


import ClosedBoardsModal from './ClosedBoardsPage';

export default function BoardsMainContent({ onCreateBoard }) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showClosedModal, setShowClosedModal] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBoards(); // ❗ KHÔNG còn truyền workspaceId
      setBoards(res.data || []);
    } catch (e) {
      console.error(e);
      setError('Cannot load boards.');
    } finally {
      setLoading(false);
    }
  };


  const handleCreateBoard = async (data) => {
    // data từ BoardThemeDrawer: { title, visibility, background, ... }
    try {
      const res = await createBoard({
        name: data.name,           
        visibility: data.visibility,
        background: data.background,
      });
      // Cập nhật nhanh UI
      setBoards(prev => [res.data, ...prev]);
      setShowDrawer(false);
    } catch (err) {
      console.error('❌ Lỗi tạo board:', err);
      if (err.response) {
        console.error('📥 API error:', err.response.data);
      }
    }
  };



  const handleBoardReopened = () => {
    // Cách đơn giản nhất: Tải lại toàn bộ danh sách boards
    loadBoards();
  };

return (
  <div className="p-4" style={{ width: '100%' }}>
    <div className="d-flex justify-content-between align-items-start">
      {/* LEFT: Quick actions */}
      <div>
        <h6 className="text-uppercase text-muted mb-3" style={{ fontWeight: 800 }}>Your Boards</h6>

        <div style={{ position: 'relative' }}>
          <CreateCard onClick={() => setShowDrawer(true)}>Create new board</CreateCard>

          {showDrawer && (
            <BoardThemeDrawer
              show={true}
              onClose={() => setShowDrawer(false)}
              onCreate={handleCreateBoard}
            />
          )}
        </div>

        <Button
          variant="light"
          className="mt-3"
          style={{ borderRadius: 4, fontWeight: 500 }}
          onClick={() => setShowClosedModal(true)}
        >
          View all closed boards
        </Button>
      </div>

      {/* RIGHT: Tabs (cosmetic) */}
      <div className="d-flex align-items-start gap-2">
        <TabButton style={{ fontWeight: 800 }}>Boards</TabButton>
        <TabButton style={{ fontWeight: 800 }}>Members</TabButton>
        <TabButton style={{ fontWeight: 800 }}>Settings</TabButton>
        <Button variant="outline-primary" style={{ background: '#f5f0ff', borderColor: '#c4b5fd', color: '#6b46c1' }}>
          Upgrade
        </Button>
      </div>
    </div>

    {showDrawer && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} />}

    {/* Boards list */}
    <div className="mt-4">
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="success" />
          <span className="ml-2">Loading boards...</span>
        </div>
      ) : error ? (
        <div className="text-danger text-center">{error}</div>
      ) : boards.length === 0 ? (
        <div className="text-center">No boards found.</div>
      ) : (
        <BoardGrid>
          {boards.map(board => (
            <Link
              key={board.id}
              to={`/boards/${board.id}`}  // không còn /inbox ở URL nếu bạn không dùng
              style={{ textDecoration: 'none' }}
            >
              <BoardCard>{board.name}</BoardCard>
            </Link>
          ))}
        </BoardGrid>
      )}
    </div>

    <ClosedBoardsModal
      show={showClosedModal}
      onClose={() => setShowClosedModal(false)}
      onBoardReopened={handleBoardReopened}
    />
  </div>
);

}

const CreateCard = styled.div`
  width: 180px;
  height: 100px;
  border: 2px solid #1e7e34;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f5f7;
  color: #172b4d;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const TabButton = styled(Button).attrs({ variant: 'light' })`
  background-color: #f4f5f7;
  border: 1px solid #dcdfe4;
  color: #172b4d;
  font-weight: 500;
  padding: 6px 12px;
`;

const BoardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const BoardCard = styled.div`
  background-color: #f4f5f7;
  border-radius: 6px;
  height: 100px;
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