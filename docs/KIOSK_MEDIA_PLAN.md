# Kiosk Media Plan — Future Phase

เอกสารนี้เป็น contract สำหรับระยะ Kiosk เท่านั้น ยังไม่มีการใส่วิดีโอจริงใน repository ตอนนี้

## หลักการ

Web Preview และ Kiosk ใช้ State Machine / Touch Engine ชุดเดียวกัน

ต่างกันเฉพาะ Media Provider:

```text
Preview
createPrototypeMediaProvider()
→ ไม่โหลดวิดีโอ

Kiosk
createKioskMediaProvider()
→ resolve ไฟล์จาก Local SSD
```

## โครงสร้างที่ตั้งใจใช้บนเครื่อง Kiosk

```text
Zone1-8Touch/
├── Zone1-8Touch.exe
├── resources/
└── media/
    ├── idle.mp4
    ├── brain.mp4
    ├── mouth.mp4
    ├── lungs.mp4
    ├── heart.mp4
    ├── liver.mp4
    ├── kidney.mp4
    ├── digestive.mp4
    └── muscle.mp4
```

ไฟล์ media ไม่จำเป็นต้องอยู่ใน GitHub และไม่ต้อง deploy ไป Vercel

## ตอนเริ่ม Kiosk phase ต้องทำ

1. เลือกวิธี resolve local file ใน Electron
2. ทำ LocalVideoScene
3. preload / warm-up decoder
4. audio output test
5. transition idle → clip → idle
6. missing-file fallback
7. watchdog / crash recovery
8. startup / auto-login / auto-run
9. burn-in test หลายชั่วโมง
10. final calibration หน้างาน

## เหตุผลที่แยก media ออกจาก Web

- ลดขนาด repository
- Vercel ไม่ต้องรับไฟล์หนัก
- เปลี่ยนวิดีโอหน้างานได้โดยไม่ rebuild UI
- media backup/restore ง่าย
- ลดความเสี่ยง path หรือ CDN มีปัญหา
- Kiosk เล่นจาก SSD โดยตรง
