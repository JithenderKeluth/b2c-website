/**her we are checking country any value to allow user to edit input or not  */
export function restrictEditOption(tsCountry: any, value: any) {
  return Boolean(tsCountry === 'MM' && value);
}
  export function getUserCredentials(){
    let credentials = null;
    if (sessionStorage.getItem('credentials')) {
      credentials = JSON.parse(sessionStorage.getItem('credentials'));
    } else if (localStorage.getItem('credentials')) {
      credentials = JSON.parse(localStorage.getItem('credentials'));
    }
    return credentials;
  }
