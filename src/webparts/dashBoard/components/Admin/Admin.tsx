import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from '../DashBoard.module.scss';
import type { IDashBoardProps } from '../IDashBoardProps';
import { SPHttpClient } from '@microsoft/sp-http';
import { totalTime } from "../../../clockInClockOut/StopWatch/TimeCalculation";
import { useNavigate } from 'react-router-dom';
import { UserData, initialState } from './IAdminStats';
import { Box, ClearIcon, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, InputAdornment, TextField, SearchIcon, Avatar, Skeleton } from './MUIImports';
import { TableSortLabel } from '@mui/material';

const Admin: React.FC<IDashBoardProps> = (props) => {
  const { spHttpClient, absoluteURL, listName } = props;
  const [userData, setUserData] = useState<UserData[]>(initialState.userData); // Initialize userData with initialState.userData
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState('EmployeeName');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getListData = async () => {
    try {
      const response = await spHttpClient.get(
        `${absoluteURL}/_api/web/lists/GetByTitle('${listName}')/items?$select=EmployeeID,EmployeeName,Email,Date,Status,TodayTotalTime,TodayFirstIn,TodayLastOut,January,February,March,April,May,June,July,August,September,October,November,December`,
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

  const handleChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z]*$/;
    if (regex.test(value)) {
      setSearchQuery(value);
      setError(false);
    } else {
      setError(true);
    }
  };

  const getStatusImage = (status) => {
    if (status === 'IN') {
      return (
        <img
          src={require("../../assets/GreenDot.png")}
          alt="IN Status"
          style={{ width: 30, height: 30, marginRight: 0 }}
        />
      );
    } else if (status === 'OUT') {
      return (
        <img
          src={require("../../assets/RedDot.png")}
          alt="OUT Status"
          style={{ width: 30, height: 30, marginRight: 0 }}
        />
      );
    }
    return null;
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const filteredUserData = stableSort(
    userData.filter(user =>
      user.EmployeeName && user.Status &&
      (user.EmployeeName.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1 ||
        user.Status.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1)
    ),
    getComparator(order, orderBy)
  );

  return (
    <div className={styles.dashBoard}>
      {userData && userData.length > 0 ? (
        <>
          <Box className={styles.Header}>
            <Typography align="center" variant="h6" sx={{ color: 'White' }}>
              All Users Work Logs
            </Typography></Box>
          <Box className={styles.searchContainer}>
            <TextField
              variant="outlined"
              label="Search by name and status"
              value={searchQuery}
              onChange={handleChange}
              size="small"
              error={error}
              helperText={error ? "Only letters are allowed" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {searchQuery && (
                      <IconButton onClick={() => setSearchQuery('')} size="small">
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
                style: { padding: '0 5px' }
              }}
              inputProps={{
                style: { height: '40px', padding: '0 5px' }
              }}
              style={{ width: '100%', margin: '10px 0' }}
            /></Box>
          <TableContainer component={Paper} sx={{ mt: 5 }} >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow >
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600", ml: 5 }}>
                    <TableSortLabel
                      active={orderBy === 'EmployeeName'}
                      direction={orderBy === 'EmployeeName' ? order : 'asc'}
                      onClick={() => handleRequestSort('EmployeeName')}
                    >
                      Employee Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600", ml: 5 }}>
                    <TableSortLabel
                      active={orderBy === 'Date'}
                      direction={orderBy === 'Date' ? order : 'asc'}
                      onClick={() => handleRequestSort('Date')}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600", ml: 5 }}>
                    <TableSortLabel
                      active={orderBy === 'Status'}
                      direction={orderBy === 'Status' ? order : 'asc'}
                      onClick={() => handleRequestSort('Status')}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600", ml: 5 }}>
                    <TableSortLabel
                      active={orderBy === 'TodayFirstIn'}
                      direction={orderBy === 'TodayFirstIn' ? order : 'asc'}
                      onClick={() => handleRequestSort('TodayFirstIn')}
                    >
                      First In
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600", ml: 5 }}>
                    <TableSortLabel
                      active={orderBy === 'TodayLastOut'}
                      direction={orderBy === 'TodayLastOut' ? order : 'asc'}
                      onClick={() => handleRequestSort('TodayLastOut')}
                    >
                      Last Out
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600", ml: 5 }}>
                    <TableSortLabel
                      active={orderBy === 'TodayTotalTime'}
                      direction={orderBy === 'TodayTotalTime' ? order : 'asc'}
                      onClick={() => handleRequestSort('TodayTotalTime')}
                    >
                      Total Time
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600", ml: 5 }}>
                    Details
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUserData.map((index: any) => (
                  <TableRow
                    key={index.EmployeeID}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="left" sx={{ ml: 5 }} >
                      <Box display="flex" alignItems="left" justifyContent="left"  >
                        <Avatar
                          alt={index.EmployeeName}
                          src={`${props.context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?accountname=${index.Email}&Size=S`}
                          style={{ marginRight: 8, height: "30px", width: "30px" }}
                        />
                        <Box sx={{ mt:0.5  }}> 
                          {index.EmployeeName}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="left" sx={{ ml: 5 }}>{index.Date}</TableCell>
                    <TableCell align="left" sx={{ ml: 5 }}>
                      <Box display="flex" alignItems="left" justifyContent="left">
                        {getStatusImage(index.Status)}  <Box sx={{ mt:0.5  }}>
                        {index.Status}</Box>
                        </Box>
                    </TableCell>
                    <TableCell align="left" sx={{ ml: 5 }}>{index.TodayFirstIn}</TableCell>
                    <TableCell align="left" sx={{ ml: 5 }}>{index.TodayLastOut}</TableCell>
                    <TableCell align="left" sx={{ ml: 5 }}>{totalTime(index.TodayTotalTime)}</TableCell>
                    <TableCell align="left" >
                      <IconButton aria-label="Detail Logs">
                        <img src={require("../../assets/eye.png")} alt="Timer Button" onClick={() => handleRowClick(index.EmployeeID)} style={{ width: 30, height: 30, cursor: 'pointer' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>) : (
        <Box sx={{ width: "100%" }}>
          <Skeleton />
          <Skeleton animation="wave" />
          <Skeleton animation={false} />
        </Box>
      )}
    </div>
  );
};

export default Admin;
