import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { BiLabel } from 'react-icons/bi';
import { HiOutlineUserAdd } from 'react-icons/hi';
import { BsCardText, BsClock, BsArrowsMove, BsFiles, BsLink45Deg, BsArchive } from 'react-icons/bs';
import LabelPopup from '../../components/Label/LabelPopup';
import ConfirmationModal from './common/ConfirmationModal';
import Portal from './common/Portal';

import { fetchBoardLabels } from '../../api/boardApi';
import { deleteCard } from '../../api/cardApi';

export default function CardEditPopup({
  anchorRect,
  cardText,
  onClose,
  onChange,
  onSave,
  onOpenFullCard,
  card,
  listId,
  boardId,
  updateCardLabels,
  onCardDeleted,
  isInboxMode = false,
}) {
  const labelButtonRef = useRef();
  const popupRef = useRef();
  const textareaRef = useRef();
  const [text, setText] = useState(cardText);
  const [showLabelPopup, setShowLabelPopup] = useState(false);
  const [labels, setLabels] = useState([]);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [labelError, setLabelError] = useState(null);
  const [labelAnchorRect, setLabelAnchorRect] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  
  useEffect(() => {
    if (showLabelPopup && labelButtonRef.current) {
      requestAnimationFrame(() => {
        const rect = labelButtonRef.current.getBoundingClientRect();
        setLabelAnchorRect(rect);
      });
    }
  }, [showLabelPopup]);

  useEffect(() => {
    // Chỉ fetch labels nếu có boardId
    if (boardId) {
      const loadLabels = async () => {
        setLoadingLabels(true);
        try {
          // ✅ Gọi API với boardId
          const res = await fetchBoardLabels(boardId);
          setLabels(res.data || []);
        } catch (err) {
          console.error('❌ Failed to fetch labels:', err);
          setLabelError('Failed to load labels');
        } finally {
          setLoadingLabels(false);
        }
      };
      loadLabels();
    }
  }, [boardId]); 

  useEffect(() => {
    function handleClickOutside(e) {
      if (showDeleteConfirm) {
        return;
      }

      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose,showDeleteConfirm]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSave = () => {
    onSave();
    if (updateCardLabels) {
      updateCardLabels(card.id, card.labels || []);
    }
    onClose();
  };

  const handleDeleteCard = async () => {
    setShowDeleteConfirm(false); // Hide confirmation modal first

    try {
      // ✅ FIX: API call is now made BEFORE updating the UI (pessimistic update)
      await deleteCard(card.id);

      // On successful deletion, update the UI and close the popup
      if (onCardDeleted) {
        onCardDeleted(card.id);
      }
      onClose();
    } catch (err) {
      console.error('❌ Failed to delete card:', err);
      // Inform user of the failure
      alert('Failed to delete the card. Please check your connection and try again.');
    }
  };

  const handleToggleLabel = (labelId) => {
    const newLabels = card.labels.includes(labelId)
      ? card.labels.filter((id) => id !== labelId)
      : [...(card.labels || []), labelId];
    card.labels = newLabels;
  };

  if (!card) {
    return null;
  }

  return (
    <Portal>
      <Dialog
        ref={popupRef}
        style={{
          top: anchorRect.bottom + window.scrollY + 8,
          left: Math.min(anchorRect.left + 6, window.innerWidth - 320),
          visibility: showDeleteConfirm ? 'hidden' : 'visible',
        }}
      >
        <Form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <CardTextArea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="Enter card title"
          />
          <SaveButton type="submit">Save</SaveButton>
        </Form>

        <MenuList>
          <MenuItem onClick={() => { onClose(); onOpenFullCard(); }}>
            <BsCardText />
            <span>Open card</span>
          </MenuItem>

          {!isInboxMode && (
            <>
              <MenuItem
                ref={labelButtonRef}
                onClick={() => {
                  setShowLabelPopup(true);
                }}
              >
                <BiLabel />
                <span>Edit labels</span>
              </MenuItem>

              <MenuItem onClick={() => alert('Change members')}>
                <HiOutlineUserAdd />
                <span>Change members</span>
              </MenuItem>
            </>
          )}

          <MenuItem onClick={() => alert('Edit dates')}>
            <BsClock />
            <span>Edit dates</span>
          </MenuItem>
          <MenuItem onClick={() => alert('Move')}>
            <BsArrowsMove />
            <span>Move</span>
          </MenuItem>
          <MenuItem onClick={() => alert('Copy')}>
            <BsFiles />
            <span>Copy card</span>
          </MenuItem>
          <MenuItem onClick={() => alert('Copy link')}>
            <BsLink45Deg />
            <span>Copy link</span>
          </MenuItem>
          <MenuItem onClick={() => alert('Archive')}>
            <BsArchive />
            <span>Archive</span>
          </MenuItem>
          <MenuItemDelete onClick={() => setShowDeleteConfirm(true)}>
            <BsArchive />
            <span>Delete Card</span>
          </MenuItemDelete>
        </MenuList>
      </Dialog>

      {showLabelPopup && (
        <LabelPopup
          anchorRect={labelAnchorRect}
          labels={labels}
          selectedLabelIds={card.labels || []}
          onToggleLabel={handleToggleLabel}
          onEditLabel={(label) => alert(`Edit label ${label.name}`)}
          onClose={() => {
            setShowLabelPopup(false);
            setLabelAnchorRect(null);
          }}
          boardId={listId}
          loadingLabels={loadingLabels}
          labelError={labelError}
        />
      )}

      {/* ✅ BƯỚC 3.6: RENDER MODAL XÁC NHẬN */}
      <ConfirmationModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteCard}
        title="Delete Card?"
        body={`Are you sure you want to permanently delete the card "${card.name}"? This action cannot be undone.`}
        confirmText="Delete Card"
        confirmVariant="danger"
      />
    </Portal>
  );
}

const Dialog = styled.div`
  position: absolute;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  padding: 12px;
  z-index: 2000;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const CardTextArea = styled.textarea`
  width: 100%;
  font-size: 14px;
  padding: 8px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  resize: none;
  outline: none;
`;

const SaveButton = styled.button`
  align-self: flex-start;
  background: #0c66e4;
  color: white;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease;
`;

const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const MenuItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: #172b4d;
  background-color: #f1f2f4;
  margin-bottom: 4px;

  &:hover {
    background-color: #e9f2ff;
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const MenuItemDelete = styled(MenuItem)`
  color: #c9372c; // Màu đỏ
  
  &:hover {
    background-color: #ffebe6; // Màu đỏ nhạt khi hover
    color: #ae2a19;
  }
`;