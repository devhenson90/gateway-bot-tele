export enum TroubleshootData {
  DEPOSIT_SUCCESS = 'รายการฝากสำเร็จ สามารถเติม credit ให้ลูกค้า',
  DEPOSIT_FAILED = 'รายการฝากไม่สำเร็จ แจ้งให้ Payment โอนคืน',
  DEPOSIT_PENDING = 'กดตรวจสอบรายการ',
  WITHDRAW_SUCCESS = 'รายการสำเร็จ สามารถปรับสถานะได้ ถ้าไม่ได้รับเงินกรุณาแจ้ง Payment',
  WITHDRAW_FAILED = 'รายการถอนเงินล้มเหลว กรุณาทำรายการมาใหม่',
  CALLBACK_FAILED = 'ร้านค้าปลายทางไม่ได้รับ callback',
}
