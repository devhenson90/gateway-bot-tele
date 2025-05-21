import { MethodEnum } from "./enums";

export const agentRules = [
  // user-management
  // user
  {
    path: '/api/gateway/v1/user/change-password/:id',
    method: MethodEnum.PATCH,
  },
  {
    path: '/api/gateway/v1/user/set-password/:id',
    method: MethodEnum.PATCH,
  },
  // user-asso
  {
    path: '/api/gateway/v1/user-asso/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user-asso/:view/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user-asso/profile/:view/:id',
    method: MethodEnum.GET,
  },

  // bank-account
  {
    path: '/api/gateway/v1/bank-account',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/bank-account/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/bank-account',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/bank-account',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/bank-account/:id',
    method: MethodEnum.DELETE,
  },

  // transaction-asso
  {
    path: '/api/gateway/v1/transaction-asso/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/list-transaction',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/bank-statement',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/withdraw-funds',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/summary',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/report-deposit',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/report-withdraw',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/report-settlement',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/report-daily',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/report-deposit-balance',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/report-withdraw-balance',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/commission',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/report-deposit-balance',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-asso/:view/report-deposit-balance',
    method: MethodEnum.GET,
  },
  // commission-transaction-asso
  {
    path: '/api/gateway/v1/commission-transaction-asso/:view',
    method: MethodEnum.GET,
  },
  // commission-calculation-transaction-asso
  {
    path: '/api/gateway/v1/commission-calculation-transaction-asso/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-calculation-transaction-asso/:view/summary',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-calculation-transaction-asso/:view/report',
    method: MethodEnum.GET,
  },
];