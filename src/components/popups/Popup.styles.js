import styled from 'styled-components';

export const Wrapper = styled.div`
  position: absolute;
  background: white;
  width: 320px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0px 8px 12px rgba(0, 0, 0, 0.12);
  z-index: 999;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const Title = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #172b4d;
  margin: 0;
`;

export const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  color: #44546f;
  line-height: 1;

  &:hover {
    color: #172b4d;
  }
`;

export const Section = styled.div`
  margin-bottom: 16px;
`;

export const SectionLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #172b4d;
`;

export const SubText = styled.div`
  font-size: 12px;
  color: #5e6c84;
  margin-top: 4px;
`;

export const KeywordInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  outline: none;
  transition: all 0.2s ease;
  &:focus {
    border-color: #0c66e4;
    box-shadow: 0 0 0 2px rgba(0, 102, 228, 0.3);
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #172b4d;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.2s;
  &:hover {
    background: #f1f2f4;
  }

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #0c66e4;
  }

  span {
    color: #172b4d;
  }
`;
