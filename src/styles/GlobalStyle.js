// src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* Drag placeholder giống Trello */
  div[data-rbd-placeholder-context-id] {
    background-color: #e0e0e0 !important;
    border-radius: 8px !important;
    min-height: 48px !important;
    margin-bottom: 8px !important;
    transition: background 0.2s ease;
    opacity: 1 !important;
  }
`;

