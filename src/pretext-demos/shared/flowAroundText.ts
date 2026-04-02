// Shared long text used by both React and Vue FlowAround demos
export const FLOW_AROUND_TEXT =
  `Once upon a time in a land where text could flow freely around any obstacle, ` +
  `a curious typographer discovered the secret of dynamic layout. Characters ` +
  `gracefully wrapped around whatever stood in their path — a circle, a moon, ` +
  `a sleeping cat, or a mouse cursor dancing across the screen. ` +
  `这种排版方式在东亚文化中拥有悠久而深厚的历史。汉字、假名和谚文可以灵活地环绕图形排列，` +
  `创造出令人叹为观止的视觉美感。排版不仅是技术，更是一门艺术。` +
  `The Pretext library makes this possible by computing each line's available width ` +
  `independently via layoutNextLine(), accounting for the circular exclusion zone at ` +
  `each vertical scanline. No DOM. No reflow. Pure arithmetic over canvas-measured glyph widths. ` +
  `بدأت الرحلة حين اكتشف المبرمج قوة النص الحر — نص لا تقيده الصناديق، بل يتدفق كالماء حول الصخر. ` +
  `مع مكتبة Pretext، يصبح ذلك ممكناً بدقة متناهية وسرعة فائقة، دون لمس DOM على الإطلاق. ` +
  `Every time the cursor moves, the entire paragraph recalculates instantly: ` +
  `each line queries the exclusion geometry, picks the wider half-column, ` +
  `and calls layoutNextLine() with that exact pixel budget — all in a single rAF. ` +
  `한국어: 문자는 자유롭게 흐릅니다. 어떤 장애물이 있어도 텍스트는 그 주위를 우아하게 감쌉니다. ` +
  `प्रीटेक्स्ट लाइब्रेरी बहुभाषी पाठ को सटीकता से मापती है और DOM को बिल्कुल नहीं छूती। ` +
  `日本語テスト：吾輩は猫である。名前はまだない。どこで生まれたかとんと見当がつかぬ。` +
  `何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。` +
  `それ以外のことは何も判らない。どんな姿をしていたかということは、全くわからない。` +
  `This demo also showcases bidirectional text shaping 🌍, mixed scripts 🔤, ` +
  `emoji sequences 🏔️🌊🦋🌙⭐🎭, and the kind of typographic precision ` +
  `that was previously only achievable with native font engines. ` +
  `Русский: Каждая строка вычисляется независимо, ` +
  `учитывая геометрию исключённой зоны в реальном времени. ` +
  `ภาษาไทย: ข้อความสามารถไหลรอบวัตถุกีดขวางได้อย่างลื่นไหล ` +
  `เหมือนน้ำที่ไหลรอบก้อนหิน โดยไม่ต้องใช้ DOM เลย ` +
  `The canvas is your canvas — render to DOM, SVG, WebGL, or even server-side PDF. ` +
  `Pretext simply tells you: here is the text for this line, and its exact pixel width. ` +
  `What you do with that is entirely up to you. 你可以随心所欲地使用这些数据。` +
  `The future of text layout on the web is fast, accurate, and language-aware. ` +
  `Keep moving your mouse to witness the exclusion zone reshape the paragraph ` +
  `frame by frame — pure JS, zero layout thrashing, infinite possibilities. 🚀`
