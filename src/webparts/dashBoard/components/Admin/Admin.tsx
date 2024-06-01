import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from '../DashBoard.module.scss';
import type { IDashBoardProps } from '../IDashBoardProps';
import { SPHttpClient } from '@microsoft/sp-http';
import { totalTime } from "../../../clockInClockOut/StopWatch/TimeCalculation";
import { useNavigate } from 'react-router-dom';
import { UserData, initialState } from './IAdminStats'; // Import initialState from the correct file

import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  KeyboardArrowDownIcon,
  KeyboardArrowUpIcon
} from './MUIImports';

const Admin: React.FC<IDashBoardProps> = (props) => {
  const { spHttpClient, absoluteURL, listName } = props;
  const [userData, setUserData] = useState<UserData[]>(initialState.userData); // Initialize userData with initialState.userData
  const navigate = useNavigate();
  const getListData = async () => {
    try {
      const response = await spHttpClient.get(
        `${absoluteURL}/_api/web/lists/GetByTitle('${listName}')/items?$select=EmployeeID,EmployeeName,Date,Status,TodayTotalTime,TodayFirstIn,TodayLastOut,January,February,March,April,May,June,July,August,September,October,November,December`,
        SPHttpClient.configurations.v1
      );
      if (response.ok) {
        const data = await response.json();
        if (data.value) {
          setUserData(data.value);  
        } else {
          console.log("No data found.");
        }
      } else {
        console.log("No data found.");
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getListData();
  }, []);

  const handleRowClick = (id: any) => {
    navigate(`/employee/${id}`);
  };

  return (
    <div className={styles.dashBoard}>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Employee Name</TableCell>
              <TableCell align="center">Date</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">First IN</TableCell>
              <TableCell align="center">Last OUT</TableCell>
              <TableCell align="center">Total Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userData.map((index: any) => (
              <TableRow
                key={index.EmployeeID}
                onClick={() => handleRowClick(index.EmployeeID)}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
              >
                <TableCell align="center">{index.EmployeeName}</TableCell>
                <TableCell align="center">{index.Date}</TableCell>
                <TableCell align="center">{index.Status}</TableCell>
                <TableCell align="center">{index.TodayFirstIn}</TableCell>
                <TableCell align="center">{index.TodayLastOut}</TableCell>
                <TableCell align="center">{totalTime(index.TodayTotalTime)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Admin;
