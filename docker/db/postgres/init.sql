CREATE TYPE "role_type" AS ENUM (
  'application',
  'user'
);

CREATE TYPE "grant_type" AS ENUM (
  'authorization_code',
  'token',
  'password',
  'client_credentials'
);

CREATE TYPE "auth_code_status" AS ENUM (
  'incomplete',
  'encrypted',
  'complete'
);

CREATE TYPE "admin_status" AS ENUM (
  'disable',
  'enable',
  'delete'
);

CREATE TYPE "user_status" AS ENUM (
  'disable',
  'enable',
  'delete'
);

CREATE TYPE "application_status" AS ENUM (
  'disable',
  'enable',
  'delete'
);

CREATE TYPE "role_status" AS ENUM (
  'disable',
  'enable',
  'delete'
);

CREATE TYPE "permission_status" AS ENUM (
  'disable',
  'enable',
  'delete'
);

CREATE TYPE "scope_master_status" AS ENUM (
  'disable',
  'enable',
  'delete'
);

CREATE TYPE "forgot_types" AS ENUM (
  'pin',
  'password'
);

CREATE TYPE "forgot_expire_reasons" AS ENUM (
  'user_already_used',
  'timeout',
  'have_new_token'
);

CREATE TYPE "forgot_methods" AS ENUM (
  'phone',
  'email'
);

CREATE TYPE "sms_configuration_service" AS ENUM (
  'smsmkt'
);

CREATE TYPE "fund_accounts_status" AS ENUM (
  'disable',
  'enable',
  'deleted'
);

CREATE TYPE "fund_accounts_type" AS ENUM (
  'DEPOSIT',
  'WITHDRAW',
  'FEE'
);

CREATE TYPE "transaction_status" AS ENUM (
  'DRAFT',
  'CREATE',
  'ON_PROCESS',
  'WAIT_CONFIRM',
  'SUCCESS',
  'REJECT',
  'BLACKLIST',
  'FAILED',
  'SETTLED',
  'MERCHANT_TRANSFERED'
);

CREATE TYPE "transaction_type" AS ENUM (
  'DEPOSIT',
  'WITHDRAW',
  'TOPUP',
  'TRANSFER',
  'CONFIRM'
);

CREATE TYPE "statement_confirmation" AS ENUM (
  'WAIT_CONFIRM',
  'CONFIRMED',
  'REJECT'
);

CREATE TYPE "statement_settlement" AS ENUM (
  'SETTLED',
  'WAITING'
);

CREATE TYPE "settlement_status" AS ENUM (
  'WAITING',
  'APPROVED',
  'TRANSFERED',
  'FAILED',
  'CANCELLED'
);

CREATE TYPE "qr_status" AS ENUM (
  'CREATED',
  'COMPLETED',
  'CANCELED'
);

CREATE TYPE "layer_type" AS ENUM (
  'PROCEDURE',
  'STEP',
  'LOOP'
);

CREATE TYPE "status_rpa" AS ENUM (
  'AVAILABLE',
  'BUSY',
  'OFFLINE'
);

CREATE TYPE "batch_status_scb" AS ENUM (
  'SUCCESS',
  'PARTIALLY_SUCCESS',
  'FAILED',
  'PROCESSING',
  'CREATED'
);

CREATE TABLE "admin_consoles" (
  "id" SERIAL PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "password" varchar,
  "avatar" varchar,
  "status" admin_status NOT NULL,
  "last_login_at" timestamp,
  "last_active_at" timestamp,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "sms_configurations" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar NOT NULL,
  "service" sms_configuration_service NOT NULL,
  "api_key" varchar NOT NULL,
  "secret_key" varchar NOT NULL,
  "sender" varchar NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "applications" (
  "id" SERIAL PRIMARY KEY,
  "admin_console_id" int,
  "name" varchar NOT NULL,
  "description" text,
  "client_id" varchar UNIQUE NOT NULL,
  "client_secret" varchar UNIQUE NOT NULL,
  "redirect_uri" text NOT NULL,
  "callback_uri" text,
  "status" application_status NOT NULL,
  "verify_account_name" bool,
  "sms_configuration_id" int,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "application_scope_relations" (
  "id" SERIAL PRIMARY KEY,
  "application_id" int,
  "scope_master_id" int,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "scope_masters" (
  "id" SERIAL PRIMARY KEY,
  "admin_console_id" int,
  "name" varchar NOT NULL,
  "scope" varchar UNIQUE NOT NULL,
  "host_name" varchar NOT NULL,
  "url_path" varchar NOT NULL,
  "type" varchar NOT NULL,
  "status" scope_master_status NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "admin_console_id" int,
  "origin_app_id" int,
  "username" varchar,
  "email" varchar,
  "phone" varchar,
  "password" varchar,
  "pin_code" varchar,
  "avatar" varchar,
  "access_key_id" varchar,
  "secret_access_key_id" varchar,
  "status" user_status NOT NULL,
  "secret_expired_at" timestamp,
  "last_login_at" timestamp,
  "last_active_at" timestamp,
  "is_first_login" bool,
  "last_updated_password" timestamp,
  "two_factor_secret" varchar,
  "is_mfa_verification" bool,
  "is_mfa_enabled" bool,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now()),
  "deleted_at" timestamp
);

CREATE TABLE "user_app_credentials" (
  "id" SERIAL PRIMARY KEY,
  "app_id" int NOT NULL,
  "user_id" int NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "user_role_relations" (
  "id" SERIAL PRIMARY KEY,
  "role_id" int NOT NULL,
  "user_id" int NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "user_forgot_codes" (
  "id" SERIAL PRIMARY KEY,
  "forgot_type" forgot_types NOT NULL,
  "forgot_method" forgot_methods NOT NULL,
  "code" varchar NOT NULL,
  "user_id" int NOT NULL,
  "expired_at" timestamp NOT NULL,
  "expired_reason" forgot_expire_reasons DEFAULT 'timeout',
  "used_at" timestamp,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "roles" (
  "id" SERIAL PRIMARY KEY,
  "application_id" int,
  "name" varchar NOT NULL,
  "status" role_status NOT NULL,
  "type" role_type NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "permissions" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar NOT NULL,
  "permission" varchar NOT NULL,
  "status" permission_status NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "role_permission_relations" (
  "id" SERIAL PRIMARY KEY,
  "role_id" int,
  "permission_id" int,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "user_scope_relations" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "scope_master_id" int,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "tmp_auth_codes" (
  "id" SERIAL PRIMARY KEY,
  "user_id" int,
  "app_id" int NOT NULL,
  "code" varchar NOT NULL,
  "csrf" varchar NOT NULL,
  "status" auth_code_status NOT NULL,
  "encrypted_auth_data" text,
  "auth_token" json,
  "grant_type" grant_type NOT NULL,
  "expired_at" timestamp,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "fund_accounts" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "account_no" varchar(50) NOT NULL,
  "account_name" varchar(255) NOT NULL,
  "balance" decimal(20,3) NOT NULL,
  "available_balance" decimal(20,3) NOT NULL,
  "account_ref_id" int,
  "user_id" int NOT NULL,
  "status" fund_accounts_status NOT NULL,
  "settle_bank_account_id" int,
  "commission_charged" varchar[],
  "type" fund_accounts_type NOT NULL,
  "agent_user_id" int,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "bank_account" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "account_no" varchar(50) NOT NULL,
  "account_name" varchar(255) NOT NULL,
  "bank_code" varchar(10),
  "is_default" bool,
  "user_id" int NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "transaction" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "order_id" varchar(10) UNIQUE NOT NULL,
  "transaction_type_id" int,
  "amount" decimal(20,3) NOT NULL,
  "mdr_amount" decimal(20,3) NOT NULL,
  "net_amount" decimal(20,3) NOT NULL,
  "balance" decimal(20,3) NOT NULL,
  "bank_account_id" int,
  "fund_account_id" int NOT NULL,
  "dest_fund_account_id" int,
  "status" transaction_status NOT NULL,
  "commission_percent_id" int,
  "is_settled" bool,
  "is_commission_cal" bool DEFAULT false,
  "bank_ref" varchar,
  "bank_response" json,
  "transaction_details" json,
  "remark" json,
  "customer_balance" decimal(20,3),
  "customer_id" int,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "transaction_withdraws" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "order_id" varchar(10) UNIQUE NOT NULL,
  "transaction_type_id" int,
  "amount" decimal(20,3) NOT NULL,
  "mdr_amount" decimal(20,3) NOT NULL,
  "net_amount" decimal(20,3) NOT NULL,
  "bank_account_id" int,
  "bank_account_name" varchar,
  "bank_account_no" varchar(50),
  "bank_code" varchar(10),
  "effective_at" timestamp,
  "status" transaction_status NOT NULL,
  "evidence_url" varchar,
  "bank_ref" varchar,
  "batch_process_withdrawal_id" int,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "transaction_types" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" varchar(3),
  "description" varchar,
  "flag" varchar(2),
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "transaction_config" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" varchar(30),
  "value" varchar,
  "unit" varchar,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "qr_generates" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "transaction_id" int NOT NULL,
  "ref_1" varchar,
  "ref_2" varchar,
  "amount" decimal(20,3) NOT NULL,
  "status" qr_status NOT NULL,
  "generate_by_user_id" int NOT NULL,
  "callback_qr_img" varchar,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "commission_percent" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "percent" decimal(5,3) NOT NULL,
  "is_subagent" bool,
  "commission_hierarchy_id" int,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "commission_hierarchies" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "user_id" int NOT NULL,
  "commission_hierarchy_id" int,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "commission_calculate_transactions" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "amount" decimal(20,3) NOT NULL,
  "from_amount" decimal(20,3) NOT NULL,
  "from_percent" decimal(5,3) NOT NULL,
  "transaction_id" int,
  "commission_parent_id" int,
  "commission_percent_id" int NOT NULL,
  "status" statement_settlement DEFAULT 'WAITING',
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "commission_transactions" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "amount" decimal(20,3) NOT NULL,
  "bank_account_id" int NOT NULL,
  "count_of_transaction" int,
  "summary_transaction_amount" decimal(20,3),
  "summary_transaction_mdr_amount" decimal(20,3),
  "summary_transaction_net_amount" decimal(20,3),
  "avg_rate" decimal(10,3),
  "effective_at" timestamp,
  "status" settlement_status,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "settlement_transactions" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "from_transaction_id" int,
  "to_transaction_withdraw_id" int,
  "status" settlement_status,
  "amount" decimal(20,3) NOT NULL,
  "settlement_config_id" int NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "settlement_configs" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "min_amount" decimal(20,3) NOT NULL,
  "max_amount" decimal(20,3),
  "is_auto" bool,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "rpa_json_participants" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "action" transaction_type,
  "layer" layer_type,
  "bank_code" varchar(10),
  "procedure" json,
  "procedure_child_id" int,
  "step_seq_no" int,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "running_doc_formatting" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "name" varchar(20),
  "prefix" varchar(3),
  "running_number" int,
  "decimal" int,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "bank_rpa_withdrawal" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "bank_code" varchar(10),
  "username" varchar(100),
  "password" varchar(100),
  "slave_username" varchar(100),
  "slave_password" varchar(100),
  "is_default" bool,
  "user_id" int NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "rpa_status_processing" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "max_seq_no" int,
  "status_rpa" status_rpa,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "mapping_order_ids" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "source_order_id" varchar UNIQUE,
  "request_order_id" varchar UNIQUE,
  "troubleshoot" varchar,
  "signature_key" varchar UNIQUE,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "batch_process_withdrawal" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "batch_ref" varchar UNIQUE,
  "count_of_items" int,
  "summary_amount" decimal(20,3) NOT NULL,
  "bank_balance_amount" decimal(20,3),
  "bank_rpa_withdrawal_id" int,
  "batch_status" batch_status_scb,
  "batch_file_name" varchar,
  "retry" int DEFAULT 0,
  "is_pause" bool DEFAULT false,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "customers" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "username" varchar UNIQUE,
  "balance" decimal(20,3),
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "transaction_logs" (
  "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  "request_order_id" varchar,
  "payload" json,
  "path" string,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE UNIQUE INDEX ON "application_scope_relations" ("application_id", "scope_master_id");

CREATE UNIQUE INDEX ON "users" ("username", "deleted_at");

CREATE UNIQUE INDEX ON "users" ("origin_app_id", "email", "deleted_at");

CREATE UNIQUE INDEX ON "users" ("origin_app_id", "phone", "deleted_at");

CREATE UNIQUE INDEX ON "users" ("access_key_id", "deleted_at");

CREATE UNIQUE INDEX ON "users" ("secret_access_key_id", "deleted_at");

CREATE UNIQUE INDEX ON "user_app_credentials" ("app_id", "user_id");

CREATE UNIQUE INDEX ON "user_role_relations" ("role_id", "user_id");

CREATE UNIQUE INDEX ON "user_forgot_codes" ("code", "used_at");

CREATE UNIQUE INDEX ON "role_permission_relations" ("role_id", "permission_id");

CREATE UNIQUE INDEX ON "user_scope_relations" ("user_id", "scope_master_id");

ALTER TABLE "applications" ADD FOREIGN KEY ("admin_console_id") REFERENCES "admin_consoles" ("id");

ALTER TABLE "applications" ADD FOREIGN KEY ("sms_configuration_id") REFERENCES "sms_configurations" ("id");

ALTER TABLE "scope_masters" ADD FOREIGN KEY ("admin_console_id") REFERENCES "admin_consoles" ("id");

ALTER TABLE "users" ADD FOREIGN KEY ("admin_console_id") REFERENCES "admin_consoles" ("id");

ALTER TABLE "user_app_credentials" ADD FOREIGN KEY ("app_id") REFERENCES "applications" ("id");

ALTER TABLE "user_app_credentials" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_role_relations" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "user_role_relations" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_forgot_codes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "roles" ADD FOREIGN KEY ("application_id") REFERENCES "applications" ("id");

ALTER TABLE "application_scope_relations" ADD FOREIGN KEY ("application_id") REFERENCES "applications" ("id");

ALTER TABLE "tmp_auth_codes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "application_scope_relations" ADD FOREIGN KEY ("scope_master_id") REFERENCES "scope_masters" ("id");

ALTER TABLE "user_scope_relations" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_scope_relations" ADD FOREIGN KEY ("scope_master_id") REFERENCES "scope_masters" ("id");

ALTER TABLE "role_permission_relations" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "role_permission_relations" ADD FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id");

ALTER TABLE "tmp_auth_codes" ADD FOREIGN KEY ("app_id") REFERENCES "applications" ("id");

ALTER TABLE "users" ADD FOREIGN KEY ("origin_app_id") REFERENCES "applications" ("id");

ALTER TABLE "fund_accounts" ADD FOREIGN KEY ("account_ref_id") REFERENCES "fund_accounts" ("id");

ALTER TABLE "fund_accounts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "fund_accounts" ADD FOREIGN KEY ("settle_bank_account_id") REFERENCES "bank_account" ("id");

ALTER TABLE "fund_accounts" ADD FOREIGN KEY ("agent_user_id") REFERENCES "commission_hierarchies" ("id");

ALTER TABLE "bank_account" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "transaction" ADD FOREIGN KEY ("transaction_type_id") REFERENCES "transaction_types" ("id");

ALTER TABLE "transaction" ADD FOREIGN KEY ("bank_account_id") REFERENCES "bank_account" ("id");

ALTER TABLE "transaction" ADD FOREIGN KEY ("fund_account_id") REFERENCES "fund_accounts" ("id");

ALTER TABLE "transaction" ADD FOREIGN KEY ("dest_fund_account_id") REFERENCES "fund_accounts" ("id");

ALTER TABLE "transaction" ADD FOREIGN KEY ("commission_percent_id") REFERENCES "commission_percent" ("id");

ALTER TABLE "transaction" ADD FOREIGN KEY ("customer_id") REFERENCES "customers" ("id");

ALTER TABLE "transaction_withdraws" ADD FOREIGN KEY ("transaction_type_id") REFERENCES "transaction_types" ("id");

ALTER TABLE "transaction_withdraws" ADD FOREIGN KEY ("bank_account_id") REFERENCES "bank_account" ("id");

ALTER TABLE "transaction_withdraws" ADD FOREIGN KEY ("batch_process_withdrawal_id") REFERENCES "batch_process_withdrawal" ("id");

ALTER TABLE "qr_generates" ADD FOREIGN KEY ("transaction_id") REFERENCES "transaction" ("id");

ALTER TABLE "qr_generates" ADD FOREIGN KEY ("generate_by_user_id") REFERENCES "users" ("id");

ALTER TABLE "commission_percent" ADD FOREIGN KEY ("commission_hierarchy_id") REFERENCES "commission_hierarchies" ("id");

ALTER TABLE "commission_hierarchies" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "commission_hierarchies" ADD FOREIGN KEY ("commission_hierarchy_id") REFERENCES "commission_hierarchies" ("id");

ALTER TABLE "commission_calculate_transactions" ADD FOREIGN KEY ("transaction_id") REFERENCES "transaction" ("id");

ALTER TABLE "commission_calculate_transactions" ADD FOREIGN KEY ("commission_parent_id") REFERENCES "commission_calculate_transactions" ("id");

ALTER TABLE "commission_calculate_transactions" ADD FOREIGN KEY ("commission_percent_id") REFERENCES "commission_percent" ("id");

ALTER TABLE "commission_transactions" ADD FOREIGN KEY ("bank_account_id") REFERENCES "bank_account" ("id");

ALTER TABLE "settlement_transactions" ADD FOREIGN KEY ("from_transaction_id") REFERENCES "transaction" ("id");

ALTER TABLE "settlement_transactions" ADD FOREIGN KEY ("to_transaction_withdraw_id") REFERENCES "transaction_withdraws" ("id");

ALTER TABLE "settlement_transactions" ADD FOREIGN KEY ("settlement_config_id") REFERENCES "settlement_configs" ("id");

ALTER TABLE "rpa_json_participants" ADD FOREIGN KEY ("procedure_child_id") REFERENCES "rpa_json_participants" ("id");

ALTER TABLE "bank_rpa_withdrawal" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "batch_process_withdrawal" ADD FOREIGN KEY ("bank_rpa_withdrawal_id") REFERENCES "bank_rpa_withdrawal" ("id");
