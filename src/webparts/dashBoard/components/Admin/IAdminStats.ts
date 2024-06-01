
export interface InOutDetail {
  start: number;
  end: number;
  Total: number;
  status: string;
}



export interface DetailRecord {
  currentDate: {
    username: string;
    employeeId: number;
    status: string;
    todayTotalTime: number;
    firstIn: string;
    lastOut: string;
    inOutDetails: InOutDetail[];
  };
}
export type DetailRecords = DetailRecord[];

export interface UserData {
  EmployeeID: string;
  EmployeeName: string;
  Date: string;
  Status: string;
  TodayTotalTime: number;
  TodayFirstIn: string;
  TodayLastOut: string;
  January: string; 
  February: string; 
  March: string; 
  April: string;
  May: string;
  June: string; 
  July: string; 
  August: string; 
  September: string; 
  October: string; 
  November: string; 
  December: string; 
}

const initialUserDataArray: UserData[] = [
  {
    EmployeeID: "",
    EmployeeName: "",
    Date: "",
    Status: "",
    TodayTotalTime: 0,
    TodayFirstIn: "",
    TodayLastOut: "",
    January: "[]",
    February: "[]",
    March: "[]",
    April: "[]",
    May: "[]",
    June: "[]",
    July: "[]",
    August: "[]",
    September: "[]",
    October: "[]",
    November: "[]",
    December: "[]",
  }
];

const initialDetailRecord: DetailRecord = {
  currentDate: {
    username: "",
    employeeId: 0,
    status: "",
    todayTotalTime: 0,
    firstIn: "",
    lastOut: "",
    inOutDetails: [],
  },
};

const initialInOutDetail: InOutDetail = {
  start: 0,
  end: 0,
  Total: 0,
  status: "",
}

export const initialState = {
  timer: 0,
  checkInTime: "",
  isRunning: false,
  time: 0,
  status: "OUT",
  todayLoggedRecords: [] as any[],
  userData: initialUserDataArray,
  detailRecord:  [initialDetailRecord],
  inOutDetail: [initialInOutDetail]
};
