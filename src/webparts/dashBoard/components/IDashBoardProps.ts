import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IDashBoardProps {
    spHttpClient: any;
    absoluteURL: any;
    listName:string;
    context: WebPartContext;
    
}
