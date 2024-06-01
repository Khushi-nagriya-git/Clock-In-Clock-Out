import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'DashBoardWebPartStrings';
import DashBoard from './components/DashBoard';
import { IDashBoardProps } from './components/IDashBoardProps';

export interface IDashBoardWebPartProps {
  absoluteURL: any;
  spHttpClient: any;
  context:any;
  listName:string;
}

export default class DashBoardWebPart extends BaseClientSideWebPart<IDashBoardWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IDashBoardProps> = React.createElement(
      DashBoard,
      {
        absoluteURL: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient,
        context: this.context,
        listName:this.properties.listName,
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
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField("listName", {
                  label: "Assign a list name",
                  onGetErrorMessage: this.validateListName.bind(this)
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
