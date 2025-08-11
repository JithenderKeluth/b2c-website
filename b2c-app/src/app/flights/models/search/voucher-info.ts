export class voucherInfo {
  code: string;
  data: voucherData;
  paymentData: voucherPaymentData;
  email: string;
  mobileNo: number;
  businessLoggedOnToken: string;
  contactDetails: any;
}

export class voucherData {
  data: string;
  size: number;
}

export class voucherPaymentData {
  data: string;
  size: number;
}
