// File: FilterPopup.jsx - PHIÊN BẢN ĐÃ ĐƯỢC NÂNG CẤP

import React from 'react';
// 1. Import style từ file chung
import {
  Wrapper, Header, Title, CloseBtn, Section, SectionLabel,
  KeywordInput, CheckboxGroup, CheckboxItem
} from '../../components/popups/Popup.styles';

// 2. Định nghĩa các lựa chọn filter dưới dạng DỮ LIỆU
const createdDateOptions = [
  { value: 'week', label: 'Created in the last week' },
  { value: '2weeks', label: 'Created in the last two weeks' },
  { value: 'month', label: 'Created in the last month' },
];

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'incomplete', label: 'Incomplete' },
];

const dueDateOptions = [
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Due Today' },
    { value: 'week', label: 'This Week' },
    { value: 'none', label: 'No due date' },
];

export default function FilterPopup({
  filter,
  onClose,
  position,
  // 3. Nhận các hàm xử lý từ hook `useSimpleFilter`
  updateKeyword,
  handleSingleSelectChange,
}) {
  return (
    <Wrapper style={{ top: position.top, left: position.left }}>
      <Header>
        <Title>Filter</Title>
        <CloseBtn onClick={onClose}>×</CloseBtn>
      </Header>

      <Section>
        <SectionLabel>Keyword</SectionLabel>
        <KeywordInput
          type="text"
          placeholder="Enter keyword..."
          value={filter.keyword}
          onChange={(e) => updateKeyword(e.target.value)}
        />
      </Section>

      {/* 4. Dùng .map() để render UI từ dữ liệu */}
      <Section>
        <SectionLabel>Created Date</SectionLabel>
        <CheckboxGroup>
          {createdDateOptions.map(option => (
            <CheckboxItem key={option.value} $checked={filter.created === option.value}>
              <input
                type="checkbox"
                checked={filter.created === option.value}
                onChange={() => handleSingleSelectChange('created', option.value)}
              />
              <span>{option.label}</span>
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </Section>
      
      <Section>
        <SectionLabel>Status</SectionLabel>
        <CheckboxGroup>
          {statusOptions.map(option => (
            <CheckboxItem key={option.value} $checked={filter.status === option.value}>
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

      <Section>
        <SectionLabel>Due Date</SectionLabel>
        <CheckboxGroup>
          {dueDateOptions.map(option => (
            <CheckboxItem key={option.value} $checked={filter.due === option.value}>
              <input
                type="checkbox"
                checked={filter.due === option.value}
                onChange={() => handleSingleSelectChange('due', option.value)}
              />
              <span>{option.label}</span>
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </Section>
    </Wrapper>
  );
}


