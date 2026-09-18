export const ORGANS = [
  { id:'brain', order:'01', name:'สมอง', en:'BRAIN', zone:'โซน 3 · ฐานใจสุข กายสุข', short:'ความคิด · ความจำ · อารมณ์', risk:'ความเครียดสะสมและการพักผ่อนไม่เพียงพอทำให้สมองทำงานหนักเกินไป', care:'พักผ่อนให้เพียงพอ และจัดการความเครียดอย่างเหมาะสม', anchorX:50, anchorY:14, touchX:22, touchY:78, hue:196 },
  { id:'mouth', order:'02', name:'ช่องปาก + ฟัน', en:'MOUTH + TEETH', zone:'โซน 2 · My Body', short:'จุดเริ่มต้นของระบบย่อยอาหาร', risk:'การละเลยการดูแลช่องปากเพิ่มความเสี่ยงฟันผุและเหงือกอักเสบ', care:'ดูแลช่องปากและแปรงฟันอย่างสม่ำเสมอ', anchorX:50, anchorY:24, touchX:40, touchY:78, hue:177 },
  { id:'lungs', order:'03', name:'ปอด', en:'LUNGS', zone:'โซน 4 · สารพิษสะกิดโรค', short:'ทุกลมหายใจคือการแลกเปลี่ยนออกซิเจน', risk:'PM2.5 และควันบุหรี่สะสมทำลายถุงลมทีละน้อย', care:'หลีกเลี่ยงฝุ่นควันและงดสูบบุหรี่', anchorX:43, anchorY:38, touchX:60, touchY:78, hue:188 },
  { id:'heart', order:'04', name:'หัวใจ', en:'HEART', zone:'โซน 5 · Fitness for Health', short:'สูบฉีดเลือดไปหล่อเลี้ยงทั่วร่างกาย', risk:'การไม่ออกกำลังกายและการกินไขมันสูงเพิ่มความเสี่ยงหลอดเลือดตีบตัน', care:'ขยับร่างกายและออกกำลังกายอย่างสม่ำเสมอ', anchorX:56, anchorY:39, touchX:78, touchY:78, hue:350 },
  { id:'liver', order:'05', name:'ตับ', en:'LIVER', zone:'โซน 4 · สารพิษสะกิดโรค', short:'จัดการสารต่าง ๆ และช่วยกระบวนการย่อยอาหาร', risk:'การดื่มแอลกอฮอล์เป็นประจำทำลายเซลล์ตับสะสม', care:'ลดการดื่มแอลกอฮอล์เพื่อช่วยลดภาระของตับ', anchorX:57, anchorY:49, touchX:22, touchY:91, hue:42 },
  { id:'kidney', order:'06', name:'ไต', en:'KIDNEYS', zone:'โซน 3 · Food and Fit', short:'กรองของเสียและรักษาสมดุลน้ำ', risk:'การกินเค็มจัดเป็นประจำเพิ่มภาระให้ไตทำงานหนักขึ้น', care:'ลดโซเดียมและดื่มน้ำให้เพียงพอ', anchorX:43, anchorY:53, touchX:40, touchY:91, hue:201 },
  { id:'digestive', order:'07', name:'กระเพาะ + ลำไส้', en:'DIGESTIVE', zone:'โซน 3 · Food and Fit', short:'ย่อยและดูดซึมสารอาหาร', risk:'หวาน มัน เค็มจัด และกากใยน้อย ทำให้ระบบย่อยอาหารเสียสมดุล', care:'เพิ่มผัก ผลไม้ ดื่มน้ำ และเคี้ยวอาหารช้า ๆ', anchorX:50, anchorY:60, touchX:60, touchY:91, hue:318 },
  { id:'muscle', order:'08', name:'กล้ามเนื้อ + กระดูก', en:'MUSCLE + BONE', zone:'โซน 5 · Fitness for Health', short:'ช่วยให้เราเคลื่อนไหวและพยุงร่างกาย', risk:'การนั่งนิ่งเป็นเวลานานทำให้กล้ามเนื้ออ่อนแรงและกระดูกเปราะบาง', care:'ขยับร่างกายและมีกิจกรรมทางกายเป็นประจำ', anchorX:65, anchorY:70, touchX:78, touchY:91, hue:36 },
]

export function getOrgan(id) {
  return ORGANS.find((item) => item.id === id) || null
}
