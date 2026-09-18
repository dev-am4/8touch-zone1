# Kiosk Media Plan — Media Playback Engine V1

ระบบ Playback ถูกวางโครงแล้ว แต่ repository ยังไม่มีไฟล์วิดีโอจริง

## Runtime แยก 2 แบบ

### Web / Vercel Preview

ใช้ `createPrototypeMediaProvider()`

- ไม่ request MP4 จริง
- ใช้ Prototype Scene เพื่อทดสอบ Flow
- Story มี prototype timeout
- ใช้ทดสอบ Touch / Projection / Calibration / Operator ได้

### Electron Kiosk

ใช้ `createRuntimeMediaProvider()` แล้วเลือก Local Video Provider อัตโนมัติ

- เล่นไฟล์จาก Local SSD
- ไม่ต้องใช้อินเทอร์เน็ต
- ไม่มี story timeout แบบเดาเวลา
- จบคลิปด้วย event `ended` จริง
- เปลี่ยนคลิปด้วย double-buffer A/B

## Media directory

วางโฟลเดอร์ `media` ไว้ข้างไฟล์ EXE:

```text
Zone1-8Touch/
├── Zone1-8Touch.exe
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

หรือกำหนด path เองด้วย environment variable:

`ZONE1_MEDIA_DIR=D:\\Zone1Media`

Electron ให้ renderer อ่านวิดีโอผ่าน custom protocol `zone1-media://` เท่านั้น และ whitelist เฉพาะ 9 filename ข้างต้น

## Interaction contract

```text
IDLE VIDEO
   │
   ├─ แตะ A
   │    → preload A ใน buffer ที่ซ่อน
   │    → wait decoded first frame
   │    → play A
   │    → crossfade IDLE → A
   │
   └─ รอผู้ชม

STORY A
   │
   ├─ แตะ A ซ้ำ
   │    → ยกเลิก
   │    → crossfade A → IDLE
   │
   ├─ แตะ B
   │    → latest intent wins
   │    → preload B
   │    → crossfade A → B
   │
   ├─ แตะ BACK
   │    → crossfade A → IDLE
   │
   └─ video ended
        → crossfade A → IDLE
```

Transition เริ่มต้น `420 ms` และสามารถปรับใน `EXHIBIT_CONFIG.playback.transitionMs`

## Double-buffer playback

มี video element 2 ตัวซ้อนกัน:

```text
Buffer A = visible / playing
Buffer B = hidden / loading next clip
```

ก่อนสลับ:

1. กำหนด source ให้ hidden buffer
2. รอ `loadeddata` หรือ `canplay`
3. เริ่ม play ที่ volume 0
4. สลับ opacity A/B
5. fade audio พร้อมภาพ
6. pause buffer เก่าหลัง transition

วิธีนี้ลด black frame และการกระตุกจากการเปลี่ยน `src` บน video element เดียว

## Rapid touch policy

ระบบใช้ request token แบบ **latest intent wins**

เช่นผู้ชมแตะ:

`หัวใจ → ปอด → ไต`

ถ้า input มาเร็วกว่า decoder ระบบไม่ต่อคิวเล่นครบทั้งสาม แต่ clip ที่กำลังโหลดซึ่งไม่ใช่คำสั่งล่าสุดจะถูกทิ้ง และไปที่ `ไต`

## Story controls

ขณะวิดีโอย่อยเล่น:

- Universal Reach 8 จุดยังคงอยู่แบบ opacity ต่ำ
- เรื่องที่กำลังเล่น highlight ชัดขึ้น
- แตะเรื่องอื่น = เปลี่ยนทันที
- แตะเรื่องเดิม = กลับหน้าหลัก
- มีปุ่ม BACK แยกสำหรับทุกวัย
- F8 แสดง Touch Area สำหรับ QC

## Media inventory

Operator F9 อ่านสถานะไฟล์จาก Electron:

- `9/9` = พร้อม
- ถ้าไม่ครบ จะแสดง filename ที่หาย
- Web Preview แสดงว่าไม่โหลด media จริง

## Export recommendation

ไฟล์ทั้ง 9 ควรใช้มาตรฐานเดียวกัน:

- Resolution เดียวกันทั้งชุด
- CFR frame rate เดียวกัน เช่น 30 fps
- H.264
- AAC 48 kHz
- keyframe interval สม่ำเสมอ
- ไม่มี VFR
- `idle.mp4` ต้อง seamless loop จริง

ถ้าจะใช้ 4K ให้ล็อกเครื่อง Kiosk / GPU / projector chain ก่อน export final ไม่ควรผสม 1080p และ 4K ในชุด production เดียวกัน

## Final QC ก่อนส่งมอบ

1. ตรวจ Operator MEDIA = 9/9
2. ทดสอบ Main → ทุก Story → Main
3. ทดสอบแตะเรื่องเดิมซ้ำ
4. ทดสอบ Story A → Story B ทุกคู่ที่สำคัญ
5. ทดสอบแตะรัวหลายจุด
6. ทดสอบ BACK ทั้ง touch screen และ sensor
7. ทดสอบ story ended กลับ Main
8. ถอดอินเทอร์เน็ตแล้วทดสอบทั้งหมดอีกครั้ง
9. restart Windows / auto-start kiosk
10. burn-in ต่อเนื่องหลายชั่วโมง
11. ตรวจ audio output หลัง sleep/restart
12. ทดสอบจริงกับเด็ก ผู้ใหญ่ และผู้ใช้รถเข็น
