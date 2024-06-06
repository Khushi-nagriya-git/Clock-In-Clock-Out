import * as React from 'react';
import styles from './DashBoard.module.scss';
import type { IDashBoardProps } from './IDashBoardProps';
import Admin from './Admin/Admin';
import User from './User/User';
import DetailRecords from './Admin/DetailRecords';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { SPHttpClient } from "@microsoft/sp-http";
import { useEffect, useState } from 'react';
import { CurrentUserDetails, initialState } from '../../clockInClockOut/StopWatch/IStopWatchStats';
import { Avatar, Grid, Typography } from '@mui/material';

const DashBoard: React.FC<IDashBoardProps> = (props) => {
  const { spHttpClient, absoluteURL, listName, context } = props;
  const [group, setGroup] = useState("");
  const [currentUserDetails, setCurrentUserDetails] = useState<CurrentUserDetails>(initialState.currentUserDetails);
  const getCurrentUserData = async () => {
    try {
      const response = await spHttpClient.get(
        `${absoluteURL}/_api/web/currentuser?$select=Title,Email,Id&$expand=groups`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            Accept: "application/json;odata=nometadata",
            "odata-version": "",
          },
        }
      );
      if (response.ok) {
        const responseJSON = await response.json();
        return responseJSON;
      } else {
        console.log("No data found");
        return null;
      }
    } catch (error) {
      console.log("Error:", error);
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      const userData = await getCurrentUserData();

      if (userData) {
        setCurrentUserDetails(userData);
        userData.Groups.forEach(group => {
          if (group.Title === "CICO Admin") {
            setGroup(group.Title);
          }
        });
      }
    })();
  }, []);
  return (
    <React.Fragment>
   
    {group !== "" ? ( 
      <HashRouter>
            <Routes>
              <Route path="/" element={<Admin spHttpClient={spHttpClient} absoluteURL={absoluteURL} listName={listName} context={context} />} />
              <Route path="/employee/:id" element={<DetailRecords spHttpClient={spHttpClient} absoluteURL={absoluteURL} listName={listName} context={context} />} />
            </Routes>
          </HashRouter>
    ) : (
      <User spHttpClient={spHttpClient} absoluteURL={absoluteURL} listName={listName} context={context}></User>
    )}
  </React.Fragment>
  );
};

export default DashBoard;
