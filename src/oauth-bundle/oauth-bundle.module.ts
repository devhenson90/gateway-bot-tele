import { Module } from '@nestjs/common';
import { ApplicationScopeModule } from './application-scope/application-scope.module';
import { ApplicationModule } from './application/application.module';
import { TMPAuthCodeModule } from './tmp-auth-code/tmp-auth-code.module';
import { ScopeMasterModule } from './scope-master/scope-master.module';
import { UserModule } from './user/user.module';
import { UserScopeModule } from './user-scope/user-scope.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { UserRoleModule } from './user-role/user-role.module';
import { AdminConsoleModule } from './admin-console/admin-console.module';
import { OtpModule } from './otp/module';
import { RecaptchaModule } from './recaptcha/recaptcha.module';

@Module({
  imports: [
    UserModule,
    RoleModule,
    PermissionModule,
    ApplicationModule,
    RecaptchaModule,
    TMPAuthCodeModule,
    ScopeMasterModule,
    RolePermissionModule,
    ApplicationScopeModule,
    UserScopeModule,
    UserRoleModule,
    AdminConsoleModule,
    OtpModule,
  ],
  controllers: [],
  providers: [],
})
export class OAuthBundleModule {}
