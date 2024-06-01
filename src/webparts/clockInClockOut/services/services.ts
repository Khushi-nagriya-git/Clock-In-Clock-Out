import { SPHttpClient } from "@microsoft/sp-http";
//This function is used to get logged in  user information
export const getCurrentUserData = async (spHttpClient: SPHttpClient, absoluteURL: string) => {
    try {
        const response = await spHttpClient.get(
            `${absoluteURL}/_api/web/currentuser?$select=Title,Email,Id`,
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

// This function is used to get sharepoint list data
export const getListData = async (
    spHttpClient: SPHttpClient,
    absoluteURL: string,
    listName: string,
    currentUserDetails: any,
    currentDate: string,
    setUserData: React.Dispatch<React.SetStateAction<any>>,
    setStatus: React.Dispatch<React.SetStateAction<string>>,
    setTodayLoggedRecords: React.Dispatch<React.SetStateAction<any[]>>,
    setTime: React.Dispatch<React.SetStateAction<number>>,
    totalTime: (time: number) => string
) => {
    try {
        const response = await spHttpClient.get(
            `${absoluteURL}/_api/web/lists/GetByTitle('${listName}')/items?$select=EmployeeID,EmployeeName,Date,Status,TodayTotalTime,TodayFirstIn,TodayLastOut,January,February,March,April,May,June,July,August,September,October,November,December&$filter=EmployeeID eq '${currentUserDetails.Id}'`,
            SPHttpClient.configurations.v1
        );
        if (response.ok) {
            const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            
            const currentMonthIndex = new Date().getMonth();
            const currentMonthName = months[currentMonthIndex];
            const data = await response.json();
            if (data.value.length > 0) {
                setUserData(data.value[0]);
                setStatus(data.value[0].Status);
                const parseData = JSON.parse(data.value[0][currentMonthName]);
                let k = parseData.length - 1;
                setTodayLoggedRecords(parseData[k][currentDate].inOutDetails.slice().reverse());
                setTime(parseData[k][currentDate].todayTotalTime);
                totalTime(parseData[k][currentDate].todayTotalTime);
            } else {
                console.log("No data found.");
            }
        } else {
            console.log("Please enter the correct name of the list in the property pane.");
        }
    } catch (error) {
        console.log("Error fetching data:", error);
    }
};

// This function is used to add user data into sharepoint list
export const addUserRecords = async (
    spHttpClient: SPHttpClient,
    absoluteURL: string,
    listName: string,
    currentUserDetails: any,
    currentDate: string,
    startTime: string,
    loginInTime: number
) => {
    const userRecord = [{
        [currentDate]: {
            username: currentUserDetails.Title,
            employeeId: currentUserDetails.Id,
            status: "IN",
            todayTotalTime: 0,
            firstIn: startTime,
            lastOut: "-",
            inOutDetails: [
                {
                    start: loginInTime,
                    end: 0,
                    Total: 0,
                    status: "IN",
                },
            ],
        },
    }];
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentMonthIndex = new Date().getMonth();
    const currentMonthName = months[currentMonthIndex];
    const listItemData = {
        EmployeeID: currentUserDetails.Id,
        EmployeeName: currentUserDetails.Title,
        Date: currentDate,
        Status: "IN",
        TodayTotalTime: 0,
        TodayFirstIn: startTime,
        TodayLastOut: "-",
        [currentMonthName]: JSON.stringify(userRecord)
    };
    
    const requestURL = `${absoluteURL}/_api/web/lists/getbytitle('${listName}')/items`;
    const response = await spHttpClient.post(requestURL, SPHttpClient.configurations.v1, {
        headers: {
            Accept: "application/json;odata=nometadata",
            "Content-type": "application/json;odata=nometadata",
            "odata-version": "",
        },
        body: JSON.stringify(listItemData),
    });
    if (!response.ok) {
        console.error("Error adding user records");
    }
};

// This function is used to update user data into sharepoint list
export async function updateUserRecords(
    spHttpClient: SPHttpClient,
    absoluteURL: string,
    listName: string,
    currentUserDetails: any,
    currentUserRecord: any,
    currentDate: string,
    type: string,
    setUserData: React.Dispatch<React.SetStateAction<any>>,
    setStatus: React.Dispatch<React.SetStateAction<string>>,
    setTodayLoggedRecords: React.Dispatch<React.SetStateAction<any>>,
    setTime: React.Dispatch<React.SetStateAction<number>>,
    totalTime: (time: number) => string
) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    const currentMonthIndex = new Date().getMonth();
    const currentMonthName = months[currentMonthIndex];
    let listItemData = {};
    if (type === "todayDate") {
        listItemData = {
            Date: currentDate,
            Status: currentUserRecord.Status,
            TodayTotalTime: currentUserRecord.TodayTotalTime,
            TodayLastOut: currentUserRecord.TodayLastOut,
            [currentMonthName]: JSON.stringify(currentUserRecord[currentMonthName]),
        };
    } else if (type === "newDate") {
        listItemData = {
            Date: currentDate,
            Status: currentUserRecord.Status,
            TodayTotalTime: 0,
            TodayLastOut: "-",
            TodayFirstIn: currentUserRecord.TodayFirstIn,
            [currentMonthName]: JSON.stringify(currentUserRecord[currentMonthName]),
        };
    }
    try {
        const response = await spHttpClient.get(
            `${absoluteURL}/_api/web/lists/getbytitle('${listName}')/items?$filter=EmployeeID eq ${currentUserDetails.Id}`,
            SPHttpClient.configurations.v1
        );
        if (response.ok) {
            const data = await response.json();
            if (data.value && data.value.length > 0) {
                const itemToUpdate = data.value[0];
                const itemId = itemToUpdate.ID;
                const updateEndpoint = `${absoluteURL}/_api/web/lists/getbytitle('${listName}')/items(${itemId})`;
                const updateResponse = await spHttpClient.post(updateEndpoint, SPHttpClient.configurations.v1, {
                    headers: {
                        Accept: "application/json;odata=nometadata",
                        "Content-type": "application/json;odata=nometadata",
                        "odata-version": "",
                        "IF-MATCH": "*",
                        "X-HTTP-Method": "MERGE",
                    },
                    body: JSON.stringify(listItemData),
                });
                if (updateResponse.ok) {
                    await getListData(
                        spHttpClient,
                        absoluteURL,
                        listName,
                        currentUserDetails,
                        currentDate,
                        setUserData,
                        setStatus,
                        setTodayLoggedRecords,
                        setTime,
                        totalTime
                    );
                } else {
                    console.log("Error updating item:", updateResponse.statusText);
                }
            } else {
                console.log("No item found with the specified EmployeeID.");
            }
        } else {
            console.log("Error fetching item:", response.statusText);
        }
    } catch (error) {
        console.log("Error fetching item:", error);
    }
}
