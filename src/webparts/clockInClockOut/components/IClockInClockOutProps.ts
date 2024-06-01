import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IClockInClockOutProps {
    spHttpClient: any;
    absoluteURL: any;
    context: WebPartContext;
    listName:string;
    backgroundColor:string;
}
