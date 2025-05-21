import { Injectable } from '@nestjs/common';
import { QueryTypes } from "sequelize";
import { RDSService } from "artifacts/rds/rds.service";
import { DayJsService } from "artifacts/day-js/day-js.service";

const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const TOKEN = '7670972610:AAHZYcf_Oclfm7qLJDOms7SceeKXONKEBhg'; // ใส่ Bot Token ที่ได้จาก BotFather
const CHAT_ID_FILE = './chat_ids.json';
const ADMIN_ID = 5781571528;

@Injectable()
export class BotTelegramService {
    private bot: any;

    constructor(private readonly rdsService: RDSService, private readonly dayJsService: DayJsService) {
        this.bot = new TelegramBot(TOKEN, { polling: true });
        this.setupBotHandlers();
    }

    private setupBotHandlers() {
        this.bot.onText(/\/activate/, (msg) => {
            this.activateReportBroadcastStatic(msg);
        });
        this.bot.onText(/\/report/, (msg) => {
            this.reportBroadcastStatic(msg);
        });
    }

    // โหลด chat ids จากไฟล์
    private loadChatIds() {
        try {
            const data = fs.readFileSync(CHAT_ID_FILE, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            return [];
        }
    }

    // บันทึก chat ids ลงไฟล์
    private saveChatIds(ids) {
        fs.writeFileSync(CHAT_ID_FILE, JSON.stringify(ids));
    }

    // เพิ่ม chat id ถ้ายังไม่มี
    private registerChatId(chatId) {
        const ids = this.loadChatIds();
        if (!ids.includes(chatId)) {
            ids.push(chatId);
            this.saveChatIds(ids);
        }
    }

    private checkActivateBot(chatId) {
        const ids = this.loadChatIds();
        if (ids.includes(chatId)) {
            return true;
        }
        return false;
    }

    async activateReportBroadcastStatic(msg) {
        const chatId = msg.chat.id;
        if (msg.from.id !== ADMIN_ID) {
            return this.bot.sendMessage(chatId, '❌ คุณไม่มีสิทธิ์เปิดใช้งาน Bot');
        }
        this.registerChatId(chatId);
        this.bot.sendMessage(chatId, 'Report Activated ✅');
    }

    async reportBroadcastStatic(msg) {
        const chatId = msg.chat.id;
        if (this.checkActivateBot(chatId)) {
            await this.getTransactionReport(msg, chatId);
        } else {
            this.bot.sendMessage(chatId, 'ยังไม่ได้เปิดใช้งาน Report ในกลุ่มนี้ ❌');
        }
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
- ยอดรวมทั้งหมด: ${dataDeposit[0]?.deposit_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ค่าธรรมเนียม: ${dataDeposit[0]?.deposit_mdr_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดสุทธิหลังหักค่าธรรมเนียม: ${dataDeposit[0]?.deposit_net_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

📤 รายการถอน
- จำนวนรายการ: ${dataDeposit[0]?.withdraw_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดรวมทั้งหมด: ${dataDeposit[0]?.withdraw_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ค่าธรรมเนียม: ${dataDeposit[0]?.withdraw_mdr_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
- ยอดสุทธิ: ${dataDeposit[0]?.withdraw_net_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}

💰 กำไร: ${((dataDeposit[0]?.deposit_amount - dataDeposit[0]?.withdraw_net_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))} บาท
📈 กำไร: ${((dataDeposit[0]?.deposit_amount - dataDeposit[0]?.withdraw_net_amount) / dataDeposit[0]?.deposit_net_amount * 100).toFixed(2)}%
        `;

        this.bot.sendMessage(chatId, textReport);
    }
}