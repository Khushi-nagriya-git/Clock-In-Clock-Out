import * as React from 'react';
import styles from './DashBoard.module.scss';
import type { IDashBoardProps } from './IDashBoardProps';
import Admin from './Admin/Admin';
import DetailRecords from './Admin/DetailRecords';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const DashBoard: React.FC<IDashBoardProps> = (props) => {
  const { spHttpClient, absoluteURL, listName, context } = props;

  const basePath = "/sites/Stats/_layouts/15/workbench.aspx";

  return (
    <Router basename={basePath}>
      <Routes>
        <Route path="/" element={<Admin spHttpClient={spHttpClient} absoluteURL={absoluteURL} listName={listName} context={context} />} />
        <Route path="/employee/:id" element={<DetailRecords spHttpClient={spHttpClient} absoluteURL={absoluteURL} listName={listName} context={context} />} />
      </Routes>
    </Router>
  );
};

export default DashBoard;
