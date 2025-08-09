import React, { useEffect, useRef, useState, useMemo } from 'react';
import styled from 'styled-components';
import { FaPen } from 'react-icons/fa';
import { IoMdCheckmark } from 'react-icons/io';


const DEFAULT_LABELS = [
  { id: 'green', color: '#61bd4f', name: '' },
  { id: 'yellow', color: '#20201bff', name: '' },
  { id: 'orange', color: '#ff9f1a', name: '' },
  { id: 'red', color: '#eb5a46', name: '' },
  { id: 'purple', color: '#c377e0', name: '' },
  { id: 'blue', color: '#0079bf', name: '' },
];

export default function LabelPopup({
  anchorRect,
  labels = [],
  selectedLabelIds = [],
  onToggleLabel,
  onCreateLabel,
  onEditLabel,
  onClose,
  boardId,
  loadingLabels,
  labelError,
}) {
  const popupRef = useRef();
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('list');
  const [editingLabel, setEditingLabel] = useState(null);
  const [newLabel, setNewLabel] = useState({ name: '', color: '' });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        if (mode === 'list') {
          console.log('Closing popup due to click outside in list mode');
          onClose();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, mode]);

  const allLabels = labels.length === 0 ? DEFAULT_LABELS : labels;
  const filteredLabels = useMemo(() =>
    allLabels.filter((label) =>
      label.name.toLowerCase().includes(search.toLowerCase())
    ),
    [allLabels, search]
  );

  const handleModeChange = (newMode) => {
    console.log('Switching mode to:', newMode);
    setMode(newMode);
    if (newMode === 'list') {
      setEditingLabel(null);
      setNewLabel({ name: '', color: '' });
      setSearch('');
    }
  };

  return (
    <Wrapper
      ref={popupRef}
      style={{
        top: Math.min(
          (anchorRect?.bottom ?? window.innerHeight / 2) + window.scrollY + 8,
          window.scrollY + window.innerHeight - 100
        ),
        left: anchorRect?.left
          ? Math.min(anchorRect.left, window.innerWidth - 304)
          : (window.innerWidth - 304) / 2,
      }}
    >
      {mode === 'list' && (
        <>
          <Header>
            <Title>Labels</Title>
            <CloseBtn onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</CloseBtn>
          </Header>

          <SearchInput
            placeholder="Search labels…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loadingLabels ? (
            <Loading>Loading labels...</Loading>
          ) : labelError ? (
            <Error>{labelError}</Error>
          ) : filteredLabels.length === 0 ? (
            <EmptyMessage>No labels found</EmptyMessage>
          ) : (
            <LabelList>
              {filteredLabels.map((label) => {
                const isSelected = selectedLabelIds.includes(label.id);
                return (
                  <LabelItem key={label.id}>
                    <StyledLabelDiv onClick={(e) => { e.stopPropagation(); onToggleLabel(label.id); }}>
                      <Checkbox type="checkbox" checked={isSelected} readOnly />
                      <ColorBlock color={label.color}>
                        <LabelName>{label.name || ''}</LabelName>
                        <EditBtn
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Edit button clicked for label:', label.id);
                            setEditingLabel(label);
                            handleModeChange('edit');
                          }}
                        >
                          <FaPen />
                        </EditBtn>
                      </ColorBlock>
                    </StyledLabelDiv>
                  </LabelItem>
                );
              })}
            </LabelList>
          )}

          <CreateButton onClick={(e) => { e.stopPropagation(); console.log('Create button clicked'); handleModeChange('create'); }}>
            + Create a new label
          </CreateButton>
        </>
      )}

      
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 304px;
  max-width: 90vw;
  height: auto;
  max-height: 80vh;
  overflow-y: auto;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  z-index: 2100;
  position: absolute;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Title = styled.h2`
  font-size: 16px;
  margin: 0;
`;

const CloseBtn = styled.button`
  border: none;
  background: none;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #e9f2ff;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  margin-bottom: 10px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
`;

const LabelList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  max-height: 50vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const LabelItem = styled.li`
  margin-bottom: 6px;
`;

const StyledLabelDiv = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const ColorBlock = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background-color: ${({ color }) => color || '#ccc'};
  border-radius: 4px;
  padding: 6px 10px;
  color: var(--ds-text-inverse);
  font-size: 13px;
  font-weight: 500;
  min-height: 32px;
  overflow: hidden;
  transition: filter 0.2s ease;

  &:hover {
    filter: brightness(1.05);
  }

  &:active {
    filter: brightness(0.95);
  }
`;

const LabelName = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const EditBtn = styled.button`
  background: none;
  border: none;
  color: #172b4d;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover {
    background: #e9f2ff;
    border-radius: 4px;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const CreateButton = styled.button`
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background: #f4f5f7;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #e9f2ff;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 12px;
  color: #172b4d;
`;

const Error = styled.div`
  text-align: center;
  padding: 12px;
  color: #eb5a46;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 12px;
  color: #172b4d;
`;