import { Injectable } from '@nestjs/common';
import { DayJsService } from 'artifacts/day-js/day-js.service';
import { RDSService } from 'artifacts/rds/rds.service';
import { activateBot, checkGetReportDaily } from './bll/bot'
import { QueryTypes } from 'sequelize';
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '7670972610:AAHZYcf_Oclfm7qLJDOms7SceeKXONKEBhg'; // ใส่ Bot Token ที่ได้จาก BotFather

@Injectable()
export class BotTeleService {
  private bot: any;
  constructor(
    private readonly rdsService: RDSService,
    private readonly dayJsService: DayJsService
  ) {
    this.bot = new TelegramBot(TOKEN, { polling: true });
    this.setupBotHandlers();
  }

  private setupBotHandlers() {
    this.bot.onText(/\/activate/, (msg) => {
      activateBot(msg, this.bot);
    });
    this.bot.onText(/\/report/, (msg) => {
      if (checkGetReportDaily(msg, this.bot)) {
        this.getTransactionReport(msg, msg.chat.id)
      }
    });
  }


  private async getTransactionReport(msg, chatId) {
    console.log(msg.text);
    const text = msg.text.split(' ');
    let dateTime;
    if (text[1] && this.dayJsService.dayjs(text[1], 'YYYY-MM-DD', true).isValid()) {
      dateTime = text[1];
    } else {
      dateTime = this.dayJsService.dayjs().tz('Asia/Bangkok').format('YYYY-MM-DD');
    }
    let startDate = '';
    let endDate = '';
    if (text.includes('half')) {
      startDate = `${dateTime} 00:00:01`;
      endDate = `${dateTime} 12:00:00`;
    } else if (text.includes('full')) {
      startDate = `${dateTime} 00:00:01`;
      endDate = `${dateTime} 23:59:59`;
    } else {
      startDate = `${dateTime} 00:00:01`;
      endDate = `${dateTime} 23:59:59`;
    }

    const selectDeposit = `
        SELECT 
        count(case when transaction_type_id = 1 then 1 else null end) as deposit_count,
        count(case when transaction_type_id = 2 then 1 else null end) as withdraw_count,
        SUM(case when transaction_type_id = 1 then amount else 0 end) as deposit_amount,
        SUM(case when transaction_type_id = 2 then amount else 0 end) as withdraw_amount,
        SUM(case when transaction_type_id = 1 then net_amount else 0 end) as deposit_net_amount,
        SUM(case when transaction_type_id = 2 then net_amount else 0 end) as withdraw_net_amount,
        SUM(case when transaction_type_id = 1 then mdr_amount else 0 end) as deposit_mdr_amount,
        SUM(case when transaction_type_id = 2 then mdr_amount else 0 end) as withdraw_mdr_amount
        from public."transaction" t 
        where transaction_type_id IN(1,2) and status = 'SUCCESS' and fund_account_id <> 3 and dest_fund_account_id <> 3
        AND (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') 
        BETWEEN '${startDate}' AND '${endDate}';
    `;

    const dataDeposit: any = await this.rdsService.getRDSClient().getSequelize().query(selectDeposit, {
      type: QueryTypes.SELECT,
    });
    if (dataDeposit.length === 0) {
      return this.bot.sendMessage(chatId, 'ไม่พบข้อมูล ❌');
    }

    const textReport = `
🕐 ช่วงเวลา: ${startDate} - ${endDate}

📥 รายการฝาก
- จำนวนรายการ: ${dataDeposit[0]?.deposit_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดรวมทั้งหมด: ${Number(dataDeposit[0]?.deposit_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ค่าธรรมเนียม: ${Number(dataDeposit[0]?.deposit_mdr_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดสุทธิหลังหักค่าธรรมเนียม: ${Number(dataDeposit[0]?.deposit_net_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

📤 รายการถอน
- จำนวนรายการ: ${dataDeposit[0]?.withdraw_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดรวมทั้งหมด: ${Number(dataDeposit[0]?.withdraw_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ค่าธรรมเนียม: ${Number(dataDeposit[0]?.withdraw_mdr_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดสุทธิ: ${Number(dataDeposit[0]?.withdraw_net_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

💰 กำไร: ${((dataDeposit[0]?.deposit_amount - dataDeposit[0]?.withdraw_net_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))} บาท
📈 กำไร: ${((dataDeposit[0]?.deposit_amount - dataDeposit[0]?.withdraw_net_amount) / dataDeposit[0]?.deposit_net_amount * 100).toFixed(2)}%
    `;

    this.bot.sendMessage(chatId, textReport);
  }
}
