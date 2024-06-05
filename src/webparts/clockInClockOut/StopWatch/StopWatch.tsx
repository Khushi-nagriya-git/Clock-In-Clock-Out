import * as React from "react";
import { useState, useEffect } from "react";
import type { IStopWatchProps } from "./IStopWatchProps";
import { SPHttpClient } from "@microsoft/sp-http";
import styles from "./StopWatch.module.scss";
import * as find from "lodash";
import { Scrollbar } from "react-scrollbars-custom";
import { totalTime, formatTime, formatTimeFromTimestamp, calculateIntervalTime } from "./TimeCalculation";
import { getCurrentUserData, getListData, addUserRecords, updateUserRecords } from "../services/services";
import { CurrentUserDetails, UserData, initialState } from "./IStopWatchStats";
import { Container,Box} from "@mui/material";

const StopWatch: React.FunctionComponent<IStopWatchProps> = (
  props: IStopWatchProps
) => {
  const [timer, setTimer] = useState<number>(initialState.timer);
  const [checkInTime, setCheckInTime] = useState<string>(initialState.checkInTime);
  const [isRunning, setIsRunning] = useState<boolean>(initialState.isRunning);
  const [time, setTime] = useState<number>(initialState.time);
  const [status, setStatus] = useState<string>(initialState.status);
  const [todayLoggedRecords, setTodayLoggedRecords] = useState<any[]>(initialState.todayLoggedRecords);
  const [currentUserDetails, setCurrentUserDetails] = useState<CurrentUserDetails>(initialState.currentUserDetails);
  const [userData, setUserData] = useState<UserData>(initialState.userData);
  const date = new Date();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let day = daysOfWeek[date.getDay()]; // Get the day of the week
  const currentDate  = (date.toISOString().split("T")[0])+" , " + day;
  let userRecord: any[] = [];
  let startTime = "";
  let stopTime = "";
  let loginTime = 0;
  let logOutTime = 0;

  useEffect(() => {
    (async () => {
      const userData = await getCurrentUserData(props.spHttpClient, props.absoluteURL);
      setCurrentUserDetails(userData || {});
    })();
    const storedData = JSON.parse(localStorage.getItem("stopwatchData") || "{}");
    setTimer(storedData.timer || 0);
    setCheckInTime(storedData.startTime || "");
    setIsRunning(storedData.isRunning || false);
    setStatus(storedData.status || "OUT");
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
        setTime((todatTotalTime) => todatTotalTime + 1000);
      }, 1000); // Update every sec (1000 milliseconds)
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const stopwatchData = { timer, startTime: checkInTime, isRunning, status };
    localStorage.setItem("stopwatchData", JSON.stringify(stopwatchData));
  }, [timer, checkInTime, isRunning, status]);

  useEffect(() => {
    if (currentUserDetails.Id !== 0) {
      getListData(props.spHttpClient, props.absoluteURL,props.listName,currentUserDetails,currentDate,setUserData,setStatus, setTodayLoggedRecords,setTime,totalTime );
    }
  }, [currentUserDetails, props.listName]);

  const startStopWatch = () => {
    startTime = new Date().toLocaleTimeString();
    setCheckInTime(startTime);
    loginTime = new Date().getTime();
    setIsRunning(true);
    setStatus("IN");
    editUserDetails();
  };

  const stopStopWatch = () => {
    stopTime = new Date().toLocaleTimeString();
    logOutTime = new Date().getTime();
    setStatus("OUT");
    editUserDetails();
    setIsRunning(false);
    setTimer(0);
  };

  async function editUserDetails() {
    try {
      const filterQuery = `$select=EmployeeID,EmployeeName,Date,Status,TodayTotalTime,TodayFirstIn,TodayLastOut,January,February,March,April,May,June,July,August,September,October,November,December`;
      const requestUrl = `${props.absoluteURL}/_api/web/lists/GetByTitle('${props.listName}')/items?${filterQuery}`;
      const response = await props.spHttpClient.get(
        requestUrl,
        SPHttpClient.configurations.v1
      );
      if (response.ok) {
        let data: any;
        data = await response.json();
        if (data.value.length > 0) {
          userRecord = data.value;
          let currentUserRecord = find.find(userRecord, {
            EmployeeID: currentUserDetails.Id,
          });
          const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];    
        const currentMonthIndex = new Date().getMonth();
        let currentMonthName = months[currentMonthIndex];
          if (currentUserRecord) {
            currentUserRecord[currentMonthName] = JSON.parse(
              currentUserRecord[currentMonthName]
            );
            const currentMonthData = currentUserRecord[currentMonthName];
            let todayData = find.find(currentMonthData, (obj) =>
            find.has(obj, currentDate)
            );
            if (todayData) {
              if (currentUserRecord.Status === "IN") {
                todayData[currentDate].inOutDetails[
                  todayData[currentDate].inOutDetails.length - 1
                ].status = "OUT";
                todayData[currentDate].inOutDetails[
                  todayData[currentDate].inOutDetails.length - 1
                ].end = logOutTime;
                (todayData[currentDate].inOutDetails[
                  todayData[currentDate].inOutDetails.length - 1
                ].Total =
                  logOutTime -
                  todayData[currentDate].inOutDetails[
                    todayData[currentDate].inOutDetails.length - 1
                  ].start),
                  (todayData[currentDate].lastOut = stopTime);
                todayData[currentDate].status = "OUT";
                todayData[currentDate].todayTotalTime =
                  calculateIntervalTime(todayData);
                currentUserRecord.Status = "OUT";
                currentUserRecord.TodayTotalTime =
                  calculateIntervalTime(todayData);
                currentUserRecord.TodayLastOut = stopTime;
                currentUserRecord.Date = currentDate;
                await updateUserRecords(
                  props.spHttpClient,
                  props.absoluteURL,
                  props.listName,
                  currentUserDetails,
                  currentUserRecord,
                  currentDate,
                  "todayDate",
                  setUserData,
                  setStatus,
                  setTodayLoggedRecords,
                  setTime,
                  totalTime
                );
              } else {
                currentUserRecord.Status = "IN";
                currentUserRecord.TodayTotalTime =
                calculateIntervalTime(todayData);
                currentUserRecord.TodayLastOut = currentUserRecord.TodayLastOut;
                currentUserRecord.Date = currentDate;
                todayData[currentDate].lastOut = stopTime;
                todayData[currentDate].status = "IN";
                todayData[currentDate].todayTotalTime = todayData[currentDate].todayTotalTime;
                todayData[currentDate].inOutDetails.push({
                  start: loginTime,
                  end: 0,
                  Total: 0,
                  status: "IN",
                });
                await updateUserRecords(
                  props.spHttpClient,
                  props.absoluteURL,
                  props.listName,
                  currentUserDetails,
                  currentUserRecord,
                  currentDate,
                  "todayDate",
                  setUserData,
                  setStatus,
                  setTodayLoggedRecords,
                  setTime,
                  totalTime
                );
              }
            } else {
              userRecord = [];
              userRecord.push({
                [currentDate]: {
                  username: currentUserDetails.Title,
                  employeeId: currentUserDetails.Id,
                  status: "IN",
                  todayTotalTime: 0,
                  firstIn: startTime,
                  lastOut: "-",
                  inOutDetails: [
                    {
                      start: loginTime,
                      end: 0,
                      Total: 0,
                      status: "IN",
                    },
                  ],
                },
              });
              currentUserRecord.Date = currentDate;
              currentUserRecord.Status = "IN";
              currentUserRecord.TodayFirstIn = startTime;
              if(currentUserRecord[currentMonthName] === null){currentUserRecord[currentMonthName]=userRecord}else{ currentUserRecord[currentMonthName].push(...userRecord)}
              // currentUserRecord[currentMonthName].push(...userRecord)
              await updateUserRecords(
                props.spHttpClient,
                props.absoluteURL,
                props.listName,
                currentUserDetails,
                currentUserRecord,
                currentDate,
                "newDate",
                setUserData,
                setStatus,
                setTodayLoggedRecords,
                setTime,
                totalTime
              );
            }
          } else {
            await addUserRecords(
              props.spHttpClient,
              props.absoluteURL,
              props.listName,
              currentUserDetails,
              currentDate,
              startTime,
              loginTime
            );
          }
        } else {
          await addUserRecords(
            props.spHttpClient,
            props.absoluteURL,
            props.listName,
            currentUserDetails,
            currentDate,
            startTime,
            loginTime
          );
        }
      } else {
        console.log("Error");
      }
    } catch (error) {
      console.error("Error in service:", error);
    }
  }
  
  return (
    <Container>
    <Box className={styles.StopWatch}>
      <Box className={styles.main}>
        <Box className={styles.Header}>
          <img src={require("../assets/timer.png")} className={styles.clockIocn} />
          <p className={styles.webpartTitle}>My Time</p>
        </Box>
        <Box className={styles.inOutDetails}>
          {(!isRunning && !timer && status === "OUT") && (
            <>
              <Box className={styles.totalTime}>
                <p className={styles.time}>{formatTime(timer)}</p>
              </Box>
              <Box className={styles.clockedInTime}>
                <p className={styles.data}>
                  Clocked Out: {userData.Date === currentDate ? "Today" : "Yesterday"} at{" "}
                  {userData.TodayLastOut ? userData.TodayLastOut.split(":")[0] + ":" + userData.TodayLastOut.split(":")[1] + " " + userData.TodayLastOut.split(" ")[1] : "0:00"}
                </p>
              </Box>
              <button onClick={startStopWatch} className={styles.playButton}>
                <img src={require("../assets/timerButton.png")} className={styles.buttonImg} />
                <p className={styles.ClockInButtonText}>Clock In</p>
              </button>
            </>
          )}
          {status === "IN" && (
            <>
              <Box className={styles.totalTime}>
                <p className={styles.time}>{formatTime(timer)}</p>
              </Box>
              <Box className={styles.clockedInTime}>
                <p className={styles.data}>
                  Clocked In: Today at {checkInTime.split(":")[0] + ":" + checkInTime.split(":")[1] + " " + checkInTime.split(" ")[1]}
                </p>
              </Box>
              <button onClick={stopStopWatch} className={styles.playButton}>
                <img src={require("../assets/stop.png")} className={styles.buttonImg} />
                <p className={styles.ClockInButtonText}>Clock Out</p>
              </button>
            </>
          )}
        </Box>
        <Box className={styles.records}>
          <Box className={styles.todayTime}>
            <p className={styles.totalTimeText}>Today - {totalTime(time)}</p>
          </Box>
          <Box className={styles.inoutStatus}>
            <Scrollbar className={styles.scrollBar}>
              {todayLoggedRecords.map((list: any, i: number) => (
                <Box className={styles.demo} key={list.start}>
                  <p>{formatTimeFromTimestamp(list.start)}</p>{" "}
                  <img src={require("../assets/line.png")} className={styles.line} />
                  <p>{list.end !== 0 ? formatTimeFromTimestamp(list.end) : "Now"}</p>
                  <img src={require("../assets/arrow.png")} className={styles.arrow} />
                  <p className={styles.todayTotalTime}>
                    {i === 0 && isRunning ? formatTime(timer) : totalTime(list.Total)}
                  </p>
                </Box>
              ))}
            </Scrollbar>
          </Box>
        </Box>
      </Box>
    </Box>
    </Container>
  );
};

export default StopWatch;