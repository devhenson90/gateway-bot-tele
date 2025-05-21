import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const IS_OAUTH_APP_REQ = 'IS_OAUTH_APP_REQ';
export const OAuthAppReq = () => SetMetadata(IS_OAUTH_APP_REQ, true);
