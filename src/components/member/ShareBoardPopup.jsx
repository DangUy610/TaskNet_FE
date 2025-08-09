import React, { useEffect, useState, useCallback, useReducer, useMemo } from 'react';
import styled from 'styled-components';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';
import { FaTimes, FaLink, FaCopy, FaTrash, FaChevronDown, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

import {
  addMemberToBoard,
  fetchBoardMembers,
  updateMemberRole,
  removeMember,
  generateShareLink,
  deleteShareLink,
  getShareLink,
} from '../../api/boardApi';
import { searchUsers } from '../../api/authApi';

// Constants
const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.EDITOR]: 'Member',
  [ROLES.VIEWER]: 'Observer',
};

const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Can edit and manage board settings',
  [ROLES.EDITOR]: 'Can add and edit cards',
  [ROLES.VIEWER]: 'Can only view board content',
};

const LOADING_STATES = {
  INITIAL: 'initial',
  SEARCH: 'search',
  MEMBER_ACTION: 'memberAction',
  LINK_ACTION: 'linkAction',
};

const ERROR_TYPES = {
  GENERAL: 'general',
  SEARCH: 'search',
  MEMBER_ACTION: 'memberAction',
  LINK_ACTION: 'linkAction',
};

// State reducer for better state management
const initialState = {
  members: [],
  searchQuery: '',
  searchResults: [],
  inviteToken: null,
  selectedRole: ROLES.EDITOR,
  loading: {
    [LOADING_STATES.INITIAL]: true,
    [LOADING_STATES.SEARCH]: false,
    [LOADING_STATES.MEMBER_ACTION]: false,
    [LOADING_STATES.LINK_ACTION]: false,
  },
  errors: {
    [ERROR_TYPES.GENERAL]: null,
    [ERROR_TYPES.SEARCH]: null,
    [ERROR_TYPES.MEMBER_ACTION]: null,
    [ERROR_TYPES.LINK_ACTION]: null,
  },
  ui: {
    openDropdowns: new Set(),
  },
};

function stateReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.loadingType]: action.value },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.errorType]: action.error },
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.errorType]: null },
      };
    
    case 'SET_MEMBERS':
      return { ...state, members: action.members };
    
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.member] };
    
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map(member =>
          member.user.id === action.userId
            ? { ...member, role: action.newRole }
            : member
        ),
      };
    
    case 'REMOVE_MEMBER':
      return {
        ...state,
        members: state.members.filter(member => member.user.id !== action.userId),
      };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };
    
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.results };
    
    case 'CLEAR_SEARCH':
      return { ...state, searchQuery: '', searchResults: [] };
    
    case 'SET_INVITE_TOKEN':
      return { ...state, inviteToken: action.token };
    
    case 'SET_SELECTED_ROLE':
      return { ...state, selectedRole: action.role };
    
    case 'TOGGLE_DROPDOWN':
      const newDropdowns = new Set(state.ui.openDropdowns);
      if (newDropdowns.has(action.dropdownId)) {
        newDropdowns.delete(action.dropdownId);
      } else {
        newDropdowns.clear(); // Close all other dropdowns
        newDropdowns.add(action.dropdownId);
      }
      return {
        ...state,
        ui: { ...state.ui, openDropdowns: newDropdowns },
      };
    
    case 'CLOSE_ALL_DROPDOWNS':
      return {
        ...state,
        ui: { ...state.ui, openDropdowns: new Set() },
      };
    
    default:
      return state;
  }
}

// Custom hooks
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};

const useAsyncOperation = (operation, dependencies = []) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation(...args);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return { execute, loading, error };
};

// Components
const MemberItem = React.memo(({ member, boardOwnerId, onRoleChange, onRemove, isDropdownOpen, onToggleDropdown }) => {
  const isOwner = member.user.id === boardOwnerId;
  const dropdownRef = React.useRef(null);

  useClickOutside(dropdownRef, () => {
    if (isDropdownOpen) onToggleDropdown();
  });

  const handleRoleChange = useCallback((newRole) => {
    onRoleChange(member.user.id, newRole);
    onToggleDropdown();
  }, [member.user.id, onRoleChange, onToggleDropdown]);

  const handleRemove = useCallback(() => {
    if (window.confirm(`Remove ${member.user.display_name || member.user.username} from this board?`)) {
      onRemove(member);
    }
  }, [member, onRemove]);

  const avatarUrl = useMemo(() => {
    return member.user.avatar || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.display_name || member.user.username)}&background=0c66e4&color=fff&size=32`;
  }, [member.user]);

  return (
    <MemberItemWrapper>
      <MemberAvatar 
        src={avatarUrl}
        alt={member.user.display_name || member.user.username}
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.display_name || member.user.username)}&background=0c66e4&color=fff&size=32`;
        }}
      />
      
      <MemberInfo>
        <MemberName>{member.user.display_name || member.user.username}</MemberName>
        <MemberEmail>{member.user.email}</MemberEmail>
      </MemberInfo>

      {isOwner ? (
        <OwnerBadge>Owner</OwnerBadge>
      ) : (
        <MemberActions>
          <RoleDropdownContainer ref={dropdownRef}>
            <RoleDropdownTrigger 
              onClick={onToggleDropdown}
              $isOpen={isDropdownOpen}
              disabled={isOwner}
            >
              {ROLE_LABELS[member.role] || 'Member'}
              <FaChevronDown size={12} />
            </RoleDropdownTrigger>
            
            {isDropdownOpen && (
              <RoleDropdownMenu>
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  role !== ROLES.OWNER && (
                    <RoleDropdownItem 
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      $isSelected={member.role === role}
                    >
                      <RoleInfo>
                        <RoleName>{label}</RoleName>
                        <RoleDescription>{ROLE_DESCRIPTIONS[role]}</RoleDescription>
                      </RoleInfo>
                    </RoleDropdownItem>
                  )
                ))}
              </RoleDropdownMenu>
            )}
          </RoleDropdownContainer>
          
          <RemoveButton 
            onClick={handleRemove}
            title="Remove member"
          >
            <FaTimes size={12} />
          </RemoveButton>
        </MemberActions>
      )}
    </MemberItemWrapper>
  );
});

const SearchResultItem = React.memo(({ user, onSelect, selectedRole }) => {
  const avatarUrl = useMemo(() => {
    return user.avatar || 
           `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username)}&background=0c66e4&color=fff&size=32`;
  }, [user]);

  const handleSelect = useCallback(() => {
    onSelect(user, selectedRole);
  }, [user, selectedRole, onSelect]);

  return (
    <SearchResultWrapper onClick={handleSelect}>
      <MemberAvatar 
        src={avatarUrl}
        alt={user.display_name || user.username}
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username)}&background=0c66e4&color=fff&size=32`;
        }}
      />
      <MemberInfo>
        <MemberName>{user.display_name || user.username}</MemberName>
        <MemberEmail>{user.email}</MemberEmail>
      </MemberInfo>
      <RoleBadge>{ROLE_LABELS[selectedRole]}</RoleBadge>
    </SearchResultWrapper>
  );
});

const ShareLinkSection = React.memo(({ 
  inviteLink, 
  onCopyLink, 
  onCreateLink, 
  onDeleteLink, 
  isLoading 
}) => (
  <LinkSectionWrapper>
    <LinkHeader>
      <FaLink size={14} />
      <LinkTitle>Share this board with a link</LinkTitle>
    </LinkHeader>
    
    {inviteLink ? (
      <LinkControls>
        <LinkDescription>Anyone with this link can join as a member</LinkDescription>
        <LinkUrl>{inviteLink}</LinkUrl>
        <LinkActions>
          <SecondaryButton onClick={onCopyLink} disabled={isLoading}>
            <FaCopy size={12} />
            Copy link
          </SecondaryButton>
          <DangerButton onClick={onDeleteLink} disabled={isLoading}>
            {isLoading ? <FaSpinner className="spin" size={12} /> : <FaTrash size={12} />}
            Delete
          </DangerButton>
        </LinkActions>
      </LinkControls>
    ) : (
      <LinkControls>
        <LinkDescription>Create a link that allows anyone to join this board</LinkDescription>
        <SecondaryButton onClick={onCreateLink} disabled={isLoading}>
          {isLoading ? <FaSpinner className="spin" size={12} /> : 'Create link'}
        </SecondaryButton>
      </LinkControls>
    )}
  </LinkSectionWrapper>
));

const ErrorBoundary = ({ error, onRetry, children }) => {
  if (error) {
    return (
      <ErrorContainer>
        <FaExclamationTriangle size={24} />
        <ErrorMessage>{error.message || 'Something went wrong'}</ErrorMessage>
        {onRetry && (
          <SecondaryButton onClick={onRetry}>Try Again</SecondaryButton>
        )}
      </ErrorContainer>
    );
  }
  return children;
};

// Main component
export default function ShareBoardPopup({ boardId, onClose, boardOwnerId }) {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  const [debouncedSearch] = useDebounce(state.searchQuery, 300);
  const popupRef = React.useRef(null);

  // Close popup on ESC key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close dropdowns when clicking outside
  useClickOutside(popupRef, () => {
    dispatch({ type: 'CLOSE_ALL_DROPDOWNS' });
  });

  // Derived state
  const inviteLink = useMemo(() => {
    return state.inviteToken ? `${window.location.origin}/join/${state.inviteToken}` : '';
  }, [state.inviteToken]);

  const memberIds = useMemo(() => {
    return new Set(state.members.map(m => m.user.id).concat([boardOwnerId]));
  }, [state.members, boardOwnerId]);

  const filteredSearchResults = useMemo(() => {
    return state.searchResults.filter(user => !memberIds.has(user.id));
  }, [state.searchResults, memberIds]);

  // Error handling
  const handleError = useCallback((error, errorType = ERROR_TYPES.GENERAL) => {
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'An unexpected error occurred';
    
    dispatch({ type: 'SET_ERROR', errorType, error: { message } });
    toast.error(message);
    console.error(`ShareBoardPopup Error (${errorType}):`, error);
  }, []);

  const clearError = useCallback((errorType) => {
    dispatch({ type: 'CLEAR_ERROR', errorType });
  }, []);

  // Load initial data
  const { execute: loadInitialData } = useAsyncOperation(async () => {
    const [membersResponse, linkResponse] = await Promise.allSettled([
      fetchBoardMembers(boardId),
      getShareLink(boardId)
    ]);

    if (membersResponse.status === 'fulfilled') {
      dispatch({ type: 'SET_MEMBERS', members: membersResponse.value.data || [] });
    } else {
      throw membersResponse.reason;
    }

    if (linkResponse.status === 'fulfilled' && linkResponse.value?.data?.token) {
      dispatch({ type: 'SET_INVITE_TOKEN', token: linkResponse.value.data.token });
    }
  }, [boardId]);

  useEffect(() => {
    loadInitialData().catch((error) => {
      handleError(error, ERROR_TYPES.GENERAL);
    }).finally(() => {
      dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.INITIAL, value: false });
    });
  }, [loadInitialData, handleError]);

  // Search users
  const { execute: performSearch } = useAsyncOperation(async (query) => {
    if (query.length < 2) {
      dispatch({ type: 'SET_SEARCH_RESULTS', results: [] });
      return;
    }

    const response = await searchUsers(query);
    dispatch({ type: 'SET_SEARCH_RESULTS', results: response.data || [] });
  }, []);

  useEffect(() => {
    if (debouncedSearch !== state.searchQuery) return;

    dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.SEARCH, value: true });
    clearError(ERROR_TYPES.SEARCH);

    performSearch(debouncedSearch)
      .catch((error) => handleError(error, ERROR_TYPES.SEARCH))
      .finally(() => {
        dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.SEARCH, value: false });
      });
  }, [debouncedSearch, state.searchQuery, performSearch, handleError, clearError]);

  // Event handlers
  const { execute: inviteUser } = useAsyncOperation(async (user, role) => {
    if (!user?.id) {
      throw new Error('Invalid user selected');
    }

    if (memberIds.has(user.id)) {
      throw new Error('User is already a member');
    }

    const response = await addMemberToBoard(boardId, user.id, role);
    dispatch({ type: 'ADD_MEMBER', member: response.data });
    dispatch({ type: 'CLEAR_SEARCH' });
    toast.success(`${user.display_name || user.username} has been added to the board`);
  }, [boardId, memberIds]);

  const handleInviteUser = useCallback(async (user, role = state.selectedRole) => {
    dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.MEMBER_ACTION, value: true });
    clearError(ERROR_TYPES.MEMBER_ACTION);

    try {
      await inviteUser(user, role);
    } catch (error) {
      handleError(error, ERROR_TYPES.MEMBER_ACTION);
    } finally {
      dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.MEMBER_ACTION, value: false });
    }
  }, [state.selectedRole, inviteUser, handleError, clearError]);

  const { execute: changeRole } = useAsyncOperation(async (userId, newRole) => {
    await updateMemberRole(boardId, userId, newRole);
    dispatch({ type: 'UPDATE_MEMBER', userId, newRole });
    toast.success('Role updated successfully');
  }, [boardId]);

  const handleRoleChange = useCallback(async (userId, newRole) => {
    dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.MEMBER_ACTION, value: true });
    clearError(ERROR_TYPES.MEMBER_ACTION);

    try {
      await changeRole(userId, newRole);
    } catch (error) {
      handleError(error, ERROR_TYPES.MEMBER_ACTION);
    } finally {
      dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.MEMBER_ACTION, value: false });
    }
  }, [changeRole, handleError, clearError]);

  const { execute: removeMemberFromBoard } = useAsyncOperation(async (member) => {
    await removeMember(boardId, member.user.id);
    dispatch({ type: 'REMOVE_MEMBER', userId: member.user.id });
    toast.success(`${member.user.display_name || member.user.username} has been removed`);
  }, [boardId]);

  const handleRemoveMember = useCallback(async (member) => {
    dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.MEMBER_ACTION, value: true });
    clearError(ERROR_TYPES.MEMBER_ACTION);

    try {
      await removeMemberFromBoard(member);
    } catch (error) {
      handleError(error, ERROR_TYPES.MEMBER_ACTION);
    } finally {
      dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.MEMBER_ACTION, value: false });
    }
  }, [removeMemberFromBoard, handleError, clearError]);

  const { execute: createShareLink } = useAsyncOperation(async () => {
    const response = await generateShareLink(boardId);
    dispatch({ type: 'SET_INVITE_TOKEN', token: response.data.token });
    toast.success('Share link created');
  }, [boardId]);

  const handleCreateLink = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.LINK_ACTION, value: true });
    clearError(ERROR_TYPES.LINK_ACTION);

    try {
      await createShareLink();
    } catch (error) {
      handleError(error, ERROR_TYPES.LINK_ACTION);
    } finally {
      dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.LINK_ACTION, value: false });
    }
  }, [createShareLink, handleError, clearError]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Link copied to clipboard');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard');
    }
  }, [inviteLink]);

  const { execute: removeShareLink } = useAsyncOperation(async () => {
    await deleteShareLink(boardId);
    dispatch({ type: 'SET_INVITE_TOKEN', token: null });
    toast.success('Share link deleted');
  }, [boardId]);

  const handleDeleteLink = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this share link? Anyone with the current link will no longer be able to join.')) {
      return;
    }

    dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.LINK_ACTION, value: true });
    clearError(ERROR_TYPES.LINK_ACTION);

    try {
      await removeShareLink();
    } catch (error) {
      handleError(error, ERROR_TYPES.LINK_ACTION);
    } finally {
      dispatch({ type: 'SET_LOADING', loadingType: LOADING_STATES.LINK_ACTION, value: false });
    }
  }, [removeShareLink, handleError, clearError]);

  const handleToggleDropdown = useCallback((memberId) => {
    dispatch({ type: 'TOGGLE_DROPDOWN', dropdownId: `member-${memberId}` });
  }, []);

  if (state.loading.initial) {
    return (
      <PopupOverlay onClick={onClose}>
        <PopupContainer onClick={e => e.stopPropagation()}>
          <LoadingState>
            <FaSpinner className="spin" size={24} />
            <span>Loading board data...</span>
          </LoadingState>
        </PopupContainer>
      </PopupOverlay>
    );
  }

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContainer ref={popupRef} onClick={e => e.stopPropagation()}>
        <PopupHeader>
          <PopupTitle>Share board</PopupTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </PopupHeader>

        <PopupContent>
          <ErrorBoundary 
            error={state.errors.general} 
            onRetry={() => {
              clearError(ERROR_TYPES.GENERAL);
              loadInitialData();
            }}
          >
            {/* Search Section */}
            <SearchSection>
              <SearchInputWrapper>
                <SearchInput
                  type="email"
                  placeholder="Email address or name"
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value })}
                  disabled={state.loading.memberAction}
                />
                <MemberRoleSelect
                  value={state.selectedRole}
                  onChange={(e) => dispatch({ type: 'SET_SELECTED_ROLE', role: e.target.value })}
                  disabled={state.loading.memberAction}
                >
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.EDITOR}>Member</option>
                  <option value={ROLES.VIEWER}>Observer</option>
                </MemberRoleSelect>
                <PrimaryButton 
                  onClick={() => filteredSearchResults.length > 0 && handleInviteUser(filteredSearchResults[0])}
                  disabled={!filteredSearchResults.length || state.loading.memberAction}
                >
                  {state.loading.memberAction ? (
                    <FaSpinner className="spin" size={12} />
                  ) : (
                    'Share'
                  )}
                </PrimaryButton>
              </SearchInputWrapper>

              {/* Search Results */}
              {(state.loading.search || filteredSearchResults.length > 0) && (
                <SearchResultsList>
                  {state.loading.search && (
                    <SearchLoadingItem>
                      <FaSpinner className="spin" size={16} />
                      <span>Searching...</span>
                    </SearchLoadingItem>
                  )}
                  {filteredSearchResults.map(user => (
                    <SearchResultItem
                      key={user.id}
                      user={user}
                      selectedRole={state.selectedRole}
                      onSelect={handleInviteUser}
                    />
                  ))}
                  {!state.loading.search && filteredSearchResults.length === 0 && state.searchQuery.length >= 2 && (
                    <SearchLoadingItem>
                      No users found matching "{state.searchQuery}"
                    </SearchLoadingItem>
                  )}
                </SearchResultsList>
              )}

              {state.errors.search && (
                <ErrorMessage>{state.errors.search.message}</ErrorMessage>
              )}
            </SearchSection>

            {/* Share Link Section */}
            <ShareLinkSection
              inviteLink={inviteLink}
              onCopyLink={handleCopyLink}
              onCreateLink={handleCreateLink}
              onDeleteLink={handleDeleteLink}
              isLoading={state.loading.linkAction}
            />

            {state.errors.linkAction && (
              <ErrorMessage>{state.errors.linkAction.message}</ErrorMessage>
            )}

            {/* Members Section */}
            <MembersSection>
              <SectionHeader>
                <SectionTitle>Board members</SectionTitle>
                <MemberCount>{state.members.length}</MemberCount>
              </SectionHeader>

              {state.errors.memberAction && (
                <ErrorMessage>{state.errors.memberAction.message}</ErrorMessage>
              )}

              <MembersList>
                {state.members.length > 0 ? (
                  state.members.map(member => (
                    <MemberItem
                      key={member.user.id}
                      member={member}
                      boardOwnerId={boardOwnerId}
                      onRoleChange={handleRoleChange}
                      onRemove={handleRemoveMember}
                      isDropdownOpen={state.ui.openDropdowns.has(`member-${member.user.id}`)}
                      onToggleDropdown={() => handleToggleDropdown(member.user.id)}
                    />
                  ))
                ) : (
                  <EmptyState>This board has no members yet.</EmptyState>
                )}
              </MembersList>
            </MembersSection>
          </ErrorBoundary>
        </PopupContent>
      </PopupContainer>
    </PopupOverlay>
  );
}

// Styled Components
const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

const PopupContainer = styled.div`
  width: 100%;
  max-width: 584px;
  max-height: 90vh;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(9, 30, 66, 0.3);
  display: flex;
  flex-direction: column;
  margin: 20px;
  overflow: hidden;
`;

const PopupHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #dfe1e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: #f8f9fa;
`;

const PopupTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #172b4d;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b778c;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e4e6ea;
    color: #172b4d;
  }
`;

const PopupContent = styled.div`
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const SearchSection = styled.div`
  position: relative;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #dfe1e6;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0c66e4;
    box-shadow: 0 0 0 3px rgba(12, 102, 228, 0.1);
  }

  &::placeholder {
    color: #6b778c;
  }

  &:disabled {
    background: #f4f5f7;
    color: #6b778c;
    cursor: not-allowed;
  }
`;

const MemberRoleSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #dfe1e6;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  min-width: 120px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #0c66e4;
    box-shadow: 0 0 0 3px rgba(12, 102, 228, 0.1);
  }

  &:disabled {
    background: #f4f5f7;
    color: #6b778c;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled.button`
  background: #0c66e4;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #0052cc;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(12, 102, 228, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #dfe1e6;
    color: #6b778c;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SecondaryButton = styled.button`
  background: #f4f5f7;
  color: #44546f;
  border: 1px solid #dfe1e6;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #e4e6ea;
    border-color: #c1c7d0;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .spin {
    animation: spin 1s linear infinite;
  }
`;

const DangerButton = styled(SecondaryButton)`
  color: #c9372c;
  
  &:hover:not(:disabled) {
    background: #ffebe6;
    border-color: #ffbdad;
    color: #ae2a19;
  }
`;

const SearchResultsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dfe1e6;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  max-height: 280px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 8px;
`;

const SearchResultWrapper = styled.div`
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f4f5f7;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f4f5f7;
  }
`;

const SearchLoadingItem = styled.div`
  padding: 20px;
  text-align: center;
  color: #6b778c;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .spin {
    animation: spin 1s linear infinite;
  }
`;

const RoleBadge = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #6b778c;
  background: #f4f5f7;
  padding: 4px 8px;
  border-radius: 12px;
`;

const LinkSectionWrapper = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e4e6ea;
`;

const LinkHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

const LinkTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #172b4d;
`;

const LinkControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LinkDescription = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6b778c;
  line-height: 1.4;
`;

const LinkUrl = styled.div`
  background: white;
  border: 1px solid #dfe1e6;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 13px;
  color: #172b4d;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  word-break: break-all;
  background: #f8f9fa;
`;

const LinkActions = styled.div`
  display: flex;
  gap: 12px;
`;

const MembersSection = styled.div``;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f4f5f7;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #172b4d;
`;

const MemberCount = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #6b778c;
  background: #e4e6ea;
  padding: 4px 10px;
  border-radius: 12px;
`;

const MembersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MemberItemWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f4f5f7;

  &:last-child {
    border-bottom: none;
  }
`;

const MemberAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  border: 2px solid #f4f5f7;
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MemberName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #172b4d;
  margin-bottom: 4px;
`;

const MemberEmail = styled.div`
  font-size: 12px;
  color: #6b778c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MemberActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RoleDropdownContainer = styled.div`
  position: relative;
`;

const RoleDropdownTrigger = styled.button`
  background: #f4f5f7;
  border: 1px solid #dfe1e6;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;

  &:hover:not(:disabled) {
    background: #e4e6ea;
    border-color: #c1c7d0;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.2s ease;
    color: #6b778c;
  }
`;

const RoleDropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #dfe1e6;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 20;
  margin-top: 4px;
  min-width: 200px;
  max-height: 200px;
  overflow-y: auto;
`;

const RoleDropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  background: ${({ $isSelected }) => $isSelected ? '#e4e6ea' : 'transparent'};

  &:hover {
    background: #f4f5f7;
  }

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const RoleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const RoleName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #172b4d;
`;

const RoleDescription = styled.span`
  font-size: 11px;
  color: #6b778c;
  line-height: 1.3;
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: #6b778c;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #ffebe6;
    color: #c9372c;
    transform: scale(1.1);
  }
`;

const OwnerBadge = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #0c66e4;
  background: #e7f2ff;
  padding: 6px 12px;
  border-radius: 12px;
  border: 1px solid #b3d4ff;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #6b778c;
  font-size: 14px;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dfe1e6;
`;

const LoadingState = styled.div`
  text-align: center;
  color: #6b778c;
  font-size: 14px;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .spin {
    animation: spin 1s linear infinite;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #c9372c;
  background: #ffebe6;
  border-radius: 8px;
  border: 1px solid #ffbdad;
`;

const ErrorMessage = styled.div`
  color: #c9372c;
  font-size: 13px;
  padding: 8px 12px;
  background: #ffebe6;
  border: 1px solid #ffbdad;
  border-radius: 6px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:before {
    content: '⚠️';
    font-size: 12px;
  }
`;