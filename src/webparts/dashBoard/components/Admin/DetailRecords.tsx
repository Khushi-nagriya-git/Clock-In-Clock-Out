import * as React from 'react';
import { useParams } from 'react-router-dom';
import { IDashBoardProps } from '../IDashBoardProps';
import { SPHttpClient } from '@microsoft/sp-http';
import styles from '../DashBoard.module.scss';
import { UserData, initialState, DetailRecord, InOutDetail } from './IAdminStats';
import { useEffect, useState } from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Grid, Typography, Avatar, Box, styled, Dialog, DialogTitle, TablePagination } from '@mui/material';
import { formatTimeFromTimestamp, totalTime } from '../../../clockInClockOut/StopWatch/TimeCalculation';
import CloseIcon from '@mui/icons-material/Close';

const DetailRecords: React.FC<IDashBoardProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const { spHttpClient, absoluteURL, listName } = props;
  const [userRecords, setUserRecords] = useState<UserData>(initialState.userData[0]);
  const [monthRecords, setMonthRecords] = useState<DetailRecord[]>(initialState.detailRecord);
  const [open, setOpen] = useState(false);
  const [Logs, setLogs] = useState<InOutDetail[]>(initialState.inOutDetail);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const currentMonth = new Date().getMonth();
  const [dialogPage, setDialogPage] = useState(0);
  const [dialogRowsPerPage, setDialogRowsPerPage] = useState(5);
  const [selectedMonth, setSelectedMonth] = useState(0);

  const getEmployeeDetails = async (employeeId: string | undefined) => {
    try {
      const response = await spHttpClient.get(
        `${absoluteURL}/_api/web/lists/GetByTitle('${listName}')/items?$select=EmployeeID,EmployeeName,Email,Date,Status,TodayTotalTime,TodayFirstIn,TodayLastOut,January,February,March,April,May,June,July,August,September,October,November,December&$filter=EmployeeID eq '${employeeId}'`,
        SPHttpClient.configurations.v1
      );
      if (response.ok) {
        const data = await response.json();
        if (data.value.length > 0) {
          setUserRecords(data.value[0]);
        } else {
          console.log("No data found ");
        }
      } else {
        console.log("Please enter the correct name of the list in the property pane.");
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (id) {
      getEmployeeDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (userRecords.EmployeeID) {
      handleMonthClick(currentMonth);
    }
  }, [userRecords]);

  const handleMonthClick = (month: number) => {
    setSelectedMonth(month);
    const monthRecordsArray = [
      userRecords.January,
      userRecords.February,
      userRecords.March,
      userRecords.April,
      userRecords.May,
      userRecords.June,
      userRecords.July,
      userRecords.August,
      userRecords.September,
      userRecords.October,
      userRecords.November,
      userRecords.December,
    ];

    const selectedMonthData = monthRecordsArray[month];
    if (selectedMonthData) {
      try {
        const parsedData = JSON.parse(selectedMonthData) as DetailRecord[];
        setMonthRecords(parsedData.reverse());
        setPage(0);
      } catch (error) {
        console.error("Error parsing month data:", error);
        setMonthRecords([]);
      }
    } else {
      setMonthRecords([]);
    }
  };

  function inOutDetails(key: string) {
    for (const record of monthRecords) {
      if (Object.keys(record)[0] === key) {
        setLogs((record[key].inOutDetails).reverse());
        break;
      }
    }
  }

  const DialogBox = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className={styles.dashBoard}>
      <></>
      <Box className={styles.Header}>
        <Typography align="center" variant="h6" sx={{ color: 'White', mt: 0 }}>
          All Work Logs
        </Typography></Box>
      <Grid container spacing={2} alignItems="center" sx={{ mt: 0 }}>
        <Grid item>
          <Avatar alt={userRecords.EmployeeName} src={`${props.context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?accountname=${userRecords.Email}&Size=S`} />
        </Grid>
        <Grid item>
          <Typography variant="h6" component="h6">
            {userRecords.EmployeeName}
          </Typography>
        </Grid>
      </Grid>
      <Grid container justifyContent="flex-end">
        <Grid item>
          <ButtonGroup variant="outlined" aria-label="Basic button group">
            {Array.apply(null, { length: new Date().getMonth() + 1 })
              .map((data, index) => new Date(0, index).toLocaleString('default', { month: 'short' }))
              .reverse()
              .map((month, index) => {
                const monthIndex = new Date().getMonth() - index;
                return (
                  <Button
                    key={index}
                    onClick={() => handleMonthClick(monthIndex)}
                    style={{ backgroundColor: selectedMonth === monthIndex ? '#1976d2' : 'transparent', color: selectedMonth === monthIndex ? 'white' : '#1976d2' }} // Highlight selected button
                  >
                    {month}
                  </Button>
                );
              })}
          </ButtonGroup>
        </Grid>
      </Grid>
      {monthRecords.length === 0 ? (
        <Typography variant="h6" component="h6" sx={{ mt: 15, color: 'black', fontSize: '1rem', textAlign: 'center', fontWeight: "700" }}>No logs available</Typography>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600" }}>Date</TableCell>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600" }}>Status</TableCell>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600" }}>First In</TableCell>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600" }}>Last Out</TableCell>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600" }}>Total Time</TableCell>
                  <TableCell align="left" sx={{ backgroundColor: "#f3f2f1", fontWeight: "600" }}>Logs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthRecords.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record) => (
                  <TableRow key={Object.keys(record)[0]} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell align="left">{Object.keys(record)[0]}</TableCell>
                    <TableCell align="left">{record[Object.keys(record)[0]].status}</TableCell>
                    <TableCell align="left">{record[Object.keys(record)[0]].firstIn}</TableCell>
                    <TableCell align="left">{record[Object.keys(record)[0]].lastOut}</TableCell>
                    <TableCell align="left">{totalTime(record[Object.keys(record)[0]].todayTotalTime)}</TableCell>
                    <TableCell align="left">
                      <IconButton aria-label="Detail Logs" onClick={() => { handleClickOpen(); inOutDetails(Object.keys(record)[0]); }}>
                        <img src={require("../../assets/list.png")} style={{ width: 22, height: 22, cursor: 'pointer' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10]}
            component="div"
            count={monthRecords.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
      <DialogBox
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 1, p: 1, color: "#1976d2" }} id="customized-dialog-title">
          Logs
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 500 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: "#f3f2f1", fontWeight: "600" }} align="center">Clock In</TableCell>
                  <TableCell sx={{ backgroundColor: "#f3f2f1", fontWeight: "600" }} align="center">Clock Out</TableCell>
                  <TableCell sx={{ backgroundColor: "#f3f2f1", fontWeight: "600" }} align="center">Total Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Logs.slice(dialogPage * dialogRowsPerPage, dialogPage * dialogRowsPerPage + dialogRowsPerPage)
                  .map((record, index) => (
                    <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell align="center">{formatTimeFromTimestamp(record.start)}</TableCell>
                      <TableCell align="center"> {record.end === 0 ? '-' : formatTimeFromTimestamp(record.end)}</TableCell>
                      <TableCell align="center">{totalTime(record.Total)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={Logs.length}
            rowsPerPage={dialogRowsPerPage}
            page={dialogPage}
            onPageChange={(event, newPage) => setDialogPage(newPage)}
            onRowsPerPageChange={(event) => {
              setDialogRowsPerPage(parseInt(event.target.value, 10));
              setDialogPage(0);
            }}
          />
        </Paper>
      </DialogBox>
    </div>
  );
};

export default DetailRecords;
