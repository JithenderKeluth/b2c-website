import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ApiService } from '@app/general/services/api/api.service';
import { Credentials, CredentialsService } from './credentials.service';

import {
  ACCOUNT_AUTH_SIGNUP_PATH,
  ACCOUNT_FORGOT_PASSWORD_PATH,
  ACCOUNT_AUTH_SIGNIN_PATH,
  ACCOUNT_RESET_PASSWORD_PATH,
  ACCOUNT_AUTH_ACTIVATE_PATH,
  ACCOUNT_USER_RESEND_ACTIVATION_EMAIL_PATH,
  ACCOUNT_USER_OTP_LOGIN,
  ACCOUNT_USER_OTP_VERIFICATION,
  PROXY_SERVER_PATH,
  PROXY_LOGIN,
  PROXY_AUTHENTICATION
} from '@app/general/services/api/api-paths';
import { I18nService } from '@app/i18n';

export interface LoginContext {
  username: string;
  password: string;
  remember?: boolean;
  socialToken: string;
  provider: string;
}

/**
 * Provides a base for authentication workflow.
 * The login/logout methods should be replaced with proper implementation.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    private credentialsService: CredentialsService,
    private http: HttpClient,
    private i18Service: I18nService,
    private apiservice: ApiService
  ) {}

  login(context: LoginContext): Observable<Credentials> {
    // Replace by proper authentication call
    let data;

    if (context && context.socialToken) {
      data = {
        provider: context.provider,
        socialToken: context.socialToken,
        userAgent: this.userAgent(),
      };
    } else {
      if (context) {
        data = {
          username: context.username,
          password: context.password,
          userAgent: this.userAgent(),
        };
      }
    }

    return this.http
      // .post<any>(`${this.apiservice.tsMyAccountUrl()}${ACCOUNT_AUTH_SIGNIN_PATH}`, JSON.stringify(data))
      .post<any>(`${PROXY_SERVER_PATH}${PROXY_LOGIN}`, data)
      .pipe(
        map((user) => {
          if (user && user.data) {
            // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
            this.credentialsService.setCredentials(user, context.remember);
            return user;
          } else {
            return user;
          }
        })
      );
  }

  activationEmail(username: string) {
    const params = {
      username: username,
      userAgent: this.userAgent(),
    };
    const url = `${this.apiservice.tsMyAccountUrl()}${ACCOUNT_USER_RESEND_ACTIVATION_EMAIL_PATH}`;
    return this.http.post(url, params);
  }

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    // Customize credentials invalidation here
    this.credentialsService.setCredentials();
    return of(true);
  }

  /**
   * Authenticates the user.
   * @param context The login parameters.
   * @return The user credentials.
   */
  userAgent() {
    let userAgent = {
      deviceId: 'browser',
      application: `${this.i18Service.browser}`,
      version: 'v1',
      country: this.i18Service.language.split('-')[1],
      market: this.i18Service.language.split('-')[1],
      language: this.i18Service.language.split('-')[0],
    };
    return userAgent;
  }

  getForgotPassword(emailValue: any) {
    const userData = {
      username: emailValue,
      userAgent: this.userAgent(),
    };
    let url = `${this.apiservice.tsMyAccountUrl()}${ACCOUNT_FORGOT_PASSWORD_PATH}`;
    return this.http.post(url, userData);
  }

  signUp(signUpData: any) {
    return this.http
      .post<any>(
        `${this.apiservice.tsMyAccountUrl()}${ACCOUNT_AUTH_SIGNUP_PATH}`,
        JSON.stringify(this.signUpData(signUpData))
      )
      .pipe(
        map((user) => {
          return user;
        })
      );
  }
  signUpData(signUpValue: any) {
    return {
      username: signUpValue.email,
      password: signUpValue.password,
      contactInfo: {
        personName: {
          // nameTitle: "Mr",
          givenName: signUpValue.firstName,
          surname: signUpValue.surName,
        },
        email: signUpValue.email,
      },
      userAgent: this.userAgent(),
    };
  }

  private closeForgotPwd = new BehaviorSubject(false);
  currentCloseForgotPwd = this.closeForgotPwd.asObservable();

  changeCloseForgotPwd(value: boolean) {
    this.closeForgotPwd.next(value);
  }
  private showResetPassword = new BehaviorSubject(false);
  currentResetPassword = this.showResetPassword.asObservable();

  changeshowResetPassword(value: boolean) {
    this.showResetPassword.next(value);
  }
  resetpassword(updateData: any) {
    let url = `${this.apiservice.tsMyAccountUrl()}${ACCOUNT_RESET_PASSWORD_PATH}`;
    return this.http.post(url, updateData);
  }
  userActivateAccount(userData: any) {
    let userVal = {
      userName: userData['user-name'],
      validatingToken: userData.code,
      userAgent: this.userAgent(),
    };
    let url = `${this.apiservice.tsMyAccountUrl()}${ACCOUNT_AUTH_ACTIVATE_PATH}`;
    return this.http.post<any>(`${url}`, userVal).pipe(
      map((user) => {
        if (user && user.data) {
          this.credentialsService.setCredentials(user);
          return user;
        } else {
          return user;
        }
      })
    );
  }
  /**Getting the OTP */
  getOTPToLogin(otpReqData: any) {
    let url = `${this.apiservice.tsMyAccountUrl()}${ACCOUNT_USER_OTP_LOGIN}`;
    return this.http.post(url, otpReqData);
  }

  /**Validating the OTP */
  validateOTP(verifyOTPData: any) {
    return this.http.post(`${PROXY_SERVER_PATH}${PROXY_AUTHENTICATION}`, verifyOTPData);
  }

}
