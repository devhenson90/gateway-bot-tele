export enum ForgotTypesEnum {
  pin = 'pin',
  password = 'password',
}

export enum ForgotExpiredReasonEnum {
  timeout = 'timeout',
  have_new_token = 'have_new_token',
  user_already_used = 'user_already_used',
}

export enum ForgotMethodEnum {
  phone = 'phone',
  email = 'email',
}