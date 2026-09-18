# 8touch-zone1

Interactive Projection สำหรับโซน 1 “สุขภาพสำคัญอย่างไร” — 8 จุดสัมผัส

ระบบนี้ใช้ Web Technology สำหรับพัฒนา และ Electron Kiosk สำหรับติดตั้งจริง โดยใช้วิดีโอ pre-render เป็นคอนเทนต์หลัก เพื่อให้แก้ UI/Hotspot ง่าย แต่หน้างานรัน fullscreen จาก SSD ได้โดยไม่ต้องใช้อินเทอร์เน็ต

## Flow

Power On → Zone1-8Touch.exe → Idle Loop → แตะ 1 ใน 8 จุด → เล่นวิดีโอของอวัยวะ → จบคลิป → กลับ Idle

ผู้ชมสามารถแตะอวัยวะอื่นระหว่างคลิปเพื่อเปลี่ยนเรื่องได้ทันที โดยระบบจะไม่ใช้ inactivity timeout ตัดคลิปกลางคัน

## 8 จุด

1. สมอง → โซน 3 ฐานใจสุข กายสุข
2. ช่องปาก + ฟัน → โซน 2 My Body
3. ปอด → โซน 4 สารพิษสะกิดโรค
4. หัวใจ → โซน 5 Fitness for Health
5. ตับ → โซน 4 สารพิษสะกิดโรค
6. ไต → โซน 3 Food and Fit
7. กระเพาะ + ลำไส้ → โซน 3 Food and Fit
8. กล้ามเนื้อ + กระดูก → โซน 5 Fitness for Health

## พัฒนา

ต้องมี Node.js 20+ และ npm

npm install
npm run dev

จากนั้นเปิด http://localhost:5173

ระบบมี fallback visualization ในตัว จึงสามารถทดสอบ interaction ได้แม้ยังไม่ได้ใส่วิดีโอจริง

## Kiosk test

npm install
npm run kiosk:dev

## Build Windows EXE

ใส่วิดีโอจริงใน public/media ก่อน แล้วรัน:

npm install
npm run dist:win

ไฟล์ installer/portable จะออกในโฟลเดอร์ release

## Media

ชื่อไฟล์ที่ระบบรอ:
- public/media/idle.mp4
- public/media/heart.mp4
- public/media/lungs.mp4
- public/media/brain.mp4
- public/media/digestive.mp4
- public/media/liver.mp4
- public/media/kidney.mp4
- public/media/muscle.mp4
- public/media/mouth.mp4

Vite จะคัดลอก media เข้า build และ Electron จะอ่านจาก SSD โดยตรง

## Operator / หน้างาน

- F9 — เปิด/ปิด Diagnostic Panel
- Ctrl + Shift + I — กลับ Idle
- Ctrl + Shift + Q — ออกจาก Kiosk
- Double click มุมซ้ายบน — เปิด Operator Panel สำรอง
- Operator Panel แสดงสถานะ media และกดทดสอบทั้ง 8 จุดได้

## Sensor

ถ้าเซ็นเซอร์ของหน้างานส่งตำแหน่งเป็น Mouse/Touch ของ Windows ใช้งานได้ทันที เพราะ hotspot ใช้ Pointer Events

ถ้าต้องรับพิกัดจาก middleware ให้ส่ง normalized coordinate 0–1 ด้วย CustomEvent ชื่อ zone1:touch และ detail เป็น { x, y } หรือส่ง window.postMessage โดย type เป็น zone1:touch

ตัวอย่างแนวคิด:

window.dispatchEvent(new CustomEvent('zone1:touch', {
  detail: { x: 0.56, y: 0.39 }
}))

ระบบจะเลือก hotspot ที่ใกล้พิกัดที่สุดในรัศมีที่กำหนด

## Production checklist

- ปิด Windows notification
- ปิด sleep / screen saver
- ตั้ง Windows Auto Login สำหรับเครื่องนิทรรศการ
- เพิ่ม Zone1-8Touch.exe ใน Startup
- ล็อก resolution / refresh rate ให้ตรงกับ projector
- Calibration sensor หลัง projection mapping
- ทดสอบ touch ทุกจุดอย่างน้อย 100 ครั้ง
- ทดสอบ restart หลังไฟดับ/เปิดเครื่องใหม่
- สำรอง installer + media ไว้ใน SSD แยกอีกชุด
