export interface InOutDetail {
    start: number;
    end: number;
    total: number;
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

export interface CurrentUserDetails {
    Title: string;
    Id: any;
    email: string;
    groups:[];
}

export interface UserData {
    EmployeeID: number;
    EmployeeName: string;
    Date: string;
    Status: string;
    TodayTotalTime: number;
    TodayFirstIn: string;
    TodayLastOut: string;
    DetailRecords: DetailRecord[];
}

export const initialCurrentUserDetails: CurrentUserDetails = {
    Title: "",
    Id: 0,
    email: "",
    groups: []
};

export const initialUserData: UserData = {
    EmployeeID: 0,
    EmployeeName: "",
    Date: "",
    Status: "",
    TodayTotalTime: 0,
    TodayFirstIn: "",
    TodayLastOut: "",
    DetailRecords: [
        {
            currentDate: {
                username: initialCurrentUserDetails.Title,
                employeeId: initialCurrentUserDetails.Id,
                status: "IN",
                todayTotalTime: 0,
                firstIn: "",
                lastOut: "-",
                inOutDetails: [
                    {
                        start: 0,
                        end: 0,
                        total: 0,
                        status: "",
                    },
                ],
            },
        },
    ],
};

export const initialState = {
    timer: 0,
    checkInTime: "",
    isRunning: false,
    time: 0,
    status: "OUT",
    todayLoggedRecords: [] as any[],
    currentUserDetails: initialCurrentUserDetails,
    userData: initialUserData,
};
