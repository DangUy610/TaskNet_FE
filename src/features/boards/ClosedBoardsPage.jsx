// src/features/boards/ClosedBoardsModal.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, ListGroup, Image } from 'react-bootstrap';
import styled from 'styled-components';
import { FaTrashAlt } from 'react-icons/fa';

// Import các API cần thiết
import * as boardApi from '../../api/boardApi';
import ConfirmationModal from '../../components/Card/common/ConfirmationModal';

// Component con để render một dòng board
const BoardItem = ({ board, onReopen, onDelete  }) => (
  <StyledListItem>
    <BoardInfo>
      <BoardThumbnail src={board.background || `https://placehold.co/40x32/E2E4E6/FFFFFF?text=%20`} />
      <div>
        <BoardNameLink href="#">{board.name}</BoardNameLink>
        {/* Chúng ta cần thêm workspace name vào đây, backend cần trả về */}
        <WorkspaceName>{board.workspace?.name || 'Unknown Workspace'}</WorkspaceName> 
      </div>
    </BoardInfo>
    <ActionButtons>
      <Button variant="primary" size="sm" onClick={() => onReopen(board)}>Reopen</Button>
      <Button variant="danger" size="sm" onClick={() => onDelete(board)}>
        <FaTrashAlt /> Delete
      </Button>
    </ActionButtons>
  </StyledListItem>
);


export default function ClosedBoardsModal({ show, onClose,onBoardReopened  }) {
  const [closedBoards, setClosedBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho modal xác nhận xóa
  const [boardToDelete, setBoardToDelete] = useState(null);

  useEffect(() => {
    if (show) {
      const fetchClosedBoards = async () => {
        setLoading(true);
        setError(null);
        try {
          
          const res = await boardApi.getClosedBoards(); 
          setClosedBoards(res.data);
        } catch (err) {
          setError('Could not load closed boards.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchClosedBoards();
    }
  }, [show]);

  const handleReopen = async (board) => {
    try {
      // API call: PATCH { is_closed: false }
      await boardApi.updateBoard(board.workspace.id, board.id, { is_closed: false });
      // Cập nhật UI: loại board này khỏi danh sách đã đóng
      setClosedBoards(prev => prev.filter(b => b.id !== board.id));

       // Gọi callback để báo cho component cha
      if (onBoardReopened) {
        onBoardReopened(board); // Truyền cả board object để cha biết board nào đã mở lại
      }
    } catch (err) {
      console.error('Failed to reopen board:', err);
      alert('Failed to reopen board.');
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!boardToDelete) return;

    try {
        // API call: DELETE /api/workspaces/.../boards/...
        await boardApi.deleteBoard(boardToDelete.workspace.id, boardToDelete.id);
        // Cập nhật UI
        setClosedBoards(prev => prev.filter(b => b.id !== boardToDelete.id));
        setBoardToDelete(null);
    } catch (err) {
        console.error('Failed to delete board:', err);
        alert('Failed to delete board.');
        setBoardToDelete(null);
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-center p-4"><Spinner animation="border" /></div>;
    if (error) return <div className="text-center text-danger p-4">{error}</div>;
    if (closedBoards.length === 0) return <div className="text-center p-4">You have no closed boards.</div>;

    return (
      <ListGroup variant="flush">
        {closedBoards.map(board => (
          <BoardItem 
            key={board.id} 
            board={board} 
            onReopen={handleReopen} 
            onDelete={setBoardToDelete} // Mở modal xác nhận
          />
        ))}
      </ListGroup>
    );
  };

  return (
    <>
      <Modal show={show} onHide={onClose} size="lg" centered dialogClassName="closed-boards-modal">
        <Modal.Header closeButton>
          <Modal.Title><span className="me-2">🗃️</span> Closed boards</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          {renderContent()}
        </Modal.Body>
      </Modal>

      <ConfirmationModal
        show={!!boardToDelete}
        onClose={() => setBoardToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete Board?"
        body={
            boardToDelete && `Are you sure you want to permanently delete the board "${boardToDelete.name}"? 
            All lists, cards, and actions will be gone forever. This cannot be undone.`
        }
        confirmText="Delete Permanently"
      />
    </>
  );
}

// Styled components để giao diện giống Trello
const StyledListItem = styled(ListGroup.Item)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
`;

const BoardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BoardThumbnail = styled(Image)`
  width: 40px;
  height: 32px;
  object-fit: cover;
  border-radius: 3px;
`;

const BoardNameLink = styled.a`
  font-weight: 500;
  color: #0c66e4;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const WorkspaceName = styled.div`
  font-size: 12px;
  color: #626F86;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;