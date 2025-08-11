import moment from 'moment';
/**To get number of nights stayed for hotel section */
export function stayDaysCount(fromDate:any,toDate:any){
    let firstDate = moment(fromDate);
     let secondDate = moment(toDate);
    let diffInDays = Math.abs(firstDate.diff(secondDate, 'days'));
    return diffInDays;
   }
