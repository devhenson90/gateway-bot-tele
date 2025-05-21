import { SetMetadata } from '@nestjs/common';

export const IS_IGNORE_HTTP_LOGGING = 'isIgnoreHttpLogging';
export const IgnoreLogging = () => SetMetadata(IS_IGNORE_HTTP_LOGGING, true);
