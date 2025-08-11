export function getOTPReqData(userEmail: string): any {
  return {
    email: userEmail,
    contactNumber: null,
    organisation: 'travelstart',
    userAgent: {
      deviceId: 'browser',
      application: 'Web-Chrome',
      language: 'en',
      country: 'ZA',
    },
  };
}

export function verifyUserOTP(otpData: any, email: string, userOtp: string): any {
  return {
    requestId: otpData?.data?.req_id,
    otp: userOtp,
    email: email,
    contactNumber: null,
    organisation: 'travelstart',
    userAgent: {
      deviceId: 'browser',
      application: 'Web-Chrome',
      language: 'en',
      version: 'v1',
      country: 'ZA',
    },
  };
}
