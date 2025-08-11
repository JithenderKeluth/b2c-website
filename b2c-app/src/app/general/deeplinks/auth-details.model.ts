import { SigninSource } from './signin-source.enum';
import { AccessRole } from './access-role.enum';

export class AuthDetails {
  public userToken: string;
  public givenName: string;
  public surname: string;
  public initials: string;
  public status: string;
  public signinSource: SigninSource;
  public accessRole: AccessRole;
  public rememberMe: boolean;

  // NG1 unification with ts-account
  public isBusinessAccount: boolean;
  public email: string;

  constructor() {
    // default to active as this is no longer returned but handled as API flow logic
    this.status = 'ACTIVE';
    this.signinSource = SigninSource.PERSONAL;
  }
}
