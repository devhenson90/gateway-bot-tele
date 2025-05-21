export enum HttpHeaderKey {
  clientId = 'oauth-client-id',
}

export enum HttpBodyKey {
  clientId = 'clientId',
}

export function ClientId(request) {
  let clientId = request.headers[HttpHeaderKey.clientId];
  if (!clientId) {
    clientId = request.body[HttpBodyKey.clientId];
  }
  return clientId;
}
