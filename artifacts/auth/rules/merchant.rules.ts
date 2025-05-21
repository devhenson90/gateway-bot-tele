import { MethodEnum } from "./enums";

export const merchantRules = [
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
  {
    path: '/api/gateway/v1/user-asso/:view',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/user-asso/:view',
    method: MethodEnum.PUT,
  },
  // application
  {
    path: '/api/gateway/v1/application',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/application/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/application',
    method: MethodEnum.PUT,
  },
  // application-asso
  {
    path: '/api/gateway/v1/application-asso/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/application-asso/:view/:id',
    method: MethodEnum.GET,
  },
  // scope-master
  {
    path: '/api/gateway/v1/scope-master',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/scope-master/:id',
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
  // transaction
  {
    path: '/api/gateway/v1/transaction/deposit',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/withdrawal/generate',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/withdrawal/confirm',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/withdrawal/cancel',
    method: MethodEnum.POST,
  },
  // {
  //   path: '/api/gateway/v1/transaction/withdraw',
  //   method: MethodEnum.POST,
  // },
  {
    path: '/api/gateway/v1/transaction/transfer',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/top-up',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/inquiry-retry',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/slip-upload',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/topup-slip-upload',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/manual-callback',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/verify',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/cancel',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/troubleshoot',
    method: MethodEnum.POST,
  },
  // settlement-asso
  {
    path: '/api/gateway/v1/settlement-asso/:view',
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
  // transaction-withdraw
  {
    path: '/api/gateway/v1/transaction-withdraw/orderId/:orderId',
    method: MethodEnum.GET,
  },
  // dashboard
  {
    path: '/api/gateway/v1/dashboard/list-transaction',
    method: MethodEnum.GET,
  },
];