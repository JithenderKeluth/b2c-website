import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  pwdResetForm: UntypedFormGroup;
  showEyePassIcon: boolean = true;
  submitted: boolean = false;
  showPwdReset: boolean = true;
  resetPwdInfo: any;
  errorRes: any = null;
  @Output() closePwdModal: EventEmitter<any> = new EventEmitter<any>();
  get form() {
    return this.pwdResetForm.controls;
  }
  constructor(private formBuilder: UntypedFormBuilder, private authenticationService: AuthenticationService, private storage: UniversalStorageService) {}

  ngOnInit(): void {
    this.resetPasswordForm();
    if (this.storage.getItem('resetPasswordData', 'session')) {
      this.resetPwdInfo = JSON.parse(this.storage.getItem('resetPasswordData', 'session'));
    }
  }
  resetPasswordForm() {
    this.pwdResetForm = this.formBuilder.group({
      password: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[.$@$!%*#?&])[A-Za-z\d$@$!%.*#?&]{6,}/)],
      ],
    });
  }
  showPwd() {
    this.showEyePassIcon = !this.showEyePassIcon;
  }

  resetPwd() {
    this.submitted = true;
    if (this.pwdResetForm.invalid) {
      return;
    } else {
      let reqObj = {
        newPassword: this.pwdResetForm.get('password').value,
        userAgent: this.authenticationService.userAgent(),
        validatingToken: this.resetPwdInfo.code,
        validatingTokenUserName: this.resetPwdInfo['user-name'],
      };
      this.authenticationService.resetpassword(reqObj).subscribe((data: any) => {
        this.showPwdReset = false;
        if (data.result != 'OK' && data.code != 200) {
          this.errorRes = data.result;
        }
      });
    }
  }
  login() {
    this.closePwdModal.emit(true);
    this.authenticationService.changeCloseForgotPwd(true);
  }
  close() {
    this.closePwdModal.emit(false);
  }
}
