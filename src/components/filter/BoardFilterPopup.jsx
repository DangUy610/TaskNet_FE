// ✅ BoardFilterPopup.jsx – Giao diện chuẩn Trello (có Keyword)

import React from 'react';
import styled from 'styled-components';
import { FaUser } from 'react-icons/fa';
import LabelFilterItem from './LabelFilterItem';
import MemberFilterItem from './MemberFilterItem';

import {
  Wrapper,
  Header,
  Title,
  CloseBtn,
  Section,
  SectionLabel,
  KeywordInput,
  SubText,
  CheckboxGroup,
  CheckboxItem,
} from '../../components/popups/Popup.styles';

const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'doing', label: 'Doing' },
    { value: 'done', label: 'Done' }
  ];

const dueOptions = [
  { value: 'none', label: 'No dates' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due in the next day' },
  { value: 'week', label: 'Due in the next week' },
  { value: 'month', label: 'Due in the next month' }
];



export default function BoardFilterPopup({ 
  filter,
  onClose,
  position,
  members = [],
  labels = [],
  // Nhận các hàm xử lý đã được tạo từ hook
  updateKeyword,
  toggleArrayItem,
  handleSingleSelectChange,
  
}) {
  
    return (
        <Wrapper style={{ top: position.top, left: position.left }}>
        <Header>
            <Title>Filter</Title>
            <CloseBtn onClick={onClose}>×</CloseBtn>
        </Header>

        {/* 🔍 Keyword */}
        <Section>
            <KeywordInput
            type="text"
            placeholder="Enter a keyword..."
            value={filter.keyword}
            onChange={(e) => updateKeyword(e.target.value)}
            />
            <SubText>Search cards, members, labels, and more.</SubText>
        </Section>

        
        {/* Members */}
        <Section>
          <SectionLabel>Members</SectionLabel>
          <CheckboxGroup>
            {members.map((m) => (
              <MemberFilterItem
                key={m.id}
                member={m}
                checked={filter.members.includes(m.id)}
                onToggle={() => toggleArrayItem('members', m.id)}
              />
            ))}
          </CheckboxGroup>
        </Section>

        {/* Card status */}
        <Section>
          <SectionLabel>Card status</SectionLabel>
          <CheckboxGroup>
            {statusOptions.map(option => (
              <CheckboxItem 
              key={option.value}
              $checked={filter.status === option.value}
              >
                <input
                  type="checkbox"
                  checked={filter.status === option.value}
                  onChange={() => handleSingleSelectChange('status', option.value)}
                />
                <span>{option.label}</span>
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </Section>

        {/* ⏰ Due Date */}
        <Section>
          <SectionLabel>Due date</SectionLabel>
          <CheckboxGroup>
            {dueOptions.map(option => (
              <CheckboxItem 
                key={option.value}
                $checked={filter.status === option.value}
                >
                  <input
                      type="checkbox"
                      $checked={filter.due === option.value}
                      onChange={() => handleSingleSelectChange('due', option.value)}
                  />
                  <span>{option.label}</span>
              </CheckboxItem>
            ))}
            </CheckboxGroup>
          </Section>         

        {/* 🏷 Labels */}
        <Section>
            <SectionLabel>Labels</SectionLabel>
            <CheckboxGroup>
                {labels.map((label) => (
                <LabelFilterItem
                    key={label.id}
                    label={label}
                    checked={filter.labels.includes(label.id)}
                    onToggle={() => toggleArrayItem('labels', label.id)}
                />
                ))}
            </CheckboxGroup>
        </Section>
        </Wrapper>
    );
}

