# Video Alignment Spec — Zone 1 8 Touch

## Visitor principle

Visitor UI ต้อง **น้อยที่สุด**

ภาพหลัก ป้ายชื่อ ปุ่ม และ visual feedback ที่ผู้ชมเห็น ให้ตัดต่ออยู่ในวิดีโอ

Runtime UI มีหน้าที่เพียง:
- transparent touch areas
- sensor hit areas
- exactly 8 transparent touch areas
- debug / operator สำหรับช่าง

ใน Kiosk ปกติจะไม่มี headline, instruction card, status badge หรือข้อความอธิบายซ้อนบนวิดีโอ

## One visual coordinate system

วิดีโอทั้ง 9 ไฟล์ต้องใช้ canvas เดียวกัน และตำแหน่ง visual button ต้องตรงกันทุกไฟล์

แนะนำ final master:

```text
1920 × 1080
16:9
CFR 30 fps
H.264
AAC 48 kHz
```

ห้ามเปลี่ยน crop / scale / position แยกกันระหว่างไฟล์ เพราะ touch overlay ใช้พิกัดชุดเดียวตลอด

## Final alignment workflow

```text
เครื่อง / projector จริง
      ↓
F6 Projection Setup
      ↓
F7 Touch Calibration
      ↓
F8 Touch Debug
      ↓
ล็อกตำแหน่ง 8 Touch
      ↓
ใช้ภาพอ้างอิงนี้เป็น Overlay Guide ใน Premiere
      ↓
ตัดต่อ idle.mp4 + 8 story clips ให้ปุ่มในวิดีโอตรง Touch Area
      ↓
Export final media
      ↓
ห้ามขยับ F6/F7 หลังจากนี้
เว้นแต่จะกลับไปแก้วิดีโอให้ตรงใหม่
```

## Continuous playback design

ทุกคลิปควรรักษาองค์ประกอบหลักและตำแหน่งปุ่มไว้ตำแหน่งเดิม

เพื่อให้การเปลี่ยนคลิปดูเป็นฉากเดียวกัน:

- ช่วงต้น Story ควรเริ่มจาก composition ที่ใกล้กับ Main
- ช่วงท้าย Story ควรกลับเข้า composition ที่ใกล้กับ Main
- ปุ่ม 8 จุดต้องไม่กระโดดตำแหน่งระหว่างคลิป
- Background motion ควรมีทิศทาง/ความเร็วต่อเนื่อง
- ไม่ใช้ title card ที่ตัดภาพแบบ hard cut ระหว่างคลิป
- เผื่อ transition handle ประมาณ 10–15 frames ที่ต้นและท้าย

Playback Engine ใช้ A/B double buffer และ crossfade ค่าเริ่มต้น 320 ms

## Touch behavior

```text
Main + แตะ A       → A
A + แตะ B          → B
A + แตะ A ซ้ำ      → Main
A เล่นจบ           → Main
A → B → C เร็วมาก  → ใช้ C เป็นคำสั่งล่าสุด
```

ไม่มี popup หรือ page navigation ระหว่างคลิป

## Visual feedback

Visual feedback ควรอยู่ในวิดีโอเป็นหลัก เช่น:
- pulse รอบปุ่ม
- glow
- organ animation
- light trail
- transition energy / particles

Web runtime ไม่ควรซ้อนกรอบ UI เพิ่มบน visual เหล่านี้

## Preview vs Kiosk

### Web Preview
- แสดงชื่อจุดแตะแบบจางมาก เพื่อทดสอบตำแหน่ง
- ไม่มีวิดีโอจริง
- ใช้ minimal placeholder

### Electron Kiosk
- ชื่อจุดแตะจาก Web ถูกซ่อน
- touch areas โปร่งใส
- ผู้ชมเห็นเฉพาะ visual ที่อยู่ในวิดีโอ
- F8 เท่านั้นที่เปิด hitbox สำหรับช่าง

## Important

เมื่อ final media ถูกตัดต่อให้ตรงกับตำแหน่งปุ่มแล้ว ให้ถือ Projection + Calibration เป็น **locked media geometry**

ถ้าขยับตำแหน่งปุ่มหลังจากนั้น ต้องแก้ visual button ในวิดีโอให้ตรงอีกครั้ง


## HOME FRAME contract

Playback now treats `idle.mp4` frame 0 as the deterministic HOME FRAME.

Whenever a Story:
- ends, or
- is cancelled by touching the same active point,

the hidden idle buffer is prepared at HOME FRAME before the crossfade begins.

This replaces the previous idea of resuming idle from an arbitrary paused frame.

At 30 fps, the current runtime crossfade of 320 ms is approximately 10 frames. Production uses a 12-frame transition-safe handle for margin.

See `PREMIERE_TIMING_TEMPLATE.md` for the exact edit structure.


## Exactly eight points

The exhibit has exactly 8 visitor touch points.

Each visual button in the edited video must correspond 1:1 with one runtime hit area. There is no ninth Back button and no duplicate anatomical hit layer.

While a Story is active:
- touching the active point again returns to Main
- touching another of the 8 points switches directly to that Story
