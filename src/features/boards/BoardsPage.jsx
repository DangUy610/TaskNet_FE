import React from 'react';
import BoardsMainContent from './BoardsMainContent';
import WithHeaderAndSidebarLayout from '../../Layouts/WithHeaderAndSidebarLayout';

export default function BoardsPage() {
  return (
    <WithHeaderAndSidebarLayout>
      <BoardsMainContent />
    </WithHeaderAndSidebarLayout>
  );
}
