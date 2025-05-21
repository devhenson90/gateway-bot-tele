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
    this.initializeBot();
  }

  private async initializeBot() {
    this.bot = new TelegramBot(TOKEN, { polling: false });
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
        SUM(case when transaction_type_id = 1 then amount else 0 end) as deposit_amount,
        SUM(case when transaction_type_id = 1 then net_amount else 0 end) as deposit_net_amount,
        SUM(case when transaction_type_id = 1 then mdr_amount else 0 end) as deposit_mdr_amount
        from public."transaction" t 
        where transaction_type_id IN(1) and status = 'SUCCESS' and fund_account_id <> 3 and dest_fund_account_id <> 3
        AND (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') 
        BETWEEN '${startDate}' AND '${endDate}';
    `;

    const dataDeposit: any = await this.rdsService.getRDSClient().getSequelize().query(selectDeposit, {
      type: QueryTypes.SELECT,
    });
    if (dataDeposit.length === 0) {
      return this.bot.sendMessage(chatId, 'ไม่พบข้อมูล ❌');
    }

    const selectWithdraw = `
        select SUM(count_of_items) as count_of_items,SUM(summary_amount) as summary_amount from batch_process_withdrawal bpw 
      where batch_status = 'SUCCESS'
        AND (updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok') 
        BETWEEN '${startDate}' AND '${endDate}';
    `;

    const dataWithdraw: any = await this.rdsService.getRDSClient().getSequelize().query(selectWithdraw, {
      type: QueryTypes.SELECT,
    });
    if (dataWithdraw.length === 0) {
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
- จำนวนรายการ: ${(dataWithdraw[0]?.count_of_items ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดรวมทั้งหมด: ${Number((dataWithdraw[0]?.summary_amount ?? "0")).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

💰 กำไร: ${((dataDeposit[0]?.deposit_amount - dataWithdraw[0]?.summary_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))} บาท
📈 กำไร: ${((dataDeposit[0]?.deposit_amount - dataWithdraw[0]?.summary_amount) / dataDeposit[0]?.deposit_amount * 100).toFixed(2)}%
    `;

    this.bot.sendMessage(chatId, textReport);
  }
}
