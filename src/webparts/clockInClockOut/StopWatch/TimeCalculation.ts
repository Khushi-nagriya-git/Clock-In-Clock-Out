const date = new Date();
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let day = daysOfWeek[date.getDay()]; // Get the day of the week
const currentDate  = (date.toISOString().split("T")[0])+" , " + day;

{/*Converts a time duration given in milliseconds to a formatted string in "HHh MMm" format.
This function is used to calculate the total time for today.*/}
 export function totalTime(time: number) {
    const totalHours = parseFloat((time / (1000 * 60 * 60)).toFixed(4));
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  }
  
  {/*Converts a time duration given in seconds to a formatted string in "HHh MMm" format.
  This function is used for stopwatch format */}
  export function formatTime  (timeInSeconds: number)  {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours}h ${minutes < 10 ? "0" : ""}${minutes}m` ;
  };
 
  {/*Converts a timestamp to a formatted time string in 12-hour AM/PM format.
  This function is used for in out list */}
  export function formatTimeFromTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const minutesStr = minutes < 10 ? '0' + minutes : String(minutes); 
    const amOrPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutesStr} ${amOrPm}`;
  }
  
 {/* This function is used to calculate all interval time */}
  export function calculateIntervalTime(todayData: any) {
    let totalTime = 0;
    todayData[currentDate].inOutDetails.forEach((item: any) => {
      totalTime += item.Total;
    });
    return totalTime;
  }