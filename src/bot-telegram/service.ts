import { Injectable } from '@nestjs/common';
import { DayJsService } from 'artifacts/day-js/day-js.service';
import { RDSService } from 'artifacts/rds/rds.service';
import { activateBot, checkActivateBot } from './bll/bot'
import { QueryTypes } from 'sequelize';
import { ThirdPartyService } from './bll/co2pay';
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '7670972610:AAHZYcf_Oclfm7qLJDOms7SceeKXONKEBhg'; // ใส่ Bot Token ที่ได้จาก BotFather

@Injectable()
export class BotTeleService {
  private bot: any;
  constructor(
    private readonly rdsService: RDSService,
    private readonly dayJsService: DayJsService,
    private readonly thirdPartyService: ThirdPartyService
  ) {
    this.initializeBot();
  }

  private async initializeBot() {
    this.bot = new TelegramBot(TOKEN, { polling: true });
    await this.clearPendingMessages();

    // Start polling after clearing messages
    this.bot.startPolling();

    // Add a small delay before setting up handlers
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.setupBotHandlers();
  }

  private async clearPendingMessages() {
    try {
      const updates = await this.bot.getUpdates({ offset: -1 });
      if (updates && updates.length > 0) {
        const lastUpdateId = updates[updates.length - 1].update_id;
        await this.bot.getUpdates({ offset: lastUpdateId + 1 });
        console.log('Successfully cleared all pending messages');
      }
    } catch (error) {
      console.error('Error clearing pending messages:', error);
    }
  }

  private setupBotHandlers() {
    this.bot.onText(/\/activate/, (msg) => {
      activateBot(msg, this.bot);
    });

    let isProcessingReport = false;
    this.bot.onText(/\/report/, async (msg) => {
      if (isProcessingReport) {
        return;
      }
      try {
        isProcessingReport = true;
        if (checkActivateBot(msg, this.bot)) {
          await this.getTransactionReport(msg, msg.chat.id);
        }
      } finally {
        isProcessingReport = false;
      }
    });

    let isProcessingCheck = false;
    this.bot.onText(/\/check/, async (msg) => {
      if (isProcessingCheck) {
        return;
      }
      try {
        isProcessingCheck = true;
        if (checkActivateBot(msg, this.bot)) {
          await this.getTransactionCheck(msg, msg.chat.id);
        }
      } finally {
        isProcessingCheck = false;
      }
    });
  }

  private async getTransactionCheck(msg, chatId) {
    console.log(msg.text);
    const text = msg.text.split(' ');
    let textResponse = '';
    if (text[1]) {
      const requestOrderId = text[1];
      const checkTypeTransaction = `
      SELECT moi.source_order_id,moi.request_order_id,t.transaction_type_id,t.status,t.amount,t.bank_ref,t.mdr_amount,t.net_amount,t.bank_response,t.created_at,t.updated_at,t.transaction_details,t.remark 
      FROM public."mapping_order_ids" moi LEFT JOIN public."transaction" t ON moi.source_order_id = t.order_id 
      WHERE moi.request_order_id = '${requestOrderId}';
  `;

      const dataTransaction: any = await this.rdsService.getRDSClient().getSequelize().query(checkTypeTransaction, {
        type: QueryTypes.SELECT,
      });
      if (dataTransaction.length === 0) {
        textResponse = 'ไม่พบข้อมูล ❌';
      }
      console.log("dataTransaction", dataTransaction);
      if (dataTransaction[0].transaction_type_id === 1) {
        textResponse = await this.checkDepositData(requestOrderId, dataTransaction[0]);
      } else if (dataTransaction[0].transaction_type_id === 2) {

        textResponse = 'Hi'
      }
    } else {
      textResponse = 'กรุณาระบุรหัสธุรกรรม'
    }

    return this.bot.sendMessage(chatId, textResponse);

  }

  private async checkDepositData(requestOrderId: string, dataTransaction: any): Promise<string> {
    let textResponse = '';
    if (dataTransaction.status === 'SUCCESS') {
      const inquiryData: any = await this.thirdPartyService.inquiryTransaction(requestOrderId);
      if (inquiryData) {
        if (inquiryData?.data?.status === 'SUCCESS') {
          return textResponse = `
          Copy Text : รายการฝากสำเร็จ เติมเครดิตเรียบร้อย ✅
          
------- สำหรับ Check PTT ห้าม Copy --------
รหัสธุรกรรม : ${dataTransaction.source_order_id}
รหัสธุรกรรมครอบ : ${requestOrderId}
ชื่อ : ${dataTransaction.transaction_details.accountName}
ยอดเงิน : ${Number(dataTransaction.amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} บาท
วันที่ทำรายการ : ${this.dayJsService.dayjs(dataTransaction.updated_at).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm:ss')}
เว็ป User : ${inquiryData?.data?.customer?.username || ''}`;
        }
      }
      return textResponse = `
      Copy Text : รายการฝากสำเร็จ แจ้งให้เว็ปเติมเครดิต ✅
      
------- สำหรับ Check PTT ห้าม Copy --------
รหัสธุรกรรม : ${dataTransaction.source_order_id}
รหัสธุรกรรมครอบ : ${requestOrderId}
ชื่อ : ${dataTransaction.transaction_details.accountName}
ยอดเงิน : ${Number(dataTransaction.amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} บาท
วันที่ทำรายการ : ${this.dayJsService.dayjs(dataTransaction.updated_at).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm:ss')}
เว็ป User : ${inquiryData?.data?.customer?.username || ''}`
    } else {
      if (dataTransaction.status === 'CREATE') {
        if (dataTransaction.remark && dataTransaction.remark.status === "PENDING_VERIFY") {
          return textResponse = `
          Copy Text : รายการรอ อนุโลมกรุณาไปทำรายการบนเว็ปครอบ 
          
------- สำหรับ Check PTT ห้าม Copy --------
รหัสธุรกรรม : ${dataTransaction.source_order_id}
รหัสธุรกรรมครอบ : ${requestOrderId}
ชื่อ : ${dataTransaction.transaction_details.accountName}
ยอดเงิน : ${Number(dataTransaction.amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} บาท
วันที่ทำรายการ : ${this.dayJsService.dayjs(dataTransaction.updated_at).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm:ss')}`
        } else if (dataTransaction.remark && dataTransaction.remark.status === "VERIFIED") {
          return textResponse = `
      Copy Text : รายการฝากสำเร็จ แจ้งให้เว็ปเติมเครดิต ✅
      
------- สำหรับ Check PTT ห้าม Copy --------
รหัสธุรกรรม : ${dataTransaction.source_order_id}
รหัสธุรกรรมครอบ : ${requestOrderId}
ชื่อ : ${dataTransaction.transaction_details.accountName}
ยอดเงิน : ${Number(dataTransaction.amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} บาท
วันที่ทำรายการ : ${this.dayJsService.dayjs(dataTransaction.updated_at).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm:ss')}`
        } else {
          return textResponse = `
      รายการหมดอายุแล้ว ❌
ทำตาม Step
1. เข้าหน้าเว็ป
2. กด Callback
3. แจ้งโอนคืน ${requestOrderId}
      
------- สำหรับ Check PTT ห้าม Copy --------
รหัสธุรกรรม : ${dataTransaction.source_order_id}
รหัสธุรกรรมครอบ : ${requestOrderId}
ชื่อ : ${dataTransaction.transaction_details.accountName}
ยอดเงิน : ${Number(dataTransaction.amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} บาท
วันที่ทำรายการ : ${this.dayJsService.dayjs(dataTransaction.updated_at).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm:ss')}`
        }
      } else {
        const callbackData = {
          orderId: requestOrderId,
          amount: parseInt(dataTransaction.amount),
          status: 'FAILED',
          mdrAmount: parseInt(dataTransaction.mdr_amount),
          netAmount: parseInt(dataTransaction.net_amount),
          payerAccountNumber: dataTransaction.transaction_details.accountNo,
          payerName: dataTransaction.transaction_details.accountName,
          bankRef: dataTransaction.bank_ref,
          createdAt: dataTransaction.created_at,
          updatedAt: dataTransaction.updated_at,
        }
        console.log("dataTransaction", callbackData);
        await this.thirdPartyService.callbackTransaction(requestOrderId, callbackData, '/deposit');

        return textResponse = `
      โอนคืน Reply Tag Approve ตามด้วย ${requestOrderId}
      
------- สำหรับ Check PTT ห้าม Copy --------

รหัสธุรกรรม : ${dataTransaction.source_order_id}
รหัสธุรกรรมครอบ : ${requestOrderId}
ชื่อ : ${dataTransaction.transaction_details.accountName}
ยอดเงิน : ${Number(dataTransaction.amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} บาท
วันที่ทำรายการ : ${this.dayJsService.dayjs(dataTransaction.updated_at).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm:ss')}`
      }

    }
  }


  private async getTransactionReport(msg, chatId) {
    console.log(msg.text);
    const text = msg.text.split(' ');
    let startDateTimeDeposit;
    let startDateTimeDepositWithHours;
    let dateTime;
    let endDateTime;
    let endDateTimeDeposit;
    if (text[1] && this.dayJsService.dayjs(text[1], 'YYYY-MM-DD', true).isValid()) {
      dateTime = text[1];
      startDateTimeDeposit = this.dayJsService.dayjs(text[1], 'YYYY-MM-DD', true).subtract(1, 'day').tz('Asia/Bangkok').format('YYYY-MM-DD');
    } else {
      dateTime = this.dayJsService.dayjs().tz('Asia/Bangkok').format('YYYY-MM-DD');
      startDateTimeDeposit = this.dayJsService.dayjs().subtract(1, 'day').tz('Asia/Bangkok').format('YYYY-MM-DD');
    }

    if (text[2] && this.dayJsService.dayjs(text[2], 'YYYY-MM-DD', true).isValid()) {
      endDateTime = text[2];
    } else {
      endDateTime = dateTime
    }

    let startDate = '';
    let endDate = '';
    let endDateTimeDepositWithHours;
    if (text.includes('half')) {
      startDate = `${dateTime} 00:00:01`;
      startDateTimeDepositWithHours = `${startDateTimeDeposit} 23:00:00`;
      endDate = `${endDateTime} 12:00:00`;
      endDateTimeDepositWithHours = `${endDateTime} 12:00:00`;
    } else if (text.includes('full')) {
      startDate = `${dateTime} 00:00:01`;
      startDateTimeDepositWithHours = `${startDateTimeDeposit} 23:00:00`;
      endDate = `${endDateTime} 23:59:59`;
      endDateTimeDepositWithHours = `${endDateTime} 22:59:59`;
    } else {
      startDate = `${dateTime} 00:00:01`;
      startDateTimeDepositWithHours = `${startDateTimeDeposit} 23:00:00`;
      endDate = `${endDateTime} 23:59:59`;
      endDateTimeDepositWithHours = `${endDateTime} 22:59:59`;
    }

    const selectDeposit = `
        SELECT 
        count(case when transaction_type_id = 1 then 1 else null end) as deposit_count,
        SUM(case when transaction_type_id = 1 then amount else 0 end) as deposit_amount,
        SUM(case when transaction_type_id = 1 then net_amount else 0 end) as deposit_net_amount,
        SUM(case when transaction_type_id = 1 then mdr_amount else 0 end) as deposit_mdr_amount
        from public."transaction" t 
        where transaction_type_id IN(1) and status = 'SUCCESS' and fund_account_id <> 3 and dest_fund_account_id <> 3
        AND (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') 
        BETWEEN '${startDateTimeDepositWithHours}' AND '${endDateTimeDepositWithHours}';
    `;

    const dataDeposit: any = await this.rdsService.getRDSClient().getSequelize().query(selectDeposit, {
      type: QueryTypes.SELECT,
    });
    if (dataDeposit.length === 0) {
      return this.bot.sendMessage(chatId, 'ไม่พบข้อมูล ❌');
    }

    const selectWithdraw = `
        select count(id) as count_of_items,SUM(amount) as summary_amount from transaction_withdraws
      where status IN('SUCCESS')
        AND (updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') 
        BETWEEN '${startDate}' AND '${endDate}';
    `;

    const dataWithdraw: any = await this.rdsService.getRDSClient().getSequelize().query(selectWithdraw, {
      type: QueryTypes.SELECT,
    });
    if (dataWithdraw.length === 0) {
      return this.bot.sendMessage(chatId, 'ไม่พบข้อมูล ❌');
    }

    const selectRevertDeposit = `
        SELECT 
        count(case when transaction_type_id = 2 then 1 else null end) as deposit_count,
        SUM(case when transaction_type_id = 2 then amount else 0 end) as deposit_amount,
        SUM(case when transaction_type_id = 2 then net_amount else 0 end) as deposit_net_amount,
        SUM(case when transaction_type_id = 2 then mdr_amount else 0 end) as deposit_mdr_amount
        from public."transaction" t 
        where transaction_type_id IN(2) and remark::jsonb ? 'refOrderId'
        and remark->>'refOrderId' is not null and fund_account_id <> 3 and dest_fund_account_id <> 3
        AND (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') 
        BETWEEN '${startDateTimeDepositWithHours}' AND '${endDateTimeDepositWithHours}';
    `;

    const dataRevertDeposit: any = await this.rdsService.getRDSClient().getSequelize().query(selectRevertDeposit, {
      type: QueryTypes.SELECT,
    });

    const textReport = `
🕐 ช่วงเวลาฝาก: ${startDateTimeDepositWithHours} - ${endDateTimeDepositWithHours}

📥 รายการฝาก
- จำนวนรายการ: ${dataDeposit[0]?.deposit_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดรวมทั้งหมด: ${Number(dataDeposit[0]?.deposit_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ค่าธรรมเนียม: ${Number(dataDeposit[0]?.deposit_mdr_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดสุทธิหลังหักค่าธรรมเนียม: ${Number(dataDeposit[0]?.deposit_net_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}


🕐 ช่วงเวลาถอน: ${startDate} - ${endDate}
📤 รายการถอน
- จำนวนรายการ: ${(dataWithdraw[0]?.count_of_items ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดรวมทั้งหมด: ${Number((dataWithdraw[0]?.summary_amount ?? "0")).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

💰 ส่วนต่าง: ${((dataDeposit[0]?.deposit_amount - dataWithdraw[0]?.summary_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))} บาท
📈 ส่วนต่าง %: ${((dataDeposit[0]?.deposit_amount - dataWithdraw[0]?.summary_amount) / dataDeposit[0]?.deposit_amount * 100).toFixed(2)}%

🔄 Refund
- จำนวนรายการ: ${dataRevertDeposit[0]?.deposit_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดรวมทั้งหมด: ${Number(dataRevertDeposit[0]?.deposit_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
    `;

    this.bot.sendMessage(chatId, textReport);
  }
}
