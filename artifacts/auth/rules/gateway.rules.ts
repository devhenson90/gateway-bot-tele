import { MethodEnum } from "./enums";

export const gatewayRules = [
  // user-management
  // user
  {
    path: '/api/gateway/v1/user',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/user',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/user/change-password/:id',
    method: MethodEnum.PATCH,
  },
  {
    path: '/api/gateway/v1/user/set-password/:id',
    method: MethodEnum.PATCH,
  },
  {
    path: '/api/gateway/v1/user/:id',
    method: MethodEnum.DELETE,
  },
  // user-asso
  {
    path: '/api/gateway/v1/user-asso/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user-asso/:view/all-users',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user-asso/with-roles/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user-asso/with-roles/:view/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user-asso/by-roles/:view',
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
    path: '/api/gateway/v1/user-asso/user-authority/:view/:id',
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
  {
    path: '/api/gateway/v1/user-asso',
    method: MethodEnum.DELETE,
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
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/application',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/application/:id',
    method: MethodEnum.DELETE,
  },
  // admin-console
  {
    path: '/api/gateway/v1/admin-console/:id',
    method: MethodEnum.GET,
  },
  // application-scope
  {
    path: '/api/gateway/v1/application-scope/relation',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/application-scope/:view',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/application-scope/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/application-scope/:view/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/application-scope/:view',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/application-scope/:applicationId/:scopeId',
    method: MethodEnum.DELETE,
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
  {
    path: '/api/gateway/v1/application-asso/:view',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/application-asso/:view',
    method: MethodEnum.PUT,
  },
  // role
  {
    path: '/api/gateway/v1/role',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/role/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/role',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/role',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/role/:id',
    method: MethodEnum.DELETE,
  },
  // permission
  {
    path: '/api/gateway/v1/permission',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/permission/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/permission',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/permission',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/permission/:id',
    method: MethodEnum.DELETE,
  },
  // tmp-auth-code
  {
    path: '/api/gateway/v1/tmp-auth-code',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/tmp-auth-code/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/tmp-auth-code',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/tmp-auth-code',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/tmp-auth-code/:id',
    method: MethodEnum.DELETE,
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
  {
    path: '/api/gateway/v1/scope-master',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/scope-master',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/scope-master/:id',
    method: MethodEnum.DELETE,
  },
  // role-permission
  {
    path: '/api/gateway/v1/role-permission/relation',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/role-permission/:view',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/role-permission/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/role-permission/:view/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/role-permission/:view',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/role-permission/:roleId/:permissionId',
    method: MethodEnum.DELETE,
  },
  // user-scope
  {
    path: '/api/gateway/v1/user-scope/relation',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/user-scope/:view',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/user-scope/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user-scope/:view/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user-scope/:view',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/user-scope/:userId/:scopeId',
    method: MethodEnum.DELETE,
  },
  // user-role
  {
    path: '/api/gateway/v1/user-role/relation',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/user-role/:view',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/user-role/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user-role/:view/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/user-role/:view',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/user-role/:relationId',
    method: MethodEnum.DELETE,
  },
  // application-asso
  {
    path: '/api/gateway/v1/application-asso/relation',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/application-asso/:view',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/application-asso/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/application-asso/:view/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/application-asso/:view',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/application-asso/:relationId',
    method: MethodEnum.DELETE,
  },

  // fund-account
  {
    path: '/api/gateway/v1/fund-account',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/fund-account/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/fund-account',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/fund-account/available',
    method: MethodEnum.POST,
  },
  // {
  //   path: '/api/gateway/v1/fund-account',
  //   method: MethodEnum.PUT,
  // },
  {
    path: '/api/gateway/v1/fund-account',
    method: MethodEnum.PATCH,
  },
  {
    path: '/api/gateway/v1/fund-account',
    method: MethodEnum.DELETE,
  },
  // fund-account-asso
  {
    path: '/api/gateway/v1/fund-account-asso/:view/list',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/fund-account-asso/no-fund-account-users',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/fund-account-asso/relation',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/fund-account-asso/:view',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/fund-account-asso/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/fund-account-asso/:view/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/fund-account-asso/:view',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/fund-account-asso/:relationId',
    method: MethodEnum.DELETE,
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
  // commission-hierarchy
  {
    path: '/api/gateway/v1/commission-hierarchy',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-hierarchy/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-hierarchy',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/commission-hierarchy',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/commission-hierarchy/:id',
    method: MethodEnum.DELETE,
  },
  // commission-hierarchy-transaction-asso
  {
    path: '/api/gateway/v1/commission-hierarchy-transaction-asso/relation',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/commission-hierarchy-transaction-asso/:view',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/commission-hierarchy-transaction-asso/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-hierarchy-transaction-asso/:view/selector',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-hierarchy-transaction-asso/:view/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-hierarchy-transaction-asso/:view',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/commission-hierarchy-transaction-asso/:relationId',
    method: MethodEnum.DELETE,
  },
  // commission-percent
  {
    path: '/api/gateway/v1/commission-percent',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-percent/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-percent',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/commission-percent',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/commission-percent/:id',
    method: MethodEnum.DELETE,
  },
  // commission-transaction
  {
    path: '/api/gateway/v1/commission-transaction',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-transaction/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-transaction',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/commission-transaction',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/commission-transaction/:id',
    method: MethodEnum.DELETE,
  },
  // commission-transaction-asso
  {
    path: '/api/gateway/v1/commission-transaction-asso/relation',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/commission-transaction-asso/:view',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/commission-transaction-asso/settlement',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/commission-transaction-asso/:view',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-transaction-asso/:view/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/commission-transaction-asso/:view',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/commission-transaction-asso/:relationId',
    method: MethodEnum.DELETE,
  },
  // settlement
  {
    path: '/api/gateway/v1/settlement',
    method: MethodEnum.POST,
  },
  // rpa-json-participants
  {
    path: '/api/gateway/v1/rpa-json-participants',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/rpa-json-participants/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/rpa-json-participants/action/:action',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/rpa-json-participants',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/rpa-json-participants',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/rpa-json-participants/:id',
    method: MethodEnum.DELETE,
  },
  // running-doc-formatting
  {
    path: '/api/gateway/v1/running-doc-formatting',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/running-doc-formatting/order-id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/running-doc-formatting/fund-account-no',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/running-doc-formatting/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/running-doc-formatting',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/running-doc-formatting',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/running-doc-formatting/:id',
    method: MethodEnum.DELETE,
  },
  // rpa-status-processing
  {
    path: '/api/gateway/v1/rpa-status-processing',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/rpa-status-processing/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/rpa-status-processing',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/rpa-status-processing',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/rpa-status-processing/:id',
    method: MethodEnum.DELETE,
  },
  // transaction-config
  {
    path: '/api/gateway/v1/transaction-config',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-config/name/:name',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-config/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/transaction-config',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction-config',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/transaction-config/:id',
    method: MethodEnum.DELETE,
  },
  // settlement-config
  {
    path: '/api/gateway/v1/settlement-config',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/settlement-config/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/settlement-config',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/settlement-config',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/settlement-config/:id',
    method: MethodEnum.DELETE,
  },

  // main-menu
  // dashboard
  {
    path: '/api/gateway/v1/dashboard/list-transaction',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/dashboard/summary',
    method: MethodEnum.GET,
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
    path: '/api/gateway/v1/transaction/withdraw',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/transfer',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/top-up',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/manual-update-status',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/transaction/orderId/:orderId',
    method: MethodEnum.GET,
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
  // merchant integration logs
  {
    path: '/api/gateway/v1/merchant-integration-logs',
    method: MethodEnum.POST,
  },
  // bank-rpa-withdrawal
  {
    path: '/api/gateway/v1/bank-rpa-withdrawal',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/bank-rpa-withdrawal/:id',
    method: MethodEnum.GET,
  },
  {
    path: '/api/gateway/v1/bank-rpa-withdrawal',
    method: MethodEnum.POST,
  },
  {
    path: '/api/gateway/v1/bank-rpa-withdrawal',
    method: MethodEnum.PUT,
  },
  {
    path: '/api/gateway/v1/bank-rpa-withdrawal/:id',
    method: MethodEnum.DELETE,
  },
];