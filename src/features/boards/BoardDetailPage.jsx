import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import InboxPane from './panes/InboxPane';
import PlannerPane from './panes/PlannerPane';
import BoardPane from './panes/BoardPane';

import dayjs from 'dayjs';

import BottomFloatingNav from './BottomFloatingNav';
import FullCardModal from '../../components/Card/FullCardModal.jsx';
import ConfirmationModal from '../../components/Card/common/ConfirmationModal.jsx';

import { useNavigate } from 'react-router-dom';
import { updateList, deleteList  } from '../../api/listApi.js';
import { getBoard, updateBoard } from '../../api/boardApi.js';
import { DragDropContext } from '@hello-pangea/dnd';

import { fetchInboxCards, updateCard, createInboxCard } from '../../api/cardApi'; 


export default function BoardDetailPage() {
  const navigate = useNavigate();
  const { workspaceId, boardId } = useParams();
  const numericBoardId = parseInt(boardId);
  const [background, setBackground] = useState('#e4f0f6');
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState(['inbox']);
  const [cards, setCards] = useState([]);
  const [lists, setLists] = useState([
    { id: 1, title: 'To Do', cards: [] },
    { id: 2, title: 'Doing', cards: [] },
    { id: 3, title: 'Done', cards: [] },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [editPopup, setEditPopup] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const [listToDelete, setListToDelete] = useState(null); // Sẽ lưu { id, name, cards }

  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  const handleConfirmCloseBoard = async () => {
    setShowCloseConfirm(false);
    
    try {
      // ✅ Gọi API `PATCH` để cập nhật is_closed = true
      // Bạn cần tạo hàm này trong `boardApi.js`
      // updateBoard = (workspaceId, boardId, data) => api.patch(...)
      await updateBoard(workspaceId, boardId, { is_closed: true });

      // ✅ Chuyển hướng người dùng về trang chủ hoặc trang boards
      navigate('/boards'); 
    } catch (err) {
      console.error('❌ Failed to close board:', err);
      // Hiển thị thông báo lỗi
    }
  };

  const handleDeleteListRequest = (listId, listName, cardsInList) => {
    setListToDelete({ id: listId, name: listName, cards: cardsInList });
  };

  // ✅ TẠO HÀM XÁC NHẬN XÓA
  const handleConfirmDeleteList = async () => {
    if (!listToDelete) return;

    const { id: listIdToDelete, cards: cardsToMove } = listToDelete;

    // B1: Optimistic UI
    // Xóa cột khỏi `lists` state
    setLists(prevLists => prevLists.filter(list => list.id !== listIdToDelete));
    // Thêm các thẻ của cột đó vào `cards` (Inbox) state
    setCards(prevCards => [...prevCards, ...cardsToMove]);

    // B2: Đóng modal
    setListToDelete(null);

    // B3: Gọi API
    try {
      await deleteList(listIdToDelete);
    } catch (err) {
      console.error('❌ Failed to delete list:', err);
      // TODO: Rollback state nếu API thất bại
    }
  };

  const handleCloseBoardRequest = () => {
        setShowCloseConfirm(true);
    };


  useEffect(() => {
    async function loadBoard() {
      if (!workspaceId || !boardId) return;
      setLoading(true);
      try {
        const res = await getBoard(workspaceId, boardId);
        setBackground(res.data.background || '#e4f0f6');
      } catch (err) {
        console.error('Lỗi fetch board:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBoard();
  }, [workspaceId, boardId]);

  useEffect(() => {
    const loadInboxCards = async () => {
      try {
        const res = await fetchInboxCards(); // gọi API cards/ => card không có list
        setCards(res.data || []);
      } catch (err) {
        console.error('❌ Lỗi load inbox cards:', err);
      }
    };
    loadInboxCards();
  }, [boardId]);


  // useEffect(() => {
//   console.log('Attempting to connect to WebSocket for board:', boardId);
//   if (!boardId) return; // Add a guard clause

//   const socket = new WebSocket('ws://127.0.0.1:8000/ws/boards/' + boardId + '/');
  
//   socket.onopen = () => {
//     console.log('WebSocket connection established.');
//   };

//   socket.onmessage = (event) => {
//     console.log('WebSocket message received:', event.data);
//     const data = JSON.parse(event.data);
//     if (data.type === 'card_update') {
//       // Handle updates here
//     }
//   };

//   socket.onerror = (error) => {
//     console.error('WebSocket Error:', error);
//   };

//   socket.onclose = (event) => {
//     if (event.wasClean) {
//       console.log(`WebSocket closed cleanly, code=${event.code} reason=${event.reason}`);
//     } else {
//       console.error('WebSocket connection died');
//     }
//   };

//   return () => {
//     console.log('Closing WebSocket connection.');
//     socket.close();
//   };
// }, [boardId]);

  const handleAddCard = async () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === '') {
      console.log("Input is empty, not creating card.");
      return;
    }

    // Xây dựng payload một cách rõ ràng
    const payload = {
      name: trimmedValue,
      position: cards.length, // Hoặc một logic tính position khác nếu bạn có
    };

    // Log payload trước khi gửi đi để debug
    console.log("Preparing to create inbox card with payload:", payload);

    try {
      const res = await createInboxCard(payload);
      
      setCards((prev) => [...prev, res.data]);
      setInputValue('');
      setShowInput(false);

    
    } catch (err) {
      if (err.response) {
        console.error('❌ Backend Error:', err.response.data);
      } else {
        console.error('❌ Network or other error:', err.message);
      }
    }
  };



  const onDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;

    const ensureCardStructure = (card) => ({
      id: card.id,
      name: card.name || '',
      description: card.description || '',
      due_date: card.due_date || null,
      completed: card.completed ?? false,
      list: card.list || null,
      visibility: card.visibility || 'private',
      status: card.status || 'doing',
      position: card.position ?? 0,
    });

    let movedCard;
    let originalCards = [...cards]; // Lưu trạng thái ban đầu để rollback
    let originalLists = [...lists]; // Lưu trạng thái ban đầu để rollback

    try {
      if (type === 'column') {
        // Reorder cột trong BoardPane
        const newLists = [...lists];
        const [moved] = newLists.splice(source.index, 1);
        newLists.splice(destination.index, 0, moved);
        setLists(newLists);

        // Cập nhật position của các cột
        await Promise.all(
          newLists.map((list, index) => updateList(list.id, { position: index }))
        );
        return;
      }

      // Xử lý kéo thả thẻ
      if (source.droppableId === destination.droppableId) {
        if (source.droppableId === 'inbox') {
          // Reorder trong Inbox
          const newCards = [...cards];
          [movedCard] = newCards.splice(source.index, 1);
          newCards.splice(destination.index, 0, ensureCardStructure(movedCard));
          setCards(newCards);

          // Cập nhật position cho tất cả thẻ trong Inbox
          await Promise.all(
            newCards.map((card, index) =>
              updateCard(card.id, { position: index })
            )
          );
        } else {
          // Reorder trong cùng một list
          const listId = parseInt(source.droppableId.replace('list-', ''));
          const newLists = [...lists];
          const listIndex = newLists.findIndex((l) => l.id === listId);
          if (listIndex === -1) return;

          const newCards = [...newLists[listIndex].cards];
          [movedCard] = newCards.splice(source.index, 1);
          newCards.splice(destination.index, 0, ensureCardStructure(movedCard));
          newLists[listIndex] = { ...newLists[listIndex], cards: newCards };
          setLists(newLists);

          // Cập nhật position cho tất cả thẻ trong list
          await Promise.all(
            newCards.map((card, index) =>
              updateCard(card.id, { list: listId, position: index })
            )
          );
        }
      } else {
        const sourceListId = source.droppableId.startsWith('list-')
          ? parseInt(source.droppableId.replace('list-', ''))
          : null;
        const destListId = destination.droppableId.startsWith('list-')
          ? parseInt(destination.droppableId.replace('list-', ''))
          : null;

        if (source.droppableId === 'inbox') {
          // Kéo từ Inbox sang list
          const newCards = [...cards];
          [movedCard] = newCards.splice(source.index, 1);
          setCards(newCards);

          const destList = lists.find((l) => l.id === destListId);
          if (!destList) return;

          const newLists = [...lists];
          const destListIndex = newLists.findIndex((l) => l.id === destListId);
          const newDestCards = [...newLists[destListIndex].cards];
          newDestCards.splice(destination.index, 0, ensureCardStructure(movedCard));
          newLists[destListIndex] = { ...newLists[destListIndex], cards: newDestCards };
          setLists(newLists);

          // Cập nhật list và position cho thẻ được kéo
          await updateCard(movedCard.id, {
            list: destListId,
            position: destination.index,
            completed: destList.title === 'Done',
          });

          // Cập nhật position cho tất cả thẻ trong danh sách đích
          await Promise.all(
            newDestCards.map((card, index) =>
              updateCard(card.id, { list: destListId, position: index })
            )
          );

          // Cập nhật position cho tất cả thẻ còn lại trong Inbox
          await Promise.all(
            newCards.map((card, index) =>
              updateCard(card.id, { position: index })
            )
          );
        } else if (destination.droppableId === 'inbox') {
          // Kéo từ list sang Inbox
          const newLists = [...lists];
          const sourceListIndex = newLists.findIndex((l) => l.id === sourceListId);
          if (sourceListIndex === -1) return;

          const sourceCards = [...newLists[sourceListIndex].cards];
          [movedCard] = sourceCards.splice(source.index, 1);
          newLists[sourceListIndex] = { ...newLists[sourceListIndex], cards: sourceCards };
          setLists(newLists);

          const newCards = [...cards];
          newCards.splice(destination.index, 0, ensureCardStructure(movedCard));
          setCards(newCards);

          // Cập nhật list=null và position cho thẻ được kéo
          await updateCard(movedCard.id, {
            list: null,
            position: destination.index,
            completed: false,
          });

          // Cập nhật position cho tất cả thẻ trong Inbox
          await Promise.all(
            newCards.map((card, index) =>
              updateCard(card.id, { position: index })
            )
          );

          // Cập nhật position cho tất cả thẻ trong danh sách nguồn
          await Promise.all(
            sourceCards.map((card, index) =>
              updateCard(card.id, { list: sourceListId, position: index })
            )
          );
        } else {
          // Kéo giữa các list trong BoardPane
          const newLists = [...lists];
          const sourceListIndex = newLists.findIndex((l) => l.id === sourceListId);
          const destListIndex = newLists.findIndex((l) => l.id === destListId);
          if (sourceListIndex === -1 || destListIndex === -1) return;

          const sourceCards = [...newLists[sourceListIndex].cards];
          const destCards = [...newLists[destListIndex].cards];
          [movedCard] = sourceCards.splice(source.index, 1);
          destCards.splice(destination.index, 0, ensureCardStructure(movedCard));
          newLists[sourceListIndex] = { ...newLists[sourceListIndex], cards: sourceCards };
          newLists[destListIndex] = { ...newLists[destListIndex], cards: destCards };
          setLists(newLists);

          // Cập nhật list và position cho thẻ được kéo
          await updateCard(movedCard.id, {
            list: destListId,
            position: destination.index,
            completed: newLists[destListIndex].title === 'Done',
          });

          // Cập nhật position cho tất cả thẻ trong danh sách đích
          await Promise.all(
            destCards.map((card, index) =>
              updateCard(card.id, { list: destListId, position: index })
            )
          );

          // Cập nhật position cho tất cả thẻ trong danh sách nguồn
          await Promise.all(
            sourceCards.map((card, index) =>
              updateCard(card.id, { list: sourceListId, position: index })
            )
          );
        }
      }
    } catch (err) {
      console.error('❌ Lỗi kéo thả:', err);
      // Rollback trạng thái
      setCards(originalCards);
      setLists(originalLists);
    }
  };


  const toggleTab = (tabName) => {
    setActiveTabs((prev) =>
      prev.includes(tabName)
        ? prev.length > 1
          ? prev.filter((t) => t !== tabName)
          : prev
        : [...prev, tabName]
    );
  };

  const toggleComplete = async (index) => {
    const updated = [...cards];
    const card = updated[index];
    const newCompleted = !card.completed;

    try {
      await updateCard(card.id, { completed: newCompleted });
      updated[index].completed = newCompleted;
      setCards(updated);
    } catch (err) {
      console.error('❌ Lỗi cập nhật completed:', err);
    }
  };


  const handleSaveCard = async () => {
    if (editPopup) {
      try {
        const updated = [...cards];
        const card = updated[editPopup.index];

        const res = await updateCard(card.id, {
          name: editPopup.text,
        });

        updated[editPopup.index] = { ...card, ...res.data };
        setCards(updated);
        setEditPopup(null);
      } catch (err) {
        console.error('❌ Lỗi update card:', err);
      }
    }
  };


  const renderPanes = () => (
    <SplitContainer>
      {activeTabs.includes('inbox') && (
        <InboxPane
          background="#e4f0f6"
          cards={cards}
          setCards={setCards}
          inputValue={inputValue}
          setInputValue={setInputValue}
          showInput={showInput}
          setShowInput={setShowInput}
          editPopup={editPopup}
          setEditPopup={setEditPopup}
          selectedCard={selectedCard}
          setSelectedCard={setSelectedCard}
          handleAddCard={handleAddCard}
          toggleComplete={toggleComplete}
          handleSaveCard={handleSaveCard}
        />
      )}
      {activeTabs.includes('planner') && <PlannerPane background="#e4f0f6" />}
      {activeTabs.includes('board') && <BoardPane 
      background={background} 
      boardId={numericBoardId} 
      lists={lists} 
      setLists={setLists}
      onListDeleted={handleDeleteListRequest} 
      onCloseBoard={handleCloseBoardRequest}
       />}
    </SplitContainer>
  );

  if (loading) return <div>Loading board...</div>;

  return (
    <>
      {editPopup && <DarkOverlay />}
      {selectedCard && (
        <FullCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      <BoardWrapper $background={background}>
        <DragDropContext onDragEnd={onDragEnd}>
            {renderPanes()}
        </DragDropContext>
        <BottomFloatingNav activeTabs={activeTabs} toggleTab={toggleTab} activeCount={activeTabs.length} />
    </BoardWrapper>

    <ConfirmationModal
        show={!!listToDelete}
        onClose={() => setListToDelete(null)}
        onConfirm={handleConfirmDeleteList}
        title="Delete List?"
        body={
          listToDelete && `Are you sure you want to delete the list "${listToDelete.name}"? 
          All ${listToDelete.cards.length} cards in this list will be moved to your Inbox.`
        }
        confirmText="Delete and Move Cards"
        confirmVariant="danger" // Vẫn dùng màu đỏ vì đây là hành động lớn
    />

    {/* ✅ RENDER MODAL XÁC NHẬN ĐÓNG BẢNG */}
      <ConfirmationModal
        show={showCloseConfirm}
        onClose={() => setShowCloseConfirm(false)}
        onConfirm={handleConfirmCloseBoard}
        title="Close Board?"
        body="Are you sure you want to close this board? You can find and reopen closed boards later."
        confirmText="Close"
        confirmVariant="danger"
      />

  </>
  );
}

const BoardWrapper = styled.div`
  background: ${({ $background }) => $background};
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const SplitContainer = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  > * {
    flex: 1;
    min-width: 240px;
    overflow-y: auto;
    border-left: 1px solid #ddd;
    &:first-child {
      border-left: none;
    }
  }
`;

const DarkOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 998;
`;
