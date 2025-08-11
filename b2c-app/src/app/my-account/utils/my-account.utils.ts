import { getUserCredentials } from "../../general/utils/common-utils";

export function myAccountEventData(bookingId:any){
    const credentials:any = getUserCredentials();
    const locality = sessionStorage.getItem('country-language');
    const eventData = {
      locality : locality,
      email : credentials?.data?.contactInfo?.email ?? '',
      firstName : credentials?.data?.firstName ?? '',
      surname: credentials?.data?.surname ?? '',
      bookingId : bookingId
    }
    return eventData;
}