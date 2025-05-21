import { chatIds } from './chat-ids';

// โหลด chat ids จากไฟล์
function loadChatIds() {
  try {
    return chatIds
  } catch (err) {
    return [];
  }
}

// เพิ่ม chat id ถ้ายังไม่มี
function checkerAuthChatId(chatId: number): boolean {
  const ids = loadChatIds();
  if (ids.includes(chatId)) {
    return true
  }
  return false
}

export const activateBot = (msg,botTele) :boolean => {
    const chatId = msg.chat.id;
    if (!checkerAuthChatId(chatId)) {
      botTele.sendMessage(chatId, `ห้องแชทนี้ไม่ได้ลงทะเบียนกับ PTT BOT ❌ : ${chatId}`);
      return false
    }
    botTele.sendMessage(chatId, 'PTT BOT Activated ✅');
    return true
}

export const checkGetReportDaily = (msg,botTele) :boolean => {
    const chatId = msg.chat.id;
    if (!checkerAuthChatId(chatId)) {
      botTele.sendMessage(chatId, `ห้องแชทนี้ไม่ได้ลงทะเบียนกับ PTT BOT ❌ : ${chatId}`);
      return false
    }
    return true
}

// Broadcase zone
const ADMIN_ID = 5781571528;

// botTele.onText(/\/broadcast (.+)/, (msg: any, match: RegExpExecArray | null) => {
//   if (msg.from.id !== ADMIN_ID) {
//     return botTele.sendMessage(msg.chat.id, '❌ คุณไม่มีสิทธิ์ส่ง Broadcast');
//   }

//   const message = match?.[1];
//   const chatIds = loadChatIds();

//   chatIds.forEach(id => {
//     bot.sendMessage(id, message).catch((err: Error) => {
//       console.error(`ส่งไม่ได้ถึง ${id}:`, err.message);
//     });
//   });

//   bot.sendMessage(msg.chat.id, `✅ Broadcast ส่งไป ${chatIds.length} คนแล้ว`);
// });
