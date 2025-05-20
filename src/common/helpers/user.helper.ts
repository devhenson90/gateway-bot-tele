import { SCOPE_ALLOWED } from 'artifacts/auth/rules/enums';
import { CLS_KEY } from 'artifacts/cls/cls.client';
import { ClsService } from 'nestjs-cls';

enum HEADER_KEY {
  IMPERSONATE_USER = 'x-impersonateuserid',
}

export function UserId(cls: ClsService, header: Record<string, string>): number {
  if (header[HEADER_KEY.IMPERSONATE_USER]) {
    return Number(header[HEADER_KEY.IMPERSONATE_USER]);
  }
  const user = cls.get(CLS_KEY.REQ_USER);
  return user?.userId;
}

export function UserImpersonateUserId(request: any): number {
  if (request.headers[HEADER_KEY.IMPERSONATE_USER]) {
    return Number(request.headers[HEADER_KEY.IMPERSONATE_USER]);
  }
  const user = request.user;
  return user?.userId;
}

export function UserIdWithScope(cls: ClsService, header: Record<string, string>): number | null {
  if (header[HEADER_KEY.IMPERSONATE_USER]) {
    return Number(header[HEADER_KEY.IMPERSONATE_USER]);
  }
  const user = cls.get(CLS_KEY.REQ_USER);

  if (user?.scopes) {
    const scopeIsObject = user.scopes.some((scope: any) => scope?.scope === SCOPE_ALLOWED.GATEWAY_SERVICE);
    if (scopeIsObject) return null;
  }

  return user?.userId;
}
