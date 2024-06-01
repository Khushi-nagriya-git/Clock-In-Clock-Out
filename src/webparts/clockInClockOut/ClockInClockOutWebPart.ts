import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import ClockInClockOut from './components/ClockInClockOut';
import { IClockInClockOutProps } from './components/IClockInClockOutProps';

export interface IClockInClockOutWebPartProps {
  description: string;
  absoluteURL: any;
  spHttpClient: any;
  context:any;
  listName:string;
  backgroundColor:string;
}

export default class ClockInClockOutWebPart extends BaseClientSideWebPart<IClockInClockOutWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IClockInClockOutProps> = React.createElement(
      ClockInClockOut,
      {
        absoluteURL: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient,
        context: this.context,
        listName:this.properties.listName,
        backgroundColor:this.properties.backgroundColor
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  protected onAfterPropertyPaneChangesApplied(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
    this.render();
  }

  private validateListName(value:any): string {
    if (value.trim()==0) {
      return "Please specify the list name here";
    }
    return "";
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          displayGroupsAsAccordion: true,
          groups: [
            {
              groupName:"General Settings",
              groupFields: [
                PropertyPaneTextField("listName", {
                  label: "Assign a list name",
                  onGetErrorMessage: this.validateListName.bind(this)
                }),
                
              ]
            },
            {
              groupName:"Color Settings",
              groupFields: [
                PropertyPaneTextField("backgroundColor", {
                  placeholder:"#ffffff",
                  label: "Background color (E.g. #ffffff)",
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
