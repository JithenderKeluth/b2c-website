/**
 * The ApiError model, based off the OTA _Error Java class used by the web api
 *
 * We ignore most of these properties in Angular, mostly focusing on the `tscode` and
 * `shortText` properties of the `errorWarningAttributeGroup` object for logging and decision making
 */
export interface ApiError {
  errorWarningAttributeGroup: {
    code: string;
    docUrl: string;
    entity: string;
    entityID: string;
    recordID: string;
    shortText: string;
    status: string;
    tag: string;
    tscode: number;
    tsshortText: string;
  };
  freeText: string;
  nodeList: string;
  type: string;
}
