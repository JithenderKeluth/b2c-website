export interface ApiErrorCodes {
  code: string;
  subject: string;
  description: string;
  category: string;
}

export const ApiErrorscode: Array<ApiErrorCodes> = [
  {
    code: '7',
    subject: '',
    description: 'We could not process your payment. Please double check your CVV details and try again',
    category: '',
  },
  {
    code: '11',
    subject: '',
    description: 'Oops, your payment failed due to insufficient funds',
    category: '',
  },
  {
    code: '14',
    subject: '',
    description: 'There was an issue processing your payment. Please verify your card details and try again',
    category: '',
  },
  {
    code: '48404',
    subject: '',
    description: 'Sadly, your flight is no longer available',
    category: '',
  },
  {
    code: '288',
    subject: '',
    description: 'Sadly, your flight is no longer available',
    category: '',
  },
  {
    code: '1051',
    subject: '',
    description: 'Seat request not available, request seats at check in',
    category: '',
  },
  {
    code: '1052',
    subject: '',
    description:
      'We noticed a price increase for your seats, we’ve removed all seat selections. Please request your seats at check-in',
    category: '',
  },
  {
    code: '48403',
    subject: '',
    description: 'Sadly, your flight is no longer available',
    category: '',
  },
  {
    code: '0',
    subject: '',
    description: 'Sadly, your flight is no longer available',
    category: '',
  },
];
