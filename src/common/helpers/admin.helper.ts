import { CLS_KEY } from 'artifacts/cls/cls.client';
import { ClsService } from 'nestjs-cls';

export function AdminConsoleId(cls: ClsService): number {
  const user = cls.get(CLS_KEY.REQ_USER);
  return user?.adminConsoleId;
}
