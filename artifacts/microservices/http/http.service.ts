import { Injectable, Scope } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable({
  scope: Scope.TRANSIENT, // make url not remember latest vale
})
export class HTTPService {
  private url?: string;

  constructor(private readonly httpService: HttpService) {}

  setUrl(url: string) {
    this.url = url;
  }

  getUrl(): string {
    return this.url;
  }

  private adjustURLPath(path?: string) {
    return path ? (this.url ? this.url : '') + path : this.url;
  }

  async get<T>(path?: string, headersRequest?: any): Promise<T> {
    const urlPath = this.adjustURLPath(path);

    const res$ = this.httpService.get(urlPath, { headers: headersRequest });
    return (await lastValueFrom(res$)).data;
  }

  async post<T>(
    path?: string,
    payload?: any,
    headersRequest?: any,
  ): Promise<T> {
    const urlPath = this.adjustURLPath(path);

    const res$ = this.httpService.post(urlPath, payload, {
      headers: headersRequest,
    });
    return (await lastValueFrom(res$)).data;
  }

  async put<T>(path?: string, payload?: any, headersRequest?: any): Promise<T> {
    const urlPath = this.adjustURLPath(path);

    const res$ = this.httpService.put(urlPath, payload, {
      headers: headersRequest,
    });
    return (await lastValueFrom(res$)).data;
  }

  async patch<T>(
    path?: string,
    payload?: any,
    headersRequest?: any,
  ): Promise<T> {
    const urlPath = this.adjustURLPath(path);

    const res$ = this.httpService.patch(urlPath, payload, {
      headers: headersRequest,
    });
    return (await lastValueFrom(res$)).data;
  }

  async del<T>(path?: string, headersRequest?: any): Promise<T> {
    const urlPath = this.adjustURLPath(path);

    const res$ = this.httpService.delete(urlPath, { headers: headersRequest });
    return (await lastValueFrom(res$)).data;
  }
}
