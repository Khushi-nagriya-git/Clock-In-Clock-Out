import * as React from 'react';
import styles from './DashBoard.module.scss';
import type { IDashBoardProps } from './IDashBoardProps';
import Admin from './Admin/Admin';
import DetailRecords from './Admin/DetailRecords';
import { HashRouter, Routes, Route } from 'react-router-dom';


const DashBoard: React.FC<IDashBoardProps> = (props) => {
  const { spHttpClient, absoluteURL, listName, context } = props;

  const basePath = window.location.pathname;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Admin spHttpClient={spHttpClient} absoluteURL={absoluteURL} listName={listName} context={context} />} />
        <Route path="/employee/:id" element={<DetailRecords spHttpClient={spHttpClient} absoluteURL={absoluteURL} listName={listName} context={context} />} />
      </Routes>
    </HashRouter>
  );
};

export default DashBoard;
