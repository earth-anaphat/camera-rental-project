import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Aperture, ArrowDown, ArrowRight, Ban, Bell, CalendarClock, CalendarDays, CalendarPlus, CalendarRange, Camera, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, ClipboardCheck, Clock3, Download, History as HistoryIcon, Home, ImagePlus, Landmark, LayoutDashboard, LayoutGrid, List, LogIn, LogOut, Menu, Monitor, Package, Pencil, Phone, Plus, Printer, RefreshCw, Replace, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Smartphone, StickyNote, Tablet, Trash2, TrendingDown, TrendingUp, UploadCloud, Users, Wallet, WifiOff, Wrench, X, Zap } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

/* LensDesk — frontend ไฟล์เดียว: ธีม, ระบบ, ทุกหน้า */
const __CSS = `@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

/* =====================================================
   LENS DESK — PURPLE DESIGN SYSTEM
   ธีมม่วงมาตรฐานเดียวทั้งหน้าแนะนำและหน้าระบบ
   ===================================================== */
@property --vfo { syntax: '<number>'; inherits: true; initial-value: 0.3; }
@property --ang { syntax: '<angle>'; inherits: false; initial-value: 0deg; }

:root {
  /* Purple scale inspired by --wa-color-purple-05 through --wa-color-purple-95 */
  --wa-color-purple-05: 250 247 255;
  --wa-color-purple-10: 243 237 255;
  --wa-color-purple-20: 231 218 255;
  --wa-color-purple-30: 211 188 255;
  --wa-color-purple-40: 185 153 255;
  --wa-color-purple-50: 157 115 250;
  --wa-color-purple-60: 132 82 224;
  --wa-color-purple-70: 109 61 193;
  --wa-color-purple-80: 85 44 156;
  --wa-color-purple-90: 58 27 108;
  --wa-color-purple-95: 37 16 71;

  /* สีพื้นฐานคงที่ทั้งระบบ: ขาวอมม่วงตัดกับม่วงเข้ม */
  --bg: var(--wa-color-purple-95);
  --surface: var(--wa-color-purple-05);
  --surface2: var(--wa-color-purple-10);
  --line: var(--wa-color-purple-30);
  --ink: var(--wa-color-purple-95);
  --mute: var(--wa-color-purple-80);

  --accent: var(--wa-color-purple-60);
  --accent-fg: 255 255 255;

  --ok: 48 112 80;
  --warn: 160 104 20;
  --bad: 176 56 40;
  --info: 52 92 138;

  --side: var(--wa-color-purple-95);
  --side-ink: var(--wa-color-purple-05);
  --side-mute: var(--wa-color-purple-30);

  --hi: 0.12;
  --sh: 0.32;
  --grain: 0.025;
  --radius: 14px;
  --radius-sm: 9px;
  --pad: 1.45rem;
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
}



/* ธีมสี — สลับชุดสเกลสีหลักทั้งระบบด้วย data-color บน <html> (ค่าเริ่มต้นคือม่วงตามด้านบน) */
[data-color='green'] { --wa-color-purple-05: 244 251 245; --wa-color-purple-10: 230 245 233; --wa-color-purple-20: 203 235 210; --wa-color-purple-30: 159 219 174; --wa-color-purple-40: 101 199 131; --wa-color-purple-50: 0 175 89; --wa-color-purple-60: 0 143 71; --wa-color-purple-70: 0 117 57; --wa-color-purple-80: 0 91 43; --wa-color-purple-90: 0 62 27; --wa-color-purple-95: 0 40 15; }
[data-color='red'] { --wa-color-purple-05: 255 246 246; --wa-color-purple-10: 255 235 234; --wa-color-purple-20: 255 214 212; --wa-color-purple-30: 255 179 175; --wa-color-purple-40: 253 134 132; --wa-color-purple-50: 241 83 90; --wa-color-purple-60: 213 40 59; --wa-color-purple-70: 182 9 41; --wa-color-purple-80: 145 0 29; --wa-color-purple-90: 100 0 16; --wa-color-purple-95: 67 0 8; }
[data-color='orange'] { --wa-color-purple-05: 255 247 242; --wa-color-purple-10: 254 237 226; --wa-color-purple-20: 253 217 196; --wa-color-purple-30: 250 186 147; --wa-color-purple-40: 243 147 85; --wa-color-purple-50: 244 126 24; --wa-color-purple-60: 216 94 6; --wa-color-purple-70: 151 71 0; --wa-color-purple-80: 119 55 0; --wa-color-purple-90: 82 35 0; --wa-color-purple-95: 55 20 0; }
[data-color='blue'] { --wa-color-purple-05: 245 249 255; --wa-color-purple-10: 231 241 255; --wa-color-purple-20: 207 227 255; --wa-color-purple-30: 167 204 255; --wa-color-purple-40: 118 177 255; --wa-color-purple-50: 57 145 255; --wa-color-purple-60: 0 115 230; --wa-color-purple-70: 0 94 190; --wa-color-purple-80: 0 72 150; --wa-color-purple-90: 0 48 105; --wa-color-purple-95: 0 30 71; }
[data-color='pink'] { --wa-color-purple-05: 255 246 250; --wa-color-purple-10: 254 234 243; --wa-color-purple-20: 252 213 230; --wa-color-purple-30: 248 178 210; --wa-color-purple-40: 239 136 187; --wa-color-purple-50: 224 89 162; --wa-color-purple-60: 196 52 135; --wa-color-purple-70: 167 30 112; --wa-color-purple-80: 133 15 87; --wa-color-purple-90: 92 6 59; --wa-color-purple-95: 60 4 37; }
[data-color='teal'] { --wa-color-purple-05: 242 251 250; --wa-color-purple-10: 226 245 243; --wa-color-purple-20: 195 235 231; --wa-color-purple-30: 142 218 213; --wa-color-purple-40: 56 198 191; --wa-color-purple-50: 0 168 162; --wa-color-purple-60: 0 137 132; --wa-color-purple-70: 0 112 108; --wa-color-purple-80: 0 88 84; --wa-color-purple-90: 0 59 56; --wa-color-purple-95: 0 38 36; }
[data-color='gold'] { --wa-color-purple-05: 252 248 242; --wa-color-purple-10: 247 240 225; --wa-color-purple-20: 239 224 193; --wa-color-purple-30: 226 198 141; --wa-color-purple-40: 210 168 71; --wa-color-purple-50: 184 138 0; --wa-color-purple-60: 150 112 0; --wa-color-purple-70: 123 91 0; --wa-color-purple-80: 97 71 0; --wa-color-purple-90: 66 47 0; --wa-color-purple-95: 43 29 0; }
[data-color='slate'] { --wa-color-purple-05: 247 249 250; --wa-color-purple-10: 238 241 244; --wa-color-purple-20: 220 226 233; --wa-color-purple-30: 193 203 216; --wa-color-purple-40: 161 176 195; --wa-color-purple-50: 129 148 172; --wa-color-purple-60: 101 121 146; --wa-color-purple-70: 81 99 122; --wa-color-purple-80: 62 77 96; --wa-color-purple-90: 40 51 65; --wa-color-purple-95: 25 32 42; }

[data-radius='sharp'] { --radius: 4px; --radius-sm: 3px; }
[data-radius='soft'] { --radius: 14px; --radius-sm: 9px; }
[data-radius='round'] { --radius: 26px; --radius-sm: 15px; }
[data-density='compact'] { --pad: 1.05rem; }

/* =====================================================
   BASE
   ===================================================== */
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }

/* LensDesk global typography: Prompt across every screen and dialog */
html, body, #root, #root *, #root *::before, #root *::after,
.swal2-container, .swal2-container *, .swal2-container *::before, .swal2-container *::after,
/* Modal และ Drawer ถูก render ผ่าน Portal ใต้ body จึงต้องกำหนดฟอนต์แยกจาก #root */
.overlay, .overlay *, .overlay *::before, .overlay *::after,
.modal-panel, .modal-panel *, .modal-panel *::before, .modal-panel *::after,
.drawer-panel, .drawer-panel *, .drawer-panel *::before, .drawer-panel *::after,
.ld-notice-stack, .ld-notice-stack *, .ld-notice-stack *::before, .ld-notice-stack *::after {
  font-family: 'Prompt', sans-serif !important;
}


body {
  margin: 0;
  background: rgb(var(--bg));
  color: rgb(var(--ink));
  font-family: 'IBM Plex Sans Thai', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
  transition: background-color 0.5s var(--ease), color 0.5s var(--ease);
}

/* แสงรั่วเข้าห้องมืดมุมบนซ้าย */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(900px 560px at 8% -10%, rgb(var(--accent) / 0.11), transparent 62%),
    radial-gradient(760px 520px at 104% 106%, rgb(var(--info) / 0.06), transparent 60%);
}

/* เม็ดฟิล์ม */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 350;
  pointer-events: none;
  opacity: var(--grain);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

::selection { background: rgb(var(--accent) / 0.3); }

input, select, textarea { font-size: 16px; }
@media (min-width: 768px) { input, select, textarea { font-size: 14px; } }
* { -webkit-tap-highlight-color: transparent; }

.scroll-thin::-webkit-scrollbar { height: 6px; width: 6px; }
.scroll-thin::-webkit-scrollbar-thumb { background: rgb(var(--line)); border-radius: 99px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }
.safe-b { padding-bottom: env(safe-area-inset-bottom); }
.safe-t { padding-top: env(safe-area-inset-top); }

.font-num {
  font-family: 'Cormorant Garamond', 'IBM Plex Sans Thai', serif;
  font-variant-numeric: lining-nums;
  letter-spacing: -0.015em;
}
.font-mono, .mono {
  font-family: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;
}
.mono { font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; }
.mono-l {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(var(--mute));
}

/* =====================================================
   PRIMITIVES
   ===================================================== */
.card {
  position: relative;
  background-color: rgb(var(--surface));
  border: 1px solid rgb(var(--line));
  border-radius: var(--radius);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / var(--hi)), 0 26px 50px -34px rgb(0 0 0 / var(--sh));
}
.card-pad { padding: var(--pad); }
.card-hover { transition: transform 0.5s var(--ease), box-shadow 0.5s var(--ease), border-color 0.4s; }
.card-hover:hover {
  transform: translateY(-4px);
  border-color: rgb(var(--accent) / 0.4);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / var(--hi)), 0 36px 60px -30px rgb(0 0 0 / var(--sh));
}

/* กรอบ viewfinder มุมทั้งสี่ */
.vf {
  --vc: rgb(var(--accent) / var(--vfo));
  --vl: 13px;
  --vp: 9px;
  --vt: 1.5px;
  transition: --vfo 0.45s var(--ease), transform 0.5s var(--ease), box-shadow 0.5s var(--ease), border-color 0.4s;
  background-repeat: no-repeat;
  background-image:
    linear-gradient(var(--vc), var(--vc)), linear-gradient(var(--vc), var(--vc)),
    linear-gradient(var(--vc), var(--vc)), linear-gradient(var(--vc), var(--vc)),
    linear-gradient(var(--vc), var(--vc)), linear-gradient(var(--vc), var(--vc)),
    linear-gradient(var(--vc), var(--vc)), linear-gradient(var(--vc), var(--vc));
  background-size:
    var(--vl) var(--vt), var(--vt) var(--vl), var(--vl) var(--vt), var(--vt) var(--vl),
    var(--vl) var(--vt), var(--vt) var(--vl), var(--vl) var(--vt), var(--vt) var(--vl);
  background-position:
    left var(--vp) top var(--vp), left var(--vp) top var(--vp),
    right var(--vp) top var(--vp), right var(--vp) top var(--vp),
    left var(--vp) bottom var(--vp), left var(--vp) bottom var(--vp),
    right var(--vp) bottom var(--vp), right var(--vp) bottom var(--vp);
}
.vf:hover { --vfo: 1; }

/* แสงไฟสปอตตามเมาส์ */
.spot { position: relative; isolation: isolate; }
.spot::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.45s;
  background: radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgb(var(--accent) / 0.13), transparent 65%);
}
.spot::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.45s;
  background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgb(var(--accent) / 0.85), transparent 70%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.spot:hover::before, .spot:hover::after { opacity: 1; }

/* การ์ดเอียง 3 มิติ */
.tilt {
  transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform 0.55s var(--ease), box-shadow 0.5s, border-color 0.4s, --vfo 0.45s;
  will-change: transform;
}
.tilt[data-on] { transition: transform 0.08s linear, box-shadow 0.5s, border-color 0.4s, --vfo 0.45s; }
.tilt .glare {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  mix-blend-mode: soft-light;
  transition: opacity 0.4s;
  background: radial-gradient(420px circle at var(--gx, 50%) var(--gy, 50%), rgb(255 255 255 / 0.55), transparent 60%);
}
.tilt:hover .glare { opacity: 0.55; }

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgb(var(--accent));
}
.eyebrow::before {
  content: '';
  width: 7px;
  height: 7px;
  background: currentColor;
  transform: rotate(45deg);
  flex-shrink: 0;
}

/* รอยปรุขอบฟิล์ม */
.perf {
  height: 7px;
  background-image: linear-gradient(90deg, rgb(var(--line)) 0 9px, transparent 9px 18px);
  background-size: 18px 100%;
  border-radius: 2px;
  opacity: 0.8;
}

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 42px;
  padding: 0 1.15rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid transparent;
  overflow: hidden;
  transition: transform 0.25s var(--ease), background-color 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.35s, opacity 0.2s;
  user-select: none;
}
.btn:active { transform: scale(0.96); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

.btn-primary {
  background: linear-gradient(135deg, rgb(var(--wa-color-purple-60)), rgb(var(--wa-color-purple-80)));
  color: rgb(var(--accent-fg));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.28), 0 12px 26px -14px rgb(var(--accent) / 0.95);
}
.btn-primary::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 30%, rgb(255 255 255 / 0.32) 50%, transparent 70%);
  transform: translateX(-120%);
  transition: transform 0.8s var(--ease);
}
.btn-primary:hover:not(:disabled)::after { transform: translateX(120%); }
.btn-primary:hover:not(:disabled) { box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.3), 0 16px 32px -12px rgb(var(--accent)); }

.btn-ink { background: rgb(var(--ink)); color: rgb(var(--bg)); }
.btn-ink:hover:not(:disabled) { opacity: 0.88; }
.btn-ghost { background: transparent; color: rgb(var(--ink)); border-color: rgb(var(--line)); }
.btn-ghost:hover:not(:disabled) { background: rgb(var(--surface2)); border-color: rgb(var(--ink) / 0.28); }
.btn-danger { background: rgb(var(--bad) / 0.1); color: rgb(var(--bad)); border-color: rgb(var(--bad) / 0.28); }
.btn-danger:hover:not(:disabled) { background: rgb(var(--bad) / 0.18); }
.btn-sm { min-height: 34px; padding: 0 0.8rem; font-size: 0.8rem; }

/* ปุ่มกรอบวิ่งวน (moving border) */
.mb {
  position: relative;
  display: inline-flex;
  padding: 1.5px;
  border-radius: 999px;
  background: conic-gradient(from var(--ang), transparent 0 62%, rgb(var(--mb, 217 179 110)) 86%, transparent 100%), rgb(255 255 255 / 0.1);
  animation: ang 4s linear infinite;
}
.mb > * { border-radius: 999px; }

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  color: rgb(var(--mute));
  transition: background-color 0.2s, color 0.2s, transform 0.25s var(--ease);
}
.icon-btn:hover { background: rgb(var(--surface2)); color: rgb(var(--ink)); }
.icon-btn:active { transform: scale(0.9); }

.input {
  width: 100%;
  min-height: 44px;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgb(var(--line));
  background: rgb(var(--surface));
  color: rgb(var(--ink));
  outline: none;
  transition: border-color 0.2s, box-shadow 0.25s, background-color 0.2s;
}
.input::placeholder { color: rgb(var(--mute) / 0.65); }
.input:hover { border-color: rgb(var(--ink) / 0.25); }
.input:focus { border-color: rgb(var(--accent)); box-shadow: 0 0 0 4px rgb(var(--accent) / 0.15); }
textarea.input { resize: vertical; line-height: 1.6; }
select.input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23857a68' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  padding-right: 2.2rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 36px;
  padding: 0 0.95rem;
  border-radius: 999px;
  border: 1px solid rgb(var(--line));
  background: rgb(var(--surface));
  font-size: 0.8rem;
  font-weight: 500;
  color: rgb(var(--mute));
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.25s var(--ease);
}
.chip:hover { color: rgb(var(--ink)); border-color: rgb(var(--ink) / 0.3); }
.chip[data-on='true'] {
  background: linear-gradient(135deg, rgb(var(--wa-color-purple-60)), rgb(var(--wa-color-purple-80)));
  color: rgb(var(--wa-color-purple-05)) !important;
  border-color: transparent;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.24), 0 5px 14px -8px rgb(var(--wa-color-purple-80) / 0.9);
}
.chip:disabled { opacity: 0.42; cursor: not-allowed; }

/* แท็บมีแถบเลื่อน (sliding pill) */
.seg {
  max-width: 100%;
  width: fit-content;
  overflow-x: auto;
  padding: 4px;
  border: 1px solid rgb(var(--line));
  border-radius: 999px;
  background: rgb(var(--surface));
}
.seg-in { position: relative; display: flex; gap: 2px; }
.seg-pill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: 999px;
  background: rgb(var(--ink));
  transition: transform 0.5s var(--ease), width 0.5s var(--ease), opacity 0.2s;
}
.seg-i {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 34px;
  padding: 0 0.95rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  color: rgb(var(--mute));
  cursor: pointer;
  transition: color 0.3s;
}
.seg-i:hover { color: rgb(var(--ink)); }
.seg-i[data-on='true'] { color: rgb(var(--bg)); }
.seg-n {
  min-width: 1.35rem;
  padding: 0 0.35rem;
  border-radius: 99px;
  background: rgb(var(--surface2));
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.64rem;
  line-height: 1.35rem;
  text-align: center;
}
.seg-i[data-on='true'] .seg-n { background: rgb(var(--bg) / 0.2); }

.divider-dots {
  height: 1px;
  background-image: linear-gradient(to right, rgb(var(--line)) 50%, transparent 0);
  background-size: 8px 1px;
}

/* =====================================================
   MOTION
   ===================================================== */
@keyframes rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pop { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: none; } }
@keyframes sheetUp { from { transform: translateY(100%); } to { transform: none; } }
@keyframes drawerIn { from { transform: translateX(var(--from, 100%)); } to { transform: none; } }
@keyframes shimmer { to { background-position: -200% 0; } }
@keyframes growY { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes growX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes spinSlow { to { transform: rotate(360deg); } }
@keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
@keyframes drift { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(14px, -18px) scale(1.06); } 66% { transform: translate(-10px, 10px) scale(0.96); } }
@keyframes pulseRing { 0% { transform: scale(0.9); opacity: 0.7; } 100% { transform: scale(2.2); opacity: 0; } }
@keyframes marquee { to { transform: translateX(-50%); } }
@keyframes marqueeR { from { transform: translateX(-50%); } to { transform: translateX(0); } }
@keyframes maskRise { from { transform: translateY(112%); } to { transform: none; } }
@keyframes toastIn { from { opacity: 0; transform: translateY(-14px) scale(0.96); } to { opacity: 1; transform: none; } }
@keyframes ang { to { --ang: 360deg; } }
@keyframes blink { 0%, 60% { opacity: 1; } 61%, 100% { opacity: 0.15; } }
@keyframes exifIn { from { opacity: 0; transform: translateY(8px); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
@keyframes beamRun { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
@keyframes spotIn { from { opacity: 0; transform: translate(-8%, -4%) rotate(-6deg); } to { opacity: 1; transform: none; } }
@keyframes lock { 0% { transform: scale(1.5); opacity: 0.2; } 55% { transform: scale(0.88); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes tickIn { from { opacity: 0.2; } to { opacity: 1; } }
@keyframes shutter { 0% { transform: scale(1); } 50% { transform: scale(0.94); } 100% { transform: scale(1); } }

.page-in { animation: rise 0.75s var(--ease) both; }
.stagger > * { animation: rise 0.75s var(--ease) both; animation-delay: calc(var(--i, 0) * 70ms); }
.anim-i { animation: rise 0.75s var(--ease) both; animation-delay: calc(var(--i, 0) * 70ms); }

.skeleton {
  background: linear-gradient(100deg, rgb(var(--surface2)) 30%, rgb(var(--surface)) 50%, rgb(var(--surface2)) 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
  border-radius: var(--radius-sm);
}

/* scroll reveal */
.rv {
  opacity: 0;
  transition: opacity 1s var(--ease), transform 1s var(--ease), filter 1s var(--ease), clip-path 1.2s var(--ease);
  transition-delay: var(--d, 0ms);
  will-change: transform, opacity;
}
.rv[data-a='up'] { transform: translateY(46px); }
.rv[data-a='left'] { transform: translateX(-70px); }
.rv[data-a='right'] { transform: translateX(70px); }
.rv[data-a='zoom'] { transform: scale(0.86); }
.rv[data-a='blur'] { filter: blur(16px); transform: translateY(14px); }
.rv[data-a='rotate'] { transform: perspective(900px) rotateX(20deg) translateY(44px); }
.rv.in { opacity: 1; transform: none; filter: none; }

/* ข้อความทยอยปรากฏ (text generate) */
.gt {
  display: inline-block;
  opacity: 0;
  filter: blur(9px);
  transform: translateY(0.4em);
  transition: opacity 0.8s var(--ease), filter 0.8s var(--ease), transform 0.8s var(--ease);
}
.gt.in { opacity: 1; filter: none; transform: none; }

[data-motion='off'] *, [data-motion='off'] *::before, [data-motion='off'] *::after {
  animation-duration: 0.001ms !important;
  animation-delay: 0ms !important;
  transition-duration: 0.001ms !important;
  transition-delay: 0ms !important;
}
[data-motion='off'] .rv, [data-motion='off'] .gt { opacity: 1 !important; transform: none !important; filter: none !important; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
  .rv, .gt { opacity: 1 !important; transform: none !important; filter: none !important; }
}

/* =====================================================
   MODAL / DRAWER
   ===================================================== */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgb(6 5 3 / 0.62);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
  animation: fadeIn 0.25s ease both;
}
.modal-panel {
  width: 100%;
  max-height: calc(100dvh - 3rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgb(var(--surface));
  border: 1px solid rgb(var(--line));
  border-radius: calc(var(--radius) + 6px);
  box-shadow: 0 50px 110px -34px rgb(0 0 0 / 0.75);
  animation: pop 0.5s var(--ease) both;
}
@media (max-width: 767px) {
  .overlay { align-items: flex-end; padding: 0; }
  .modal-panel { max-height: 94dvh; border-radius: 24px 24px 0 0; border-bottom: 0; animation: sheetUp 0.5s var(--ease) both; }
}
.drawer-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  z-index: 85;
  width: min(100%, 480px);
  display: flex;
  flex-direction: column;
  background: rgb(var(--surface));
  border-left: 1px solid rgb(var(--line));
  box-shadow: -30px 0 90px -30px rgb(0 0 0 / 0.7);
  animation: drawerIn 0.55s var(--ease) both;
}
.drawer-panel[data-side='left'] { right: auto; left: 0; border-left: 0; border-right: 1px solid rgb(var(--line)); --from: -100%; }

/* =====================================================
   NAVIGATION
   ===================================================== */
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  min-height: 44px;
  padding: 0 0.9rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 450;
  color: rgb(var(--side-mute));
  cursor: pointer;
  transition: color 0.25s, background-color 0.25s, transform 0.3s var(--ease);
}
.nav-item:hover { color: rgb(var(--side-ink)); background: rgb(255 255 255 / 0.05); transform: translateX(3px); }
.nav-item[data-on='true'] { color: rgb(var(--side-ink)); background: linear-gradient(90deg, rgb(var(--wa-color-purple-60) / 0.24), rgb(var(--wa-color-purple-30) / 0.08)); }
.nav-item[data-on='true']::before {
  content: '';
  position: absolute;
  left: -0.75rem;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 99px;
  background: rgb(var(--accent));
  box-shadow: none;
  animation: growY 0.45s var(--ease) both;
}
.nav-item[data-on='true'] svg { color: rgb(var(--accent)); }
.nav-idx { margin-left: auto; font-family: 'IBM Plex Mono', monospace; font-size: 0.62rem; letter-spacing: 0.1em; opacity: 0.4; }
.rail .nav-item { justify-content: center; padding: 0; }
.rail .nav-item:hover { transform: none; }
.rail .nav-item[data-on='true']::before { left: -0.65rem; }

.tabs-top { position: relative; display: flex; gap: 0.25rem; overflow-x: auto; }
.tab-top {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 0.95rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgb(var(--mute));
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.25s;
}
.tab-top:hover { color: rgb(var(--ink)); }
.tab-top[data-on='true'] { color: rgb(var(--ink)); }
.tab-line {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  border-radius: 2px;
  background: rgb(var(--accent));
  box-shadow: none;
  transition: transform 0.5s var(--ease), width 0.5s var(--ease);
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: end;
  padding: 0.4rem 0.5rem calc(0.4rem + env(safe-area-inset-bottom));
  background: rgb(var(--surface) / 0.86);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border-top: 1px solid rgb(var(--line));
}
.bb-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  min-height: 52px;
  padding-top: 0.45rem;
  font-size: 0.66rem;
  font-weight: 500;
  color: rgb(var(--mute));
  transition: color 0.25s, transform 0.25s var(--ease);
}
.bb-item:active { transform: scale(0.9); }
.bb-item[data-on='true'] { color: rgb(var(--accent)); }
.bb-item svg { transition: transform 0.3s var(--ease); }
.bb-item[data-on='true'] svg { transform: translateY(-2px); }
.bb-fab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: -24px auto 0;
  border-radius: 50%;
  background: rgb(var(--accent));
  color: rgb(var(--accent-fg));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.3), 0 14px 28px -10px rgb(var(--accent) / 0.9), 0 0 0 5px rgb(var(--bg));
  transition: transform 0.35s var(--ease);
}
.bb-fab:active { transform: scale(0.88) rotate(90deg); }

/* dock ลอยแบบขยายตามเมาส์ */
.dock {
  position: fixed;
  left: 50%;
  bottom: 1.1rem;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  gap: 0.3rem;
  max-width: calc(100vw - 1.5rem);
  padding: 0.5rem 0.6rem;
  transform: translateX(-50%);
  border-radius: 24px;
  background: rgb(var(--side) / 0.88);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  box-shadow: 0 28px 60px -18px rgb(0 0 0 / 0.65), inset 0 0 0 1px rgb(255 255 255 / 0.07);
  animation: rise 0.9s var(--ease) both;
}
.dock-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 15px;
  color: rgb(var(--side-mute));
  background: rgb(255 255 255 / 0.04);
  transform-origin: bottom center;
  transform: translateY(calc((var(--s, 1) - 1) * -16px)) scale(var(--s, 1));
  transition: background-color 0.3s, color 0.3s;
}
.dock-item:hover { color: rgb(var(--side-ink)); }
.dock-item[data-on='true'] { background: rgb(var(--accent)); color: rgb(var(--accent-fg)); }
.dock-item::after {
  content: attr(data-label);
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  background: rgb(var(--ink));
  color: rgb(var(--bg));
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 6px);
  transition: opacity 0.2s, transform 0.25s var(--ease);
}
@media (hover: hover) { .dock-item:hover::after { opacity: 1; transform: translate(-50%, 0); } }
.dock-sep { width: 1px; align-self: stretch; margin: 6px 3px; background: rgb(255 255 255 / 0.1); }

.glass-header {
  background: rgb(var(--bg) / 0.72);
  backdrop-filter: blur(18px) saturate(1.3);
  -webkit-backdrop-filter: blur(18px) saturate(1.3);
  border-bottom: 1px solid rgb(var(--line) / 0.85);
}

.tbl { width: 100%; text-align: left; font-size: 0.875rem; border-collapse: separate; border-spacing: 0; }
.tbl th {
  padding: 0.85rem 1.1rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.66rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(var(--mute));
  background: rgb(var(--surface2) / 0.6);
  border-bottom: 1px solid rgb(var(--line));
  white-space: nowrap;
}
/* UX10: keep booking/history column headers visible while scrolling the table */
.booking-table-scroll { position: relative; max-height: min(72vh, 760px); overflow: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.booking-table-scroll .tbl thead th { position: sticky; top: 0; z-index: 8; background: rgb(var(--wa-color-purple-10)); box-shadow: 0 1px 0 rgb(var(--wa-color-purple-30)); }
.booking-table-scroll .tbl thead { position: relative; z-index: 8; }
.booking-table-scroll .tbl tbody tr { scroll-margin-top: 3.5rem; }
.tbl td { padding: 0.95rem 1.1rem; border-bottom: 1px solid rgb(var(--line) / 0.7); vertical-align: middle; }
.tbl tbody tr { transition: background-color 0.2s; }
.tbl tbody tr:hover { background: rgb(var(--accent) / 0.06); }
.tbl tbody tr:last-child td { border-bottom: 0; }

/* =====================================================
   SWEETALERT2 — LENS DESK PURPLE MOTION SYSTEM
   ใช้ฟอนต์ Prompt และโทนม่วงเดียวกับ UI ทุกชนิดของ Alert
   ===================================================== */
.swal2-container {
  z-index: 120 !important;
  padding: max(16px, env(safe-area-inset-top)) 14px max(16px, env(safe-area-inset-bottom)) !important;
  backdrop-filter: blur(10px) saturate(1.1);
  -webkit-backdrop-filter: blur(10px) saturate(1.1);
}
.swal2-container.swal2-backdrop-show,
.swal2-container.swal2-noanimation {
  background: rgb(var(--wa-color-purple-95) / 0.58) !important;
}
.sw-popup {
  position: relative !important;
  isolation: isolate;
  overflow: hidden;
  width: min(92vw, 31rem) !important;
  padding: 2rem 1.65rem 1.5rem !important;
  border-radius: calc(var(--radius) + 8px) !important;
  background: linear-gradient(145deg, rgb(var(--surface)) 0%, rgb(var(--wa-color-purple-05)) 72%, rgb(var(--wa-color-purple-10)) 100%) !important;
  color: rgb(var(--ink)) !important;
  border: 1px solid rgb(var(--wa-color-purple-30) / .9) !important;
  box-shadow: 0 35px 100px -38px rgb(var(--wa-color-purple-95) / .68), 0 0 0 1px rgb(255 255 255 / .65) inset !important;
  font-family: 'Prompt', sans-serif !important;
}
.sw-popup::before {
  content: '';
  position: absolute;
  z-index: -1;
  width: 230px;
  height: 150px;
  top: -95px;
  right: -70px;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(var(--wa-color-purple-40) / .34), transparent 72%);
  filter: blur(5px);
  animation: swGlowFloat 5s ease-in-out infinite alternate;
  pointer-events: none;
}
.sw-popup::after {
  content: '';
  position: absolute;
  inset: 0 18% auto;
  height: 2px;
  border-radius: 0 0 99px 99px;
  background: linear-gradient(90deg, transparent, rgb(var(--accent) / .8), rgb(var(--wa-color-purple-30)), transparent);
  opacity: .9;
  pointer-events: none;
}
.sw-title {
  font-family: 'Prompt', sans-serif !important;
  font-size: 1.28rem !important;
  line-height: 1.45 !important;
  font-weight: 700 !important;
  letter-spacing: -.015em;
  color: rgb(var(--ink)) !important;
  padding: 0 !important;
  animation: swTitleReveal .42s .06s var(--ease) both;
}
.sw-html {
  font-family: 'Prompt', sans-serif !important;
  color: rgb(var(--mute)) !important;
  font-size: .91rem !important;
  line-height: 1.75 !important;
  text-align: left;
  overflow-wrap: anywhere;
  animation: swTitleReveal .46s .1s var(--ease) both;
}
.sw-popup .swal2-input,
.sw-popup .swal2-select,
.sw-popup .swal2-textarea,
.sw-popup .swal2-file,
.sw-popup label,
.sw-popup input,
.sw-popup select,
.sw-popup textarea,
.sw-popup button {
  font-family: 'Prompt', sans-serif !important;
}
.sw-actions { gap: .65rem; margin-top: 1.4rem !important; width: 100%; }
.sw-actions .btn {
  position: relative;
  flex: 1;
  min-height: 46px;
  overflow: hidden;
  transition: transform .22s var(--ease), box-shadow .22s ease, filter .22s ease !important;
}
.sw-actions .btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 20%, rgb(255 255 255 / .28) 48%, transparent 76%);
  transform: translateX(-130%);
  transition: transform .55s ease;
  pointer-events: none;
}
.sw-actions .btn:hover { transform: translateY(-2px); filter: saturate(1.08); box-shadow: 0 8px 18px rgb(var(--wa-color-purple-90) / .16); }
.sw-actions .btn:hover::after { transform: translateX(130%); }
.sw-actions .btn:active { transform: translateY(0) scale(.985); }
.sw-in { animation: swPopupEnter .48s cubic-bezier(.16, 1, .3, 1) both !important; }
.sw-out { animation: swPopupExit .18s ease-in both !important; }
.sw-popup .swal2-icon { animation: swIconBloom .56s .04s cubic-bezier(.16, 1, .3, 1) both; }
.sw-popup .swal2-icon.swal2-success .swal2-success-ring { border-color: rgb(var(--accent) / .28) !important; }
.sw-popup .swal2-icon.swal2-success [class^='swal2-success-line'] { background-color: rgb(var(--accent)) !important; }
.sw-popup .swal2-icon.swal2-error { border-color: rgb(var(--wa-color-purple-40)) !important; }
.sw-popup .swal2-icon.swal2-error [class^='swal2-x-mark-line'] { background-color: rgb(var(--wa-color-purple-70)) !important; }
.sw-popup .swal2-icon.swal2-warning,
.sw-popup .swal2-icon.swal2-question,
.sw-popup .swal2-icon.swal2-info { color: rgb(var(--accent)) !important; border-color: rgb(var(--wa-color-purple-40)) !important; }
.sw-popup .swal2-icon.swal2-warning { color: rgb(var(--wa-color-purple-70)) !important; }
.sw-toast {
  background: linear-gradient(145deg, rgb(var(--surface)), rgb(var(--wa-color-purple-10))) !important;
  color: rgb(var(--ink)) !important;
  border: 1px solid rgb(var(--wa-color-purple-30)) !important;
  border-radius: var(--radius) !important;
  box-shadow: 0 24px 55px -25px rgb(var(--wa-color-purple-95) / .55), 0 0 0 1px rgb(255 255 255 / .7) inset !important;
  font-family: 'Prompt', sans-serif !important;
  animation: swPopupEnter .42s cubic-bezier(.16, 1, .3, 1) both;
}
.sw-toast .swal2-title {
  font-family: 'Prompt', sans-serif !important;
  font-size: .9rem !important;
  line-height: 1.5 !important;
  font-weight: 600 !important;
  color: rgb(var(--ink)) !important;
  margin: 0 .6rem !important;
}
.swal2-timer-progress-bar { background: linear-gradient(90deg, rgb(var(--wa-color-purple-40)), rgb(var(--accent))) !important; }
.swal2-loader { border-color: rgb(var(--accent)) transparent rgb(var(--accent)) transparent !important; }
.swal2-validation-message {
  font-family: 'Prompt', sans-serif !important;
  background: rgb(var(--wa-color-purple-10)) !important;
  color: rgb(var(--wa-color-purple-80)) !important;
  border: 1px solid rgb(var(--wa-color-purple-30)) !important;
  border-radius: var(--radius-sm) !important;
}
@keyframes swPopupEnter { from { opacity: 0; transform: translateY(22px) scale(.92); filter: blur(5px); } 68% { opacity: 1; transform: translateY(-3px) scale(1.008); filter: blur(0); } to { opacity: 1; transform: translateY(0) scale(1); filter: none; } }
@keyframes swPopupExit { to { opacity: 0; transform: translateY(8px) scale(.98); filter: blur(2px); } }
@keyframes swTitleReveal { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
@keyframes swIconBloom { 0% { opacity: 0; transform: scale(.45) rotate(-12deg); } 62% { opacity: 1; transform: scale(1.12) rotate(3deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
@keyframes swGlowFloat { from { transform: translate3d(0, 0, 0) scale(.92); opacity: .65; } to { transform: translate3d(-12px, 10px, 0) scale(1.12); opacity: 1; } }
@media (max-width: 480px) {
  .sw-popup { padding: 1.55rem 1.1rem 1.15rem !important; border-radius: 20px !important; }
  .sw-title { font-size: 1.12rem !important; }
  .sw-actions { gap: .5rem; }
  .sw-actions .btn { min-height: 44px; padding-inline: .7rem; }
}
@media (prefers-reduced-motion: reduce) {
  .sw-in, .sw-out, .sw-popup::before, .sw-title, .sw-html, .sw-popup .swal2-icon, .sw-toast { animation: none !important; }
  .sw-actions .btn, .sw-actions .btn::after { transition: none !important; }
}
.sw-form { display: grid; gap: 0.85rem; margin-top: 0.6rem; }
.sw-form label { display: block; font-size: 0.78rem; font-weight: 600; color: rgb(var(--ink)); margin-bottom: 0.3rem; }
.sw-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.sw-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.sw-check {
  display: flex !important;
  align-items: center;
  gap: 0.55rem;
  margin: 0 !important;
  padding: 0.6rem 0.75rem;
  border: 1px solid rgb(var(--line));
  border-radius: var(--radius-sm);
  font-weight: 450 !important;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}
.sw-check:hover { border-color: rgb(var(--accent) / 0.6); }
.sw-check input { width: 18px; height: 18px; accent-color: rgb(var(--accent)); }
.sw-note { padding: 0.8rem 0.95rem; border-radius: var(--radius-sm); background: rgb(var(--surface2)); font-size: 0.82rem; line-height: 1.7; }
.sw-note.warn { background: rgb(var(--warn) / 0.13); color: rgb(var(--warn)); }
.sw-sum { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.15rem 0; }
.sw-sum.big { font-size: 1rem; font-weight: 600; color: rgb(var(--ink)); border-top: 1px dashed rgb(var(--line)); margin-top: 0.4rem; padding-top: 0.6rem; }
.swal2-validation-message { background: rgb(var(--bad) / 0.1) !important; color: rgb(var(--bad)) !important; }
@media (max-width: 480px) { .sw-checks, .sw-grid2 { grid-template-columns: 1fr; } }

/* UX10 — polished owner login dialog */
.auth-login-popup { position: relative !important; overflow: hidden !important; width: min(440px, calc(100vw - 28px)) !important; padding: 2rem 1.7rem 1.55rem !important; border: 1px solid rgb(var(--wa-color-purple-30)) !important; border-radius: 26px !important; background: radial-gradient(circle at 100% 0%, rgb(var(--wa-color-purple-40) / .22), transparent 38%), linear-gradient(145deg, rgb(var(--wa-color-purple-05)) 0%, rgb(var(--wa-color-purple-05)) 100%) !important; box-shadow: 0 28px 90px -30px rgb(var(--wa-color-purple-95) / .62), 0 0 0 1px rgb(var(--wa-color-purple-50) / .12) !important; }
.auth-login-popup::before { content: ""; position: absolute; inset: 0 18% auto; height: 3px; border-radius: 0 0 999px 999px; background: linear-gradient(90deg, transparent, rgb(var(--wa-color-purple-60)), rgb(var(--wa-color-purple-30)), transparent); pointer-events: none; }
.auth-login-popup .swal2-icon { display: none !important; }
.auth-login-popup .sw-title { margin: .25rem 0 .55rem !important; font-size: 1.45rem !important; letter-spacing: -.025em; }
.auth-login-popup .sw-html { margin: 0 !important; color: #6d5b88 !important; font-size: .9rem !important; line-height: 1.7 !important; }
.auth-login-brand { display: inline-flex; align-items: center; gap: .5rem; margin: 0 auto .9rem; padding: .45rem .8rem; border: 1px solid rgb(var(--wa-color-purple-20)); border-radius: 999px; background: linear-gradient(120deg, rgb(var(--wa-color-purple-10)), rgb(var(--wa-color-purple-05))); color: rgb(var(--wa-color-purple-70)); font-size: .68rem; font-weight: 650; letter-spacing: .12em; }
.auth-login-brand-mark { display: inline-grid; width: 22px; height: 22px; place-items: center; border-radius: 7px; background: linear-gradient(135deg, rgb(var(--wa-color-purple-40)), rgb(var(--wa-color-purple-70))); color: white; font-size: 12px; }
.auth-login-popup .sw-input { height: 50px !important; margin: 1rem 0 .3rem !important; border: 1px solid rgb(var(--wa-color-purple-30)) !important; border-radius: 13px !important; background: rgb(var(--wa-color-purple-05)) !important; color: rgb(var(--wa-color-purple-95)) !important; box-shadow: none !important; outline: none !important; transition: border-color .2s, box-shadow .2s !important; }
.auth-login-popup .sw-input:focus { border-color: rgb(var(--wa-color-purple-60)) !important; box-shadow: 0 0 0 4px rgb(var(--wa-color-purple-60) / .14) !important; }
.auth-login-popup .sw-actions { display: grid !important; grid-template-columns: 1fr 1fr; gap: .7rem !important; width: 100%; margin-top: 1.2rem !important; }
.auth-login-popup .sw-actions .btn { min-height: 46px; border-radius: 12px !important; }
@media (max-width: 480px) { .auth-login-popup { padding: 1.7rem 1.1rem 1.2rem !important; border-radius: 21px !important; } .auth-login-popup .sw-title { font-size: 1.2rem !important; } .auth-login-popup .sw-actions { gap: .5rem !important; } }


/* ===== Login / Password dialogs (dark glass card) ===== */
.swal2-popup.lg-popup {
  width: min(430px, calc(100vw - 28px)) !important;
  padding: 2.1rem 1.8rem 1.6rem !important;
  border: 1px solid rgb(var(--wa-color-purple-50) / .35) !important;
  border-radius: 26px !important;
  background:
    radial-gradient(420px 260px at 85% -10%, rgb(var(--wa-color-purple-60) / .55), transparent 62%),
    radial-gradient(320px 220px at -10% 110%, rgb(var(--wa-color-purple-80) / .5), transparent 60%),
    linear-gradient(165deg, rgb(var(--wa-color-purple-95)), rgb(var(--wa-color-purple-95))) !important;
  box-shadow: 0 50px 100px -30px rgb(var(--wa-color-purple-95) / .9), inset 0 1px 0 rgb(255 255 255 / .12) !important;
  color: rgb(var(--wa-color-purple-10)) !important;
}
.swal2-popup.lg-popup::before { display: none !important; }
.lg-popup .swal2-title { display: none !important; }
.lg-popup .lg-html { margin: 0 !important; padding: 0 !important; color: rgb(var(--wa-color-purple-10)) !important; overflow: visible !important; }
.lg-mark { position: relative; display: grid; width: 64px; height: 64px; margin: 0 auto 1.1rem; place-items: center; border-radius: 20px; background: linear-gradient(145deg, rgb(var(--wa-color-purple-40)), rgb(var(--wa-color-purple-70))); color: rgb(var(--wa-color-purple-05)); box-shadow: 0 14px 34px -10px rgb(var(--wa-color-purple-50) / .9), inset 0 1px 0 rgb(255 255 255 / .35); }
.lg-mark::after { content: ''; position: absolute; inset: -9px; border-radius: 26px; border: 1px solid rgb(var(--wa-color-purple-30) / .35); animation: lgPulse 2.8s ease-out infinite; }
.lg-mark svg { animation: lgSpin 14s linear infinite; }
.lg-eyebrow { margin: 0; text-align: center; font-size: .68rem; letter-spacing: .28em; color: rgb(var(--wa-color-purple-30)); }
.lg-title { margin: .35rem 0 .4rem; text-align: center; font-size: 1.5rem; font-weight: 600; letter-spacing: -.02em; color: rgb(var(--wa-color-purple-05)); }
.lg-sub { margin: 0 auto 1.3rem; max-width: 320px; text-align: center; font-size: .86rem; line-height: 1.7; color: rgb(var(--wa-color-purple-10) / .66); }
.lg-label { display: block; margin: 0 0 .4rem; text-align: left; font-size: .74rem; font-weight: 500; color: rgb(var(--wa-color-purple-10) / .75); }
.lg-field { position: relative; display: flex; align-items: center; margin-bottom: .85rem; border: 1px solid rgb(var(--wa-color-purple-30) / .28); border-radius: 14px; background: rgb(255 255 255 / .06); transition: border-color .2s, box-shadow .2s, background .2s; }
.lg-field:focus-within { border-color: rgb(var(--wa-color-purple-40)); background: rgb(255 255 255 / .09); box-shadow: 0 0 0 4px rgb(var(--wa-color-purple-40) / .2); }
.lg-field > svg { flex: none; margin-left: 14px; color: rgb(var(--wa-color-purple-30)); }
.lg-field input { flex: 1; min-width: 0; height: 50px; padding: 0 .75rem; border: 0 !important; outline: 0 !important; background: transparent !important; color: rgb(var(--wa-color-purple-05)) !important; font-size: 16px !important; letter-spacing: .02em; box-shadow: none !important; }
.lg-field input::placeholder { color: rgb(var(--wa-color-purple-10) / .38); letter-spacing: 0; }
.lg-eye { flex: none; height: 38px; margin-right: 6px; padding: 0 .7rem; border: 0; border-radius: 10px; background: transparent; color: rgb(var(--wa-color-purple-30)); font-size: .74rem; cursor: pointer; transition: background .2s; }
.lg-eye:hover { background: rgb(255 255 255 / .1); }
.lg-caps { margin: -.25rem 0 .8rem; text-align: left; font-size: .76rem; color: #fcd34d; }
.lg-hint { margin: .2rem 0 0; text-align: center; font-size: .74rem; color: rgb(var(--wa-color-purple-10) / .5); }
.lg-shake { animation: lgShake .42s cubic-bezier(.36, .07, .19, .97); border-color: #f87171 !important; }
.lg-meter { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin: -.2rem 0 .35rem; }
.lg-meter i { height: 4px; border-radius: 99px; background: rgb(255 255 255 / .14); transition: background .25s; }
.lg-meter[data-s='1'] i:nth-child(-n+1) { background: #f87171; }
.lg-meter[data-s='2'] i:nth-child(-n+2) { background: #fbbf24; }
.lg-meter[data-s='3'] i:nth-child(-n+3) { background: #a3e635; }
.lg-meter[data-s='4'] i { background: #4ade80; }
.lg-meter-t { margin: 0 0 .85rem; text-align: left; font-size: .72rem; color: rgb(var(--wa-color-purple-10) / .55); }
.lg-popup .swal2-validation-message { margin: .9rem 0 0 !important; border: 1px solid rgb(248 113 113 / .45) !important; background: rgb(248 113 113 / .12) !important; color: #fecaca !important; font-size: .82rem !important; }
.lg-popup .sw-actions { display: grid !important; grid-template-columns: 1fr; gap: .55rem !important; width: 100%; margin: 1.15rem 0 0 !important; }
.lg-popup .sw-actions .btn { width: 100%; min-height: 48px; border-radius: 14px !important; }
.lg-popup .sw-actions .btn-primary { background: linear-gradient(135deg, rgb(var(--wa-color-purple-40)), rgb(var(--wa-color-purple-60))) !important; color: rgb(var(--wa-color-purple-05)) !important; box-shadow: 0 16px 34px -14px rgb(var(--wa-color-purple-40) / .95) !important; }
.lg-popup .sw-actions .btn-ghost { border-color: transparent !important; background: transparent !important; color: rgb(var(--wa-color-purple-10) / .7) !important; }
.lg-popup .sw-actions .btn-ghost:hover { background: rgb(255 255 255 / .08) !important; }
.lg-popup .swal2-loader { border-color: rgb(var(--wa-color-purple-05)) transparent rgb(var(--wa-color-purple-05)) transparent !important; }
/* สถานะกำลังโหลดตอนเข้าสู่ระบบ: ให้วงโหลดอยู่กึ่งกลางปุ่ม (grid ทำให้เดิมชิดซ้าย) */
.lg-popup .sw-actions { justify-items: center; }
.lg-popup .sw-actions .swal2-loader { justify-self: center; align-self: center; margin: .2rem auto !important; }
.lg-popup .sw-actions .btn.swal2-loading {
  justify-self: center !important; width: 3rem !important; min-width: 0 !important; height: 3rem !important; min-height: 0 !important;
  padding: 0 !important; margin: 0 auto !important; border-radius: 999px !important; font-size: 0 !important;
  display: grid !important; place-items: center; box-shadow: 0 0 0 6px rgb(var(--wa-color-purple-40) / .18) !important;
}
.lg-popup .sw-actions .btn.swal2-loading::after { display: none !important; }
.lg-popup .sw-actions .btn.swal2-loading ~ .btn { display: none !important; }
@keyframes lgPulse { 0% { transform: scale(.92); opacity: .9; } 100% { transform: scale(1.28); opacity: 0; } }
@keyframes lgSpin { to { transform: rotate(360deg); } }
@keyframes lgShake { 10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); } 30%, 50%, 70% { transform: translateX(-7px); } 40%, 60% { transform: translateX(7px); } }
@media (prefers-reduced-motion: reduce) { .lg-mark::after, .lg-mark svg, .lg-shake { animation: none !important; } }

/* =====================================================
   APP — เลย์เอาต์พิเศษ
   ===================================================== */
.bokeh {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle at 36% 34%, rgb(255 238 205 / 0.55), rgb(var(--accent) / 0.2) 55%, transparent 72%);
  box-shadow: inset 0 0 0 1px rgb(255 240 210 / 0.16);
  animation: drift 14s ease-in-out infinite;
}
.readout > * + * { border-left: 1px solid rgb(255 255 255 / 0.09); }
.readout-l > * + * { border-left: 1px solid rgb(var(--line)); }
@media (max-width: 639px) {
  .readout { display: grid; grid-template-columns: 1fr 1fr; }
  .readout > * + * { border-left: 0; }
  .readout > :nth-child(even) { border-left: 1px solid rgb(255 255 255 / 0.09); }
  .readout > :nth-child(n + 3) { border-top: 1px solid rgb(255 255 255 / 0.09); }
}
.tick { stroke: rgb(var(--line)); transition: stroke 0.5s, opacity 0.5s; }
.tick.on { stroke: rgb(var(--accent)); animation: tickIn 0.6s both; }
.tick.on.hot { stroke: rgb(var(--bad)); }
.tip { position: relative; }
.tip::after {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  padding: 0.25rem 0.55rem;
  border-radius: 6px;
  background: rgb(var(--ink));
  color: rgb(var(--bg));
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.66rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 4px);
  transition: opacity 0.2s, transform 0.2s;
  z-index: 5;
}
.tip:hover::after { opacity: 1; transform: translate(-50%, 0); }
.live-dot { animation: blink 1.6s steps(1) infinite; }

/* =====================================================
   LANDING
   ===================================================== */
.ld { background: linear-gradient(180deg, rgb(var(--wa-color-purple-05)) 0%, rgb(var(--wa-color-purple-05)) 48%, rgb(var(--wa-color-purple-10)) 100%); color: rgb(var(--wa-color-purple-95)); }
.ld-purple { color: rgb(var(--wa-color-purple-50)); }
.ld-title { font-family: 'Noto Serif Thai', serif; font-weight: 500; letter-spacing: -0.012em; line-height: 1.16; }
.ld-mask { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.14em; }
.ld-mask > span { display: inline-block; transform: translateY(112%); }
.ld-ready .ld-mask > span { animation: maskRise 1.2s var(--ease) forwards; animation-delay: calc(var(--i, 0) * 110ms + 150ms); }
.ld-fade { opacity: 0; }
.ld-ready .ld-fade { animation: rise 1s var(--ease) forwards; animation-delay: calc(var(--i, 0) * 100ms + 500ms); }

.ld-grain { position: relative; }
.ld-word { opacity: 0.14; transition: opacity 0.4s linear; }
.ld-word[data-on='true'] { opacity: 1; }
.ld-marquee { display: flex; width: max-content; animation: marquee 44s linear infinite; }
.ld-marquee.rev { animation: marqueeR 52s linear infinite; }
.ld-marquee:hover { animation-play-state: paused; }
.ld-nav {
  position: fixed;
  top: 14px;
  left: 50%;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.4rem 0.4rem 1rem;
  border-radius: 999px;
  border: 1px solid rgb(239 232 218 / 0.12);
  background: rgb(18 15 11 / 0.7);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 20px 50px -22px rgb(0 0 0 / 0.8);
  transform: translate(-50%, 0);
  transition: transform 0.6s var(--ease), opacity 0.4s;
}
.ld-nav[data-hide='true'] { transform: translate(-50%, -140%); }
.ld-nav button.l { padding: 0.5rem 0.9rem; border-radius: 999px; font-size: 0.82rem; color: rgb(239 232 218 / 0.65); transition: color 0.2s, background-color 0.2s; }
.ld-nav button.l:hover { color: rgb(var(--wa-color-purple-05)); background: rgb(var(--wa-color-purple-05) / 0.08); }
.ld-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  min-height: 54px;
  padding: 0 1.7rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.3s var(--ease), background-color 0.3s, color 0.3s, box-shadow 0.4s, border-color 0.3s;
}
.ld-btn-purple { background: rgb(var(--wa-color-purple-60)); color: rgb(var(--wa-color-purple-05)); box-shadow: 0 10px 22px -14px rgb(var(--wa-color-purple-90) / 0.8); }
.ld-btn-purple:hover { background: rgb(var(--wa-color-purple-50)); }
.tbl td, .tbl th, table td { font-variant-numeric: tabular-nums; }
.grid > * { min-width: 0; }
.ld-btn-line { border: 1px solid rgb(var(--wa-color-purple-05) / 0.26); color: rgb(var(--wa-color-purple-05)); }
.ld-btn-line:hover { background: rgb(var(--wa-color-purple-05) / 0.08); border-color: rgb(239 232 218 / 0.5); }
.ld-dot { position: relative; }
.ld-dot::after { content: ''; position: absolute; inset: 0; border-radius: 50%; border: 1px solid rgb(var(--wa-color-purple-50)); animation: pulseRing 2.4s ease-out infinite; }

.dotgrid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(rgb(239 232 218 / 0.2) 1px, transparent 1.3px);
  background-size: 28px 28px;
  -webkit-mask-image: radial-gradient(ellipse 72% 62% at 50% 42%, #000 20%, transparent 100%);
  mask-image: radial-gradient(ellipse 72% 62% at 50% 42%, #000 20%, transparent 100%);
}
.beam-b { stroke: rgb(239 232 218 / 0.07); fill: none; stroke-width: 1; }
.beam-r { fill: none; stroke: rgb(var(--wa-color-purple-50)); stroke-width: 1.2; stroke-dasharray: 55 945; animation: beamRun var(--d, 9s) linear infinite; animation-delay: var(--dl, 0s); opacity: 0.8; }
.spotbeam { position: absolute; top: -18%; left: -14%; width: 120%; height: 120%; pointer-events: none; animation: spotIn 2.2s var(--ease) both; }

/* viewfinder ในหน้า hero */
.vfinder {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  border-radius: 26px;
  border: 1px solid rgb(239 232 218 / 0.14);
  background: radial-gradient(120% 90% at 30% 10%, rgb(var(--wa-color-purple-80)), rgb(var(--wa-color-purple-95)) 70%);
  box-shadow: 0 60px 120px -50px rgb(0 0 0 / 0.9), inset 0 1px 0 rgb(255 255 255 / 0.06);
}
.vfinder .br { position: absolute; width: 26px; height: 26px; border: 2px solid rgb(var(--wa-color-purple-50)); opacity: 0.9; }
.vfinder .br.tl { top: 18px; left: 18px; border-right: 0; border-bottom: 0; }
.vfinder .br.tr { top: 18px; right: 18px; border-left: 0; border-bottom: 0; }
.vfinder .br.bl { bottom: 18px; left: 18px; border-right: 0; border-top: 0; }
.vfinder .br.brr { bottom: 18px; right: 18px; border-left: 0; border-top: 0; }
.reticle { position: absolute; left: 50%; top: 46%; width: 112px; height: 112px; margin: -56px 0 0 -56px; }
.reticle::before, .reticle::after { content: ''; position: absolute; background: rgb(var(--wa-color-purple-50)); }
.reticle::before { left: 50%; top: -10px; bottom: -10px; width: 1px; opacity: 0.35; }
.reticle::after { top: 50%; left: -10px; right: -10px; height: 1px; opacity: 0.35; }
.reticle i { position: absolute; inset: 0; border: 1.5px solid rgb(var(--wa-color-purple-50)); border-radius: 4px; }
.reticle[data-lock='1'] i { animation: lock 0.6s var(--ease) both; box-shadow: none; }
.reticle[data-lock='0'] i { border-color: rgb(239 232 218 / 0.5); transform: scale(1.35); transition: transform 0.9s var(--ease), border-color 0.5s; }
.exif-v { display: inline-block; animation: exifIn 0.6s var(--ease) both; }

.hz-track { display: flex; gap: 1.5rem; will-change: transform; }
.hz-card {
  position: relative;
  flex: 0 0 min(84vw, 560px);
  min-height: min(62vh, 440px);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid rgb(239 232 218 / 0.12);
  background: linear-gradient(160deg, rgb(255 255 255 / 0.06), rgb(255 255 255 / 0.012));
}
.hz-no {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(6rem, 18vw, 11rem);
  line-height: 0.8;
  color: transparent;
  -webkit-text-stroke: 1px rgb(var(--wa-color-purple-50) / 0.5);
}

.bn { position: relative; overflow: hidden; border-radius: 26px; border: 1px solid rgb(239 232 218 / 0.1); background: linear-gradient(160deg, rgb(255 255 255 / 0.05), rgb(255 255 255 / 0.01)); }
.bn.spot::before { background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgb(var(--wa-color-purple-50) / 0.16), transparent 65%); }
.bn.spot::after { background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgb(var(--wa-color-purple-50) / 0.9), transparent 70%); }

.sf-item { min-height: 62vh; display: flex; flex-direction: column; justify-content: center; transition: opacity 0.6s var(--ease), transform 0.6s var(--ease); }
.sf-item[data-on='false'] { opacity: 0.22; transform: translateX(-6px); }
.sf-vis { position: absolute; inset: 0; opacity: 0; transform: translateY(18px) scale(0.97); filter: blur(6px); transition: all 0.7s var(--ease); pointer-events: none; }
.sf-vis[data-on='true'] { opacity: 1; transform: none; filter: none; pointer-events: auto; }

.lamp { position: relative; isolation: isolate; display: flex; flex-direction: column; align-items: center; overflow: hidden; }
.lamp-cone { position: absolute; top: 0; width: 16rem; height: 15rem; opacity: 0.55; transition: width 1.2s var(--ease), opacity 1.2s; -webkit-mask-image: linear-gradient(to bottom, #000 0%, transparent 92%); mask-image: linear-gradient(to bottom, #000 0%, transparent 92%); }
.lamp-cone.l { right: 50%; background: conic-gradient(from 180deg at right top, rgb(var(--wa-color-purple-50) / 0.8), transparent 23%); }
.lamp-cone.r { left: 50%; background: conic-gradient(from 90deg at left top, transparent 2%, rgb(var(--wa-color-purple-50) / 0.8) 25%, transparent 25.4%); }
.lamp.on .lamp-cone { width: min(34rem, 48vw); opacity: 1; }
.lamp-line { position: absolute; top: 0; left: 50%; height: 2px; width: 14rem; transform: translateX(-50%); background: rgb(var(--wa-color-purple-30)); box-shadow: none; transition: width 1.2s var(--ease); }
.lamp.on .lamp-line { width: min(34rem, 60vw); }
.lamp-glow { position: absolute; top: -2rem; left: 50%; width: min(30rem, 80vw); height: 9rem; transform: translateX(-50%); background: radial-gradient(closest-side, rgb(var(--wa-color-purple-50) / 0.4), transparent); filter: blur(40px); opacity: .45; }

.pre {
  position: fixed;
  inset: 0;
  z-index: 400;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(1.2rem, 3vw, 2.4rem);
  background: rgb(var(--wa-color-purple-95));
  color: rgb(var(--wa-color-purple-05));
  border-radius: 0 0 50% 50% / 0 0 0 0;
  transition: transform 1s cubic-bezier(0.76, 0, 0.24, 1), border-radius 1s cubic-bezier(0.76, 0, 0.24, 1);
}
.pre.out { transform: translateY(-101%); border-radius: 0 0 50% 50% / 0 0 14vh 14vh; }
.cur-ring {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 300;
  width: 38px;
  height: 38px;
  margin: -19px 0 0 -19px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(var(--wa-color-purple-50) / 0.75);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--wa-color-purple-95));
  transition: width 0.35s var(--ease), height 0.35s var(--ease), margin 0.35s var(--ease), background-color 0.3s, opacity 0.3s;
}
.cur-ring.show { opacity: 1; }
.cur-ring[data-k='1'] { width: 92px; height: 92px; margin: -46px 0 0 -46px; background: rgb(var(--wa-color-purple-50)); }
.cur-dot { position: fixed; left: 0; top: 0; z-index: 301; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; background: rgb(var(--wa-color-purple-50)); pointer-events: none; opacity: 0; }
.cur-dot.show { opacity: 1; }
@media (hover: none), (pointer: coarse) { .cur-ring, .cur-dot { display: none; } }

.iris { position: fixed; inset: 0; z-index: 380; background: rgb(var(--wa-color-purple-50)); pointer-events: none; clip-path: circle(0% at var(--ix, 50%) var(--iy, 50%)); }
.iris[data-state='close'] { clip-path: circle(150% at var(--ix, 50%) var(--iy, 50%)); transition: clip-path 0.85s cubic-bezier(0.7, 0, 0.2, 1); pointer-events: all; }
.iris[data-state='open'] { clip-path: circle(0% at 50% 50%); transition: clip-path 0.9s cubic-bezier(0.7, 0, 0.2, 1); }

@media (max-width: 1023px) { .sf-item { min-height: 0; padding: 1.5rem 0; } .sf-item[data-on='false'] { opacity: 1; transform: none; } }

/* Unified LensDesk purple system theme: soft lavender canvas, bright surfaces, deep-purple accents. */
.ld-system {
  /* พื้นหลังม่วงอ่อน การ์ดขาว และม่วงเข้มใช้เฉพาะเมนู/ปุ่มเพื่อให้อ่านสบายตา */
  --bg: var(--wa-color-purple-10);
  --surface: var(--wa-color-purple-05);
  --surface2: var(--wa-color-purple-10);
  --line: var(--wa-color-purple-30);
  --ink: var(--wa-color-purple-95);
  --mute: var(--wa-color-purple-80);
  --accent: var(--wa-color-purple-60);
  --accent-fg: 255 255 255;
  --side: var(--wa-color-purple-95);
  --side-ink: var(--wa-color-purple-05);
  --side-mute: var(--wa-color-purple-30);
  background: rgb(var(--wa-color-purple-10));
  color: rgb(var(--wa-color-purple-95));
  min-height: 100dvh;
}
.ld-system .glass-header { background: rgb(var(--wa-color-purple-05) / 0.96); border-color: rgb(var(--wa-color-purple-30) / 0.9); color: rgb(var(--wa-color-purple-95)); box-shadow: 0 10px 35px -28px rgb(var(--wa-color-purple-95) / 0.6); }
.ld-system .card { background-color: rgb(var(--wa-color-purple-05)); color: rgb(var(--wa-color-purple-95)); border-color: rgb(var(--wa-color-purple-30) / 0.9); box-shadow: 0 18px 50px -34px rgb(var(--wa-color-purple-95) / 0.75); }
.ld-system .input, .ld-system select, .ld-system textarea { background-color: rgb(255 255 255); color: rgb(var(--wa-color-purple-95)); border-color: rgb(var(--wa-color-purple-30)); }
.ld-system .input::placeholder, .ld-system textarea::placeholder { color: rgb(var(--wa-color-purple-80) / 0.72); }
.ld-system .btn-primary { background: linear-gradient(135deg, rgb(var(--wa-color-purple-50)), rgb(var(--wa-color-purple-70))); color: white; border-color: transparent; }
.ld-system .nav-item[data-on='true'], .ld-system .nav-item[aria-current='page'] { background: linear-gradient(135deg, rgb(var(--wa-color-purple-70) / 0.55), rgb(var(--wa-color-purple-60) / 0.32)); color: rgb(var(--wa-color-purple-05)); border-color: rgb(var(--wa-color-purple-50) / 0.65); }
.ld-system .icon-btn:hover, .ld-system .btn-ghost:hover { background: rgb(var(--wa-color-purple-60) / 0.2); border-color: rgb(var(--wa-color-purple-50) / 0.65); }
.ld-system .table-wrap, .ld-system .tbl-wrap { background: rgb(var(--wa-color-purple-05)); border-color: rgb(var(--wa-color-purple-30)); }
.ld-system .tbl { color: rgb(var(--wa-color-purple-95)); }
.ld-system .tbl thead { background: rgb(var(--wa-color-purple-10)); color: rgb(var(--wa-color-purple-80)); }
.ld-system .tbl tbody tr:hover { background: rgb(var(--wa-color-purple-10)); }

/* =====================================================
   UX8 — subtle motion for white cards across the system
   ===================================================== */
.ld-system .card {
  position: relative;
  transform: translateZ(0);
  transform-origin: center bottom;
  transition:
    transform 260ms cubic-bezier(.2,.75,.25,1),
    box-shadow 300ms cubic-bezier(.2,.75,.25,1),
    border-color 240ms ease,
    background-color 240ms ease;
  animation: ld-white-card-enter 460ms cubic-bezier(.2,.75,.25,1) both;
}
.ld-system .card:hover {
  transform: translateY(-3px);
  border-color: rgb(var(--wa-color-purple-50) / 0.72);
  box-shadow: 0 18px 36px -25px rgb(var(--wa-color-purple-90) / 0.48),
              0 5px 14px -10px rgb(var(--wa-color-purple-90) / 0.24);
}
.ld-system .card:active {
  transform: translateY(-1px) scale(.997);
  transition-duration: 100ms;
}
.ld-system .card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 42px -27px rgb(var(--wa-color-purple-90) / 0.5),
              0 6px 16px -11px rgb(var(--wa-color-purple-90) / 0.25);
}
@keyframes ld-white-card-enter {
  from { opacity: 0; transform: translateY(9px) scale(.992); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .ld-system .card,
  .ld-system .card-hover {
    animation: none !important;
    transition: border-color 120ms ease, box-shadow 120ms ease !important;
  }
  .ld-system .card:hover,
  .ld-system .card:active,
  .ld-system .card-hover:hover { transform: none !important; }
}

/* =====================================================
   FINAL POLISH — accessible chips + airy purple landing
   ===================================================== */
.chip[data-on='true'] {
  background: linear-gradient(135deg, rgb(var(--wa-color-purple-60)), rgb(var(--wa-color-purple-80))) !important;
  color: rgb(var(--wa-color-purple-05)) !important;
  border-color: transparent !important;
}
.chip[data-on='true'] * { color: rgb(var(--wa-color-purple-05)) !important; }

/* Landing: use purple-05/10 as the canvas and reserve deep purple for accents. */
.ld {
  background: linear-gradient(180deg, rgb(var(--wa-color-purple-05)) 0%, rgb(var(--wa-color-purple-05)) 45%, rgb(var(--wa-color-purple-10)) 100%);
  color: rgb(var(--wa-color-purple-95));
}
.ld .ld-grain {
  background: radial-gradient(ellipse at 78% 20%, rgb(var(--wa-color-purple-20) / .55), transparent 48%),
              linear-gradient(135deg, rgb(var(--wa-color-purple-05)), rgb(var(--wa-color-purple-05)) 68%);
}
.ld .ld-title, .ld h1, .ld h2, .ld h3, .ld h4 { color: rgb(var(--wa-color-purple-95)); }
.ld .ld-purple { color: rgb(var(--wa-color-purple-60)) !important; }
.ld .ld-nav {
  background: rgb(var(--wa-color-purple-05) / .94);
  border-color: rgb(var(--wa-color-purple-30) / .72);
  box-shadow: 0 12px 36px -24px rgb(var(--wa-color-purple-95) / .5);
}
.ld .ld-nav button.l { color: rgb(var(--wa-color-purple-80)); }
.ld .ld-nav button.l:hover { color: rgb(var(--wa-color-purple-95)); background: rgb(var(--wa-color-purple-10)); }
.ld [class*="text-[rgb(var(--wa-color-purple-05))]"] { color: rgb(var(--wa-color-purple-80) / .86) !important; }
.ld [class*="border-[rgb(var(--wa-color-purple-05))]"] { border-color: rgb(var(--wa-color-purple-20) / .9) !important; }
.ld [class*="bg-[rgb(var(--wa-color-purple-05))]"] { background-color: rgb(var(--wa-color-purple-20) / .7) !important; }
.ld .dotgrid { background-image: radial-gradient(rgb(var(--wa-color-purple-50) / .18) 1px, transparent 1.3px); }
.ld .beam-b { stroke: rgb(var(--wa-color-purple-70) / .12); }
.ld .hz-card, .ld .bn {
  border-color: rgb(var(--wa-color-purple-20) / .95);
  background: linear-gradient(150deg, rgb(var(--wa-color-purple-05)), rgb(var(--wa-color-purple-05)) 72%, rgb(var(--wa-color-purple-10)));
  color: rgb(var(--wa-color-purple-95));
  box-shadow: 0 20px 50px -38px rgb(var(--wa-color-purple-80) / .28);
}
.ld .hz-card p, .ld .bn p { color: rgb(var(--wa-color-purple-80) / .9); }
.ld .hz-no { -webkit-text-stroke-color: rgb(var(--wa-color-purple-50) / .65); }
.ld #statement { background: rgb(var(--wa-color-purple-10) / .72); }
.ld #features { background: rgb(255 255 255 / .84); }
.ld #flow { background: rgb(var(--wa-color-purple-05)); }
.ld #devices { background: linear-gradient(180deg, rgb(var(--wa-color-purple-05)), rgb(var(--wa-color-purple-10) / .8)); border-color: rgb(var(--wa-color-purple-20)); }
.ld .ld-btn-line { border-color: rgb(var(--wa-color-purple-30)); color: rgb(var(--wa-color-purple-80)); }
.ld .ld-btn-line:hover { background: rgb(var(--wa-color-purple-10)); border-color: rgb(var(--wa-color-purple-50)); }
.ld footer { border-color: rgb(var(--wa-color-purple-20)) !important; }
.ld .ld-marquee [style*="WebkitTextStroke"] { -webkit-text-stroke-color: rgb(var(--wa-color-purple-50) / .55) !important; }


/* Accessibility and final interaction polish */
.chip { color: rgb(var(--wa-color-purple-95)); font-weight: 600; }
.chip[data-on='true'] { color: rgb(var(--wa-color-purple-05)) !important; }
.ld #features .sf-item[data-on='false'] { opacity: .62; }
.ld #features .sf-item .font-num { color: rgb(var(--wa-color-purple-60) / .72) !important; }
.ld #features .sf-item p:not(.font-num) { color: rgb(var(--wa-color-purple-80)) !important; }
.ld #features .sf-vis .bn,
.ld #features .sf-vis .hz-card,
.ld #features .sf-vis .card,
.ld #features .sf-vis [class*="rounded-"] { color: rgb(var(--wa-color-purple-95)); }
.ld #features .sf-vis p,
.ld #features .sf-vis span,
.ld #features .sf-vis small,
.ld #features .sf-vis label { text-shadow: none; }
.ld #features .sf-vis [class*="text-[rgb(var(--wa-color-purple-05))]"],
.ld #features .sf-vis [class*="text-white"] { color: rgb(var(--wa-color-purple-95)) !important; }
.ld #features .sf-vis [class*="bg-[rgb(var(--wa-color-purple-95))]"],
.ld #features .sf-vis [class*="bg-[rgb(var(--wa-color-purple-80))]"] { background: rgb(var(--wa-color-purple-10)) !important; }
.ld .ld-nav { color: rgb(var(--wa-color-purple-95)); }
.ld .ld-nav .font-display { color: rgb(var(--wa-color-purple-95)); }
.ld .ld-btn-line { color: rgb(var(--wa-color-purple-80)); }
.ld-swal-deny { color: rgb(var(--wa-color-purple-90)) !important; }

/* Contrast fixes: Spotlight / Tilt / Viewfinder on the landing page */
.ld .bn [class*="text-[rgb(var(--wa-color-purple-50))]"],
.ld .bn [class*="text-[#f3a99d]"],
.ld .bn [class*="text-[#7cbe94]"],
.ld .bn [class*="text-[#ee705e]"] {
  color: rgb(var(--wa-color-purple-70)) !important;
}
.ld .bn .ld-title,
.ld .bn h1, .ld .bn h2, .ld .bn h3, .ld .bn h4,
.ld .spot .ld-title, .ld .spot h1, .ld .spot h2, .ld .spot h3, .ld .spot h4,
.ld .tilt .ld-title, .ld .tilt h1, .ld .tilt h2, .ld .tilt h3, .ld .tilt h4 {
  color: rgb(var(--wa-color-purple-95)) !important;
}
/* The hero viewfinder intentionally stays dark, so retain high-contrast light text there. */
.ld .vfinder [class*="text-[rgb(var(--wa-color-purple-05))]"],
.ld .vfinder .mono,
.ld .vfinder .exif-v {
  color: rgb(var(--wa-color-purple-05)) !important;
}
.ld .vfinder [class*="text-[rgb(var(--wa-color-purple-50))]"] {
  color: rgb(var(--wa-color-purple-20)) !important;
}
.ld .vfinder .reticle::before,
.ld .vfinder .reticle::after,
.ld .vfinder .reticle i,
.ld .vfinder .br {
  border-color: rgb(var(--wa-color-purple-30));
}
.ld .vfinder .reticle::before,
.ld .vfinder .reticle::after { background: rgb(var(--wa-color-purple-30)); }
.ld .vfinder .reticle[data-lock='0'] i { border-color: rgb(var(--wa-color-purple-05) / .8); }


/* Non-blocking notification stack: never covers the page with a modal backdrop. */
.ld-notice-stack {
  position: fixed; top: max(16px, env(safe-area-inset-top)); right: max(16px, env(safe-area-inset-right));
  z-index: 100000; display: flex; flex-direction: column; gap: 10px; width: min(390px, calc(100vw - 28px));
  pointer-events: none;
}
.ld-notice {
  display: flex; align-items: center; gap: 12px; padding: 13px 12px; border-radius: var(--radius);
  color: rgb(var(--ink)); background: linear-gradient(145deg, var(--notice-bg, rgb(var(--wa-color-purple-10))), rgb(var(--wa-color-purple-05)));
  border: 1px solid rgb(var(--wa-color-purple-30));
  box-shadow: 0 16px 42px rgb(var(--wa-color-purple-95) / .2), 0 0 0 1px rgb(255 255 255 / .7) inset;
  font-family: 'Prompt', sans-serif !important; pointer-events: auto; animation: swPopupEnter .42s cubic-bezier(.16, 1, .3, 1) both;
}
.ld-notice, .ld-notice * { font-family: 'Prompt', sans-serif !important; }
.ld-notice-out { animation: swPopupExit .18s ease-in both; }
.ld-notice-mark { flex: 0 0 32px; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 11px; background: rgb(255 255 255 / .88); color: var(--notice-color); box-shadow: 0 3px 9px rgb(var(--wa-color-purple-95) / .09); font-size: 17px; font-weight: 800; }
.ld-notice-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 2px; line-height: 1.45; }
.ld-notice-copy strong { color: var(--notice-color); font-size: 12px; font-weight: 700; }
.ld-notice-copy span { color: rgb(var(--ink)); font-size: 13px; overflow-wrap: anywhere; }
.ld-notice-close { width: 28px; height: 28px; flex: 0 0 28px; border: 0; border-radius: 9px; background: transparent; color: rgb(var(--wa-color-purple-80)); font-size: 22px; line-height: 1; cursor: pointer; transition: background .2s, transform .2s; }
.ld-notice-close:hover { background: rgb(var(--wa-color-purple-20) / .7); transform: rotate(90deg); }
@keyframes ld-notice-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ld-notice-out { to { opacity: 0; transform: translateX(14px); } }
@media (prefers-reduced-motion: reduce) { .ld-notice, .ld-notice-out, .ld-notice-close { animation: none !important; transition: none !important; } }
@media (max-width: 640px) { .ld-notice-stack { top: max(10px, env(safe-area-inset-top)); right: 10px; width: calc(100vw - 20px); } }

/* Feature showcase mock cards: replace low-contrast purple-on-purple with clear surfaces. */
.ld #features .sf-vis [class*="bg-[rgb(var(--wa-color-purple-90))]"],
.ld #features .sf-vis [class*="bg-[rgb(var(--wa-color-purple-95))]"],
.ld #features .sf-vis [class*="bg-[rgb(var(--wa-color-purple-80))]"],
.ld #features .sf-vis [class*="bg-[rgb(var(--wa-color-purple-70))]"] {
  background-color: rgb(var(--wa-color-purple-10)) !important;
}
.ld #features .sf-vis [class*="text-white"],
.ld #features .sf-vis [class*="text-[rgb(var(--wa-color-purple-05))]"],
.ld #features .sf-vis [class*="text-[#f3a99d]"],
.ld #features .sf-vis [class*="text-[#7cbe94]"],
.ld #features .sf-vis [class*="text-[rgb(var(--wa-color-purple-95))]"] {
  color: rgb(var(--wa-color-purple-95)) !important;
}
.ld #features .sf-vis [class*="border-white"] { border-color: rgb(var(--wa-color-purple-30)) !important; }
.ld #features .sf-vis [class*="bg-white/10"],
.ld #features .sf-vis [class*="bg-white/15"] { background-color: rgb(var(--wa-color-purple-20)) !important; }
.ld #features .sf-vis [class*="text-[10px]"],
.ld #features .sf-vis [class*="text-xs"],
.ld #features .sf-vis [class*="text-sm"] { text-shadow: none !important; }

/* UX5 responsive refinements: detail drawer and image-led cards */
.drawer-panel { width: min(100vw, 480px); max-width: 100%; font-family: 'Prompt', sans-serif !important; }
.modal-panel { font-family: 'Prompt', sans-serif !important; }
.drawer-panel .font-serif, .modal-panel .font-serif { font-family: 'Prompt', sans-serif !important; }
@media (max-width: 767px) {
  .drawer-panel { width: 100vw; border-left: 0; border-radius: 18px 18px 0 0; top: auto; height: min(92dvh, 900px); bottom: 0; animation: sheetUp 0.35s var(--ease) both; }
  .drawer-panel > header { padding-top: max(1rem, env(safe-area-inset-top)); }
  .drawer-panel > footer { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
}
@media (min-width: 768px) and (max-width: 1023px) {
  .drawer-panel { width: min(70vw, 480px); }
}



/* UX13: redesign selected-day panel so it is visibly different and long lists stay inside the card */
.calendar-day-panel { display:flex; flex-direction:column; min-width:0; max-width:100%; overflow:hidden; border:1px solid rgba(139,92,246,.28); background:linear-gradient(155deg,rgba(255,255,255,.98),rgba(246,241,255,.96)); box-shadow:0 14px 36px rgba(76,29,149,.09); }
.calendar-selected-header { display:flex; align-items:flex-start; gap:.75rem; padding:1rem; border-bottom:1px solid rgba(139,92,246,.18); background:linear-gradient(120deg,rgba(139,92,246,.11),rgba(255,255,255,.45)); }
.calendar-selected-icon { display:grid; place-items:center; flex:0 0 2.5rem; width:2.5rem; height:2.5rem; border-radius:.85rem; color:rgb(var(--wa-color-purple-05)); font-size:1.3rem; background:linear-gradient(145deg,rgb(var(--wa-color-purple-40)),rgb(var(--wa-color-purple-70))); box-shadow:0 6px 16px rgba(109,40,217,.24); }
.calendar-selected-title { margin-top:.35rem; font-family:inherit!important; font-size:1.05rem; line-height:1.4; font-weight:750; color:rgb(var(--wa-color-purple-95)); overflow-wrap:anywhere; }
.calendar-selected-subtitle { margin-top:.2rem; font-size:.72rem; color:#7c65a3; }
.calendar-selected-count { display:grid; place-items:center; flex:0 0 auto; min-width:2rem; height:2rem; padding:0 .45rem; border-radius:999px; color:rgb(var(--wa-color-purple-05)); font-size:.8rem; font-weight:700; background:rgb(var(--wa-color-purple-60)); box-shadow:0 4px 12px rgba(124,58,237,.2); }
.calendar-selected-content { min-height:0; padding:.75rem; }
.calendar-selected-list { display:flex; flex-direction:column; gap:.6rem; max-height:min(52dvh,510px); overflow-y:auto; overscroll-behavior:contain; padding:.1rem .2rem .2rem .1rem; }
.calendar-selected-list li { min-width:0; max-width:100%; }
.calendar-selected-booking { display:block; min-width:0; padding:.8rem; border:1px solid rgba(139,92,246,.2); border-radius:.85rem; background:rgba(255,255,255,.8); transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease,background .2s ease; }
.calendar-selected-booking:hover { transform:translateY(-2px); border-color:rgba(124,58,237,.55); background:rgb(var(--wa-color-purple-05)); box-shadow:0 8px 18px rgba(76,29,149,.09); }
.calendar-selected-equipment { margin-top:.35rem; font-size:.75rem; color:#725a98; overflow-wrap:anywhere; }
.calendar-selected-time { margin-top:.45rem; font-size:.72rem; font-weight:650; color:rgb(var(--wa-color-purple-60)); }
.calendar-selected-footer { padding:.65rem .9rem; border-top:1px solid rgba(139,92,246,.16); color:#806b9e; font-size:.7rem; }
.calendar-empty-day { padding:.75rem .25rem; }
@media (min-width:1280px) { .calendar-day-panel { max-height:calc(100dvh - 190px); } .calendar-selected-content { overflow:hidden; } .calendar-selected-list { max-height:calc(100dvh - 370px); } }
@media (max-width:1279px) { .calendar-selected-list { max-height:360px; } }
@media (max-width:640px) { .calendar-selected-header { padding:.8rem; gap:.6rem; } .calendar-selected-content { padding:.55rem; } .calendar-selected-list { max-height:300px; } .calendar-selected-booking { padding:.7rem; } }
@media (prefers-reduced-motion:reduce) { .calendar-selected-booking { transition:none; } .calendar-selected-booking:hover { transform:none; } }

/* UX12 calendar layout: constrain month grid to viewport and keep side list independently scrollable */
.calendar-layout, .calendar-month-card, .calendar-month-card * { min-width: 0; }
.calendar-month-card { width: 100%; max-width: 100%; }
.calendar-month-header { min-height: 64px; flex-wrap: wrap; }
.calendar-month-header h2 { min-width: 0; overflow-wrap: anywhere; }
.calendar-weekdays, .calendar-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); width: 100%; }
.calendar-weekdays > div { min-width: 0; overflow: hidden; }
.calendar-day { height: clamp(64px, calc((100dvh - 330px) / 6), 112px); min-width: 0; max-width: 100%; }
.calendar-day > span { max-width: 100%; min-width: 0; }
.calendar-day-panel { min-width: 0; max-width: 100%; }
.calendar-day-panel ul { max-height: min(56dvh, 560px); overflow-y: auto; overscroll-behavior: contain; padding-right: 3px; }
.calendar-day-panel li, .calendar-day-panel li > button { min-width: 0; max-width: 100%; }
@media (min-width: 1280px) {
  .calendar-layout { grid-template-columns: minmax(0, 1fr) minmax(260px, 320px); align-items: start; }
  .calendar-day-panel { max-height: calc(100dvh - 190px); overflow: hidden; }
  .calendar-day-panel > div { min-height: 0; }
  .calendar-day-panel ul { max-height: calc(100dvh - 340px); }
}
@media (max-width: 1279px) {
  .calendar-layout { grid-template-columns: minmax(0, 1fr); }
  .calendar-day-panel { position: static; }
  .calendar-day-panel ul { max-height: 360px; }
}
@media (max-width: 640px) {
  .calendar-month-header { padding: .75rem; gap: .5rem; }
  .calendar-month-header h2 { font-size: 1rem; }
  .calendar-month-header h2 span { font-size: 1.15rem; }
  .calendar-month-header .btn { padding-inline: .5rem; }
  .calendar-day { height: clamp(54px, calc((100dvh - 310px) / 6), 76px); padding: 3px; gap: 2px; }
  .calendar-weekdays > div { padding-top: .45rem; padding-bottom: .45rem; font-size: 9px; }
  .calendar-day > span:first-child { width: 1.25rem; height: 1.25rem; font-size: .68rem; }
}
@media (prefers-reduced-motion: reduce) {
  .calendar-month-card *, .calendar-day-panel * { scroll-behavior: auto !important; }
}

/* UX14: selected-day panel always matches the calendar card height */
.calendar-panel-inner { display: flex; flex-direction: column; min-width: 0; max-width: 100%; }
@media (min-width: 1280px) {
  .calendar-layout { align-items: stretch !important; }
  .calendar-day-panel {
    position: relative !important;
    top: auto !important;
    height: auto !important;
    max-height: none !important;
    overflow: hidden !important;
  }
  /* ไม่ให้เนื้อหาในกรอบดันความสูงของแถว — ความสูงมาจากปฏิทินเท่านั้น */
  .calendar-panel-inner { position: absolute; inset: 0; min-height: 0; }
  .calendar-selected-header,
  .calendar-selected-footer { flex: none; }
  .calendar-selected-content { flex: 1 1 auto; min-height: 0; overflow: hidden !important; display: flex; flex-direction: column; }
  .calendar-selected-list { flex: 1 1 auto; min-height: 0; max-height: none !important; overflow-y: auto; }
  .calendar-empty-day { flex: 1; display: flex; align-items: center; justify-content: center; }
  .calendar-empty-day > * { width: 100%; min-height: 0 !important; }
}



`;
if (typeof document !== 'undefined' && !document.getElementById('lensdesk-css')) {
  const el = document.createElement('style');
  el.id = 'lensdesk-css';
  el.textContent = __CSS;
  document.head.prepend(el);
}

/* ═════ lib/format.js ═════ */
// MariaDB ส่งวันที่เป็น 'YYYY-MM-DD HH:mm:ss' — Safari/iPad อ่านรูปแบบที่มีช่องว่างไม่ได้
// จึงต้องแปลงเป็น ISO ก่อนเสมอ
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const text = String(value).trim().replace(' ', 'T');
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function fmtDate(value, opts = {}) {
  const d = parseDate(value);
  if (!d) return '-';
  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: opts.noYear ? undefined : 'numeric',
  });
}

function fmtTime(value) {
  const d = parseDate(value);
  if (!d) return '-';
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateTime(value) {
  const d = parseDate(value);
  if (!d) return '-';
  return `${fmtDate(d)} · ${fmtTime(d)}`;
}

function fmtLongDate(date = new Date()) {
  return date.toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const money = (value, digits = 0) =>
  new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits || 2,
  }).format(Number(value || 0));

const baht = (value) => `฿${money(value)}`;

// ค่าสำหรับ <input type="datetime-local">
function toInputValue(date = new Date()) {
  const d = parseDate(date) || new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const toDateOnly = (date = new Date()) => toInputValue(date).slice(0, 10);

// คิดเป็นรายวัน ปัดขึ้น ขั้นต่ำ 1 วัน — เหมือนกับฝั่ง Backend
function rentalDays(start, end) {
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e) return 0;
  const ms = e.getTime() - s.getTime();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / 86400000));
}

function relativeTo(value, now = new Date()) {
  const d = parseDate(value);
  if (!d) return '';
  const diff = d.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  let text;
  if (mins < 60) text = `${Math.max(mins, 1)} นาที`;
  else if (mins < 60 * 24) text = `${Math.round(mins / 60)} ชม.`;
  else text = `${Math.round(mins / 1440)} วัน`;
  return diff >= 0 ? `อีก ${text}` : `เลยมา ${text}`;
}

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];
const MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];
const DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

function downloadCsv(filename, rows) {
  if (!rows.length) return false;
  const keys = Object.keys(rows[0]);
  const csv = [
    keys.join(','),
    ...rows.map((row) =>
      keys.map((k) => `"${String(row[k] ?? '').replaceAll('"', '""')}"`).join(',')
    ),
  ].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return true;
}

/* ═════ lib/constants.js ═════ */
const NAV_ITEMS = [
  { id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard, group: 'main' },
  { id: 'bookings', label: 'รายการจอง', icon: CalendarDays, group: 'main' },
  { id: 'operations', label: 'รับ–คืนอุปกรณ์', short: 'รับ–คืน', icon: ClipboardCheck, group: 'main' },
  { id: 'calendar', label: 'ปฏิทิน', icon: CalendarRange, group: 'main' },
  { id: 'equipments', label: 'กล้องและอุปกรณ์', short: 'อุปกรณ์', icon: Camera, group: 'stock' },
  { id: 'maintenance', label: 'ซ่อมบำรุง', icon: Wrench, group: 'stock' },
  { id: 'customers', label: 'ลูกค้า', icon: Users, group: 'business' },
  { id: 'finance', label: 'รายรับ–รายจ่าย', short: 'การเงิน', icon: Wallet, group: 'business' },
  { id: 'history', label: 'ประวัติการเช่า', short: 'ประวัติ', icon: HistoryIcon, group: 'business' },
  { id: 'settings', label: 'ตั้งค่าการแสดงผล', short: 'ตั้งค่า', icon: SlidersHorizontal, group: 'system' },
];

const NAV_GROUPS = {
  main: 'งานประจำวัน',
  stock: 'คลังอุปกรณ์',
  business: 'ธุรกิจ',
  system: 'ระบบ',
};

const CATEGORIES = [
  { id: 'camera', label: 'กล้อง', icon: Camera, prefix: 'CAM' },
  { id: 'lens', label: 'เลนส์', icon: Aperture, prefix: 'LENS' },
  { id: 'flash', label: 'แฟลช/ไฟ', icon: Zap, prefix: 'FLS' },
  { id: 'accessory', label: 'อุปกรณ์เสริม', icon: Package, prefix: 'ACC' },
];

const categoryOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[3];

// tone -> ใช้กับ StatusBadge
const STATUS_META = {
  available: { label: 'พร้อมใช้งาน', tone: 'ok' },
  rented: { label: 'กำลังถูกเช่า', tone: 'info' },
  booked: { label: 'ถูกจองแล้ว', tone: 'warn' },
  maintenance: { label: 'ซ่อมบำรุง', tone: 'bad' },
  pending: { label: 'รอยืนยัน', tone: 'warn' },
  confirmed: { label: 'รอรับอุปกรณ์', tone: 'warn' },
  picked_up: { label: 'อยู่กับลูกค้า', tone: 'info' },
  returned: { label: 'คืนแล้ว', tone: 'ok' },
  cancelled: { label: 'ยกเลิก', tone: 'mute' },
  overdue: { label: 'เกินกำหนดคืน', tone: 'bad' },
  in_progress: { label: 'กำลังซ่อม', tone: 'warn' },
  completed: { label: 'เสร็จสิ้น', tone: 'ok' },
};

const DEFAULT_ACCESSORIES = [
  'แบตเตอรี่',
  'ที่ชาร์จ',
  'สายคล้อง',
  'ฝาปิดเลนส์',
  'การ์ดความจำ',
  'กระเป๋า / กล่อง',
];

const FINANCE_CATEGORIES = {
  income: ['ค่าเช่าอุปกรณ์', 'ค่าปรับ', 'ค่าใช้จ่ายเพิ่มเติม', 'ขายอุปกรณ์', 'อื่นๆ'],
  expense: ['ซ่อมบำรุง', 'ซื้ออุปกรณ์', 'อุปกรณ์สิ้นเปลือง', 'ค่าโฆษณา', 'ค่าขนส่ง', 'อื่นๆ'],
};

/* ───────────────────────────────────────────────────────────
   ข้อมูลร้าน — แก้ที่นี่ที่เดียว แล้วทุกหน้า/ใบจอง/ชื่อแท็บจะเปลี่ยนตาม
   name   : ชื่อร้าน
   logo   : ลิงก์รูปโลโก้ (เช่น '/logo.png' หรือ URL) เว้นว่างไว้ = ใช้ไอคอนเลนส์
   phone  : เบอร์ติดต่อ แสดงในใบจอง
   line   : LINE ID (ถ้ามี) แสดงในใบจอง
   pickup : จุดนัดรับกล้องปกติ แสดงในใบจอง
   ─────────────────────────────────────────────────────────── */
const SHOP = {
  name: 'เช่ากล้องกับแนน',
  logo: '/logo.png', /* วางไฟล์โลโก้ไว้ที่ frontend/public/logo.png (ถ้ายังไม่มีไฟล์ ระบบจะใช้ไอคอนเลนส์แทนอัตโนมัติ) */
  phone: '',
  line: '',
  pickup: 'สงขลา / เก้าเส้ง',
};

const THEME_COLORS = {"purple": {"label": "ม่วง", "main": "#8452e0"}, "green": {"label": "เขียว", "main": "#008f47"}, "red": {"label": "แดง", "main": "#d5283b"}, "orange": {"label": "ส้ม", "main": "#d85e06"}, "blue": {"label": "น้ำเงิน", "main": "#0073e6"}, "pink": {"label": "ชมพู", "main": "#c43487"}, "teal": {"label": "เขียวมิ้นต์", "main": "#008984"}, "gold": {"label": "ทอง", "main": "#967000"}, "slate": {"label": "เทาเข้ม", "main": "#657992"}};
/* อ่านสีธีมปัจจุบัน (hex) ไว้ใช้กับ favicon และหน้าพิมพ์ที่อยู่นอกระบบ CSS ตัวแปร */
const themeHex = (step = '60') => {
  try {
    const t = getComputedStyle(document.documentElement).getPropertyValue(`--wa-color-purple-${step}`).trim().split(/\s+/).map(Number);
    if (t.length === 3 && t.every(Number.isFinite)) return '#' + t.map((n) => n.toString(16).padStart(2, '0')).join('');
  } catch { /* ใช้ค่าเริ่มต้น */ }
  return '#8452e0';
};

const DEFAULT_SETTINGS = {
  navStyle: 'sidebar',
  side: 'left',
  radius: 'soft',
  density: 'comfortable',
  motion: true,
  color: 'purple',
  shopName: SHOP.name,
};


/* ═════ lib/api.js ═════ */
// ใส่ URL ของ Backend Vercel ที่เพิ่งได้มาตรงนี้
const PRODUCTION_BACKEND_URL = 'https://camera-rental-project-g37m.vercel.app'; 

const isVercel = window.location.hostname.includes('vercel.app');

const API_ORIGIN =
  import.meta.env.VITE_API_URL ||
  (isVercel
    ? PRODUCTION_BACKEND_URL
    : `${window.location.protocol}//${window.location.hostname}:5001`);

const AUTH_TOKEN_KEY = 'lensdesk.ownerToken';
const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, (error) => {
  if (error?.response?.status === 401 && !String(error?.config?.url || '').includes('/auth/login')) {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem('lensdesk.entered');
    window.dispatchEvent(new CustomEvent('lensdesk:auth-expired'));
  }
  return Promise.reject(error);
});

// รูปที่อัปโหลดเก็บเป็น path แบบ /uploads/xxx.jpg
const imgSrc = (url) => {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${API_ORIGIN}${url}`;
};

const errMsg = (error, fallback = 'เกิดข้อผิดพลาด กรุณาลองใหม่') => {
  if (error?.code === 'ERR_NETWORK') {
    return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบว่า Backend ทำงานอยู่';
  }
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    fallback
  );
};

async function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post('/upload', form, { timeout: 60000 });
  return data.url;
}

/* ═════ lib/swal.js ═════ */
const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

const cssRgb = (name) =>
  `rgb(${getComputedStyle(document.documentElement).getPropertyValue(name).trim()})`;

const iconColor = (icon) =>
  ({
    success: cssRgb('--ok'),
    error: cssRgb('--bad'),
    warning: cssRgb('--warn'),
    info: cssRgb('--info'),
    question: cssRgb('--accent'),
  }[icon]);

const themed = () =>
  Swal.mixin({
    buttonsStyling: false,
    reverseButtons: true,
    focusConfirm: false,
    returnFocus: false,
    showClass: { popup: 'sw-in' },
    hideClass: { popup: 'sw-out' },
    customClass: {
      popup: 'sw-popup',
      title: 'sw-title',
      htmlContainer: 'sw-html',
      actions: 'sw-actions',
      confirmButton: 'btn btn-primary',
      cancelButton: 'btn btn-ghost',
      denyButton: 'btn btn-danger',
    },
  });

// Swal.fire แบบปรับธีมให้เข้ากับระบบ
const fire = (options) =>
  themed().fire({ iconColor: iconColor(options.icon), ...options });

// Lightweight, non-blocking notifications. Avoid SweetAlert2 toast overlays that can
// remain mounted in some browser/layout states and make the page feel unresponsive.
const toast = (icon, title) => {
  if (typeof document === 'undefined') return;
  let host = document.getElementById('ld-notice-stack');
  if (!host) {
    host = document.createElement('div');
    host.id = 'ld-notice-stack';
    host.className = 'ld-notice-stack';
    host.setAttribute('aria-live', 'polite');
    host.setAttribute('aria-atomic', 'false');
    document.body.appendChild(host);
  }

  // ทุกสถานะใช้โทนม่วงเดียวกับระบบ แต่ยังแยกความหมายด้วยสัญลักษณ์และข้อความ
  const palette = {
    success: { mark: '✓', label: 'สำเร็จ', color: 'rgb(85 44 156)', bg: 'rgb(243 237 255)' },
    error: { mark: '×', label: 'เกิดข้อผิดพลาด', color: 'rgb(58 27 108)', bg: 'rgb(243 237 255)' },
    warning: { mark: '!', label: 'แจ้งเตือน', color: 'rgb(109 61 193)', bg: 'rgb(243 237 255)' },
    info: { mark: 'i', label: 'ข้อมูล', color: 'rgb(85 44 156)', bg: 'rgb(243 237 255)' },
  };
  const style = palette[icon] || palette.info;
  const item = document.createElement('div');
  item.className = 'ld-notice';
  item.style.setProperty('--notice-color', style.color);
  item.style.setProperty('--notice-bg', style.bg);
  item.setAttribute('role', icon === 'error' ? 'alert' : 'status');

  const mark = document.createElement('span');
  mark.className = 'ld-notice-mark';
  mark.textContent = style.mark;
  mark.setAttribute('aria-hidden', 'true');
  const body = document.createElement('div');
  body.className = 'ld-notice-copy';
  const heading = document.createElement('strong');
  heading.textContent = style.label;
  const message = document.createElement('span');
  message.textContent = String(title ?? '');
  body.append(heading, message);
  const close = document.createElement('button');
  close.className = 'ld-notice-close';
  close.type = 'button';
  close.textContent = '×';
  close.setAttribute('aria-label', 'ปิดการแจ้งเตือน');
  let removed = false;
  const dismiss = () => {
    if (removed) return;
    removed = true;
    item.classList.add('ld-notice-out');
    window.setTimeout(() => item.remove(), 180);
  };
  close.addEventListener('click', dismiss);
  item.append(mark, body, close);
  host.appendChild(item);
  const timer = window.setTimeout(dismiss, 3200);
  close.addEventListener('click', () => window.clearTimeout(timer), { once: true });
  // Keep the stack tidy if several updates arrive together.
  while (host.children.length > 4) host.firstElementChild?.remove();
};

async function confirmAsk({
  title,
  text,
  html,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  icon = 'question',
  danger = false,
}) {
  const result = await fire({
    icon,
    title,
    text,
    html,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: 'sw-popup',
      title: 'sw-title',
      htmlContainer: 'sw-html',
      actions: 'sw-actions',
      confirmButton: danger ? 'btn btn-danger' : 'btn btn-primary',
      cancelButton: 'btn btn-ghost',
    },
  });
  return result.isConfirmed;
}

const showLoading = (title = 'กำลังบันทึก...') =>
  fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

const showError = (text, title = 'ทำรายการไม่สำเร็จ') =>
  fire({ icon: 'error', title, text, confirmButtonText: 'ตกลง' });

/* ═════ lib/booking.js ═════ */
const effectiveStatus = (booking) => {
  if (
    booking.status === 'picked_up' &&
    parseDate(booking.end_date) &&
    parseDate(booking.end_date) < new Date()
  ) {
    return 'overdue';
  }
  return booking.status;
};

const equipmentNamesOf = (booking) =>
  booking.equipment_names ? booking.equipment_names.split(', ') : [];

const equipmentTitle = (booking) => {
  const names = equipmentNamesOf(booking);
  if (!names.length) return '-';
  if (names.length === 1) return names[0];
  return `${names[0]} +${names.length - 1}`;
};

const lateDays = (booking, now = new Date()) => {
  const end = parseDate(booking.end_date);
  if (!end || end >= now) return 0;
  return Math.ceil((now.getTime() - end.getTime()) / 86400000);
};

/* ═════ components/hooks.js ═════ */
const motionOff = () =>
  document.documentElement.dataset.motion === 'off' ||
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function useMedia(query) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [match, setMatch] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatch(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return match;
}

// mobile < 768 · tablet 768–1023 · desktop >= 1024
function useBreakpoint() {
  const isDesktop = useMedia('(min-width: 1024px)');
  const isTablet = useMedia('(min-width: 768px)');
  return isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile';
}

// เพิ่มคลาส .in เมื่อ element เลื่อนเข้าจอ
function useReveal(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (motionOff() || !('IntersectionObserver' in window)) {
      el.classList.add('in');
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in');
          if (!options.repeat) io.disconnect();
        } else if (options.repeat) {
          el.classList.remove('in');
        }
      },
      { threshold: options.threshold ?? 0.18, rootMargin: options.rootMargin ?? '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [options.repeat, options.threshold, options.rootMargin]);
  return ref;
}

function useCountUp(target, duration = 1000, active = true) {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const end = Number(target) || 0;
    if (!active) return undefined;
    if (motionOff()) {
      setValue(end);
      from.current = end;
      return undefined;
    }
    const start = from.current;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(start + (end - start) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = end;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);
  return value;
}

function useLockBody(locked = true) {
  useEffect(() => {
    if (!locked) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/* ═════ context/SettingsContext.jsx ═════ */
const KEY = 'lensdesk.settings.v2';
const SettingsCtx = createContext(null);
const useSettings = () => useContext(SettingsCtx);

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (!saved.shopName || saved.shopName === 'LensDesk') delete saved.shopName; // ชื่อเดิมที่เคยบันทึกไว้ → ใช้ชื่อร้านใหม่
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(load);

  useEffect(() => {
    const root = document.documentElement;
    /* ธีมม่วงเป็นธีมมาตรฐานเดียวทั้งหน้าแนะนำและหน้าระบบ */
    root.dataset.theme = 'light';
    root.dataset.accent = 'purple';
    root.dataset.color = THEME_COLORS[settings.color] ? settings.color : 'purple';
    root.dataset.radius = settings.radius;
    root.dataset.density = settings.density;
    root.dataset.motion = settings.motion ? 'on' : 'off';
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* โหมดส่วนตัวอาจเขียน localStorage ไม่ได้ */
    }
  }, [settings]);

  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), []);

  const value = useMemo(() => ({ settings, update, reset }), [settings, update, reset]);
  return <SettingsCtx.Provider value={value}>{children}</SettingsCtx.Provider>;
}

/* ═════ context/AppContext.jsx ═════ */
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

const ENTER_KEY = 'lensdesk.entered';

const parseHash = () => {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (!h) return 'dashboard';
  return NAV_ITEMS.some((n) => n.id === h) ? h : 'notfound';
};

const EMPTY_DASH = {
  statusCounts: {},
  todayBookings: [],
  overdueBookings: [],
  upcomingBookings: [],
  monthIncome: 0,
  monthExpense: 0,
  depositHolding: 0,
};

const ENDPOINTS = {
  equipments: '/equipments',
  bookings: '/bookings',
  dashboard: '/dashboard',
  customers: '/customers',
  maintenance: '/maintenance',
  transactions: '/transactions',
  report: '/reports/summary',
};

function AppProvider({ children }) {
  const [entered, setEntered] = useState(() => sessionStorage.getItem(ENTER_KEY) === '1' && Boolean(sessionStorage.getItem(AUTH_TOKEN_KEY)));
  const [page, setPage] = useState(parseHash);

  const [data, setData] = useState({
    equipments: [],
    bookings: [],
    dashboard: EMPTY_DASH,
    customers: [],
    maintenance: [],
    transactions: [],
    report: null,
  });
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [offline, setOffline] = useState(false);

  // modal / drawer ส่วนกลาง
  const [bookingModal, setBookingModal] = useState({ open: false, equipmentIds: [] });
  const [equipmentModal, setEquipmentModal] = useState({ open: false, item: null });
  const [detailId, setDetailId] = useState(null);

  /* ---------- โหลดข้อมูล ---------- */
  const inflight = useRef(null);
  const queued = useRef(false);
  const restBusy = useRef(false);
  const everLoaded = useRef(false);

  // ดึงข้อมูลตามชุด key แล้วอัปเดต state — คืนจำนวนที่ล้มเหลว
  const fetchKeys = useCallback(async (keys) => {
    const results = await Promise.allSettled(keys.map((k) => api.get(ENDPOINTS[k])));
    const next = {};
    let failed = 0;
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        const key = keys[i];
        next[key] = key === 'dashboard' ? { ...EMPTY_DASH, ...r.value.data } : r.value.data;
      } else {
        failed += 1;
      }
    });
    setData((prev) => ({ ...prev, ...next }));
    return failed;
  }, []);

  /* โหลดครั้งแรกรอทุกชุด แต่หลังทำรายการ (refresh ต่อจากนั้น) จะรอแค่ข้อมูลหลัก (รายการจอง/อุปกรณ์/ภาพรวม)
     ส่วนลูกค้า รายรับ ซ่อมบำรุง รายงาน โหลดต่อเบื้องหลัง — หน้าจอตอบสนองเร็วขึ้นหลังกดบันทึก */
  const CORE_KEYS = ['bookings', 'equipments', 'dashboard'];
  const REST_KEYS = Object.keys(ENDPOINTS).filter((k) => !CORE_KEYS.includes(k));

  const restQueued = useRef(false);
  const runRest = useCallback(() => {
    if (restBusy.current) {
      restQueued.current = true; // กำลังโหลดชุดรองอยู่ — โหลดซ้ำอีกรอบหลังจบ ไม่ให้ข้อมูลหลังทำรายการค้างเก่า
      return;
    }
    restBusy.current = true;
    fetchKeys(REST_KEYS).finally(() => {
      restBusy.current = false;
      if (restQueued.current) {
        restQueued.current = false;
        runRest();
      }
    });
  }, [fetchKeys]);

  const refresh = useCallback(() => {
    // ถ้ากำลังโหลดอยู่ ไม่ทิ้งคำขอ — จดไว้ให้โหลดซ้ำอีกรอบหลังจบ (เดิมคำขอที่ซ้อนกันจะถูกข้ามและข้อมูลค้างเก่า)
    if (inflight.current) {
      queued.current = true;
      return inflight.current;
    }
    inflight.current = (async () => {
      try {
        do {
          queued.current = false;
          setLoading(true);
          const first = !everLoaded.current;
          const keys = first ? Object.keys(ENDPOINTS) : CORE_KEYS;
          const failed = await fetchKeys(keys);
          if (first) {
            setOffline(failed === keys.length);
            everLoaded.current = !(failed === keys.length);
          } else if (failed < keys.length) {
            setOffline(false);
          }
          setLoaded(true);
          setLoading(false);
          if (!first) runRest();
        } while (queued.current);
      } finally {
        setLoading(false);
        inflight.current = null;
      }
    })();
    return inflight.current;
  }, [fetchKeys, runRest]);

  useEffect(() => {
    if (!entered) return undefined;
    refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, 60000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [entered, refresh]);

  /* ---------- นำทาง (hash) ---------- */
  useEffect(() => {
    const onHash = () => setPage(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = useCallback((target) => {
    const hash = `#/${target}`;
    if (window.location.hash !== hash) window.location.hash = hash;
    else setPage(target);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const enter = useCallback(() => {
    sessionStorage.setItem(ENTER_KEY, '1');
    setEntered(true);
    navigate('dashboard');
  }, [navigate]);

  const leave = useCallback(() => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(ENTER_KEY);
    setEntered(false);
    window.history.replaceState(null, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  /* ---------- modal helpers ---------- */
  const openBooking = useCallback(
    (equipmentIds = []) => setBookingModal({ open: true, equipmentIds }),
    []
  );
  const closeBooking = useCallback(() => setBookingModal({ open: false, equipmentIds: [] }), []);
  const openEquipment = useCallback((item = null) => setEquipmentModal({ open: true, item }), []);
  const closeEquipment = useCallback(() => setEquipmentModal({ open: false, item: null }), []);

  const value = useMemo(
    () => ({
      ...data,
      loading,
      loaded,
      offline,
      refresh,
      entered,
      enter,
      leave,
      page,
      navigate,
      bookingModal,
      openBooking,
      closeBooking,
      equipmentModal,
      openEquipment,
      closeEquipment,
      detailId,
      openDetail: setDetailId,
      closeDetail: () => setDetailId(null),
    }),
    [
      data, loading, loaded, offline, refresh, entered, enter, leave, page, navigate,
      bookingModal, openBooking, closeBooking, equipmentModal, openEquipment,
      closeEquipment, detailId,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

/* ═════ components/fx.jsx ═════ */
/* =====================================================
   FX — เอฟเฟกต์ภาพ/เคลื่อนไหว (ไม่พึ่งไลบรารีภายนอก)
   แรงบันดาลใจ: Aceternity UI (Spotlight, 3D Card, Moving Border,
   Background Beams, Lamp, Text Generate, Floating Dock),
   21st.dev (Animated Tabs, Spotlight Card, Magnetic Button),
   และงาน scroll/motion จากเว็บแกลเลอรีอย่าง Godly
   ===================================================== */

const hasFine = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
const isCalm = () =>
  typeof document !== 'undefined' &&
  (document.documentElement.dataset.motion === 'off' ||
    !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

function useInView(ref, { once = true, threshold = 0.25 } = {}) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (isCalm() || !('IntersectionObserver' in window)) {
      setOn(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          if (once) io.disconnect();
        } else if (!once) setOn(false);
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, threshold]);
  return on;
}

// เรียก callback ทุกเฟรมที่มีการเลื่อน (throttle ด้วย rAF)
function useScrollLoop(cb) {
  const saved = useRef(cb);
  saved.current = cb;
  useEffect(() => {
    let raf = 0;
    const run = () => {
      raf = 0;
      saved.current();
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    run();
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

/* ---------- Spotlight card ---------- */
function useSpot() {
  return useCallback((e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);
}

function Spot({ as: Tag = 'div', className = '', children, ...rest }) {
  const onMove = useSpot();
  return (
    <Tag onPointerMove={onMove} className={`spot ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------- 3D tilt card ---------- */
function Tilt({ as: Tag = 'div', className = '', max = 8, glare = true, children, ...rest }) {
  const ref = useRef(null);
  const raf = useRef(0);

  const move = (e) => {
    if (e.pointerType === 'touch' || !hasFine() || isCalm()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const cx = e.clientX - r.left;
    const cy = e.clientY - r.top;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.dataset.on = '1';
      el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`);
      el.style.setProperty('--rx', `${-(py - 0.5) * max * 2}deg`);
      el.style.setProperty('--gx', `${px * 100}%`);
      el.style.setProperty('--gy', `${py * 100}%`);
      el.style.setProperty('--mx', `${cx}px`);
      el.style.setProperty('--my', `${cy}px`);
    });
  };
  const leave = () => {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (!el) return;
    delete el.dataset.on;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <Tag ref={ref} onPointerMove={move} onPointerLeave={leave} className={`tilt spot ${className}`} {...rest}>
      {children}
      {glare && <span className="glare" aria-hidden="true" />}
    </Tag>
  );
}

/* ---------- Magnetic ---------- */
function Magnetic({ children, strength = 0.3, className = '' }) {
  const ref = useRef(null);
  const move = (e) => {
    if (e.pointerType === 'touch' || !hasFine() || isCalm()) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const leave = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return (
    <span
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </span>
  );
}

/* ---------- Text generate ---------- */
function GenerateText({ words, className = '', delay = 0, step = 70 }) {
  const ref = useRef(null);
  const on = useInView(ref, { threshold: 0.4 });
  const list = Array.isArray(words) ? words : String(words).split(' ');
  return (
    <span ref={ref} className={className}>
      {list.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className={`gt ${on ? 'in' : ''}`}
          style={{ transitionDelay: `${delay + i * step}ms`, marginRight: '0.28em' }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}

/* ---------- EXIF ticker ---------- */
const EXIF = [
  ['f/1.4', '1/500', 'ISO 100', '35mm'],
  ['f/2.8', '1/250', 'ISO 200', '50mm'],
  ['f/4', '1/125', 'ISO 400', '85mm'],
  ['f/8', '1/60', 'ISO 800', '24mm'],
];
function ExifTicker({ className = '' }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (isCalm()) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % EXIF.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={`mono flex flex-wrap gap-x-5 gap-y-1 ${className}`}>
      {EXIF[i].map((v, k) => (
        <span key={`${i}-${v}`} className="exif-v" style={{ animationDelay: `${k * 80}ms` }}>
          {v}
        </span>
      ))}
    </div>
  );
}

/* ---------- Backgrounds ---------- */
function Beams({ className = '' }) {
  const paths = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const a = -420 + i * 26;
        return `M${a} ${-220 + i * 9} C ${a + 160} 40, ${60 + i * 24} 260, ${620 + i * 26} ${620 + i * 8}`;
      }),
    []
  );
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} className="beam-b" />
          <path
            d={d}
            pathLength="1000"
            className="beam-r"
            style={{ '--d': `${8 + (i % 5) * 1.6}s`, '--dl': `${-(i * 0.9)}s` }}
          />
        </g>
      ))}
    </svg>
  );
}

function SpotlightBeam() {
  return (
    <svg className="spotbeam" viewBox="0 0 1600 1200" fill="none" aria-hidden="true">
      <defs>
        <filter id="sb-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="95" />
        </filter>
      </defs>
      <g filter="url(#sb-blur)">
        <ellipse cx="520" cy="260" rx="760" ry="105" transform="rotate(34 520 260)" fill="rgb(var(--wa-color-purple-50))" fillOpacity="0.2" />
        <ellipse cx="380" cy="120" rx="420" ry="60" transform="rotate(30 380 120)" fill="rgb(var(--wa-color-purple-30))" fillOpacity="0.14" />
      </g>
    </svg>
  );
}

function Lamp({ children, className = '' }) {
  const ref = useRef(null);
  const on = useInView(ref, { threshold: 0.35 });
  return (
    <div ref={ref} className={`lamp ${on ? 'on' : ''} ${className}`}>
      <div className="lamp-glow" />
      <div className="lamp-cone l" />
      <div className="lamp-cone r" />
      <div className="lamp-line" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

/* ---------- Cursor ring (หน้า Landing) ---------- */
function CursorRing() {
  const ring = useRef(null);
  const dot = useRef(null);
  const label = useRef(null);
  useEffect(() => {
    if (!hasFine() || isCalm()) return undefined;
    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;
    let seen = false;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!seen) {
        seen = true;
        rx = x;
        ry = y;
        ring.current?.classList.add('show');
        dot.current?.classList.add('show');
      }
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px)`;
      const t = e.target?.closest?.('[data-cursor]');
      if (ring.current) ring.current.dataset.k = t ? '1' : '';
      if (label.current) label.current.textContent = t ? t.dataset.cursor : '';
    };
    const loop = () => {
      rx += (x - rx) * 0.17;
      ry += (y - ry) * 0.17;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      <div ref={ring} className="cur-ring" aria-hidden="true">
        <span ref={label} />
      </div>
      <div ref={dot} className="cur-dot" aria-hidden="true" />
    </>
  );
}

/* ---------- Preloader ---------- */
function Preloader({ onDone }) {
  const [n, setN] = useState(0);
  const [out, setOut] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (isCalm()) {
      done.current();
      return undefined;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t0 = performance.now();
    const dur = 1700;
    let raf = 0;
    let timer = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(100 * (1 - Math.pow(1 - p, 2.4))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setOut(true);
        done.current(true);
        timer = setTimeout(() => done.current(false), 1000);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className={`pre ${out ? 'out' : ''}`} aria-hidden="true">
      <div className="mono flex justify-between text-[rgb(var(--wa-color-purple-05)/0.6)]">
        <span>{SHOP.name}</span>
        <span>{n < 100 ? 'กำลังล้างฟิล์ม' : 'พร้อมแล้ว'}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="font-num text-[clamp(7rem,28vw,20rem)] leading-[0.8] text-[rgb(var(--wa-color-purple-05))]">
          {String(n).padStart(3, '0')}
        </p>
        <div className="mono mb-3 hidden text-right text-[rgb(var(--wa-color-purple-50))] sm:block">
          <p>f/1.4 · 1/250</p>
          <p>ISO 100</p>
        </div>
      </div>
      <div className="h-px w-full bg-[rgb(var(--wa-color-purple-05)/0.15)]">
        <div className="h-full bg-[rgb(var(--wa-color-purple-50))]" style={{ width: `${n}%` }} />
      </div>
    </div>
  );
}

/* ---------- Aperture gauge (อัตราการใช้งาน) ---------- */
function ApertureGauge({ value = 0, size = 220, ticks = 56, hot = false, children }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, []);
  const lit = Math.round((ticks * Math.min(100, Math.max(0, value))) / 100);
  const c = size / 2;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {Array.from({ length: ticks }, (_, i) => {
          const major = i % 7 === 0;
          const r1 = c - (major ? 20 : 14);
          const r2 = c - 4;
          const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={i}
              x1={c + Math.cos(a) * r1}
              y1={c + Math.sin(a) * r1}
              x2={c + Math.cos(a) * r2}
              y2={c + Math.sin(a) * r2}
              strokeWidth={major ? 2.2 : 1.4}
              strokeLinecap="round"
              className={`tick ${ready && i < lit ? `on ${hot ? 'hot' : ''}` : ''}`}
              style={{ animationDelay: `${i * 18}ms`, transitionDelay: `${i * 18}ms` }}
            />
          );
        })}
        <circle cx={c} cy={c} r={c - 34} fill="none" strokeWidth="1" strokeDasharray="2 5" style={{ stroke: 'rgb(var(--line))' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

/* ---------- วัดตำแหน่งแท็บ (ใช้กับ sliding pill/underline) ---------- */
function useSlider(activeKey, deps = []) {
  const wrap = useRef(null);
  const [box, setBox] = useState({ x: 0, w: 0, ok: false });
  const measure = useCallback(() => {
    const el = wrap.current?.querySelector('[data-on="true"]');
    if (el) setBox({ x: el.offsetLeft, w: el.offsetWidth, ok: true });
    else setBox((b) => ({ ...b, ok: false }));
  }, []);
  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, measure, ...deps]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);
  return { wrap, box };
}

/* ═════ components/ui.jsx ═════ */
/* ---------- Status ---------- */
const TONES = {
  ok: 'bg-ok/10 text-ok ring-ok/25',
  info: 'bg-info/10 text-info ring-info/25',
  warn: 'bg-warn/10 text-warn ring-warn/25',
  bad: 'bg-bad/10 text-bad ring-bad/25',
  mute: 'bg-surface2 text-mute ring-line',
};

function StatusBadge({ status, className = '' }) {
  const meta = STATUS_META[status] || { label: status || 'ไม่ระบุ', tone: 'mute' };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${TONES[meta.tone]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

/* ---------- Layout bits ---------- */
function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="anim-i">
        {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
        <h1 className="font-serif text-[1.95rem] font-medium leading-[1.1] tracking-tight sm:text-[2.7rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mute">{description}</p>
        )}
      </div>
      {actions && (
        <div className="anim-i flex flex-wrap items-center gap-2" style={{ '--i': 1 }}>
          {actions}
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.78rem] font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mute">{hint}</span>}
    </label>
  );
}

function SearchBox({ value, onChange, placeholder, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-10"
      />
    </div>
  );
}

function EmptyState({ icon: Icon = Package, title, description, action }) {
  return (
    <div className="card vf flex min-h-[15rem] flex-col items-center justify-center border-dashed px-6 py-12 text-center page-in">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-line text-mute">
        <Icon size={24} strokeWidth={1.3} />
      </div>
      <h3 className="font-serif text-lg font-medium">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-mute">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

/* ---------- Stat card (readout) ---------- */
const DOT_TONES = {
  ok: 'bg-ok',
  info: 'bg-info',
  warn: 'bg-warn',
  bad: 'bg-bad',
  accent: 'bg-accent',
};

function CountUp({ value, prefix = '', digits = 0 }) {
  const v = useCountUp(value);
  return (
    <>
      {prefix}
      {digits ? v.toFixed(digits) : money(Math.round(v))}
    </>
  );
}

function Stat({ label, value, caption, icon: Icon, tone = 'accent', prefix = '', index = 0, onClick }) {
  return (
    <Spot
      as={onClick ? 'button' : 'div'}
      onClick={onClick}
      className={`card vf card-pad card-hover anim-i group overflow-hidden text-left ${onClick ? 'cursor-pointer' : ''}`}
      style={{ '--i': index }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="mono-l">{label}</p>
        {Icon && <Icon size={16} strokeWidth={1.4} className="text-mute transition-transform duration-500 group-hover:rotate-[-10deg] group-hover:scale-125" />}
      </div>
      <p className="font-num mt-4 text-[3rem] font-medium leading-none tracking-tight">
        <CountUp value={value} prefix={prefix} />
      </p>
      {caption && (
        <p className="mt-3 flex items-center gap-2 text-xs text-mute">
          <i className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONES[tone] || 'bg-accent'}`} />
          {caption}
        </p>
      )}
    </Spot>
  );
}

/* ---------- Modal & Drawer ---------- */
function Modal({ title, subtitle, onClose, children, footer, size = 'md' }) {
  useLockBody(true);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const width = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-5xl' }[size];

  return createPortal(
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className={`modal-panel ${width}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-semibold sm:text-xl">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-mute">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="icon-btn -mr-2 -mt-1 shrink-0" aria-label="ปิด">
            <X size={19} />
          </button>
        </header>
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">{children}</div>
        {footer && (
          <footer className="border-t border-line bg-surface2/40 px-5 py-4 sm:px-7 safe-b">{footer}</footer>
        )}
      </section>
    </div>,
    document.body
  );
}

function Drawer({ title, subtitle, onClose, children, footer, side = 'right' }) {
  useLockBody(true);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <>
      <div className="overlay !items-stretch !p-0" style={{ zIndex: 84 }} onMouseDown={onClose} />
      <aside className="drawer-panel" data-side={side} role="dialog" aria-modal="true" aria-label={title}>
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6 safe-t">
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-semibold">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-mute">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="icon-btn -mr-2 shrink-0" aria-label="ปิด">
            <X size={19} />
          </button>
        </header>
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <footer className="border-t border-line px-5 py-4 sm:px-6 safe-b">{footer}</footer>}
      </aside>
    </>,
    document.body
  );
}

/* ---------- Equipment photo ---------- */
function EquipmentPhoto({ item, className = '', iconSize = 28, zoom = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [item?.image_url]);
  const Icon = categoryOf(item?.category).icon;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-surface2 to-line/50 ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center text-mute/50">
        <Icon size={iconSize} strokeWidth={1.3} />
      </div>
      {item?.image_url && !failed && (
        <img
          src={imgSrc(item.image_url)}
          alt={item.name || 'รูปอุปกรณ์'}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover ${
            zoom ? 'transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]' : ''
          }`}
        />
      )}
    </div>
  );
}

/* ---------- Segmented (แท็บแถบเลื่อน) ---------- */
function Segmented({ value, onChange, options, className = '' }) {
  const sig = options.map((o) => `${o.value}:${o.count ?? ''}`).join('|');
  const { wrap, box } = useSlider(value, [sig]);
  return (
    <div className={`seg no-scrollbar ${className}`}>
      <div className="seg-in" ref={wrap}>
        <span
          className="seg-pill"
          style={{ width: box.w, transform: `translateX(${box.x}px)`, opacity: box.ok ? 1 : 0 }}
        />
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className="seg-i"
            data-on={value === o.value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
            {o.count !== undefined && <span className="seg-n">{o.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Charts ---------- */
function BarChart({ data, height = 176 }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  return (
    <div>
      <div className="flex items-end gap-2 sm:gap-4" style={{ height }}>
        {data.map((d, i) => (
          <div key={d.label} className="group flex h-full min-w-0 flex-1 items-end justify-center gap-1">
            {[
              { v: d.income, cls: 'bg-accent', name: 'รายรับ' },
              { v: d.expense, cls: 'bg-ink/25', name: 'รายจ่าย' },
            ].map((bar, j) => (
              <div
                key={bar.name}
                data-tip={`${bar.name} ฿${money(bar.v)}`}
                className={`tip w-full max-w-[26px] origin-bottom rounded-t-[3px] ${bar.cls} transition-opacity hover:opacity-80`}
                style={{
                  height: `${Math.max(3, (bar.v / max) * 100)}%`,
                  animation: 'growY 1s var(--ease) both',
                  animationDelay: `${i * 90 + j * 60}ms`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-4">
        {data.map((d) => (
          <span key={d.label} className="min-w-0 flex-1 truncate text-center text-[10px] text-mute sm:text-[11px]">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Donut({ segments, size = 148, stroke = 16, center }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} style={{ stroke: 'rgb(var(--surface2))' }} />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="butt"
              style={{
                stroke: `rgb(var(--${s.color}))`,
                strokeDasharray: ready ? `${Math.max(0, len - 2)} ${c}` : `0 ${c}`,
                strokeDashoffset: -offset,
                transition: 'stroke-dasharray 1.2s cubic-bezier(.2,.7,.2,1)',
              }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{center}</div>
    </div>
  );
}

/* ═════ lib/flows.js ═════ */
const checkRows = (items) =>
  items
    .map(
      (name) =>
        `<label class="sw-check"><input type="checkbox" name="acc" value="${esc(name)}" checked /> ${esc(name)}</label>`
    )
    .join('');

const num = (el) => Number(el?.value || 0);

/* ---------------- ส่งมอบอุปกรณ์ ---------------- */
async function checkoutFlow(booking, refresh) {
  const names = (booking.equipment_names || '').split(', ').filter(Boolean);

  const result = await fire({
    title: 'ส่งมอบอุปกรณ์',
    html: `
      <div class="sw-form">
        <div class="sw-note">
          <b>${esc(booking.customer_name)}</b> · ${esc(booking.phone || '-')}<br/>
          ${names.map(esc).join(' · ')}<br/>
          <span style="opacity:.75">กำหนดคืน ${esc(fmtDateTime(booking.end_date))}</span>
        </div>
        <div>
          <label>เช็กลิสต์ของที่ส่งมอบ</label>
          <div class="sw-checks">${checkRows(DEFAULT_ACCESSORIES)}</div>
        </div>
        <div>
          <label>อุปกรณ์เสริมอื่นๆ (คั่นด้วยเครื่องหมาย ,)</label>
          <input id="sw-extra" class="input" placeholder="เช่น ฟิลเตอร์ UV, ขาตั้งกล้อง" />
        </div>
        <div>
          <label>สภาพอุปกรณ์ก่อนส่งมอบ</label>
          <textarea id="sw-notes" class="input" rows="2" placeholder="เช่น สภาพปกติ ไม่มีรอยขีดข่วน"></textarea>
        </div>
      </div>`,
    showCancelButton: true,
    confirmButtonText: 'ยืนยันส่งมอบ',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const root = Swal.getPopup();
      const checked = [...root.querySelectorAll('input[name=acc]:checked')].map((i) => i.value);
      const extra = root
        .querySelector('#sw-extra')
        .value.split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        accessories_checked: [...checked, ...extra],
        condition_notes: root.querySelector('#sw-notes').value.trim() || null,
      };
    },
  });

  if (!result.isConfirmed) return false;

  try {
    showLoading('กำลังบันทึกการส่งมอบ...');
    await api.post(`/bookings/${booking.id}/checkout`, result.value);
    Swal.close();
    await refresh();
    await fire({
      icon: 'success',
      title: 'ส่งมอบเรียบร้อย',
      text: `${booking.customer_name} รับอุปกรณ์แล้ว`,
      timer: 2200,
      showConfirmButton: false,
    });
    return true;
  } catch (error) {
    await showError(errMsg(error, 'บันทึกการส่งมอบไม่สำเร็จ'));
    return false;
  }
}

/* ---------------- รับคืนอุปกรณ์ ---------------- */
async function returnFlow(booking, refresh) {
  const late = lateDays(booking);
  const subtotal = Number(booking.subtotal || 0);
  const discount = Number(booking.discount || 0);
  const deposit = Number(booking.deposit || 0);
  const perDay = booking.total_days ? subtotal / Number(booking.total_days) : 0;
  const suggestedFine = late ? Math.round(perDay * late) : 0;

  const result = await fire({
    title: 'รับคืนอุปกรณ์',
    html: `
      <div class="sw-form">
        <div class="sw-note ${late ? 'warn' : ''}">
          <b>${esc(booking.customer_name)}</b> · ${esc(booking.equipment_names || '')}<br/>
          ${
            late
              ? `คืนช้ากว่ากำหนด <b>${late} วัน</b> — แนะนำค่าปรับ ${baht(suggestedFine)} (แก้ไขได้)`
              : 'คืนตามกำหนดเวลา'
          }
        </div>
        <div>
          <label>ตรวจของที่ได้รับคืน (ติ๊กที่ครบ)</label>
          <div class="sw-checks">${checkRows(DEFAULT_ACCESSORIES)}</div>
        </div>
        <div class="sw-grid2">
          <div><label>ค่าใช้จ่ายเพิ่มเติม (บาท)</label><input id="sw-extra" type="number" min="0" class="input" value="0" /></div>
          <div><label>ค่าปรับ (บาท)</label><input id="sw-fine" type="number" min="0" class="input" value="${suggestedFine}" /></div>
        </div>
        <div>
          <label>สภาพอุปกรณ์หลังรับคืน</label>
          <textarea id="sw-notes" class="input" rows="2" placeholder="เช่น สภาพปกติ / พบรอยที่ตัวเลนส์"></textarea>
        </div>
        <div class="sw-note">
          <div class="sw-sum"><span>ค่าเช่า (หักส่วนลดแล้ว)</span><span>${baht(subtotal - discount)}</span></div>
          <div class="sw-sum"><span>ค่าใช้จ่ายเพิ่ม + ค่าปรับ</span><span id="sw-add">${baht(suggestedFine)}</span></div>
          <div class="sw-sum big"><span>ยอดสุทธิ</span><span id="sw-net">${baht(subtotal - discount + suggestedFine)}</span></div>
          <div class="sw-sum"><span>มัดจำที่ถือไว้ ${baht(deposit)}</span><span id="sw-bal"></span></div>
        </div>
      </div>`,
    didOpen: () => {
      const root = Swal.getPopup();
      const extraEl = root.querySelector('#sw-extra');
      const fineEl = root.querySelector('#sw-fine');
      const update = () => {
        const add = num(extraEl) + num(fineEl);
        const net = Math.max(0, subtotal - discount + add);
        root.querySelector('#sw-add').textContent = baht(add);
        root.querySelector('#sw-net').textContent = baht(net);
        const bal = net - deposit;
        root.querySelector('#sw-bal').textContent =
          deposit > 0
            ? bal >= 0
              ? `เก็บเพิ่ม ${baht(bal)}`
              : `คืนมัดจำ ${baht(-bal)}`
            : `เก็บเงิน ${baht(net)}`;
      };
      extraEl.addEventListener('input', update);
      fineEl.addEventListener('input', update);
      update();
    },
    showCancelButton: true,
    confirmButtonText: 'ยืนยันรับคืน',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const root = Swal.getPopup();
      const extra = num(root.querySelector('#sw-extra'));
      const fine = num(root.querySelector('#sw-fine'));
      if (extra < 0 || fine < 0 || !Number.isFinite(extra) || !Number.isFinite(fine)) {
        Swal.showValidationMessage('จำนวนเงินต้องไม่ติดลบ');
        return false;
      }
      const all = [...root.querySelectorAll('input[name=acc]')];
      const present = all.filter((i) => i.checked).map((i) => i.value);
      const missing = all.filter((i) => !i.checked).map((i) => i.value);
      let notes = root.querySelector('#sw-notes').value.trim();
      if (missing.length) notes = `${notes ? notes + ' | ' : ''}ของไม่ครบ: ${missing.join(', ')}`;
      return {
        extra_charges: extra,
        fine_amount: fine,
        accessories_checked: present,
        condition_notes: notes || null,
      };
    },
  });

  if (!result.isConfirmed) return false;

  try {
    showLoading('กำลังบันทึกการรับคืน...');
    const { data } = await api.post(`/bookings/${booking.id}/return`, result.value);
    Swal.close();
    await refresh();
    await fire({
      icon: 'success',
      title: 'รับคืนเรียบร้อย',
      html: `ยอดสุทธิ <b>${baht(data.net_total)}</b><br/><span style="font-size:.8rem">บันทึกรายรับเข้าระบบการเงินให้อัตโนมัติแล้ว</span>`,
      confirmButtonText: 'เรียบร้อย',
    });
    if (deposit > 0) {
      // ถามต่อทันทีว่าคืนเงินประกันอย่างไร จะได้ไม่ลืม
      await settleDepositFlow({ ...booking, deposit }, refresh);
    }
    return true;
  } catch (error) {
    await showError(errMsg(error, 'บันทึกการรับคืนไม่สำเร็จ'));
    return false;
  }
}

/* ---------------- ยกเลิกการจอง ---------------- */
async function cancelFlow(booking, refresh) {
  const ok = await confirmAsk({
    icon: 'warning',
    title: 'ยกเลิกการจองนี้?',
    html: `<b>${esc(booking.booking_no)}</b> · ${esc(booking.customer_name)}<br/>อุปกรณ์จะกลับมาว่างให้จองในช่วงเวลานั้นอีกครั้ง${
      Number(booking.deposit) > 0 ? `<br/>อย่าลืมคืนเงินมัดจำ ${baht(booking.deposit)}` : ''
    }`,
    confirmText: 'ยกเลิกการจอง',
    cancelText: 'ไม่ยกเลิก',
    danger: true,
  });
  if (!ok) return false;

  try {
    await api.patch(`/bookings/${booking.id}/cancel`);
    await refresh();
    toast('success', 'ยกเลิกการจองแล้ว');
    return true;
  } catch (error) {
    await showError(errMsg(error, 'ยกเลิกไม่สำเร็จ'));
    return false;
  }
}

/* ---------------- เงินประกัน ---------------- */
const DEPOSIT_LABEL = { pending: 'ยังไม่ได้รับ', held: 'ถือไว้อยู่', returned: 'คืนแล้ว', partial: 'หักบางส่วน' };
const DEPOSIT_TONE = {
  pending: 'bg-surface2 text-mute',
  held: 'bg-warn/15 text-warn',
  returned: 'bg-ok/15 text-ok',
  partial: 'bg-info/15 text-info',
};

async function saveDeposit(booking, payload, okText) {
  try {
    showLoading('กำลังบันทึก...');
    await api.patch(`/bookings/${booking.id}/deposit`, payload);
    Swal.close();
    toast('success', okText);
    return true;
  } catch (error) {
    await showError(errMsg(error, 'บันทึกเงินประกันไม่สำเร็จ'));
    return false;
  }
}

async function receiveDepositFlow(booking, refresh) {
  const ok = await confirmAsk({
    title: 'รับเงินประกันแล้ว?',
    html: `<b>${esc(booking.customer_name)}</b><br/>เงินประกัน <b>${baht(booking.deposit)}</b> จะถูกบันทึกว่าถือไว้อยู่`,
    confirmText: 'รับแล้ว',
    cancelText: 'ยังไม่รับ',
  });
  if (!ok) return false;
  const done = await saveDeposit(booking, { status: 'held' }, 'บันทึกว่ารับเงินประกันแล้ว');
  if (done) await refresh();
  return done;
}

async function settleDepositFlow(booking, refresh) {
  const deposit = Number(booking.deposit || 0);
  const choice = await fire({
    icon: 'question',
    title: 'คืนเงินประกัน',
    html: `<b>${esc(booking.customer_name)}</b> · ${esc(booking.booking_no)}<br/>เงินประกัน <b>${baht(deposit)}</b>`,
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: `คืนเต็ม ${baht(deposit)}`,
    denyButtonText: 'หักบางส่วน…',
    cancelButtonText: 'ยังไม่คืน',
  });

  if (choice.isConfirmed) {
    const done = await saveDeposit(booking, { status: 'returned' }, 'บันทึกว่าคืนเงินประกันแล้ว');
    if (done) await refresh();
    return done;
  }
  if (!choice.isDenied) return false;

  const form = await fire({
    title: 'หักเงินประกัน',
    html: `
      <div class="sw-form">
        <div class="sw-note">เงินที่หักจะบันทึกเป็นรายรับในหน้ารายรับ–รายจ่าย ส่วนที่เหลือคืนลูกค้า</div>
        <div><label>จำนวนที่หัก (บาท) — ไม่เกิน ${baht(deposit)}</label><input id="sw-ded" type="number" min="1" max="${deposit}" class="input" value="" /></div>
        <div><label>เหตุผล</label><textarea id="sw-dnote" class="input" rows="2" placeholder="เช่น เลนส์มีรอย / คืนช้า 1 วัน"></textarea></div>
        <div class="sw-note"><div class="sw-sum"><span>คืนลูกค้า</span><span id="sw-back">${baht(deposit)}</span></div></div>
      </div>`,
    didOpen: () => {
      const root = Swal.getPopup();
      const el = root.querySelector('#sw-ded');
      el.addEventListener('input', () => {
        root.querySelector('#sw-back').textContent = baht(Math.max(0, deposit - num(el)));
      });
    },
    showCancelButton: true,
    confirmButtonText: 'บันทึกการหัก',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const root = Swal.getPopup();
      const amount = num(root.querySelector('#sw-ded'));
      const note = root.querySelector('#sw-dnote').value.trim();
      if (!Number.isFinite(amount) || amount <= 0 || amount > deposit) {
        Swal.showValidationMessage(`จำนวนที่หักต้องมากกว่า 0 และไม่เกิน ${baht(deposit)}`);
        return false;
      }
      if (!note) {
        Swal.showValidationMessage('กรุณาระบุเหตุผลที่หักเงินประกัน');
        return false;
      }
      return { status: 'partial', deducted: amount, note };
    },
  });
  if (!form.isConfirmed) return false;
  const done = await saveDeposit(booking, form.value, 'บันทึกการหักเงินประกันแล้ว');
  if (done) await refresh();
  return done;
}

/* ---------------- ส่งซ่อม ---------------- */
async function maintenanceFlow(equipments, refresh, presetId = '') {
  const options = equipments.filter((e) => e.status !== 'maintenance' && e.status !== 'rented');
  if (!options.length) {
    await showError('ไม่มีอุปกรณ์ที่ส่งซ่อมได้ในขณะนี้', 'ไม่มีอุปกรณ์');
    return false;
  }

  const result = await fire({
    title: 'บันทึกงานซ่อมบำรุง',
    html: `
      <div class="sw-form">
        <div><label>อุปกรณ์</label>
          <select id="sw-eq" class="input">
            ${options
              .map(
                (e) =>
                  `<option value="${e.id}" ${String(e.id) === String(presetId) ? 'selected' : ''}>${esc(e.code)} · ${esc(e.name)}</option>`
              )
              .join('')}
          </select></div>
        <div><label>หัวข้อ / อาการ</label><input id="sw-title" class="input" placeholder="เช่น ทำความสะอาดเซนเซอร์" /></div>
        <div><label>รายละเอียด</label><textarea id="sw-desc" class="input" rows="2"></textarea></div>
        <div class="sw-grid2">
          <div><label>ค่าใช้จ่ายโดยประมาณ</label><input id="sw-cost" type="number" min="0" class="input" value="0" /></div>
          <div><label>วันที่</label><input id="sw-date" type="date" class="input" value="${toDateOnly()}" /></div>
        </div>
        <div class="sw-note">อุปกรณ์จะถูกตั้งเป็น “ซ่อมบำรุง” และไม่สามารถถูกจองได้จนกว่าจะปิดงาน</div>
      </div>`,
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const root = Swal.getPopup();
      const title = root.querySelector('#sw-title').value.trim();
      if (!title) {
        Swal.showValidationMessage('กรุณาระบุหัวข้อ / อาการ');
        return false;
      }
      return {
        equipment_id: Number(root.querySelector('#sw-eq').value),
        title,
        description: root.querySelector('#sw-desc').value.trim() || null,
        cost: num(root.querySelector('#sw-cost')),
        maintenance_date: root.querySelector('#sw-date').value,
      };
    },
  });
  if (!result.isConfirmed) return false;

  try {
    await api.post('/maintenance', result.value);
    await refresh();
    toast('success', 'บันทึกงานซ่อมบำรุงแล้ว');
    return true;
  } catch (error) {
    await showError(errMsg(error));
    return false;
  }
}

async function completeMaintenanceFlow(record, refresh) {
  const result = await fire({
    icon: 'question',
    title: 'ปิดงานซ่อมบำรุง',
    html: `
      <div class="sw-form">
        <div class="sw-note"><b>${esc(record.equipment_name)}</b><br/>${esc(record.title)}</div>
        <div><label>ค่าใช้จ่ายจริง (บาท)</label>
          <input id="sw-cost" type="number" min="0" class="input" value="${Number(record.cost || 0)}" /></div>
        <label class="sw-check"><input id="sw-exp" type="checkbox" checked /> บันทึกเป็นรายจ่ายในระบบการเงิน</label>
      </div>`,
    showCancelButton: true,
    confirmButtonText: 'ปิดงาน อุปกรณ์พร้อมใช้งาน',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const root = Swal.getPopup();
      return {
        cost: num(root.querySelector('#sw-cost')),
        record_expense: root.querySelector('#sw-exp').checked,
      };
    },
  });
  if (!result.isConfirmed) return false;

  try {
    await api.patch(`/maintenance/${record.id}/complete`, result.value);
    await refresh();
    toast('success', 'ปิดงานซ่อมบำรุงแล้ว');
    return true;
  } catch (error) {
    await showError(errMsg(error));
    return false;
  }
}

/* ---------------- ลบอุปกรณ์ ---------------- */
async function deleteEquipmentFlow(item, refresh) {
  const ok = await confirmAsk({
    icon: 'warning',
    title: `ลบ “${item.name}” ?`,
    text: 'การลบไม่สามารถย้อนกลับได้ รูปภาพของอุปกรณ์ชิ้นนี้จะถูกลบออกจากเครื่องด้วย',
    confirmText: 'ลบอุปกรณ์',
    danger: true,
  });
  if (!ok) return false;

  try {
    await api.delete(`/equipments/${item.id}`);
    await refresh();
    toast('success', 'ลบอุปกรณ์เรียบร้อยแล้ว');
    return true;
  } catch (error) {
    await showError(errMsg(error, 'ลบไม่สำเร็จ'), 'ลบอุปกรณ์ไม่ได้');
    return false;
  }
}

/* ---------------- รายรับ–รายจ่าย ---------------- */
async function transactionFlow(bookings, refresh, presetType = 'income') {
  const result = await fire({
    title: 'บันทึกรายการการเงิน',
    html: `
      <div class="sw-form">
        <div class="sw-grid2">
          <div><label>ประเภท</label>
            <select id="sw-type" class="input">
              <option value="income" ${presetType === 'income' ? 'selected' : ''}>รายรับ</option>
              <option value="expense" ${presetType === 'expense' ? 'selected' : ''}>รายจ่าย</option>
            </select></div>
          <div><label>หมวดหมู่</label><select id="sw-cat" class="input"></select></div>
        </div>
        <div class="sw-grid2">
          <div><label>จำนวนเงิน (บาท)</label><input id="sw-amt" type="number" min="0" class="input" placeholder="0" /></div>
          <div><label>วันและเวลา</label><input id="sw-date" type="datetime-local" class="input" value="${toInputValue()}" /></div>
        </div>
        <div><label>เกี่ยวข้องกับการจอง (ถ้ามี)</label>
          <select id="sw-bk" class="input">
            <option value="">— ไม่ระบุ —</option>
            ${bookings
              .filter((b) => b.status !== 'cancelled')
              .slice(0, 60)
              .map((b) => `<option value="${b.id}">${esc(b.booking_no)} · ${esc(b.customer_name)}</option>`)
              .join('')}
          </select></div>
        <div><label>รายละเอียด</label><input id="sw-desc" class="input" placeholder="บันทึกช่วยจำ" /></div>
      </div>`,
    didOpen: () => {
      const root = Swal.getPopup();
      const typeEl = root.querySelector('#sw-type');
      const catEl = root.querySelector('#sw-cat');
      const fill = () => {
        catEl.innerHTML = FINANCE_CATEGORIES[typeEl.value]
          .map((c) => `<option>${esc(c)}</option>`)
          .join('');
      };
      typeEl.addEventListener('change', fill);
      fill();
    },
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const root = Swal.getPopup();
      const amount = num(root.querySelector('#sw-amt'));
      if (!(amount > 0)) {
        Swal.showValidationMessage('กรุณาระบุจำนวนเงินมากกว่า 0');
        return false;
      }
      return {
        type: root.querySelector('#sw-type').value,
        category: root.querySelector('#sw-cat').value,
        amount,
        transaction_date: root.querySelector('#sw-date').value,
        booking_id: root.querySelector('#sw-bk').value || null,
        description: root.querySelector('#sw-desc').value.trim() || null,
      };
    },
  });
  if (!result.isConfirmed) return false;

  try {
    await api.post('/transactions', result.value);
    await refresh();
    toast('success', `บันทึก${result.value.type === 'income' ? 'รายรับ' : 'รายจ่าย'} ${baht(result.value.amount)} แล้ว`);
    return true;
  } catch (error) {
    await showError(errMsg(error));
    return false;
  }
}

async function deleteTransactionFlow(tx, refresh) {
  const ok = await confirmAsk({
    icon: 'warning',
    title: 'ลบรายการนี้?',
    html: `${esc(tx.category)} · ${baht(tx.amount)}<br/>${esc(tx.description || '')}`,
    confirmText: 'ลบรายการ',
    danger: true,
  });
  if (!ok) return false;
  try {
    await api.delete(`/transactions/${tx.id}`);
    await refresh();
    toast('success', 'ลบรายการแล้ว');
    return true;
  } catch (error) {
    await showError(errMsg(error));
    return false;
  }
}

/* ═════ components/BookingList.jsx ═════ */
function Actions({ b, refresh }) {
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn(b, refresh);
  };
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {['pending', 'confirmed'].includes(b.status) && (
        <>
          <button onClick={stop(checkoutFlow)} title="ส่งมอบอุปกรณ์" className="btn btn-sm border border-info/30 bg-info/10 text-info hover:bg-info/20">
            <LogOut size={14} /> <span>ส่งมอบ</span>
          </button>
          <button onClick={stop(cancelFlow)} title="ยกเลิกการจอง" className="btn btn-sm border border-bad/25 bg-bad/5 text-bad hover:bg-bad/10">
            <Ban size={14} /> <span>ยกเลิก</span>
          </button>
        </>
      )}
      {b.status === 'picked_up' && (
        <button onClick={stop(returnFlow)} title="รับคืนอุปกรณ์" className="btn btn-sm border border-ok/30 bg-ok/10 text-ok hover:bg-ok/20">
          <LogIn size={14} /> <span>รับคืน</span>
        </button>
      )}
    </div>
  );
}

function BookingList({ rows, showActions = true }) {
  const { openDetail, refresh } = useApp();

  return (
    <>
      {/* จอใหญ่: ตาราง */}
      <div className="card hidden overflow-hidden md:block">
        <div className="booking-table-scroll scroll-thin">
          <table className="tbl min-w-[980px]">
            <thead>
              <tr>
                <th>เลขที่จอง</th>
                <th>ผู้เช่า</th>
                <th>อุปกรณ์</th>
                <th>รับ</th>
                <th>คืน</th>
                <th className="text-right">ยอดสุทธิ</th>
                <th>สถานะ</th>
                {showActions && <th />}
              </tr>
            </thead>
            <tbody>
              {rows.map((b, i) => (
                <tr
                  key={b.id}
                  onClick={() => openDetail(b.id)}
                  className="anim-i cursor-pointer"
                  style={{ '--i': Math.min(i, 10) }}
                >
                  <td className="font-mono text-xs font-semibold text-accent">{b.booking_no}</td>
                  <td>
                    <p className="font-medium">{b.customer_name}</p>
                    <p className="text-xs text-mute">{b.phone}</p>
                  </td>
                  <td className="max-w-[220px] truncate">{equipmentTitle(b)}</td>
                  <td className="whitespace-nowrap text-xs text-mute">{fmtDateTime(b.start_date)}</td>
                  <td className="whitespace-nowrap text-xs text-mute">{fmtDateTime(b.end_date)}</td>
                  <td className="text-right font-medium">{baht(b.net_total)}</td>
                  <td><StatusBadge status={effectiveStatus(b)} /></td>
                  {showActions && <td><Actions b={b} refresh={refresh} /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* มือถือ: การ์ด */}
      <ul className="stagger space-y-3 md:hidden">
        {rows.map((b, i) => (
          <li key={b.id} style={{ '--i': Math.min(i, 8) }}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => openDetail(b.id)}
              className="card card-pad !p-4 text-left active:scale-[0.985]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-semibold text-accent">{b.booking_no}</p>
                  <p className="mt-0.5 truncate font-medium">{b.customer_name}</p>
                  <p className="truncate text-xs text-mute">{equipmentTitle(b)}</p>
                </div>
                <StatusBadge status={effectiveStatus(b)} />
              </div>
              <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-line pt-3">
                <div className="text-[11px] leading-relaxed text-mute">
                  <p>รับ {fmtDateTime(b.start_date)}</p>
                  <p>คืน {fmtDateTime(b.end_date)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-num text-xl font-semibold">{baht(b.net_total)}</span>
                  {showActions ? <Actions b={b} refresh={refresh} /> : <ChevronRight size={16} className="text-mute" />}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ═════ components/BookingForm.jsx ═════ */
function nextSlot() {
  const d = new Date();
  d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
  return d;
}

const DELIVERY_METHODS = [
  { value: 'meetup', label: 'นัดรับ', detail: 'สงขลา–เก้าเส้ง ส่งฟรี' },
  { value: 'van', label: 'รถตู้', detail: 'ลูกค้าจ่ายค่าส่งไป–กลับ' },
  { value: 'grab', label: 'แกร๊ป', detail: 'ลูกค้าจ่ายค่าส่งไป–กลับ' },
  { value: 'post', label: 'ไปรษณีย์', detail: 'ลูกค้าจ่ายค่าส่งไป–กลับ' },
];

const REGION_OPTIONS = [
  { value: 'local', label: 'สงขลา / เก้าเส้ง', detail: 'รายวันขั้นต่ำ 1 วัน หรือรายชั่วโมงเริ่ม 2 ชั่วโมง' },
  { value: 'south', label: 'ต่างจังหวัดภาคใต้', detail: 'รายวันขั้นต่ำ 2 วัน' },
  { value: 'other', label: 'ต่างจังหวัดภาคอื่น ๆ', detail: 'รายวันขั้นต่ำ 5 วัน' },
];

const describeBusy = (row) =>
  row
    ? `${row.booking_no}${row.customer_name ? ` · ${row.customer_name}` : ''} (${fmtDateTime(row.start_date)} – ${fmtDateTime(row.end_date)})`
    : '';

// เตือนทันทีเมื่อกล้องตัวเดียวกันถูกจองซ้อนช่วงเวลา
const alertDuplicate = (items) =>
  fire({
    icon: 'warning',
    title: 'กล้องตัวเดียวกันถูกจองซ้ำ',
    html: `<div class="sw-note warn" style="text-align:left">${items
      .map((it) => `<b>${esc(it.name)}</b><br/>มีการจองแล้ว: ${esc(describeBusy(it.row) || 'ช่วงเวลานี้ไม่ว่าง')}`)
      .join('<br/><br/>')}</div><p style="margin-top:12px;font-size:13px;opacity:.75">กรุณาเปลี่ยนวัน/เวลา หรือเลือกกล้องตัวอื่น</p>`,
    confirmButtonText: 'รับทราบ',
  });

/* ช่องทางติดต่อลูกค้า */
const CONTACT_FIELDS = [
  { key: 'line', label: 'LINE', ph: 'LINE ID', href: (v) => `https://line.me/ti/p/~${encodeURIComponent(v.replace(/^@/, ''))}` },
  { key: 'facebook', label: 'Facebook', ph: 'ชื่อ หรือลิงก์โปรไฟล์', href: (v) => (/^https?:/i.test(v) ? v : `https://facebook.com/${encodeURIComponent(v)}`) },
  { key: 'instagram', label: 'Instagram', ph: '@username', href: (v) => `https://instagram.com/${encodeURIComponent(v.replace(/^@/, ''))}` },
  { key: 'tiktok', label: 'TikTok', ph: '@username', href: (v) => `https://tiktok.com/@${encodeURIComponent(v.replace(/^@/, ''))}` },
  { key: 'whatsapp', label: 'WhatsApp', ph: 'เบอร์โทร', href: (v) => `https://wa.me/${v.replace(/\D/g, '')}` },
  { key: 'other', label: 'อื่นๆ', ph: 'เช่น อีเมล / ช่องทางอื่น', href: null },
];
const EMPTY_CONTACTS = { line: '', facebook: '', instagram: '', tiktok: '', whatsapp: '', other: '' };

function ContactChips({ contacts, className = '' }) {
  const items = CONTACT_FIELDS.filter((f) => contacts && String(contacts[f.key] || '').trim());
  if (!items.length) return null;
  return (
    <span className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.map((f) => {
        const v = String(contacts[f.key]).trim();
        const inner = <><b className="font-semibold text-accent">{f.label}</b><span className="truncate">{v}</span></>;
        const cls = 'inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs';
        return f.href ? (
          <a key={f.key} href={f.href(v)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={`${cls} transition hover:border-accent`}>{inner}</a>
        ) : (
          <span key={f.key} className={cls}>{inner}</span>
        );
      })}
    </span>
  );
}

async function editCustomerFlow(customer, refresh) {
  const c = customer.contacts || {};
  const result = await fire({
    title: 'ข้อมูลลูกค้า',
    html: `
      <div class="sw-form">
        <div><label>ชื่อลูกค้า</label><input id="cu-name" class="input" value="${esc(customer.fullname)}" /></div>
        <div class="sw-grid2">
          ${CONTACT_FIELDS.map((f) => `<div><label>${f.label}</label><input id="cu-${f.key}" class="input" placeholder="${esc(f.ph)}" value="${esc(c[f.key] || '')}" /></div>`).join('')}
        </div>
      </div>`,
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const root = Swal.getPopup();
      const fullname = root.querySelector('#cu-name').value.trim();
      if (!fullname) { Swal.showValidationMessage('กรุณากรอกชื่อลูกค้า'); return false; }
      const contacts = {};
      CONTACT_FIELDS.forEach((f) => { contacts[f.key] = root.querySelector(`#cu-${f.key}`).value.trim(); });
      return { fullname, contacts };
    },
  });
  if (!result.isConfirmed) return false;
  try {
    await api.patch(`/customers/${customer.id}`, result.value);
    await refresh();
    toast('success', 'บันทึกข้อมูลลูกค้าแล้ว');
    return true;
  } catch (error) {
    await showError(errMsg(error));
    return false;
  }
}

function BookingForm() {
  const { bookingModal, closeBooking, equipments, customers, refresh, navigate } = useApp();
  const initialStart = nextSlot();
  const [form, setForm] = useState(() => ({
    customer_name: '',
    phone: '',
    contacts: { ...EMPTY_CONTACTS },
    start_date: toInputValue(initialStart),
    end_date: toInputValue(new Date(initialStart.getTime() + 86400000)),
    rental_type: 'daily',
    duration_days: 1,
    rental_hours: 2,
    rental_region: 'local',
    delivery_method: 'meetup',
    custom_price: '0',
    notes: '',
    discount: '0',
    deposit: String(Math.max(1, bookingModal.equipmentIds.length) * 500),
  }));
  const [selected, setSelected] = useState(() => new Set(bookingModal.equipmentIds.map(Number)));
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [busy, setBusy] = useState({});
  const [busyInfo, setBusyInfo] = useState({});
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [priceTouched, setPriceTouched] = useState(false);
  const lastConflictNotice = useRef('');

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const minDays = form.rental_region === 'south' ? 2 : form.rental_region === 'other' ? 5 : 1;
  const debouncedStart = useDebounced(form.start_date, 300);
  const debouncedEnd = useDebounced(form.end_date, 300);
  const days = rentalDays(form.start_date, form.end_date);
  const validRange = days > 0 && (form.rental_type === 'hourly'
    ? form.rental_region === 'local' && Number(form.rental_hours) >= 2 && Number(form.rental_hours) <= 23
    : days >= minDays &&
      new Date(form.start_date).getHours() === new Date(form.end_date).getHours() &&
      new Date(form.start_date).getMinutes() === new Date(form.end_date).getMinutes());

  // กำหนดเวลาคืนอัตโนมัติให้ตรงกับเวลารับ: รายวันคืนเวลาเดียวกัน / รายชั่วโมงเริ่มที่ 2 ชม.
  useEffect(() => {
    const start = new Date(form.start_date);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start);
    if (form.rental_type === 'hourly') end.setHours(end.getHours() + Math.max(2, Number(form.rental_hours) || 2));
    else end.setDate(end.getDate() + Math.max(minDays, Number(form.duration_days) || minDays));
    const nextEnd = toInputValue(end);
    if (form.end_date !== nextEnd) setForm((f) => ({ ...f, end_date: nextEnd }));
  }, [form.start_date, form.rental_type, form.rental_hours, form.duration_days, form.rental_region]);

  useEffect(() => {
    if (rentalDays(debouncedStart, debouncedEnd) === 0) {
      setBusy({});
      setBusyInfo({});
      return undefined;
    }
    let cancelled = false;
    setChecking(true);
    api.get('/availability', { params: { start: debouncedStart, end: debouncedEnd } })
      .then(({ data }) => {
        if (cancelled) return;
        const map = {};
        const info = {};
        data.forEach((row) => { map[row.equipment_id] = row.booking_no; info[row.equipment_id] = row; });
        setBusy(map);
        setBusyInfo(info);
        const conflicted = equipments.filter((e) => selected.has(Number(e.id)) && map[e.id]);
        if (conflicted.length) {
          const signature = `${debouncedStart}|${debouncedEnd}|${conflicted.map((e) => e.id).join(',')}`;
          if (lastConflictNotice.current !== signature) {
            lastConflictNotice.current = signature;
            alertDuplicate(conflicted.map((e) => ({ name: e.name, row: info[e.id] })));
          }
        } else {
          lastConflictNotice.current = '';
        }
      })
      .catch(() => { if (!cancelled) setBusy({}); })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [debouncedStart, debouncedEnd, equipments, selected]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return equipments
      .filter((e) => cat === 'all' || e.category === cat)
      .filter((e) => !q || [e.name, e.brand, e.model, e.code].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [equipments, query, cat]);

  const reasonOf = (e) => {
    if (e.status === 'maintenance') return 'ซ่อมบำรุง';
    if (busy[e.id]) return `จองซ้ำ (${busy[e.id]})`;
    return '';
  };

  const toggle = (e) => {
    const alreadySelected = selected.has(Number(e.id));
    if ((e.status === 'maintenance' || busy[e.id]) && !alreadySelected) {
      if (busy[e.id]) alertDuplicate([{ name: e.name, row: busyInfo[e.id] }]);
      else showError(reasonOf(e), 'กล้องไม่ว่างในช่วงเวลานี้');
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(Number(e.id))) next.delete(Number(e.id));
      else next.add(Number(e.id));
      setForm((f) => ({ ...f, deposit: String(next.size * 500) }));
      setPriceTouched(false);
      return next;
    });
  };

  const chosen = equipments.filter((e) => selected.has(Number(e.id)));
  const basePrice = chosen.reduce((sum, e) => {
    const rate = Number(e.rental_rate_per_day || 0);
    return sum + (form.rental_type === 'hourly' ? rate / 24 * Number(form.rental_hours || 2) : rate * days);
  }, 0);
  useEffect(() => {
    if (!priceTouched) setForm((f) => ({ ...f, custom_price: String(Math.round(basePrice * 100) / 100) }));
  }, [basePrice, priceTouched]);

  const setDuration = (n) => {
    setPriceTouched(false);
    set({ rental_type: 'daily', duration_days: Math.max(minDays, n) });
  };
  const setHours = (n) => {
    setPriceTouched(false);
    set({ rental_type: 'hourly', rental_hours: Math.max(2, n), rental_region: 'local' });
  };
  const changeRegion = (region) => {
    const requiredDays = region === 'south' ? 2 : region === 'other' ? 5 : 1;
    setPriceTouched(false);
    setForm((f) => ({
      ...f,
      rental_region: region,
      rental_type: region === 'local' ? f.rental_type : 'daily',
      duration_days: Math.max(requiredDays, Number(f.duration_days) || 1),
    }));
  };

  const fillFromName = (name) => {
    set({ customer_name: name });
    const hit = customers.find((c) => c.fullname === name);
    if (hit && !form.phone) set({ phone: hit.phone, contacts: { ...EMPTY_CONTACTS, ...(hit.contacts || {}) } });
  };
  const fillFromPhone = (phone) => {
    set({ phone });
    const hit = customers.find((c) => c.phone === phone);
    if (hit && !form.customer_name) set({ customer_name: hit.fullname, contacts: { ...EMPTY_CONTACTS, ...(hit.contacts || {}) } });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (savingRef.current) return;
    if (!validRange) {
      const message = form.rental_type === 'hourly'
        ? 'รายชั่วโมงเริ่มต้น 2 ชั่วโมง และใช้ได้ในพื้นที่สงขลา/เก้าเส้งเท่านั้น'
        : `กรุณาเช่าอย่างน้อย ${minDays} วัน และกำหนดเวลาคืนให้ตรงกับเวลารับ`;
      return showError(message, 'ตรวจสอบระยะเวลาเช่า');
    }
    if (!chosen.length) return showError('กรุณาเลือกกล้องอย่างน้อย 1 ตัว', 'ยังไม่ได้เลือกกล้อง');
    const conflict = chosen.find((e) => busy[e.id] || e.status === 'maintenance');
    if (conflict) {
      if (busy[conflict.id]) return alertDuplicate([{ name: conflict.name, row: busyInfo[conflict.id] }]);
      return showError(`${conflict.name} อยู่ระหว่างซ่อมบำรุง`, 'กล้องไม่ว่าง');
    }
    const price = Number(form.custom_price);
    const discount = Number(form.discount || 0);
    const deposit = Number(form.deposit || 0);
    if (!Number.isFinite(price) || price < 0) return showError('กรุณาระบุราคาเช่าเป็นตัวเลขตั้งแต่ 0 บาทขึ้นไป');
    if (!Number.isFinite(discount) || discount < 0 || discount > price) return showError('ส่วนลดต้องไม่เกินราคาเช่า');
    if (!Number.isFinite(deposit) || deposit < 0) return showError('เงินประกันต้องเป็นตัวเลขตั้งแต่ 0 บาทขึ้นไป');
    savingRef.current = true;
    setSaving(true);
    try {
      const { data } = await api.post('/bookings', {
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        contacts: form.contacts,
        equipment_ids: chosen.map((e) => e.id),
        start_date: form.start_date,
        end_date: form.end_date,
        rental_type: form.rental_type,
        rental_hours: form.rental_type === 'hourly' ? Number(form.rental_hours) : null,
        rental_region: form.rental_region,
        delivery_method: form.delivery_method,
        custom_price: price,
        notes: form.notes.trim(),
        discount,
        deposit,
      }, { headers: { 'Idempotency-Key': window.crypto?.randomUUID?.() || `booking-${Date.now()}-${Math.random().toString(36).slice(2)}` } });
      await refresh();
      closeBooking();
      navigate('bookings');
      await fire({
        icon: 'success',
        title: 'สร้างการจองสำเร็จ',
        html: `<div class="sw-note" style="text-align:left">
          <div class="sw-sum"><span>ผู้เช่า</span><span>${esc(form.customer_name)}</span></div>
          <div class="sw-sum"><span>กล้อง</span><span>${chosen.map((e) => esc(e.name)).join(', ')}</span></div>
          <div class="sw-sum"><span>รูปแบบ</span><span>${form.rental_type === 'hourly' ? `${Number(form.rental_hours)} ชั่วโมง` : `${days} วัน`}</span></div>
          <div class="sw-sum"><span>รับ</span><span>${esc(fmtDateTime(form.start_date))}</span></div>
          <div class="sw-sum"><span>คืน</span><span>${esc(fmtDateTime(form.end_date))}</span></div>
          <div class="sw-sum"><span>การรับกล้อง</span><span>${DELIVERY_METHODS.find((m) => m.value === form.delivery_method)?.label || 'นัดรับ'}</span></div>
          <div class="sw-sum big"><span>ค่าเช่าหลังลด</span><span>${baht(Math.max(0, price - discount))}</span></div>
          <div class="sw-sum"><span>เงินประกัน (คืนตอนรับกล้องกลับ)</span><span>${baht(deposit)}</span></div>
        </div>`,
        confirmButtonText: 'เรียบร้อย',
      });
    } catch (error) {
      showError(errMsg(error, 'สร้างการจองไม่สำเร็จ'));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal
      size="lg"
      title="สร้างการจองกล้อง"
      subtitle="ระบบตรวจวันซ้ำให้ทันที • เลือกรายวันหรือรายชั่วโมง • แก้ราคาเองได้"
      onClose={closeBooking}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-mute">
            {chosen.length} ตัว · {form.rental_type === 'hourly' ? `${form.rental_hours} ชม.` : `${days || 0} วัน`} ·
            <b className="ml-1 font-num text-lg text-ink">{baht(Math.max(0, Number(form.custom_price || 0) - Number(form.discount || 0)))}</b>
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={closeBooking} className="btn btn-ghost flex-1 sm:flex-none">ยกเลิก</button>
            <button type="submit" form="booking-form" disabled={saving || checking} className="btn btn-primary flex-1 sm:min-w-44">
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'กำลังบันทึก...' : 'บันทึกการจอง'}
            </button>
          </div>
        </div>
      }
    >
      <form id="booking-form" onSubmit={submit} className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_300px] [&>*]:min-w-0">
        <div className="space-y-6">
          <section>
            <h3 className="eyebrow mb-3">ข้อมูลผู้เช่า</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ชื่อผู้เช่า *">
                <input required list="cust-names" className="input" placeholder="ชื่อ–นามสกุล" value={form.customer_name} onChange={(e) => fillFromName(e.target.value)} />
              </Field>
              <Field label="เบอร์โทรศัพท์ *">
                <input required type="tel" inputMode="tel" list="cust-phones" className="input" placeholder="08X-XXX-XXXX" value={form.phone} onChange={(e) => fillFromPhone(e.target.value)} />
              </Field>
            </div>
            <details className="mt-3 rounded-2xl border border-line bg-surface2/40 open:bg-surface2/60" open={Object.values(form.contacts || {}).some(Boolean)}>
              <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-medium">ช่องทางติดต่อเพิ่มเติม <span className="text-xs font-normal text-mute">(LINE · Facebook · IG · ไม่บังคับ)</span></summary>
              <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
                {CONTACT_FIELDS.map((f) => (
                  <Field key={f.key} label={f.label}>
                    <input className="input" placeholder={f.ph} value={form.contacts?.[f.key] || ''} onChange={(e) => set({ contacts: { ...form.contacts, [f.key]: e.target.value } })} />
                  </Field>
                ))}
              </div>
            </details>
            <datalist id="cust-names">{customers.slice(0, 80).map((c) => <option key={c.id} value={c.fullname} />)}</datalist>
            <datalist id="cust-phones">{customers.slice(0, 80).map((c) => <option key={c.id} value={c.phone} label={c.fullname} />)}</datalist>
          </section>

          <section>
            <h3 className="eyebrow mb-3">รูปแบบและพื้นที่เช่า</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="พื้นที่เช่า / ปลายทาง">
                <select className="input" value={form.rental_region} onChange={(e) => changeRegion(e.target.value)}>
                  {REGION_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </Field>
              <Field label="การเลือกรับกล้อง">
                <select className="input" value={form.delivery_method} onChange={(e) => set({ delivery_method: e.target.value })}>
                  {DELIVERY_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="chip" data-on={form.rental_type === 'daily'} onClick={() => { setPriceTouched(false); set({ rental_type: 'daily', duration_days: Math.max(minDays, Number(form.duration_days) || 1) }); }}>
                รายวัน
              </button>
              <button type="button" className="chip" data-on={form.rental_type === 'hourly'} disabled={form.rental_region !== 'local'} onClick={() => setHours(2)}>
                รายชั่วโมง (เริ่ม 2 ชม.)
              </button>
            </div>
          </section>

          <section>
            <h3 className="eyebrow mb-3">วันและเวลารับ–คืน</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="วันและเวลารับกล้อง *">
                <input required type="datetime-local" className="input" value={form.start_date} onChange={(e) => { setPriceTouched(false); set({ start_date: e.target.value }); }} />
              </Field>
              <Field label="วันและเวลาคืนกล้อง (คำนวณอัตโนมัติ)">
                <input readOnly type="datetime-local" className="input opacity-80" value={form.end_date} />
              </Field>
            </div>
            {form.rental_type === 'daily' ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-mute">จำนวนวัน:</span>
                <input
                  type="number"
                  min={minDays}
                  step="1"
                  className="input !min-h-9 !w-24"
                  aria-label="จำนวนวันเช่า"
                  value={form.duration_days}
                  onChange={(e) => { setPriceTouched(false); set({ duration_days: e.target.value }); }}
                />
                <span className="text-sm text-mute">วัน</span>
                {[minDays, Math.max(minDays, 2), Math.max(minDays, 3), Math.max(minDays, 5), Math.max(minDays, 7)].filter((n, i, a) => a.indexOf(n) === i).map((n) => (
                  <button key={n} type="button" onClick={() => setDuration(n)} className="chip !min-h-9 !px-3" data-on={days === n}>{n} วัน</button>
                ))}
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-mute">จำนวนชั่วโมง:</span>
                <input
                  type="number"
                  min="2"
                  max="23"
                  step="1"
                  className="input !min-h-9 !w-24"
                  aria-label="จำนวนชั่วโมงเช่า"
                  value={form.rental_hours}
                  onChange={(e) => { setPriceTouched(false); set({ rental_hours: e.target.value }); }}
                />
                <span className="text-sm text-mute">ชั่วโมง</span>
                {[2, 3, 4, 6, 8, 12].map((n) => (
                  <button key={n} type="button" onClick={() => setHours(n)} className="chip !min-h-9 !px-3" data-on={Number(form.rental_hours) === n}>{n} ชม.</button>
                ))}
              </div>
            )}
            {!validRange && <p className="mt-3 flex items-center gap-2 text-sm text-bad"><CircleAlert size={16} />{form.rental_type === 'hourly' ? 'รายชั่วโมงเริ่มต้น 2 ชั่วโมงและใช้ได้ในพื้นที่สงขลา/เก้าเส้ง' : `พื้นที่นี้ต้องเช่าอย่างน้อย ${minDays} วัน และคืนเวลาเดียวกับเวลารับ`}</p>}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="eyebrow">เลือกกล้อง</h3>
              <span className="flex items-center gap-1.5 text-sm text-mute">
                {checking ? <><RefreshCw size={13} className="animate-spin" /> กำลังตรวจวันซ้ำ</> : <><CalendarClock size={15} /> ตรวจสอบช่วงเวลาแล้ว</>}
              </span>
            </div>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
                <input className="input pl-10" placeholder="ค้นหาชื่อกล้อง..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {[{ id: 'all', label: 'ทั้งหมด' }, ...CATEGORIES].map((c) => <button key={c.id} type="button" className="chip" data-on={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</button>)}
              </div>
            </div>
            <div className="scroll-thin grid max-h-[380px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
              {list.map((e) => {
                const reason = reasonOf(e);
                const on = selected.has(Number(e.id));
                return (
                  <button key={e.id} type="button" disabled={Boolean(reason) && !on} onClick={() => toggle(e)} aria-pressed={on} className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 ${on ? 'border-accent bg-accent/10 ring-2 ring-accent/30 shadow-md' : 'border-line bg-white hover:border-accent/60 hover:shadow-sm'} ${reason ? 'cursor-not-allowed opacity-75' : 'active:scale-[0.98]'}`}>
                    <div className="relative">
                      <EquipmentPhoto item={e} className="h-28 w-full" iconSize={26} zoom />
                      <span className="absolute left-2 top-2 max-w-[72%] truncate rounded-md border border-white/70 bg-white/95 px-2 py-1 font-mono text-[10px] font-bold text-[rgb(var(--wa-color-purple-90))] shadow-sm">{e.code || `CAM-${e.id}`}</span>
                      <span className={`absolute bottom-2 left-2 rounded-md px-2 py-1 text-[10px] font-semibold shadow-sm ${reason ? 'bg-rose-100 text-rose-800' : on ? 'bg-[rgb(var(--wa-color-purple-70))] text-white' : 'bg-white/95 text-[rgb(var(--wa-color-purple-90))]'}`}>{reason || (on ? '✓ เลือกแล้ว' : 'พร้อมเลือก')}</span>
                      {on && <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(var(--wa-color-purple-70))] text-white shadow-md ring-2 ring-white"><Check size={15} strokeWidth={3} /></span>}
                    </div>
                    <div className="p-3">
                      <p className="min-h-[2.8em] text-sm font-bold leading-snug text-[rgb(var(--wa-color-purple-95))]">{e.name}</p>
                      <p className="mt-1 min-h-[1.2em] truncate text-[11px] font-medium text-[rgb(var(--wa-color-purple-70))]">{[e.brand, e.model].filter(Boolean).join(' · ') || categoryOf(e.category).label}</p>
                      <div className="mt-2 flex items-center justify-between gap-1 border-t border-[rgb(var(--wa-color-purple-20))] pt-2">
                        <span className="text-[10px] text-[rgb(var(--wa-color-purple-70))]">ค่าเช่า/วัน</span>
                        <span className="text-xs font-bold text-[rgb(var(--wa-color-purple-90))]">฿{money(e.rental_rate_per_day)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
              {!list.length && <p className="col-span-full py-8 text-center text-sm text-mute">ยังไม่มีกล้องในรายการ — เพิ่มได้ที่หน้าอุปกรณ์</p>}
            </div>
          </section>

          <Field label="หมายเหตุ / ที่อยู่จัดส่ง">
            <textarea rows={2} className="input" placeholder="ระบุสถานที่นัดรับ หรือที่อยู่จัดส่ง (ถ้ามี)" value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </Field>
        </div>

        <aside className="lg:sticky lg:top-0 lg:self-start">
          <div className="card card-pad !bg-surface2/60">
            <h3 className="eyebrow mb-4">สรุปราคา</h3>
            {chosen.length ? <ul className="mb-4 space-y-2 text-sm">{chosen.map((e) => <li key={e.id} className="flex justify-between gap-3"><span className="line-clamp-1">{e.name}</span><span className="shrink-0 text-mute">฿{money(e.rental_rate_per_day)}/วัน</span></li>)}</ul> : <p className="mb-4 text-sm text-mute">ยังไม่ได้เลือกกล้อง</p>}
            <div className="divider-dots mb-4" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-mute">รูปแบบเช่า</dt><dd>{form.rental_type === 'hourly' ? `${form.rental_hours} ชั่วโมง` : `${days || 0} วัน`}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">ราคาแนะนำ</dt><dd>{baht(basePrice)}</dd></div>
            </dl>
            <div className="mt-4 grid gap-3">
              <Field label="ราคาเช่าที่ตกลง (บาท) — แก้เองได้">
                <input required type="number" min="0" step="0.01" inputMode="decimal" className="input" value={form.custom_price} onChange={(e) => { setPriceTouched(true); set({ custom_price: e.target.value }); }} />
              </Field>
              <Field label="ส่วนลด (บาท)">
                <input type="number" min="0" step="0.01" inputMode="decimal" className="input" value={form.discount} onChange={(e) => set({ discount: e.target.value })} />
              </Field>
              <Field label={`เงินประกัน (500 บาท/ตัว · ${chosen.length} ตัว)`}>
                <input type="number" min="0" step="1" inputMode="numeric" className="input" value={form.deposit} onChange={(e) => set({ deposit: e.target.value })} />
              </Field>
            </div>
            <div className="divider-dots my-4" />
            <div className="flex items-end justify-between">
              <span className="text-sm font-medium">ยอดสุทธิ</span>
              <span className="font-num text-3xl font-semibold text-accent">{baht(Math.max(0, Number(form.custom_price || 0) - Number(form.discount || 0)))}</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-mute">เงินประกันแยกจากค่าเช่า ชำระวันที่รับกล้อง และคืนให้วันที่นำกล้องมาคืน</p>
          </div>
        </aside>
      </form>
    </Modal>
  );
}

/* ═════ components/BookingDetail.jsx ═════ */
const parseList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const out = JSON.parse(value);
    return Array.isArray(out) ? out : [];
  } catch {
    return [];
  }
};

/* เปิดเอกสารสำหรับพิมพ์ / บันทึกเป็น PDF ในแท็บใหม่
   ทำงานได้ทั้งคอมพิวเตอร์ แท็บเล็ต iPad และมือถือ (กดปุ่มพิมพ์ในหน้านั้น แล้วเลือก "บันทึกเป็น PDF") */
function openPrintDoc({ title, size = 'A5', body }) {
  const sheetW = size === 'A4' ? '190mm' : '135mm';
  const html = '<!doctype html><html lang="th"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>' + esc(title) + '</title>'
    + '<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600&display=swap" rel="stylesheet">'
    + '<style>@page{size:' + size + ';margin:12mm}*{box-sizing:border-box}'
    + 'body{margin:0;background:#eee9f7;color:#1d1530;font-family:Prompt,"Noto Sans Thai",Tahoma,sans-serif;font-size:13px;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}'
    + '.bar{position:sticky;top:0;z-index:5;display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:10px 14px;background:#2a1a4d;color:#fff;font-size:12px}'
    + '.bar button{font:inherit;font-weight:500;border:0;border-radius:10px;padding:9px 14px;background:' + themeHex() + ';color:#fff;cursor:pointer}.bar button.g{background:transparent;border:1px solid #ffffff55}'
    + '.sheet{background:#fff;margin:14px auto;max-width:' + sheetW + ';padding:18px 16px;box-shadow:0 10px 30px -12px #2a1a4d66;overflow-wrap:anywhere}'
    + 'h1{font-size:20px;margin:0}h2{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#6d6385;margin:16px 0 4px}'
    + '.top{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;border-bottom:2px solid #1d1530;padding-bottom:8px;margin-bottom:12px}.no{font-size:11px;text-align:right}.no b{display:block;font-size:15px}'
    + '.tw{overflow-x:auto}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:11px;color:#6d6385;border-bottom:1px solid #1d1530}td,th{padding:5px 6px 5px 0;vertical-align:top}td{border-bottom:1px dashed #cfc7e0}td small{display:block;color:#6d6385;font-size:10px}.r{text-align:right;white-space:nowrap}'
    + 'thead{display:table-header-group}tr{break-inside:avoid}.ln{display:flex;justify-content:space-between;gap:12px;padding:2px 0}.tot{border-top:2px solid #1d1530;margin-top:6px;padding-top:6px;font-size:15px}'
    + '.kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}.kpi div{border:1px solid #cfc7e0;border-radius:8px;padding:8px 10px}.kpi b{display:block;font-size:16px}'
    + '.sig{display:flex;gap:24px;margin-top:34px}.sig div{flex:1;border-top:1px solid #1d1530;text-align:center;padding-top:4px;font-size:10px;color:#6d6385}.note{margin-top:12px;font-size:10px;color:#6d6385}'
    + '@media print{.bar{display:none}body{background:#fff}.sheet{margin:0;max-width:none;padding:0;box-shadow:none}.tw{overflow:visible}}</style></head><body>'
    + '<div class="bar"><span>มือถือ: กด “พิมพ์ / บันทึกเป็น PDF” แล้วเลือก “บันทึกเป็น PDF” หรือ “แชร์”</span>'
    + '<span><button onclick="window.print()">พิมพ์ / บันทึกเป็น PDF</button> <button class="g" onclick="window.close()">ปิด</button></span></div>'
    + '<div class="sheet">' + body + '</div></body></html>';

  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const win = window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 120000);
  if (!win) {
    // เบราว์เซอร์บล็อกหน้าต่างใหม่ — ให้ผู้ใช้กดลิงก์เอง (ลิงก์ที่กดเองจะไม่ถูกบล็อก)
    fire({
      icon: 'info',
      title: 'เปิดเอกสารพร้อมพิมพ์',
      html: '<a class="btn btn-primary" href="' + url + '" target="_blank" rel="noopener">เปิดเอกสาร</a>',
      showConfirmButton: false,
      showCloseButton: true,
    });
  }
}

/* ใบยืนยันการจอง */
function printSlip(d) {
  const x = (v) => esc(v ?? '');
  const delivery = ({ meetup: 'นัดรับ', van: 'รถตู้', grab: 'แกร๊ป', post: 'ไปรษณีย์' })[d.delivery_method] || 'นัดรับ';
  const region = ({ local: 'สงขลา / เก้าเส้ง', south: 'ต่างจังหวัดภาคใต้', other: 'ต่างจังหวัดภาคอื่น ๆ' })[d.rental_region] || '-';
  const rows = (d.items || []).map((i) => '<tr><td>' + x(i.name) + '<small>' + x(i.code) + '</small></td><td class="r">' + x(baht(i.daily_rate)) + '/วัน</td></tr>').join('');
  const line = (k, v, cls) => '<div class="ln ' + (cls || '') + '"><span>' + k + '</span><b>' + v + '</b></div>';
  const contact = [SHOP.phone && ('โทร ' + x(SHOP.phone)), SHOP.line && ('LINE ' + x(SHOP.line))].filter(Boolean).join(' · ');
  const ds = ({ pending: 'ยังไม่ได้รับ', held: 'รับแล้ว (ถือไว้)', returned: 'คืนแล้ว', partial: 'หักบางส่วน' })[d.deposit_status || 'pending'];
  const body = '<div class="top"><div><h1>' + x(SHOP.name) + '</h1><div>ใบยืนยันการเช่ากล้อง' + (contact ? ' · ' + contact : '') + '</div></div>'
    + '<div class="no">เลขที่<b>' + x(d.booking_no) + '</b>' + x(fmtDateTime(d.created_at)) + '</div></div>'
    + '<h2>ผู้เช่า</h2><div>' + x(d.customer_name) + ' · ' + x(d.phone) + '</div>'
    + '<h2>ช่วงเวลาเช่า</h2>' + line('รับกล้อง', x(fmtDateTime(d.start_date))) + line('คืนกล้อง', x(fmtDateTime(d.end_date)))
    + line('รูปแบบ', d.rental_type === 'hourly' ? x(d.rental_hours) + ' ชั่วโมง' : x(d.total_days) + ' วัน')
    + line('การรับกล้อง', x(delivery) + ' · ' + x(region))
    + '<h2>อุปกรณ์</h2><table>' + rows + '</table>'
    + '<h2>ค่าใช้จ่าย</h2>' + line('ค่าเช่า', x(baht(d.subtotal)))
    + (Number(d.discount) > 0 ? line('ส่วนลด', '−' + x(baht(d.discount))) : '')
    + (Number(d.extra_charges) > 0 ? line('ค่าใช้จ่ายเพิ่มเติม', x(baht(d.extra_charges))) : '')
    + (Number(d.fine_amount) > 0 ? line('ค่าปรับ', x(baht(d.fine_amount))) : '')
    + line('ยอดสุทธิ', x(baht(d.net_total)), 'tot')
    + line('เงินประกัน (จ่ายวันรับกล้อง คืนวันคืนกล้อง)', x(baht(d.deposit)))
    + line('สถานะเงินประกัน', x(ds))
    + (Number(d.deposit_deducted) > 0 ? line('หักเงินประกัน', x(baht(d.deposit_deducted)) + (d.deposit_note ? ' (' + x(d.deposit_note) + ')' : '')) : '')
    + (d.notes ? '<h2>หมายเหตุ</h2><div>' + x(d.notes) + '</div>' : '')
    + '<div class="sig"><div>ผู้เช่า</div><div>ผู้ให้เช่า</div></div>'
    + '<p class="note">รับกล้องเวลาไหน คืนเวลาเดียวกันของวันครบกำหนด · จุดนัดรับปกติ ' + x(SHOP.pickup) + '</p>';
  openPrintDoc({ title: d.booking_no, size: 'A5', body });
}

function BookingDetail() {
  const { detailId, closeDetail, refresh, customers } = useApp();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/bookings/${detailId}`);
      setDetail(data);
      setError('');
    } catch (e) {
      setError(errMsg(e, 'โหลดรายละเอียดไม่สำเร็จ'));
    }
  }, [detailId]);

  useEffect(() => {
    load();
  }, [load]);

  const asRow = detail && {
    ...detail,
    equipment_names: (detail.items || []).map((i) => i.name).join(', '),
  };

  const run = async (flow) => {
    const done = await flow(asRow, refresh);
    if (done) load();
  };

  const status = detail ? effectiveStatus(detail) : null;
  const canCheckout = detail && ['pending', 'confirmed'].includes(detail.status);
  const canReturn = detail && detail.status === 'picked_up';

  return (
    <Drawer
      title={detail ? detail.booking_no : 'รายละเอียดการจอง'}
      subtitle={detail ? `สร้างเมื่อ ${fmtDateTime(detail.created_at)}` : ''}
      onClose={closeDetail}
      footer={
        detail ? (
          <div className="flex gap-2">
            <button onClick={() => printSlip(detail)} className="btn" title="พิมพ์ใบจอง">
              <Printer size={16} /> พิมพ์ใบจอง
            </button>
            {canCheckout && (
              <>
                <button onClick={() => run(cancelFlow)} className="btn btn-danger">
                  <Ban size={16} /> ยกเลิก
                </button>
                <button onClick={() => run(checkoutFlow)} className="btn btn-primary flex-1">
                  <LogOut size={16} /> ส่งมอบอุปกรณ์
                </button>
              </>
            )}
            {canReturn && (
              <button onClick={() => run(returnFlow)} className="btn btn-primary flex-1">
                <LogIn size={16} /> รับคืนอุปกรณ์
              </button>
            )}
          </div>
        ) : null
      }
    >
      {error && <p className="rounded-xl bg-bad/10 p-4 text-sm text-bad">{error}</p>}

      {!detail && !error && (
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
          <Skeleton className="h-32" />
        </div>
      )}

      {detail && (
        <div className="stagger space-y-6">
          <section style={{ '--i': 0 }} className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-mute">ผู้เช่า</p>
              <p className="font-serif text-xl font-semibold">{detail.customer_name}</p>
              <a href={`tel:${detail.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-accent">
                <Phone size={14} /> {detail.phone}
              </a>
              <ContactChips contacts={customers.find((c) => c.id === detail.customer_id)?.contacts} className="mt-2" />
            </div>
            <StatusBadge status={status} />
          </section>

          <section style={{ '--i': 1 }} className="card card-pad !bg-surface2/40">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs text-mute"><CalendarClock size={13} /> รับอุปกรณ์</p>
                <p className="font-medium">{fmtDateTime(detail.start_date)}</p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs text-mute"><CalendarClock size={13} /> กำหนดคืน</p>
                <p className="font-medium">{fmtDateTime(detail.end_date)}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-mute">
              {detail.rental_type === 'hourly' ? `เช่ารายชั่วโมง ${detail.rental_hours || '-'} ชั่วโมง` : `เช่ารายวัน ${detail.total_days} วัน`}
              {' · '}
              {({ meetup: 'นัดรับ', van: 'รถตู้', grab: 'แกร๊ป', post: 'ไปรษณีย์' })[detail.delivery_method] || 'นัดรับ'}
            </p>
            <p className="mt-1 text-xs text-mute">
              พื้นที่: {({ local: 'สงขลา / เก้าเส้ง', south: 'ต่างจังหวัดภาคใต้', other: 'ต่างจังหวัดภาคอื่น ๆ' })[detail.rental_region] || 'ไม่ระบุ'}
            </p>
          </section>

          <section style={{ '--i': 2 }}>
            <h3 className="eyebrow mb-3">อุปกรณ์ ({detail.items?.length || 0})</h3>
            <ul className="space-y-2.5">
              {(detail.items || []).map((item) => (
                <li key={item.id} className="card flex items-center gap-3 p-2.5">
                  <EquipmentPhoto item={item} className="h-14 w-14 shrink-0 rounded-xl" iconSize={20} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="truncate font-mono text-[11px] text-mute">{item.code}</p>
                  </div>
                  <p className="shrink-0 text-sm font-medium">{baht(item.daily_rate)}<span className="text-[11px] text-mute">/วัน</span></p>
                </li>
              ))}
            </ul>
          </section>

          <section style={{ '--i': 3 }} className="card card-pad">
            <h3 className="eyebrow mb-3">ค่าใช้จ่าย</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-mute">ค่าเช่า</dt><dd>{baht(detail.subtotal)}</dd></div>
              {Number(detail.discount) > 0 && <div className="flex justify-between"><dt className="text-mute">ส่วนลด</dt><dd>−{baht(detail.discount)}</dd></div>}
              {Number(detail.extra_charges) > 0 && <div className="flex justify-between"><dt className="text-mute">ค่าใช้จ่ายเพิ่มเติม</dt><dd>{baht(detail.extra_charges)}</dd></div>}
              {Number(detail.fine_amount) > 0 && <div className="flex justify-between"><dt className="text-mute">ค่าปรับ</dt><dd className="text-bad">{baht(detail.fine_amount)}</dd></div>}
              <div className="divider-dots my-2" />
              <div className="flex items-end justify-between"><dt className="font-medium">ยอดสุทธิ</dt><dd className="font-num text-2xl font-semibold text-accent">{baht(detail.net_total)}</dd></div>
              {Number(detail.deposit) > 0 && <div className="flex justify-between text-xs"><dt className="text-mute">มัดจำ</dt><dd>{baht(detail.deposit)}</dd></div>}
            </dl>
          </section>

          {Number(detail.deposit) > 0 && (() => {
            const ds = detail.deposit_status || 'pending';
            const deducted = Number(detail.deposit_deducted || 0);
            return (
              <section style={{ '--i': 4 }} className="card card-pad">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="eyebrow">เงินประกัน</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DEPOSIT_TONE[ds] || DEPOSIT_TONE.pending}`}>{DEPOSIT_LABEL[ds] || DEPOSIT_LABEL.pending}</span>
                </div>
                <p className="font-num mt-2 text-2xl font-semibold">{baht(detail.deposit)}</p>
                {ds === 'partial' && (
                  <p className="mt-1 text-sm text-mute">
                    หัก {baht(deducted)} · คืนลูกค้า {baht(Number(detail.deposit) - deducted)}
                    {detail.deposit_note ? ` · ${detail.deposit_note}` : ''}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {ds === 'pending' && <button onClick={() => run(receiveDepositFlow)} className="btn btn-sm">รับเงินประกันแล้ว</button>}
                  {ds === 'held' && <button onClick={() => run(settleDepositFlow)} className="btn btn-sm btn-primary">คืนเงินประกัน</button>}
                  {(ds === 'returned' || ds === 'partial') && <button onClick={() => run(settleDepositFlow)} className="btn btn-sm btn-ghost">แก้ไขการคืน</button>}
                </div>
              </section>
            );
          })()}

          {detail.notes && (
            <section style={{ '--i': 4 }} className="flex gap-3 rounded-2xl bg-warn/10 p-4 text-sm text-warn">
              <StickyNote size={17} className="mt-0.5 shrink-0" />
              <p className="leading-relaxed">{detail.notes}</p>
            </section>
          )}

          {detail.inspections?.length > 0 && (
            <section style={{ '--i': 5 }}>
              <h3 className="eyebrow mb-3">บันทึกการตรวจสภาพ</h3>
              <ol className="relative space-y-4 border-l border-line pl-5">
                {detail.inspections.map((ins) => {
                  const acc = parseList(ins.accessories_checked);
                  return (
                    <li key={ins.id} className="relative">
                      <span className={`absolute -left-[27px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-surface ${ins.type === 'checkout' ? 'bg-info' : 'bg-ok'}`} />
                      <p className="flex items-center gap-1.5 text-sm font-medium">
                        <ShieldCheck size={14} className="text-mute" />
                        {ins.type === 'checkout' ? 'ส่งมอบอุปกรณ์' : 'รับคืนอุปกรณ์'}
                      </p>
                      <p className="text-xs text-mute">{fmtDateTime(parseDate(ins.inspection_date))}</p>
                      {acc.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {acc.map((a) => (
                            <span key={a} className="rounded-full bg-surface2 px-2.5 py-0.5 text-[11px] text-mute">{a}</span>
                          ))}
                        </div>
                      )}
                      {ins.condition_notes && <p className="mt-2 text-sm leading-relaxed text-mute">{ins.condition_notes}</p>}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>
      )}
    </Drawer>
  );
}

/* ═════ components/EquipmentForm.jsx ═════ */
const MAX_SOURCE = 25 * 1024 * 1024;
const MAX_UPLOAD = 8 * 1024 * 1024;

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

// ย่อรูปในเครื่องก่อนอัปโหลด — เร็วขึ้นและประหยัดพื้นที่
async function shrinkImage(file, max = 1400) {
  if (file.type === 'image/gif') return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.\w+$/, '') || 'photo'}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function ImageUploader({ currentUrl, file, onPick, onRemove }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const shown = preview || (currentUrl ? imgSrc(currentUrl) : '');

  const handleFile = async (picked) => {
    if (!picked) return;
    if (!picked.type.startsWith('image/')) {
      showError('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP)', 'ไฟล์ไม่ถูกต้อง');
      return;
    }
    if (picked.size > MAX_SOURCE) {
      showError('ไฟล์รูปใหญ่เกินไป (สูงสุด 25 MB)', 'ไฟล์ใหญ่เกินไป');
      return;
    }
    setBusy(true);
    const ready = await shrinkImage(picked);
    setBusy(false);
    if (ready.size > MAX_UPLOAD) {
      showError('รูปหลังย่อยังใหญ่เกิน 8 MB กรุณาเลือกรูปอื่น', 'ไฟล์ใหญ่เกินไป');
      return;
    }
    onPick(ready);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`group relative flex h-52 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 sm:h-60 ${
          over ? 'scale-[1.01] border-accent bg-accent/10' : 'border-line bg-surface2/50 hover:border-accent/60'
        }`}
      >
        {shown ? (
          <>
            <img src={shown} alt="ตัวอย่างรูปอุปกรณ์" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute inset-x-3 bottom-3 flex gap-2 sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100">
              <button type="button" onClick={() => inputRef.current?.click()} className="btn btn-sm flex-1 bg-white/95 text-black">
                <Replace size={15} /> เปลี่ยนรูป
              </button>
              <button type="button" onClick={onRemove} className="btn btn-sm bg-white/95 text-bad" aria-label="ลบรูป">
                <Trash2 size={15} />
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-accent shadow-sm transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110">
              {busy ? <RefreshCw size={22} className="animate-spin" /> : <UploadCloud size={24} strokeWidth={1.5} />}
            </span>
            <span className="text-sm font-medium">
              {busy ? 'กำลังเตรียมรูป...' : 'แตะเพื่อเลือกรูปจากเครื่อง'}
            </span>
            <span className="text-xs text-mute">หรือลากรูปมาวางที่นี่ · JPG PNG WEBP</span>
          </button>
        )}
        {busy && shown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
            <RefreshCw className="animate-spin" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

const EMPTY = {
  code: '',
  name: '',
  category: 'camera',
  brand: '',
  model: '',
  serial_number: '',
  cost_price: 0,
  current_value: 0,
  rental_rate_per_day: 0,
  status: 'available',
  defects: '',
  image_url: '',
};

function suggestCode(category, equipments) {
  const prefix = CATEGORIES.find((c) => c.id === category)?.prefix || 'EQ';
  const re = new RegExp(`^(?:DEMO-)?${prefix}-(\\d+)$`);
  const max = equipments.reduce((m, e) => {
    const hit = re.exec(e.code || '');
    return hit ? Math.max(m, Number(hit[1])) : m;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

function EquipmentForm() {
  const { equipmentModal, closeEquipment, equipments, refresh } = useApp();
  const item = equipmentModal.item;
  const editing = Boolean(item);

  const [form, setForm] = useState(() =>
    item
      ? { ...EMPTY, ...item, defects: item.defects || '' }
      : { ...EMPTY, code: suggestCode('camera', equipments) }
  );
  const [codeTouched, setCodeTouched] = useState(editing);
  const [file, setFile] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const systemStatus = editing && ['rented', 'booked'].includes(item.status);

  const onCategory = (category) => {
    set({
      category,
      ...(codeTouched ? {} : { code: suggestCode(category, equipments) }),
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      let image_url = removed ? null : form.image_url || null;
      if (file) image_url = await uploadImage(file);

      const payload = {
        ...form,
        code: form.code.trim(),
        name: form.name.trim(),
        image_url,
        cost_price: Number(form.cost_price || 0),
        current_value: Number(form.current_value || 0),
        rental_rate_per_day: Number(form.rental_rate_per_day || 0),
      };

      if (editing) await api.put(`/equipments/${item.id}`, payload);
      else await api.post('/equipments', payload);

      await refresh();
      closeEquipment();
      await fire({
        icon: 'success',
        title: editing ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มอุปกรณ์เรียบร้อย',
        text: payload.name,
        timer: 1700,
        showConfirmButton: false,
      });
    } catch (error) {
      toast('error', errMsg(error, 'บันทึกไม่สำเร็จ'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? 'แก้ไขอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่'}
      subtitle={editing ? item.code : 'กรอกข้อมูลและเลือกรูปจากเครื่องของคุณ'}
      onClose={closeEquipment}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={closeEquipment} className="btn btn-ghost">
            ยกเลิก
          </button>
          <button type="submit" form="equipment-form" disabled={saving} className="btn btn-primary min-w-40">
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      }
    >
      <form id="equipment-form" onSubmit={submit} className="space-y-6">
        <ImageUploader
          currentUrl={removed ? '' : form.image_url}
          file={file}
          onPick={(f) => {
            setFile(f);
            setRemoved(false);
          }}
          onRemove={() => {
            setFile(null);
            setRemoved(true);
          }}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="หมวดหมู่">
            <select className="input" value={form.category} onChange={(e) => onCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="รหัสอุปกรณ์ *">
            <input
              required
              className="input font-mono"
              value={form.code}
              onChange={(e) => {
                setCodeTouched(true);
                set({ code: e.target.value });
              }}
            />
          </Field>
          <Field label="ชื่ออุปกรณ์ *" className="sm:col-span-2">
            <input required className="input" placeholder="ชื่อกล้องหรืออุปกรณ์" value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="ยี่ห้อ">
            <input className="input" value={form.brand || ''} onChange={(e) => set({ brand: e.target.value })} />
          </Field>
          <Field label="รุ่น">
            <input className="input" value={form.model || ''} onChange={(e) => set({ model: e.target.value })} />
          </Field>
          <Field label="Serial Number" hint="ไม่ซ้ำกับอุปกรณ์ชิ้นอื่น">
            <input className="input font-mono" value={form.serial_number || ''} onChange={(e) => set({ serial_number: e.target.value })} />
          </Field>
          <Field label="สถานะ" hint={systemStatus ? 'สถานะนี้ระบบจัดการอัตโนมัติจากการส่งมอบ/รับคืน' : undefined}>
            {systemStatus ? (
              <input className="input" disabled value={item.status === 'rented' ? 'กำลังถูกเช่า' : 'ถูกจองแล้ว'} />
            ) : (
              <select className="input" value={form.status} onChange={(e) => set({ status: e.target.value })}>
                <option value="available">พร้อมใช้งาน</option>
                <option value="maintenance">ซ่อมบำรุง</option>
              </select>
            )}
          </Field>
          <Field label="ค่าเช่าต่อวัน (บาท) *">
            <input required min="0" type="number" inputMode="decimal" className="input" value={form.rental_rate_per_day} onChange={(e) => set({ rental_rate_per_day: e.target.value })} />
          </Field>
          <Field label="ราคาทุน (บาท)">
            <input min="0" type="number" inputMode="decimal" className="input" value={form.cost_price} onChange={(e) => set({ cost_price: e.target.value })} />
          </Field>
          <Field label="มูลค่าปัจจุบัน (บาท)" className="sm:col-span-2">
            <input min="0" type="number" inputMode="decimal" className="input" value={form.current_value} onChange={(e) => set({ current_value: e.target.value })} />
          </Field>
          <Field label="ตำหนิ / หมายเหตุ" className="sm:col-span-2">
            <textarea rows={3} className="input" placeholder="รอยตำหนิ อุปกรณ์ในกล่อง หรือรายละเอียดเพิ่มเติม" value={form.defects} onChange={(e) => set({ defects: e.target.value })} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

/* ═════ components/Shell.jsx ═════ */
const SIDE_W = { sidebar: 268, rail: 84 };
const pad2 = (n) => String(n).padStart(2, '0');

function ShopMark({ size = 21, className = '' }) {
  const [bad, setBad] = useState(false);
  if (SHOP.logo && !bad) {
    return <img src={SHOP.logo} alt="" onError={() => setBad(true)} className={`h-full w-full object-cover ${className}`} />;
  }
  return <Aperture size={size} strokeWidth={1.6} className={className} />;
}

function Brand({ name, compact = false, dark = true }) {
  return (
    <div className="group flex items-center gap-3">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[11px] bg-accent text-accent-fg shadow-[inset_0_1px_0_rgb(255_255_255/0.3)]">
        <ShopMark className="rounded-[11px] transition-transform duration-700" />
      </span>
      {!compact && (
        <div className="min-w-0 leading-tight">
          <p className={`font-display truncate text-[1.5rem] font-semibold tracking-tight ${dark ? 'text-side-ink' : 'text-ink'}`}>
            {name}
          </p>
          <p className={`mono !text-[9px] !tracking-[0.26em] ${dark ? 'text-side-mute' : 'text-mute'}`}>
            Camera Rental
          </p>
        </div>
      )}
    </div>
  );
}

function Sidebar({ rail, side, overdue }) {
  const { page, navigate, openBooking, leave, offline } = useApp();
  const { settings } = useSettings();
  const groups = Object.keys(NAV_GROUPS);

  return (
    <aside
      className={`fixed inset-y-0 z-50 flex flex-col bg-side text-side-ink transition-[width] duration-500 ${
        rail ? 'rail' : ''
      } ${side === 'left' ? 'left-0 border-r' : 'right-0 border-l'} border-white/[0.06]`}
      style={{ width: rail ? SIDE_W.rail : SIDE_W.sidebar }}
    >
      <div className={`flex h-[76px] shrink-0 items-center ${rail ? 'justify-center' : 'px-6'}`}>
        <Brand name={settings.shopName} compact={rail} />
      </div>

      <div className={`pt-3 ${rail ? 'px-4' : 'px-5'}`}>
        <button
          onClick={() => openBooking([])}
          title="สร้างการจองใหม่"
          className={`btn btn-primary w-full ${rail ? '!px-0' : ''}`}
        >
          <Plus size={18} />
          {!rail && 'สร้างการจองใหม่'}
        </button>
      </div>

      <nav className={`scroll-thin mt-2 min-h-0 flex-1 overflow-y-auto pb-4 ${rail ? 'px-4' : 'px-5'}`}>
        {groups.map((g) => (
          <div key={g} className="mt-5">
            {!rail ? (
              <p className="mono mb-2 px-1 !text-[9.5px] !tracking-[0.26em] text-side-mute/60">
                {NAV_GROUPS[g]}
              </p>
            ) : (
              <div className="mx-auto mb-2 h-px w-6 bg-white/10" />
            )}
            <div className="space-y-0.5">
              {NAV_ITEMS.filter((n) => n.group === g).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  data-on={page === id}
                  className="nav-item"
                  title={label}
                  onClick={() => navigate(id)}
                >
                  <Icon size={18} strokeWidth={1.6} />
                  {!rail && <span className="text-left">{label}</span>}
                  {!rail && id !== 'operations' && (
                    <span className="nav-idx">{pad2(NAV_ITEMS.findIndex((n) => n.id === id) + 1)}</span>
                  )}
                  {id === 'operations' && overdue > 0 && (
                    <span className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-bad px-1.5 font-mono text-[10px] font-semibold text-white ${rail ? 'absolute right-1 top-1' : 'ml-auto'}`}>
                      {overdue}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={`border-t border-white/[0.07] py-4 ${rail ? 'px-4' : 'px-5'}`}>
        {!rail && (
          <p className="mono mb-3 flex items-center gap-2 px-1 !text-[9.5px] text-side-mute">
            <i className={`live-dot h-1.5 w-1.5 rounded-full ${offline ? 'bg-bad' : 'bg-ok'}`} />
            {offline ? 'ออฟไลน์ — เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' : 'ออนไลน์'}
          </p>
        )}
        <button onClick={leave} className="nav-item" title="กลับหน้าแนะนำระบบ">
          <Home size={18} strokeWidth={1.6} />
          {!rail && <span className="text-left">หน้าแนะนำระบบ</span>}
        </button>
      </div>
    </aside>
  );
}

function TopTabs() {
  const { page, navigate } = useApp();
  const { wrap, box } = useSlider(page);
  return (
    <nav className="no-scrollbar overflow-x-auto px-4 sm:px-6 lg:px-10">
      <div className="tabs-top" ref={wrap}>
        {NAV_ITEMS.map(({ id, label, short, icon: Icon }) => (
          <button key={id} data-on={page === id} className="tab-top" onClick={() => navigate(id)}>
            <Icon size={16} strokeWidth={1.6} />
            {short || label}
          </button>
        ))}
        <span className="tab-line" style={{ width: box.w, transform: `translateX(${box.x}px)`, opacity: box.ok ? 1 : 0 }} />
      </div>
    </nav>
  );
}

/* dock ลอยแบบขยายตามเมาส์ */
function Dock() {
  const { page, navigate } = useApp();
  const ref = useRef(null);

  const onMove = (e) => {
    if (e.pointerType === 'touch') return;
    [...(ref.current?.children || [])].forEach((el) => {
      if (!el.classList.contains('dock-item')) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      el.style.setProperty('--s', (1 + 0.62 * Math.pow(Math.max(0, 1 - d / 140), 2)).toFixed(3));
    });
  };
  const onLeave = () =>
    [...(ref.current?.children || [])].forEach((el) => el.style?.setProperty('--s', '1'));

  const items = [];
  let lastGroup = null;
  NAV_ITEMS.forEach((n) => {
    if (lastGroup && n.group !== lastGroup) items.push({ sep: n.group });
    lastGroup = n.group;
    items.push(n);
  });

  return (
    <nav ref={ref} className="dock no-scrollbar" aria-label="เมนูหลัก" onPointerMove={onMove} onPointerLeave={onLeave}>
      {items.map((n) =>
        n.sep ? (
          <span key={`s-${n.sep}`} className="dock-sep" />
        ) : (
          <button
            key={n.id}
            title={n.label}
            data-label={n.label}
            data-on={page === n.id}
            className="dock-item"
            onClick={() => navigate(n.id)}
          >
            <n.icon size={19} strokeWidth={1.6} />
          </button>
        )
      )}
    </nav>
  );
}

function BottomBar({ onMenu }) {
  const { page, navigate, openBooking } = useApp();
  const Item = ({ id, label, icon: Icon }) => (
    <button className="bb-item" data-on={page === id} onClick={() => navigate(id)}>
      <Icon size={21} strokeWidth={1.6} />
      {label}
    </button>
  );
  const main = ['dashboard', 'equipments', 'bookings'];
  const find = (id) => NAV_ITEMS.find((n) => n.id === id);

  return (
    <nav className="bottom-bar" aria-label="เมนูหลัก">
      <Item {...find('dashboard')} label="ภาพรวม" />
      <Item {...find('equipments')} label="อุปกรณ์" />
      <button className="bb-item" onClick={() => openBooking([])} aria-label="สร้างการจอง">
        <span className="bb-fab">
          <Plus size={26} />
        </span>
      </button>
      <Item {...find('bookings')} label="การจอง" />
      <button className="bb-item" data-on={!main.includes(page)} onClick={onMenu}>
        <Menu size={21} strokeWidth={1.6} />
        เมนู
      </button>
    </nav>
  );
}

function Shell({ children }) {
  const {
    page, navigate, leave, openBooking, refresh, loading, offline, dashboard,
  } = useApp();
  const { settings, update } = useSettings();
  const bp = useBreakpoint();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav =
    bp === 'mobile'
      ? 'mobile'
      : settings.navStyle === 'sidebar' && bp === 'tablet'
        ? 'rail'
        : settings.navStyle;

  const hasSide = nav === 'sidebar' || nav === 'rail';
  const sideW = hasSide ? SIDE_W[nav] : 0;
  const overdue = dashboard.overdueBookings?.length || 0;
  const idx = Math.max(0, NAV_ITEMS.findIndex((n) => n.id === page));
  const current = NAV_ITEMS[idx];

  return (
    <div className="ld-system min-h-dvh">
      {hasSide && <Sidebar rail={nav === 'rail'} side={settings.side} overdue={overdue} />}

      <div
        className="min-h-dvh transition-[padding] duration-500"
        style={{
          paddingLeft: settings.side === 'left' ? sideW : 0,
          paddingRight: settings.side === 'right' ? sideW : 0,
        }}
      >
        <header className="glass-header sticky top-0 z-40 safe-t">
          <div className="flex h-[68px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-4">
              {(nav === 'topbar' || nav === 'mobile' || nav === 'dock') && (
                <Brand name={settings.shopName} compact={nav === 'mobile' || nav === 'dock'} dark={false} />
              )}
              <div className="min-w-0 leading-tight">
                <p className="mono truncate !text-[10px] text-mute">
                  № {pad2(idx + 1)}
                  <span className="hidden sm:inline"> · {fmtLongDate()}</span>
                </p>
                <p className="mt-0.5 truncate font-serif text-[1.02rem] font-medium">{page === 'notfound' ? 'ไม่พบหน้า' : current?.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              {bp !== 'mobile' && (
                <button onClick={() => openBooking([])} className="btn btn-primary btn-sm mr-1.5">
                  <Plus size={16} /> สร้างการจอง
                </button>
              )}
              <button onClick={refresh} className="icon-btn" title="รีเฟรชข้อมูล" aria-label="รีเฟรช">
                <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => navigate('operations')}
                className="icon-btn relative"
                title="รายการที่ต้องติดตาม"
                aria-label="แจ้งเตือน"
              >
                <Bell size={17} />
                {overdue > 0 && (
                  <span className="live-dot absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-bad ring-2 ring-bg" />
                )}
              </button>
              <button
                onClick={() => navigate('settings')}
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-lg font-semibold text-bg transition-transform hover:scale-110"
                title="ตั้งค่า"
              >
                {(settings.shopName || 'L').trim().slice(0, 1).toUpperCase()}
              </button>
            </div>
          </div>
          {nav === 'topbar' && <TopTabs />}
        </header>

        {offline && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-bad/10 px-4 py-2.5 text-center text-sm text-bad">
            <WifiOff size={16} />
            <span>เชื่อมต่อ Backend ไม่ได้ — ตรวจสอบว่า server.js ทำงานและ MariaDB เปิดอยู่</span>
            <button onClick={refresh} className="font-semibold underline underline-offset-2">
              ลองใหม่
            </button>
          </div>
        )}

        <main
          className={`mx-auto w-full max-w-[1440px] px-4 pt-7 sm:px-6 sm:pt-9 lg:px-10 ${
            nav === 'mobile' ? 'pb-32' : nav === 'dock' ? 'pb-32' : 'pb-16'
          }`}
        >
          <div key={page} className="page-in">
            {children}
          </div>
        </main>
      </div>

      {nav === 'dock' && <Dock />}
      {nav === 'mobile' && <BottomBar onMenu={() => setMenuOpen(true)} />}

      {menuOpen && (
        <Drawer
          side="left"
          title={settings.shopName}
          subtitle="เมนูทั้งหมด"
          onClose={() => setMenuOpen(false)}
          footer={
            <button
              onClick={() => {
                setMenuOpen(false);
                leave();
              }}
              className="btn btn-ghost w-full"
            >
              <Home size={17} /> กลับหน้าแนะนำระบบ
            </button>
          }
        >
          {Object.keys(NAV_GROUPS).map((g) => (
            <div key={g} className="mb-6">
              <p className="mono mb-2.5 !text-[9.5px] !tracking-[0.24em] text-mute">{NAV_GROUPS[g]}</p>
              <div className="grid grid-cols-2 gap-2">
                {NAV_ITEMS.filter((n) => n.group === g).map(({ id, label, short, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(id);
                    }}
                    className={`card vf flex min-h-[76px] flex-col items-start justify-between p-3.5 text-left text-sm font-medium transition active:scale-95 ${
                      page === id ? '!border-accent bg-accent/10 text-accent' : ''
                    }`}
                  >
                    <Icon size={19} strokeWidth={1.5} />
                    <span className="flex w-full items-center justify-between">
                      {short || label}
                      {id === 'operations' && overdue > 0 && <AlertTriangle size={14} className="text-bad" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </Drawer>
      )}
    </div>
  );
}

/* ═════ pages/Landing.jsx ═════ */
/* =====================================================
   เนื้อหา
   ===================================================== */
const STATEMENT = [
  'เลิกจดสมุด', 'เลิกไล่เช็กแชต', 'เลิกกลัวจองซ้อน', '—', 'เรื่องของกล้องทั้งหมด',
  'อยู่ในหน้าจอเดียว', 'ตั้งแต่รูปอุปกรณ์', 'ไปจนถึงเงินในกระเป๋า',
];

const MARQUEE = ['อุปกรณ์', 'การจอง', 'รับ–คืน', 'ปฏิทิน', 'ลูกค้า', 'การเงิน', 'ซ่อมบำรุง'];


const STEPS = [
  { no: '01', title: 'เพิ่มอุปกรณ์', text: 'เลือกรูปจากเครื่อง ใส่ราคาเช่าต่อวัน เท่านี้คลังของคุณก็พร้อมรับจอง' },
  { no: '02', title: 'สร้างการจอง', text: 'กรอกชื่อ เบอร์โทร เลือกช่วงเวลา แล้วติ๊กอุปกรณ์ ระบบบอกทันทีว่าชิ้นไหนว่าง' },
  { no: '03', title: 'ส่งมอบอุปกรณ์', text: 'เช็กลิสต์ของที่ให้ลูกค้าไป บันทึกสภาพก่อนส่ง สถานะอุปกรณ์เปลี่ยนให้เอง' },
  { no: '04', title: 'รับคืนและสรุปยอด', text: 'ตรวจของ คิดค่าปรับถ้าคืนช้า สรุปยอด คืนมัดจำ แล้วลงบัญชีรายรับให้เอง' },
];

function Reveal({ as: Tag = 'div', a = 'up', delay = 0, className = '', children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} data-a={a} className={`rv ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/* =====================================================
   ภาพประกอบฟีเจอร์ (หน้าจอจำลอง)
   ===================================================== */
function VisFrame({ label, children }) {
  return (
    <div className="relative flex h-full w-full flex-col rounded-[24px] border border-white/10 bg-[rgb(var(--wa-color-purple-90))] p-5 shadow-[0_60px_110px_-50px_rgba(0,0,0,0.95)] sm:p-6">
      <div className="mono mb-4 flex justify-between !text-[10px] text-[rgb(var(--wa-color-purple-05)/0.45)]">
        <span>{label}</span>
        <span>ตัวอย่าง</span>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function VisInventory() {
  const rows = [['ชื่ออุปกรณ์', 'ราคา/สถานะ'], ['ชื่ออุปกรณ์', 'ราคา/สถานะ'], ['ชื่ออุปกรณ์', 'ราคา/สถานะ'], ['ชื่ออุปกรณ์', 'ราคา/สถานะ']];
  return (
    <VisFrame label="01 — INVENTORY">
      <div className="grid h-full grid-cols-2 gap-3">
        {rows.map(([n, p], i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="relative min-h-[64px] flex-1" style={{ background: `linear-gradient(${130 + i * 40}deg, rgb(var(--wa-color-purple-80)), rgb(var(--wa-color-purple-90)))` }}>
              <Aperture size={44} strokeWidth={0.8} className="absolute bottom-2 right-2 text-[rgb(var(--wa-color-purple-50)/0.4)]" />
            </div>
            <div className="p-3">
              <p className="truncate text-xs">{n}</p>
              <p className="mono mt-1 !text-[9px] text-[rgb(var(--wa-color-purple-50))]">{p}</p>
            </div>
          </div>
        ))}
        <div className="col-span-2 flex flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-[rgb(var(--wa-color-purple-50)/0.5)] py-2 text-[rgb(var(--wa-color-purple-50))]">
          <ImagePlus size={22} strokeWidth={1.3} />
          <span className="mono !text-[9px]">ลากรูปมาวางที่นี่</span>
        </div>
      </div>
    </VisFrame>
  );
}

function VisGantt() {
  const days = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
  const rows = [
    { n: 'อุปกรณ์ 1', bars: [[0, 3, 'a'], [4, 2, 'x']] },
    { n: 'อุปกรณ์ 2', bars: [[1, 2, 'b'], [4, 3, 'a']] },
    { n: 'อุปกรณ์ 3', bars: [[0, 2, 'b'], [3, 3, 'a']] },
  ];
  const tone = {
    a: 'bg-[rgb(var(--wa-color-purple-60))] text-white',
    b: 'bg-[#82acd8]/80 text-[#0e1824]',
    x: 'bg-[#ee705e] text-white',
  };
  return (
    <VisFrame label="02 — BOOKING">
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="mono grid grid-cols-7 pl-[4.5rem] !text-[9px] text-[rgb(var(--wa-color-purple-05)/0.4)]">
            {days.map((d) => <span key={d} className="text-center">{d}</span>)}
          </div>
          <div className="mt-3 space-y-3">
            {rows.map((r) => (
              <div key={r.n} className="flex items-center gap-3">
                <span className="mono w-[3.6rem] shrink-0 truncate !text-[9px] text-[rgb(var(--wa-color-purple-05)/0.55)]">{r.n}</span>
                <div className="relative h-7 flex-1 rounded-md bg-white/[0.04]">
                  {r.bars.map(([s, l, t]) => (
                    <span
                      key={s}
                      className={`mono absolute top-0.5 flex h-6 items-center justify-center rounded !text-[9px] font-medium ${tone[t]}`}
                      style={{ left: `${(s / 7) * 100}%`, width: `calc(${(l / 7) * 100}% - 3px)` }}
                    >
                      {t === 'x' ? 'ซ้อน' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="rounded-lg border border-[#ee705e]/40 bg-[#ee705e]/10 px-3.5 py-3 text-xs leading-relaxed text-[#f3a99d]">
          จองชิ้นเดิมในช่วงเวลาซ้อนกัน → ระบบไม่ให้เลือกและบอกเลขใบจองที่ชน
        </p>
      </div>
    </VisFrame>
  );
}

function VisChecklist() {
  const items = ['แบตเตอรี่ ×2', 'ที่ชาร์จ', 'สายคล้อง', 'ฝาปิดเลนส์', 'การ์ดความจำ'];
  return (
    <VisFrame label="03 — HANDOVER">
      <div className="flex h-full flex-col justify-between">
        <ul className="space-y-2">
          {items.map((t, i) => (
            <li key={t} className="flex items-center gap-3 rounded-lg border border-white/10 px-3.5 py-2.5 text-sm" style={{ animation: 'rise 0.7s var(--ease) both', animationDelay: `${i * 90}ms` }}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--wa-color-purple-60))] text-white"><Check size={12} strokeWidth={3} /></span>
              {t}
            </li>
          ))}
        </ul>
        <div className="mono flex items-center justify-between rounded-lg bg-white/[0.05] px-3.5 py-3 !text-[10px] text-[rgb(var(--wa-color-purple-05)/0.7)]">
          <span>คืนช้า 1 วัน</span>
          <span className="text-[rgb(var(--wa-color-purple-50))]">ค่าปรับ ฿300</span>
        </div>
      </div>
    </VisFrame>
  );
}

function VisCalendar() {
  const cells = Array.from({ length: 35 }, (_, i) => i - 3);
  const booked = { 8: 'a', 9: 'a', 10: 'a', 11: 'b', 15: 'b', 16: 'b', 22: 'a', 23: 'a', 24: 'a', 25: 'a' };
  return (
    <VisFrame label="04 — CALENDAR">
      <div className="grid h-full grid-cols-7 gap-1.5">
        {cells.map((d, i) => (
          <div
            key={i}
            className={`relative flex items-start justify-start rounded-md p-1.5 text-[10px] ${d > 0 && d <= 31 ? 'bg-white/[0.04] text-[rgb(var(--wa-color-purple-05)/0.7)]' : 'opacity-0'} ${d === 11 ? 'ring-1 ring-[rgb(var(--wa-color-purple-50))]' : ''}`}
          >
            {d > 0 && d <= 31 ? d : ''}
            {booked[d] && <i className={`absolute bottom-1.5 left-1.5 right-1.5 h-[3px] rounded-full ${booked[d] === 'a' ? 'bg-[rgb(var(--wa-color-purple-50))]' : 'bg-[#82acd8]'}`} />}
          </div>
        ))}
      </div>
    </VisFrame>
  );
}

function VisFinance() {
  const bars = [34, 52, 41, 78, 60, 94];
  return (
    <VisFrame label="05 — FINANCE">
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="mono !text-[9px] text-[rgb(var(--wa-color-purple-05)/0.45)]">รายรับเดือนนี้</p>
          <p className="font-num text-[3.6rem] leading-none text-[rgb(var(--wa-color-purple-50))]">฿24,800</p>
        </div>
        <div className="flex h-28 items-end gap-2.5">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 origin-bottom rounded-t-[3px] bg-[rgb(var(--wa-color-purple-50))]" style={{ height: `${h}%`, opacity: 0.4 + h / 160, animation: 'growY 1s var(--ease) both', animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
        <p className="mono !text-[9px] text-[rgb(var(--wa-color-purple-05)/0.45)]">รายรับถูกบันทึกอัตโนมัติเมื่อรับคืนอุปกรณ์</p>
      </div>
    </VisFrame>
  );
}

const FEATURES = [
  { title: 'คลังอุปกรณ์ พร้อมรูปจากเครื่อง', text: 'เพิ่มกล้อง เลนส์ แฟลช และอุปกรณ์เสริม แล้วเลือกรูปจากเครื่องหรือถ่ายจากมือถือได้เลย ระบบย่อรูปให้ก่อนอัปโหลด ไม่ต้องหาลิงก์', Vis: VisInventory },
  { title: 'จองหลายชิ้น แต่ไม่ชนกัน', text: 'ติ๊กอุปกรณ์หลายชิ้นในใบจองเดียว ระบบตรวจช่วงเวลาซ้อนทับ แล้วคำนวณค่าเช่า ส่วนลด และมัดจำให้ทันที', Vis: VisGantt },
  { title: 'ส่งมอบและรับคืน มีเช็กลิสต์', text: 'ติ๊กของที่ส่งมอบและรับคืนทีละชิ้น ถ้าคืนช้าระบบเสนอค่าปรับให้ แล้วสรุปยอดสุทธิในหน้าต่างเดียว', Vis: VisChecklist },
  { title: 'ปฏิทินที่เห็นทั้งเดือน', text: 'รู้ทันทีว่าวันไหนมีคนมารับ วันไหนรอคืน และช่วงไหนอุปกรณ์ว่างพอจะรับงานเพิ่ม', Vis: VisCalendar },
  { title: 'การเงินลงบัญชีให้เอง', text: 'รับคืนเสร็จ รายรับเข้าบัญชีทันที เพิ่มรายจ่ายและค่าซ่อมได้เอง ดูกำไรสุทธิและแนวโน้มรายเดือนได้ในหน้าเดียว', Vis: VisFinance },
];

/* =====================================================
   ส่วนต่างๆ ของหน้า
   ===================================================== */
function HeroFinder() {
  const [lock, setLock] = useState(0);
  useEffect(() => {
    const first = setTimeout(() => setLock(1), 2400);
    const t = setInterval(() => setLock((v) => (v ? 0 : 1)), 3600);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  return (
    <Tilt className="vfinder" max={4} glare={false}>
      <span className="bokeh" style={{ width: 150, height: 150, left: '-6%', top: '8%', animationDuration: '16s' }} />
      <span className="bokeh" style={{ width: 80, height: 80, right: '12%', top: '14%', animationDuration: '11s', animationDelay: '-3s', opacity: 0.8 }} />
      <span className="bokeh" style={{ width: 220, height: 220, right: '-14%', bottom: '8%', animationDuration: '19s', animationDelay: '-7s', opacity: 0.55 }} />
      <span className="bokeh" style={{ width: 54, height: 54, left: '22%', bottom: '20%', animationDuration: '13s', animationDelay: '-5s', opacity: 0.7 }} />
      <i className="br tl" /><i className="br tr" /><i className="br bl" /><i className="br brr" />

      <div className="mono absolute left-9 right-9 top-8 flex justify-between !text-[10px] text-[rgb(var(--wa-color-purple-05)/0.7)]">
        <span className="flex items-center gap-2"><i className="live-dot h-1.5 w-1.5 rounded-full bg-[#ee705e]" />REC</span>
        <span>AF-S · SINGLE</span>
      </div>

      <div className="reticle" data-lock={lock}><i /></div>
      <p className="mono absolute left-0 right-0 top-[calc(46%+84px)] text-center !text-[10px] text-[rgb(var(--wa-color-purple-50))]">
        {lock ? '● FOCUS LOCKED' : '○ SEARCHING'}
      </p>

      <div className="absolute right-6 top-[17%] w-[62%] rounded-xl border border-white/10 bg-black/45 p-3.5 backdrop-blur-md" style={{ animation: 'floaty 7s ease-in-out infinite' }}>
        <p className="mono !text-[9px] text-[rgb(var(--wa-color-purple-05)/0.5)]">BK-2610 · ตัวอย่าง</p>
        <p className="mt-1 text-sm  text-[rgb(var(--wa-color-purple-05)/0.5)]">ตัวอย่างรายการจอง</p>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-[rgb(var(--wa-color-purple-05)/0.6)]">
          <span>คืน 12:00 น.</span>
          <span className="flex items-center gap-1.5 text-[#7cbe94]"><i className="h-1.5 w-1.5 rounded-full bg-[#7cbe94]" />ว่างพร้อมส่ง</span>
        </div>
      </div>

      <div className="absolute bottom-[19%] left-6 rounded-xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-md" style={{ animation: 'floaty 8s ease-in-out -3s infinite' }}>
        <p className="mono !text-[9px] text-[rgb(var(--wa-color-purple-05)/0.5)]">รายรับวันนี้ · ตัวอย่าง</p>
        <p className="font-num text-3xl leading-none text-[rgb(var(--wa-color-purple-50))]">฿4,300</p>
      </div>

      <div className="absolute inset-x-8 bottom-7 flex items-end justify-between text-[rgb(var(--wa-color-purple-05)/0.8)]">
        <ExifTicker className="!text-[10px]" />
        <Aperture size={26} strokeWidth={1} className="text-[rgb(var(--wa-color-purple-50)/0.7)]" style={{ animation: 'spinSlow 30s linear infinite' }} />
      </div>
    </Tilt>
  );
}

function Counter({ to, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const on = useInView(ref, { threshold: 0.5 });
  const v = useCountUp(to, 1500, on);
  return <span ref={ref}>{prefix}{Math.round(v).toLocaleString('th-TH')}{suffix}</span>;
}

function BentoLayouts() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % 4), 1800);
    return () => clearInterval(t);
  }, []);
  const kinds = ['sidebar', 'rail', 'topbar', 'dock'];
  return (
    <div className="grid grid-cols-4 gap-2">
      {kinds.map((k, n) => (
        <div key={k} className={`relative h-16 overflow-hidden rounded-md border transition-colors duration-500 ${n === i ? 'border-[rgb(var(--wa-color-purple-50))]' : 'border-white/10'}`}>
          {k === 'sidebar' && <i className="absolute inset-y-0 left-0 w-4 bg-[rgb(var(--wa-color-purple-05)/0.4)]" />}
          {k === 'rail' && <i className="absolute inset-y-0 left-0 w-2 bg-[rgb(var(--wa-color-purple-05)/0.4)]" />}
          {k === 'topbar' && <i className="absolute inset-x-0 top-0 h-2.5 bg-[rgb(var(--wa-color-purple-05)/0.4)]" />}
          {k === 'dock' && <i className="absolute bottom-1 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-[rgb(var(--wa-color-purple-05)/0.4)]" />}
          <i className={`absolute rounded-sm transition-colors duration-500 ${n === i ? 'bg-[rgb(var(--wa-color-purple-50)/0.4)]' : 'bg-white/10'}`} style={{ inset: k === 'sidebar' ? '6px 6px 6px 22px' : k === 'rail' ? '6px 6px 6px 14px' : k === 'topbar' ? '16px 6px 6px' : '6px 6px 16px' }} />
        </div>
      ))}
    </div>
  );
}

function Bento() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-36">
      <Reveal><span className="eyebrow !text-[rgb(var(--wa-color-purple-50))]">รายละเอียดที่ใส่ใจ</span></Reveal>
      <h2 className="ld-title mt-5 max-w-3xl text-[clamp(1.9rem,4.6vw,3.4rem)]">
        <GenerateText words={['เรื่องเล็กๆ', 'ที่ทำให้', 'ใช้งานจริง', 'ได้ทุกวัน']} />
      </h2>

      <div className="mt-14 grid gap-4 md:grid-cols-6">
        <Reveal a="up" className="md:col-span-4">
          <Spot className="bn p-7 sm:p-9 min-h-[300px]">
            <p className="mono !text-[10px] text-[rgb(var(--wa-color-purple-50))]">ตรวจเวลาซ้อน</p>
            <h3 className="ld-title mt-3 max-w-md text-2xl sm:text-3xl">เลือกวันก่อน แล้วค่อยเห็นว่าชิ้นไหนว่าง</h3>
            <p className="mt-3 max-w-md text-sm leading-[1.9] text-[rgb(var(--wa-color-purple-05)/0.6)]">ตอนเปลี่ยนวันรับ–คืน ระบบเช็กใหม่ให้ทันที ชิ้นที่ไม่ว่างจะกดเลือกไม่ได้ พร้อมบอกเลขใบจองที่ใช้อยู่</p>
            <div className="mt-7 space-y-2.5">
              <div className="relative h-8 rounded-md bg-white/[0.05]">
                <span className="mono absolute left-[4%] top-1 flex h-6 w-[46%] items-center justify-center rounded bg-[rgb(var(--wa-color-purple-50))] !text-[9px] text-[rgb(var(--wa-color-purple-95))]">BK-2610</span>
              </div>
              <div className="relative h-8 rounded-md bg-white/[0.05]">
                <span className="mono absolute left-[38%] top-1 flex h-6 w-[40%] items-center justify-center rounded border border-dashed border-[#ee705e] bg-[#ee705e]/15 !text-[9px] text-[#f3a99d]">ซ้อนกัน — เลือกไม่ได้</span>
              </div>
            </div>
          </Spot>
        </Reveal>

        <Reveal a="up" delay={80} className="md:col-span-2">
          <Spot className="bn flex h-full min-h-[300px] flex-col justify-between p-7">
            <div>
              <p className="mono !text-[10px] text-[rgb(var(--wa-color-purple-50))]">ค่าปรับคืนช้า</p>
              <h3 className="ld-title mt-3 text-xl">คำนวณเองตามจำนวนวัน</h3>
            </div>
            <p className="font-num text-[5.4rem] leading-none text-[rgb(var(--wa-color-purple-50))]"><Counter to={300} prefix="฿" /></p>
            <p className="text-xs text-[rgb(var(--wa-color-purple-05)/0.5)]">แก้ตัวเลขได้ก่อนยืนยันเสมอ</p>
          </Spot>
        </Reveal>

        <Reveal a="up" delay={0} className="md:col-span-2">
          <Spot className="bn flex h-full min-h-[260px] flex-col justify-between p-7">
            <div>
              <p className="mono !text-[10px] text-[rgb(var(--wa-color-purple-50))]">จัดวางได้</p>
              <h3 className="ld-title mt-3 text-xl">เมนูซ้าย ขวา บน หรือ dock</h3>
            </div>
            <BentoLayouts />
          </Spot>
        </Reveal>

        <Reveal a="up" delay={80} className="md:col-span-2">
          <Spot className="bn flex h-full min-h-[260px] flex-col justify-between p-7">
            <div>
              <p className="mono !text-[10px] text-[rgb(var(--wa-color-purple-50))]">ทุกหน้าจอ</p>
              <h3 className="ld-title mt-3 text-xl">มือถือ แท็บเล็ต คอมพิวเตอร์</h3>
            </div>
            <div className="flex items-end gap-4 text-[rgb(var(--wa-color-purple-05)/0.7)]">
              <Smartphone size={34} strokeWidth={1} /><Tablet size={52} strokeWidth={1} /><Monitor size={78} strokeWidth={1} />
            </div>
          </Spot>
        </Reveal>

        <Reveal a="up" delay={160} className="md:col-span-2">
          <Spot className="bn flex h-full min-h-[260px] flex-col justify-between p-7">
            <div>
              <p className="mono !text-[10px] text-[rgb(var(--wa-color-purple-50))]">ส่งออก</p>
              <h3 className="ld-title mt-3 text-xl">ประวัติและบัญชีเป็นไฟล์ CSV</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">{[70, 52, 84, 40].map((w) => <i key={w} className="block h-1.5 rounded bg-white/15" style={{ width: w }} />)}</div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgb(var(--wa-color-purple-50)/0.6)] text-[rgb(var(--wa-color-purple-50))]"><Download size={19} strokeWidth={1.4} /></span>
            </div>
          </Spot>
        </Reveal>
      </div>
    </section>
  );
}

function DeviceShowcase() {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
    el.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 8}deg`);
  };
  const reset = () => {
    ref.current?.style.setProperty('--ry', '0deg');
    ref.current?.style.setProperty('--rx', '0deg');
  };
  const bars = [40, 62, 48, 80, 58, 92];
  const Mini = ({ cols = 3 }) => (
    <div className="flex h-full flex-col gap-1.5 p-2">
      <div className="flex gap-1.5">
        {Array.from({ length: cols }).map((_, i) => <div key={i} className="h-5 flex-1 rounded bg-[rgb(var(--wa-color-purple-50)/0.2)]" />)}
      </div>
      <div className="flex flex-1 items-end gap-1 rounded bg-white/[0.04] p-1.5">
        {bars.map((h, i) => <div key={i} className="flex-1 origin-bottom rounded-sm bg-[rgb(var(--wa-color-purple-50)/0.7)]" style={{ height: `${h}%`, animation: 'growY 1.2s var(--ease) both', animationDelay: `${i * 100}ms` }} />)}
      </div>
      <div className="space-y-1">{[70, 55, 82].map((w) => <div key={w} className="h-1.5 rounded bg-white/10" style={{ width: `${w}%` }} />)}</div>
    </div>
  );
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={reset} className="relative mx-auto mt-16 flex h-[340px] w-full max-w-5xl items-end justify-center sm:h-[460px]" style={{ perspective: '1400px' }}>
      <div className="absolute bottom-0 left-1/2 w-[78%] max-w-[640px] rounded-2xl border border-white/15 bg-[rgb(var(--wa-color-purple-90))] p-2 shadow-2xl transition-transform duration-500 sm:p-3" style={{ transform: 'translateX(-50%) rotateY(var(--ry,0deg)) rotateX(var(--rx,0deg))' }}>
        <div className="flex aspect-[16/10] overflow-hidden rounded-lg bg-[rgb(var(--wa-color-purple-95))]">
          <div className="w-[16%] space-y-1.5 border-r border-white/10 p-2">
            {Array.from({ length: 7 }).map((_, i) => <div key={i} className={`h-2 rounded ${i === 1 ? 'bg-[rgb(var(--wa-color-purple-50)/0.7)]' : 'bg-white/10'}`} />)}
          </div>
          <div className="flex-1"><Mini cols={4} /></div>
        </div>
      </div>
      <div className="absolute bottom-0 left-[2%] hidden w-[30%] rounded-[1.4rem] border border-white/15 bg-[rgb(var(--wa-color-purple-90))] p-1.5 shadow-2xl transition-transform duration-500 sm:block" style={{ transform: 'translateZ(60px) rotateY(calc(var(--ry,0deg) * 1.6 + 8deg)) rotateX(var(--rx,0deg))' }}>
        <div className="aspect-[3/4] overflow-hidden rounded-[1.1rem] bg-[rgb(var(--wa-color-purple-95))]"><Mini cols={2} /></div>
      </div>
      <div className="absolute bottom-0 right-[3%] w-[24%] max-w-[170px] rounded-[1.4rem] border border-white/15 bg-[rgb(var(--wa-color-purple-90))] p-1.5 shadow-2xl transition-transform duration-500 sm:right-[4%]" style={{ transform: 'translateZ(120px) rotateY(calc(var(--ry,0deg) * 2.2 - 8deg)) rotateX(var(--rx,0deg))' }}>
        <div className="aspect-[9/17] overflow-hidden rounded-[1.1rem] bg-[rgb(var(--wa-color-purple-95))]"><Mini cols={2} /></div>
      </div>
    </div>
  );
}

/* =====================================================
   หน้า Landing
   ===================================================== */
const RULES = [
  ['เวลาเช่า', 'รับกล้องเวลาไหน คืนเวลาเดียวกันของวันครบกำหนด'],
  ['รายชั่วโมง', 'เช่าได้ตั้งแต่ 2 ชั่วโมงขึ้นไป เฉพาะในพื้นที่สงขลา'],
  ['ต่างจังหวัด', 'ภาคใต้ขั้นต่ำ 2 วัน · ภาคอื่น ๆ ขั้นต่ำ 5 วัน'],
  ['การรับกล้อง', 'นัดรับที่สงขลา / เก้าเส้ง ไม่มีค่าใช้จ่าย · รถตู้ แกร๊ป ไปรษณีย์ ลูกค้าจ่ายค่าส่งทั้งไปและกลับ'],
  ['เงินประกัน', '500 บาทต่อกล้อง จ่ายวันรับกล้อง คืนให้เมื่อนำกล้องมาคืน'],
  ['จองซ้ำ', 'ระบบเตือนทันทีถ้ากล้องตัวนั้นมีคนจองช่วงเวลาเดียวกันแล้ว'],
];

function Landing({ onEnter }) {
  const skipPre = (() => {
    try { return sessionStorage.getItem('ld.pre') === '1'; } catch { return false; }
  })();
  const [showPre, setShowPre] = useState(!skipPre);
  const [ready, setReady] = useState(skipPre);

  const onPre = (phase) => {
    if (phase === true) {
      setReady(true);
      return;
    }
    setReady(true);
    setShowPre(false);
    try { sessionStorage.setItem('ld.pre', '1'); } catch { /* ไม่เป็นไร */ }
  };

  const progressRef = useRef(null);
  const navRef = useRef(null);
  const stmtRef = useRef(null);
  const hzRef = useRef(null);
  const trackRef = useRef(null);
  const hzBarRef = useRef(null);
  const itemRefs = useRef([]);
  const heroRef = useRef(null);
  const lastY = useRef(0);
  const [active, setActive] = useState(0);

  useScrollLoop(() => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const sy = window.scrollY;
    const max = document.documentElement.scrollHeight - vh;
    const clamp = (v) => Math.min(1, Math.max(0, v));

    if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? sy / max : 0})`;

    if (navRef.current) {
      const down = sy > lastY.current + 4;
      const up = sy < lastY.current - 4;
      if (sy < 140 || up) navRef.current.dataset.hide = 'false';
      else if (down) navRef.current.dataset.hide = 'true';
      lastY.current = sy;
    }

    if (stmtRef.current) {
      const r = stmtRef.current.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      const words = stmtRef.current.querySelectorAll('.ld-word');
      words.forEach((w, i) => {
        w.dataset.on = p * 1.15 > (i / words.length) * 0.92 + 0.04 ? 'true' : 'false';
      });
    }

    if (hzRef.current && trackRef.current) {
      const r = hzRef.current.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      const dist = Math.max(0, trackRef.current.scrollWidth - vw + 72);
      trackRef.current.style.transform = `translate3d(${-p * dist}px,0,0)`;
      if (hzBarRef.current) hzBarRef.current.style.transform = `scaleX(${p})`;
    }

    // feature ที่อยู่ใกล้กึ่งกลางจอที่สุด
    let best = 0;
    let bestD = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - vh * 0.5);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive((a) => (a === best ? a : best));
  });

  const onHeroMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', `${e.clientX - r.left}px`);
    el.style.setProperty('--py', `${e.clientY - r.top}px`);
  };

  const go = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    onEnter(r.left + r.width / 2, r.top + r.height / 2);
  };
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const heroLines = [['ทุกการเช่า'], ['ควรเรียบง่าย'], ['เหมือนกด', 'ชัตเตอร์']];
  let idx = 0;

  return (
    <div data-theme="light" className={`ld relative min-h-dvh overflow-x-clip ${ready ? 'ld-ready' : ''}`}>
      {showPre && <Preloader onDone={onPre} />}
      <CursorRing />
      <div ref={progressRef} className="fixed left-0 top-0 z-[90] h-[3px] w-full origin-left bg-[rgb(var(--wa-color-purple-50))]" style={{ transform: 'scaleX(0)' }} />

      {/* NAV — ลอย ซ่อนตอนเลื่อนลง */}
      <header ref={navRef} data-hide="false" className="ld-nav safe-t">
        <span className="flex items-center gap-2.5 pr-3">
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-[9px] bg-[rgb(var(--wa-color-purple-60))] text-white"><ShopMark size={17} className="rounded-[9px]" /></span>
          <span className="font-display text-[1.3rem] font-semibold tracking-tight">{SHOP.name}</span>
        </span>
        <span className="hidden items-center md:flex">
          {[['features', 'ฟีเจอร์'], ['flow', 'ขั้นตอน'], ['devices', 'ทุกอุปกรณ์']].map(([id, label]) => (
            <button key={id} className="l" onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </span>
        <button onClick={go} data-cursor="เข้าระบบ" className="ml-1 flex whitespace-nowrap items-center gap-2 rounded-full bg-[rgb(var(--wa-color-purple-60))] px-4 py-2 text-[0.82rem] font-medium text-white transition-transform hover:scale-[1.04]">
          เข้าสู่ระบบ <ArrowRight size={15} />
        </button>
      </header>

      {/* HERO */}
      <section ref={heroRef} onPointerMove={onHeroMove} className="ld-grain relative flex min-h-dvh items-center overflow-hidden">
        <SpotlightBeam />
        <div className="dotgrid" />
        <Beams className="opacity-60" />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(520px circle at var(--px,70%) var(--py,30%), rgb(157 115 250 / 0.1), transparent 60%)' }} />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-8">
          <div>
            <p className="eyebrow ld-fade !text-[rgb(var(--wa-color-purple-50))]" style={{ '--i': 0 }}>ระบบจัดการร้านเช่ากล้อง</p>
            <h1 className="ld-title mt-7 text-[clamp(2.7rem,8.2vw,6.8rem)]">
              {heroLines.map((line, li) => (
                <span key={li} className="block">
                  {line.map((word) => {
                    const i = idx++;
                    return (
                      <span key={word} className="ld-mask mr-[0.22em]">
                        <span className={li === 2 ? 'ld-purple' : ''} style={{ '--i': i }}>{word}</span>
                      </span>
                    );
                  })}
                </span>
              ))}
            </h1>
            <p className="ld-fade mt-8 max-w-xl text-base leading-[1.95] text-[rgb(var(--wa-color-purple-05)/0.65)] sm:text-lg" style={{ '--i': 6 }}>
              เก็บเรื่องอุปกรณ์ ใบจอง นัดรับ–คืน และรายรับรายจ่ายไว้ที่เดียว
              ทำมาให้ร้านที่มีคนดูแลคนเดียว เปิดจากมือถือหน้างานก็ได้
            </p>
            <div className="ld-fade mt-10 flex flex-wrap items-center gap-4" style={{ '--i': 8 }}>
              <Magnetic>
                <span className="mb">
                  <button onClick={go} data-cursor="เข้าระบบ" className="ld-btn ld-btn-purple">เข้าใช้งานระบบ <ArrowRight size={18} /></button>
                </span>
              </Magnetic>
              <button onClick={() => scrollTo('statement')} className="ld-btn ld-btn-line">ดูว่าทำอะไรได้ <ArrowDown size={17} /></button>
            </div>
            <div className="ld-fade mt-12 flex items-center gap-4 text-[rgb(var(--wa-color-purple-05)/0.5)]" style={{ '--i': 10 }}>
              <span className="h-px w-10 bg-[rgb(var(--wa-color-purple-05)/0.25)]" />
              <ExifTicker />
            </div>
          </div>

          <div className="ld-fade mx-auto w-full max-w-[420px] lg:max-w-none" style={{ '--i': 5 }}>
            <HeroFinder />
          </div>
        </div>

        <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex">
          <span className="mono !text-[9px] !tracking-[0.3em] text-[rgb(var(--wa-color-purple-05)/0.4)]">Scroll</span>
          <span className="h-10 w-px overflow-hidden bg-[rgb(var(--wa-color-purple-05)/0.2)]"><span className="block h-4 w-px bg-[rgb(var(--wa-color-purple-50))]" style={{ animation: 'floaty 1.8s ease-in-out infinite' }} /></span>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-[rgb(var(--wa-color-purple-05)/0.1)] py-6">
        <div className="ld-marquee">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {MARQUEE.map((w) => (
                <span key={w + k} className="flex items-center">
                  <span className="ld-title px-8 text-[clamp(2rem,5vw,3.6rem)] text-transparent" style={{ WebkitTextStroke: '1px rgb(239 232 218 / 0.38)' }}>{w}</span>
                  <Aperture size={22} className="text-[rgb(var(--wa-color-purple-50))]" strokeWidth={1.3} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* STATEMENT */}
      <section id="statement" ref={stmtRef} className="relative h-[240vh]">
        <div className="sticky top-0 flex h-dvh items-center">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <span className="eyebrow !text-[rgb(var(--wa-color-purple-50))]">แนวคิด</span>
            <p className="ld-title mt-8 text-[clamp(1.9rem,5.4vw,4rem)] leading-[1.3]">
              {STATEMENT.map((w, i) => <span key={i} className="ld-word mr-[0.28em] inline-block" data-on="false">{w}</span>)}
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES — sticky scroll reveal */}
      <section id="features" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-32">
        <Reveal><span className="eyebrow !text-[rgb(var(--wa-color-purple-50))]">ฟีเจอร์</span></Reveal>
        <h2 className="ld-title mt-5 max-w-2xl text-[clamp(1.9rem,4.6vw,3.4rem)] lg:ml-16">
          <GenerateText words={['ครบทุกงาน', 'ของร้านเช่า', 'ในหน้าจอเดียว']} />
        </h2>
        <div className="mt-8 grid gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-20">
          <div>
            {FEATURES.map((f, i) => (
              <div key={f.title} ref={(el) => { itemRefs.current[i] = el; }} data-on={active === i} className="sf-item">
                <p className="font-num text-[5.5rem] leading-none text-[rgb(var(--wa-color-purple-50)/0.55)]">0{i + 1}</p>
                <h3 className="ld-title mt-4 text-[clamp(1.5rem,3vw,2.2rem)]">{f.title}</h3>
                <p className="mt-4 max-w-md text-base leading-[1.95] text-[rgb(var(--wa-color-purple-05)/0.6)]">{f.text}</p>
                <div className="relative mt-8 h-[300px] lg:hidden">
                  <div className="sf-vis" data-on="true"><f.Vis /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="relative hidden lg:block">
            <div className="sticky top-[13vh] h-[min(68vh,540px)]">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="sf-vis" data-on={active === i}><f.Vis /></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Bento />

      {/* FLOW — เลื่อนลงแล้วการ์ดไหลไปทางขวา */}
      <section id="flow" ref={hzRef} className="relative h-[330vh]">
        <div className="sticky top-0 flex h-dvh flex-col justify-center overflow-hidden">
          <div className="mx-auto mb-10 w-full max-w-7xl px-5 sm:px-8">
            <span className="eyebrow !text-[rgb(var(--wa-color-purple-50))]">ขั้นตอน</span>
            <h2 className="ld-title mt-5 max-w-2xl text-[clamp(1.9rem,4.6vw,3.4rem)]">
              จากอุปกรณ์หนึ่งชิ้น <span className="ld-purple">ถึงรายรับหนึ่งรายการ</span>
            </h2>
          </div>
          <div ref={trackRef} className="hz-track pl-5 sm:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
            {STEPS.map((s) => (
              <article key={s.no} className="hz-card">
                <p className="hz-no">{s.no}</p>
                <div>
                  <h3 className="font-serif text-2xl font-medium">{s.title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-[1.9] text-[rgb(var(--wa-color-purple-05)/0.6)] sm:text-base">{s.text}</p>
                </div>
              </article>
            ))}
            <div className="w-6 shrink-0 sm:w-24" />
          </div>
          <div className="mx-auto mt-10 h-px w-[calc(100%-2.5rem)] max-w-7xl bg-[rgb(var(--wa-color-purple-05)/0.15)] sm:w-[calc(100%-4rem)]">
            <div ref={hzBarRef} className="h-full origin-left bg-[rgb(var(--wa-color-purple-50))]" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>
      </section>

      {/* DEVICES */}
      <section id="devices" className="relative overflow-hidden border-t border-[rgb(var(--wa-color-purple-05)/0.1)] px-5 py-24 sm:px-8 md:py-36">
        <div className="mx-auto max-w-5xl">
          <Reveal><span className="eyebrow !text-[rgb(var(--wa-color-purple-50))]">ใช้ได้ทุกจอ</span></Reveal>
          <Reveal a="zoom"><h2 className="ld-title mt-5 max-w-3xl text-[clamp(1.9rem,4.6vw,3.4rem)]">ที่ร้าน ระหว่างทาง หรือบนโซฟา<br /><span className="ld-purple">ก็จัดการได้เหมือนกัน</span></h2></Reveal>
          <Reveal a="rotate" delay={200}><DeviceShowcase /></Reveal>
        </div>
      </section>

      {/* กติกาการเช่า — ข้อมูลจริงของร้าน */}
      <section className="border-y border-[rgb(var(--wa-color-purple-05)/0.1)] px-5 py-16 sm:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] md:gap-16">
          <div>
            <span className="eyebrow !text-[rgb(var(--wa-color-purple-50))]">กติกาการเช่า</span>
            <h2 className="ld-title mt-5 text-[clamp(1.7rem,3.8vw,2.7rem)]">สิ่งที่ระบบเช็กให้<br />ทุกครั้งที่จอง</h2>
          </div>
          <dl className="divide-y divide-[rgb(var(--wa-color-purple-05)/0.1)] border-y border-[rgb(var(--wa-color-purple-05)/0.1)]">
            {RULES.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="text-sm text-[rgb(var(--wa-color-purple-05)/0.45)]">{k}</dt>
                <dd className="text-[rgb(var(--wa-color-purple-05)/0.85)]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA — Lamp */}
      <section className="relative overflow-hidden px-5 pb-28 pt-12 sm:px-8 md:pb-40">
        <Beams className="opacity-40" />
        <Lamp className="min-h-[560px] pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="ld-title text-[clamp(2.4rem,8vw,6rem)]">
              <GenerateText words={['พร้อมเปิด', 'ชัตเตอร์', 'แล้วหรือยัง']} step={140} />
            </h2>
            <p className="mx-auto mt-6 max-w-md text-[rgb(var(--wa-color-purple-05)/0.55)]">เข้าระบบแล้วเพิ่มกล้องตัวแรกได้เลย</p>
            <div className="mt-12">
              <Magnetic>
                <span className="mb">
                  <button onClick={go} data-cursor="เข้าระบบ" className="ld-btn ld-btn-purple !min-h-[66px] !px-11 text-lg">
                    เข้าสู่ระบบ <ArrowRight size={19} />
                  </button>
                </span>
              </Magnetic>
            </div>
          </div>
        </Lamp>
      </section>

      <footer className="border-t border-[rgb(var(--wa-color-purple-05)/0.1)] px-5 py-10 text-center">
        <p className="mono !text-[10px] text-[rgb(var(--wa-color-purple-05)/0.4)]">{SHOP.name} — ระบบจัดการร้านเช่ากล้อง</p>
      </footer>
    </div>
  );
}

/* ═════ pages/Dashboard.jsx ═════ */
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'อรุณสวัสดิ์';
  if (h < 17) return 'สวัสดีตอนบ่าย';
  return 'สวัสดีตอนเย็น';
};

function Panel({ no, title, caption, action, children, className = '', index = 0 }) {
  return (
    <Spot as="section" className={`card vf card-pad anim-i ${className}`} style={{ '--i': index }}>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="mono-l">{no}</p>
          <h2 className="mt-1.5 font-serif text-[1.15rem] font-medium">{title}</h2>
          {caption && <p className="mt-0.5 text-xs text-mute">{caption}</p>}
        </div>
        {action}
      </header>
      {children}
    </Spot>
  );
}

function Dashboard() {
  const {
    equipments, dashboard, report, openBooking, navigate, openDetail,
  } = useApp();
  const { settings } = useSettings();

  const counts = useMemo(() => {
    const by = dashboard.statusCounts || {};
    const pick = (k) =>
      by[k] !== undefined ? Number(by[k]) : equipments.filter((e) => e.status === k).length;
    return {
      available: pick('available'),
      rented: pick('rented') + pick('booked'),
      maintenance: pick('maintenance'),
      total: equipments.length,
    };
  }, [dashboard.statusCounts, equipments]);

  const overdue = dashboard.overdueBookings || [];
  const now = new Date();

  const today = useMemo(() => {
    const rows = [];
    (dashboard.todayBookings || []).forEach((b) => {
      const s = parseDate(b.start_date);
      const e = parseDate(b.end_date);
      if (s && sameDay(s, now) && ['pending', 'confirmed'].includes(b.status)) rows.push({ kind: 'pickup', at: s, b });
      if (e && sameDay(e, now) && b.status === 'picked_up') rows.push({ kind: 'return', at: e, b });
    });
    return rows.sort((a, b) => a.at - b.at);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard.todayBookings]);

  const months = useMemo(() => {
    const map = new Map((report?.monthly || []).map((m) => [m.month, m]));
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (11 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const hit = map.get(key);
      return { label: MONTHS_SHORT[d.getMonth()], income: hit?.income || 0, expense: hit?.expense || 0 };
    });
  }, [report]);

  const usable = Math.max(1, counts.total - counts.maintenance);
  const usage = Math.min(100, Math.round((counts.rented / usable) * 100));
  const top = report?.topEquipment || [];
  const topMax = Math.max(1, ...top.map((t) => t.rental_count));

  const readout = [
    { k: 'พร้อมใช้งาน', v: counts.available, tone: 'bg-ok', go: 'equipments' },
    { k: 'อยู่กับลูกค้า', v: counts.rented, tone: 'bg-info', go: 'operations' },
    { k: 'ซ่อมบำรุง', v: counts.maintenance, tone: 'bg-warn', go: 'maintenance' },
    { k: 'เกินกำหนดคืน', v: overdue.length, tone: 'bg-bad', go: 'operations' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-12">
        {/* HERO — ห้องมืด */}
        <section className="anim-i relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-[26px] border border-white/[0.07] bg-side text-side-ink shadow-[0_40px_90px_-40px_rgb(0_0_0/0.8)] xl:col-span-8">
          <span className="bokeh" style={{ width: 190, height: 190, right: '8%', top: '-6%', animationDuration: '17s' }} />
          <span className="bokeh" style={{ width: 96, height: 96, right: '30%', top: '22%', animationDuration: '12s', animationDelay: '-4s', opacity: 0.7 }} />
          <span className="bokeh" style={{ width: 130, height: 130, right: '-3%', top: '46%', animationDuration: '15s', animationDelay: '-8s', opacity: 0.55 }} />
          <Aperture
            size={380}
            strokeWidth={0.5}
            className="pointer-events-none absolute -bottom-32 right-[-60px] text-white/[0.06]"
            style={{ animation: 'spinSlow 80s linear infinite' }}
          />

          <div className="relative p-6 sm:p-9">
            <div className="mono flex items-center justify-between gap-3 !text-[10px] text-side-mute">
              <span className="flex items-center gap-2">
                <i className="live-dot h-1.5 w-1.5 rounded-full bg-[#e5654d]" /> {settings.shopName} · Live
              </span>
              <span className="hidden sm:inline">{fmtLongDate()}</span>
            </div>
            <h1 className="mt-9 max-w-2xl font-serif text-[1.95rem] font-medium leading-[1.14] sm:text-[3rem]">
              {greeting()}
              <br />
              วันนี้มี{' '}
              <span className="font-num text-[1.3em] font-medium text-[rgb(var(--wa-color-purple-50))]">
                <CountUp value={today.length} />
              </span>{' '}
              งานที่ต้องดูแล
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-side-mute">
              {overdue.length > 0
                ? `มี ${overdue.length} รายการที่เลยกำหนดคืนแล้ว ควรติดตามเป็นลำดับแรก`
                : 'ไม่มีรายการเลยกำหนดคืน ทุกอย่างเป็นไปตามแผน'}
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <button onClick={() => openBooking([])} className="btn btn-primary">
                <Plus size={17} /> สร้างการจองใหม่
              </button>
              <button onClick={() => navigate('operations')} className="btn border-white/20 text-side-ink hover:bg-white/10">
                ไปหน้ารับ–คืน <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="readout relative grid grid-cols-4 border-t border-white/10 bg-black/20">
            {readout.map((r) => (
              <button key={r.k} onClick={() => navigate(r.go)} className="group p-4 text-left transition-colors hover:bg-white/[0.05] sm:p-5">
                <p className="mono flex items-center gap-2 !text-[9.5px] !tracking-[0.18em] text-side-mute">
                  <i className={`h-1.5 w-1.5 rounded-full ${r.tone}`} />
                  {r.k}
                </p>
                <p className="font-num mt-2 text-[2.7rem] font-medium leading-none transition-transform duration-500 group-hover:translate-x-1 sm:text-[3.2rem]">
                  <CountUp value={r.v} />
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* ติดตาม */}
        <Spot as="section" className="card vf card-pad anim-i flex flex-col xl:col-span-4" style={{ '--i': 1 }}>
          {overdue.length > 0 ? (
            <>
              <p className="mono-l !text-bad">ต้องติดตาม</p>
              <p className="font-num mt-2 text-[4.2rem] font-medium leading-none text-bad">
                <CountUp value={overdue.length} />
              </p>
              <p className="mt-1 font-serif text-lg">รายการเลยกำหนดคืน</p>
              <ul className="mt-5 space-y-2">
                {overdue.slice(0, 4).map((b) => (
                  <li key={b.id}>
                    <button
                      onClick={() => openDetail(b.id)}
                      className="flex w-full items-center justify-between gap-3 rounded-[10px] border border-bad/25 bg-bad/[0.07] px-3.5 py-3 text-left text-sm transition hover:translate-x-1 hover:bg-bad/[0.12]"
                    >
                      <span className="min-w-0 truncate">
                        <b className="font-medium">{b.customer_name}</b>
                        <span className="text-mute"> · {equipmentTitle(b)}</span>
                      </span>
                      <span className="mono shrink-0 !text-[10px] text-bad">{relativeTo(b.end_date)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-ok/40 text-ok">
                <i className="absolute inset-0 rounded-full border border-ok/30" style={{ animation: 'pulseRing 3s ease-out infinite' }} />
                <Check size={38} strokeWidth={1.3} />
              </span>
              <p className="mt-6 font-serif text-xl">เรียบร้อยดี</p>
              <p className="mt-1.5 max-w-[16rem] text-sm leading-relaxed text-mute">ไม่มีอุปกรณ์เลยกำหนดคืน ณ ตอนนี้</p>
            </div>
          )}
        </Spot>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <Panel
          index={2}
          no="№ 01 · รายรับ–รายจ่าย"
          title="12 เดือนล่าสุด"
          className="xl:col-span-7"
          action={
            <button onClick={() => navigate('finance')} className="btn btn-ghost btn-sm">
              รายละเอียด <ArrowRight size={14} />
            </button>
          }
        >
          <div className="mb-6 flex flex-wrap items-end gap-x-9 gap-y-2">
            <div>
              <p className="mono-l">รายรับเดือนนี้</p>
              <p className="font-num mt-1 text-[3.4rem] font-medium leading-none text-accent">
                <CountUp value={dashboard.monthIncome} prefix="฿" />
              </p>
            </div>
            <div>
              <p className="mono-l">รายจ่ายเดือนนี้</p>
              <p className="font-num mt-1 text-[2rem] leading-none text-mute">{baht(dashboard.monthExpense)}</p>
            </div>
            <div className="mono ml-auto flex items-center gap-4 !text-[10px] text-mute">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 bg-accent" />รายรับ</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 bg-ink/25" />รายจ่าย</span>
            </div>
          </div>
          <BarChart data={months} />
        </Panel>

        <Panel index={3} no="№ 02 · อัตราการใช้งาน" title="เปอร์เซ็นการใช้งาน" caption="ยิ่งแสงติดมาก อุปกรณ์ยิ่งถูกใช้เยอะ" className="xl:col-span-5">
          <div className="flex flex-col items-center gap-7 sm:flex-row sm:justify-around xl:flex-col 2xl:flex-row">
            <ApertureGauge value={usage} hot={usage > 85}>
              <span className="font-num text-[3.6rem] font-medium leading-none">{usage}<span className="text-2xl text-mute">%</span></span>
              <span className="mono mt-1 !text-[9px] text-mute">กำลังถูกใช้งาน</span>
            </ApertureGauge>
            <ul className="w-full max-w-[15rem] space-y-3.5 text-sm">
              {[
                ['bg-ok', 'พร้อมใช้งาน', counts.available],
                ['bg-info', 'กำลังถูกเช่า', counts.rented],
                ['bg-warn', 'ซ่อมบำรุง', counts.maintenance],
              ].map(([tone, label, value]) => (
                <li key={label} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-mute"><i className={`h-2 w-2 rounded-full ${tone}`} />{label}</span>
                  <b className="font-num text-xl font-medium">{value}</b>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 border-t border-dashed border-line pt-3.5">
                <span className="text-mute">มัดจำที่ถือไว้</span>
                <b className="font-medium">{baht(dashboard.depositHolding)}</b>
              </li>
            </ul>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Panel index={4} no="№ 03 · วันนี้" title="กำหนดการวันนี้" caption="รับ–คืนอุปกรณ์ที่ถึงเวลา">
          {today.length === 0 ? (
            <EmptyState icon={CalendarClock} title="วันนี้ยังไม่มีรายการ" description="รายการรับ–คืนที่ถึงกำหนดจะแสดงที่นี่" />
          ) : (
            <ul className="stagger divide-y divide-line/70">
              {today.map(({ kind, at, b }, i) => (
                <li key={`${b.id}-${kind}`} style={{ '--i': i }}>
                  <button onClick={() => openDetail(b.id)} className="group flex w-full items-center gap-3.5 py-3 text-left">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-hover:scale-110 ${kind === 'pickup' ? 'border-warn/40 text-warn' : 'border-info/40 text-info'}`}>
                      {kind === 'pickup' ? <LogOut size={17} /> : <LogIn size={17} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{b.customer_name}</span>
                      <span className="block truncate text-xs text-mute">{equipmentTitle(b)}</span>
                    </span>
                    <span className="text-right">
                      <span className="font-num block text-xl leading-none">{fmtTime(at)}</span>
                      <span className="mono mt-1 block !text-[9px] text-mute">{kind === 'pickup' ? 'มารับ' : 'มาคืน'}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel index={5} no="№ 04 · 7 วันข้างหน้า" title="กำลังจะมาถึง" caption="การจองที่ยังไม่ได้ส่งมอบ">
          {(dashboard.upcomingBookings || []).length === 0 ? (
            <EmptyState icon={CalendarClock} title="ยังไม่มีการจองใหม่" description="ยังไม่มีใบจองที่รอรับกล้อง" />
          ) : (
            <ul className="stagger divide-y divide-line/70">
              {dashboard.upcomingBookings.map((b, i) => (
                <li key={b.id} style={{ '--i': i }}>
                  <button onClick={() => openDetail(b.id)} className="group flex w-full items-center gap-3.5 py-3 text-left">
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[10px] border border-line leading-none transition-colors group-hover:border-accent/60">
                      <span className="font-num text-xl">{parseDate(b.start_date)?.getDate()}</span>
                      <span className="mono mt-0.5 !text-[8px] text-mute">{MONTHS_SHORT[parseDate(b.start_date)?.getMonth()]}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{b.customer_name}</span>
                      <span className="block truncate text-xs text-mute">{equipmentTitle(b)}</span>
                    </span>
                    <span className="mono !text-[10px] text-mute">{fmtTime(b.start_date)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel index={6} no="№ 05 · ยอดนิยม" title="เช่าบ่อยที่สุด" caption="นับจากรายการที่รับคืนแล้ว (ตรงกับรายรับ)" className="lg:col-span-2 xl:col-span-1">
          {top.length === 0 ? (
            <EmptyState title="ยังไม่มีข้อมูล" description="ยังไม่มีการรับ–คืนกล้อง" />
          ) : (
            <ul className="space-y-4">
              {top.map((t, i) => {
                const equipment = equipments.find((e) => String(e.id) === String(t.id)) || t;
                return (
                <li key={t.id} className="flex items-center gap-3.5">
                  <span className="font-num w-5 text-2xl text-mute/50">{i + 1}</span>
                  <EquipmentPhoto item={equipment} className="h-12 w-12 shrink-0 rounded-[10px]" iconSize={18} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-surface2">
                      <div
                        className="h-full origin-left rounded-full bg-accent"
                        style={{ width: `${(t.rental_count / topMax) * 100}%`, animation: 'growX 1.1s var(--ease) both', animationDelay: `${i * 100}ms` }}
                      />
                    </div>
                    <p className="mono mt-1.5 !text-[9.5px] text-mute">{t.rental_count} ครั้ง · {baht(t.revenue)}</p>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ═════ pages/Bookings.jsx ═════ */
function Bookings() {
  const { bookings, openBooking } = useApp();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('active');

  const rows = useMemo(
    () => bookings.map((b) => ({ ...b, _status: effectiveStatus(b) })),
    [bookings]
  );

  const counts = useMemo(() => {
    const c = { all: rows.length, active: 0, confirmed: 0, picked_up: 0, overdue: 0, returned: 0, cancelled: 0 };
    rows.forEach((b) => {
      if (['pending', 'confirmed', 'picked_up'].includes(b.status)) c.active += 1;
      if (['pending', 'confirmed'].includes(b.status)) c.confirmed += 1;
      if (b.status === 'picked_up') c.picked_up += 1;
      if (b._status === 'overdue') c.overdue += 1;
      if (b.status === 'returned') c.returned += 1;
      if (b.status === 'cancelled') c.cancelled += 1;
    });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter((b) => {
      const okStatus =
        filter === 'all' ||
        (filter === 'active' && ['pending', 'confirmed', 'picked_up'].includes(b.status)) ||
        (filter === 'confirmed' && ['pending', 'confirmed'].includes(b.status)) ||
        (filter === 'overdue' ? b._status === 'overdue' : b.status === filter);
      const okText =
        !term ||
        [b.booking_no, b.customer_name, b.phone, b.equipment_names].some((v) =>
          String(v || '').toLowerCase().includes(term)
        );
      return okStatus && okText;
    });
  }, [rows, q, filter]);

  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="รายการจอง"
        description="ตรวจสอบช่วงเวลา ผู้เช่า และสถานะ แตะที่รายการเพื่อดูรายละเอียดและตรวจสภาพ"
        actions={
          <button onClick={() => openBooking([])} className="btn btn-primary">
            <Plus size={17} /> สร้างการจอง
          </button>
        }
      />

      <div className="mb-5 space-y-3">
        <SearchBox value={q} onChange={setQ} placeholder="ค้นหาเลขจอง ชื่อลูกค้า เบอร์โทร หรืออุปกรณ์..." />
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'active', label: 'ที่ยังดำเนินอยู่', count: counts.active },
            { value: 'confirmed', label: 'รอรับอุปกรณ์', count: counts.confirmed },
            { value: 'picked_up', label: 'อยู่กับลูกค้า', count: counts.picked_up },
            { value: 'overdue', label: 'เกินกำหนด', count: counts.overdue },
            { value: 'returned', label: 'คืนแล้ว', count: counts.returned },
            { value: 'cancelled', label: 'ยกเลิก', count: counts.cancelled },
            { value: 'all', label: 'ทั้งหมด', count: counts.all },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="ไม่พบรายการจอง"
          description="ลองเปลี่ยนตัวกรอง หรือสร้างการจองใหม่"
          action={<button onClick={() => openBooking([])} className="btn btn-primary"><Plus size={16} /> สร้างการจอง</button>}
        />
      ) : (
        <BookingList rows={filtered} />
      )}
    </>
  );
}

/* ═════ pages/Operations.jsx ═════ */
function Operations() {
  const { bookings, refresh, openDetail } = useApp();
  const [tab, setTab] = useState('out');

  const { waiting, out, overdue } = useMemo(() => {
    // เรียงตามลำดับที่สร้างการจอง: รายการเก่าก่อน รายการใหม่ทีหลัง
    const byBookingOrder = (a, b) => Number(a.id || 0) - Number(b.id || 0);
    const waiting = bookings.filter((b) => ['pending', 'confirmed'].includes(b.status)).sort(byBookingOrder);
    const out = bookings.filter((b) => b.status === 'picked_up').sort(byBookingOrder);
    return { waiting, out, overdue: out.filter((b) => effectiveStatus(b) === 'overdue') };
  }, [bookings]);

  const rows = tab === 'wait' ? waiting : out;

  return (
    <>
      <PageHeader
        eyebrow="Handover"
        title="รับ–คืนอุปกรณ์"
        description="บันทึกการส่งมอบพร้อมเช็กลิสต์ และรับคืนพร้อมคำนวณค่าปรับอัตโนมัติ"
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat index={0} label="รอส่งมอบ" value={waiting.length} caption="ยืนยันแล้ว รอลูกค้ามารับ" icon={CalendarClock} tone="warn" onClick={() => setTab('wait')} />
        <Stat index={1} label="อยู่กับลูกค้า" value={out.length} caption="ต้องติดตามการคืน" icon={Camera} tone="info" onClick={() => setTab('out')} />
        <Stat index={2} label="เกินกำหนดคืน" value={overdue.length} caption="ติดตามเป็นลำดับแรก" icon={AlertTriangle} tone={overdue.length ? 'bad' : 'ok'} onClick={() => setTab('out')} />
      </div>

      <Segmented
        className="mb-5"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'out', label: 'รอรับคืน', count: out.length },
          { value: 'wait', label: 'รอส่งมอบ', count: waiting.length },
        ]}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={tab === 'out' ? 'ไม่มีอุปกรณ์ที่รอรับคืน' : 'ไม่มีรายการรอส่งมอบ'}
          description="รายการจองที่ถึงขั้นตอนนี้จะแสดงที่นี่"
        />
      ) : (
        <div className="stagger grid gap-4 xl:grid-cols-2">
          {rows.map((b, i) => {
            const status = effectiveStatus(b);
            const isOut = b.status === 'picked_up';
            const target = isOut ? b.end_date : b.start_date;
            return (
              <article
                key={b.id}
                style={{ '--i': Math.min(i, 8) }}
                className={`card card-pad card-hover relative overflow-hidden ${status === 'overdue' ? '!border-bad/40' : ''}`}
              >
                {status === 'overdue' && <span className="absolute inset-y-0 left-0 w-1 bg-bad" />}
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => openDetail(b.id)} className="min-w-0 text-left">
                    <p className="font-mono text-[11px] font-semibold text-accent">{b.booking_no}</p>
                    <p className="mt-1 truncate font-serif text-lg font-semibold">{b.customer_name}</p>
                    <a
                      href={`tel:${b.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-mute hover:text-accent"
                    >
                      <Phone size={12} /> {b.phone}
                    </a>
                  </button>
                  <StatusBadge status={status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {equipmentNamesOf(b).map((n) => (
                    <span key={n} className="rounded-full bg-surface2 px-2.5 py-1 text-[11px]">{n}</span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-surface2/60 px-4 py-3">
                  <div>
                    <p className="text-[11px] text-mute">{isOut ? 'กำหนดคืน' : 'นัดรับอุปกรณ์'}</p>
                    <p className="text-sm font-medium">{fmtDateTime(target)}</p>
                  </div>
                  <p className={`flex items-center gap-1.5 text-sm font-semibold ${status === 'overdue' ? 'text-bad' : 'text-accent'}`}>
                    <Clock3 size={15} /> {relativeTo(target)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-mute">
                    ยอด <b className="font-num text-base text-ink">{baht(b.net_total)}</b>
                    {Number(b.deposit) > 0 && <> · มัดจำ {baht(b.deposit)}</>}
                  </p>
                  <button onClick={() => (isOut ? returnFlow(b, refresh) : checkoutFlow(b, refresh))} className="btn btn-primary">
                    {isOut ? <><LogIn size={16} /> รับคืน</> : <><LogOut size={16} /> ส่งมอบ</>}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ═════ pages/CalendarPage.jsx ═════ */
const PILL = {
  confirmed: 'bg-warn/15 text-warn',
  pending: 'bg-warn/15 text-warn',
  picked_up: 'bg-info/15 text-info',
  overdue: 'bg-bad/15 text-bad',
  returned: 'bg-ok/15 text-ok',
};
const DOT = {
  confirmed: 'bg-warn', pending: 'bg-warn', picked_up: 'bg-info', overdue: 'bg-bad', returned: 'bg-ok',
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function CalendarPage() {
  const { bookings, openDetail, openBooking } = useApp();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(startOfDay(today));

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = first.getDay();
    return Array.from({ length: 42 }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), 1 - offset + i));
  }, [cursor]);

  // จัดกลุ่มการจองตามวัน (ข้ามรายการที่ยกเลิก)
  const byDay = useMemo(() => {
    const map = new Map();
    const gridStart = startOfDay(cells[0]);
    const gridEnd = startOfDay(cells[41]);
    bookings
      .filter((b) => b.status !== 'cancelled')
      .forEach((b) => {
        const s = parseDate(b.start_date);
        const e = parseDate(b.end_date);
        if (!s || !e) return;
        let d = startOfDay(s < gridStart ? gridStart : s);
        const last = startOfDay(e > gridEnd ? gridEnd : e);
        let guard = 0;
        while (d <= last && guard++ < 70) {
          const key = d.toDateString();
          if (!map.has(key)) map.set(key, []);
          map.get(key).push(b);
          d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
        }
      });
    return map;
  }, [bookings, cells]);

  const move = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  const dayList = byDay.get(selected.toDateString()) || [];

  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title="ปฏิทินการจอง"
        description="ดูภาพรวมการจองทั้งเดือน เลือกวันเพื่อดูรายการรับ–คืน"
        actions={
          <button onClick={() => openBooking([])} className="btn btn-primary"><Plus size={17} /> สร้างการจอง</button>
        }
      />

      <div className="calendar-layout grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="calendar-month-card card min-w-0 overflow-hidden">
          <header className="calendar-month-header flex items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
            <h2 key={cursor.toISOString()} className="page-in font-serif text-xl font-semibold">
              {MONTHS_TH[cursor.getMonth()]} <span className="font-num text-2xl text-accent">{cursor.getFullYear() + 543}</span>
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={() => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(startOfDay(today)); }} className="btn btn-ghost btn-sm">วันนี้</button>
              <button onClick={() => move(-1)} className="icon-btn" aria-label="เดือนก่อน"><ChevronLeft size={19} /></button>
              <button onClick={() => move(1)} className="icon-btn" aria-label="เดือนถัดไป"><ChevronRight size={19} /></button>
            </div>
          </header>

          <div className="calendar-weekdays grid grid-cols-7 border-b border-line bg-surface2/50 text-center text-[11px] font-semibold text-mute">
            {DAYS_SHORT.map((d) => <div key={d} className="py-2.5">{d}</div>)}
          </div>

          <div key={cursor.toISOString()} className="calendar-days page-in grid min-w-0 grid-cols-7">
            {cells.map((d, i) => {
              const inMonth = d.getMonth() === cursor.getMonth();
              const list = byDay.get(d.toDateString()) || [];
              const isToday = sameDay(d, today);
              const isSel = sameDay(d, selected);
              return (
                <button
                  key={i}
                  onClick={() => setSelected(startOfDay(d))}
                  className={`calendar-day relative flex min-w-0 flex-col items-stretch gap-1 overflow-hidden border-b border-r border-line/70 p-1.5 text-left transition-colors ${
                    inMonth ? '' : 'bg-surface2/40 text-mute/50'
                  } ${isSel ? '!bg-accent/10 ring-2 ring-inset ring-accent' : 'hover:bg-surface2/60'}`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:h-7 sm:w-7 sm:text-sm ${isToday ? 'bg-accent text-accent-fg' : ''}`}>
                    {d.getDate()}
                  </span>
                  <span className="hidden min-h-0 min-w-0 flex-col gap-0.5 overflow-hidden sm:flex">
                    {list.slice(0, 2).map((b) => (
                      <span key={b.id} className={`block max-w-full truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${PILL[effectiveStatus(b)] || 'bg-surface2'}`}>
                        {b.customer_name}
                      </span>
                    ))}
                    {list.length > 2 && <span className="px-1 text-[10px] text-mute">+{list.length - 2} รายการ</span>}
                  </span>
                  <span className="flex flex-wrap gap-0.5 sm:hidden">
                    {list.slice(0, 4).map((b) => (
                      <i key={b.id} className={`h-1.5 w-1.5 rounded-full ${DOT[effectiveStatus(b)] || 'bg-mute'}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="calendar-day-panel card">
          <div className="calendar-panel-inner">
            <header className="calendar-selected-header">
              <div className="calendar-selected-icon" aria-hidden="true">▦</div>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">วันที่เลือก</p>
                <h3 className="calendar-selected-title">
                  {selected.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="calendar-selected-subtitle">{selected.getFullYear() + 543} · รายการรับ–คืนอุปกรณ์</p>
              </div>
              <span className="calendar-selected-count" aria-label={`${dayList.length} รายการ`}>{dayList.length}</span>
            </header>

            <div className="calendar-selected-content">
              {dayList.length === 0 ? (
                <div className="calendar-empty-day"><EmptyState title="ไม่มีรายการ" description="วันนี้อุปกรณ์ว่างทั้งหมด" /></div>
              ) : (
                <ul key={selected.toISOString()} className="calendar-selected-list stagger">
                  {dayList.map((b, i) => {
                    const s = parseDate(b.start_date);
                    const e = parseDate(b.end_date);
                    const tag = sameDay(s, selected) ? `รับ ${fmtTime(s)}` : sameDay(e, selected) ? `คืน ${fmtTime(e)}` : 'อยู่ระหว่างเช่า';
                    return (
                      <li key={b.id} style={{ '--i': i }}>
                        <button onClick={() => openDetail(b.id)} className="calendar-selected-booking w-full text-left">
                          <div className="flex min-w-0 items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{b.customer_name}</p>
                            <StatusBadge status={effectiveStatus(b)} />
                          </div>
                          <p className="calendar-selected-equipment">{equipmentTitle(b)}</p>
                          <p className="calendar-selected-time">{tag}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {dayList.length > 3 && (
              <footer className="calendar-selected-footer">
                เลื่อนเพื่อดูอีก {dayList.length} รายการ · คลิกการจองเพื่อดูรายละเอียด
              </footer>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

/* ═════ pages/Equipments.jsx ═════ */
function Equipments() {
  const { equipments, maintenance, openEquipment, openBooking, refresh } = useApp();
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [status, setStatus] = useState('all');
  const [view, setView] = useState('card');

  const counts = useMemo(() => {
    const c = { all: equipments.length };
    CATEGORIES.forEach((x) => {
      c[x.id] = equipments.filter((e) => e.category === x.id).length;
    });
    return c;
  }, [equipments]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return equipments.filter((e) => {
      const okCat = cat === 'all' || e.category === cat;
      const okStatus = status === 'all' || e.status === status;
      const okText =
        !term ||
        [e.name, e.brand, e.model, e.code, e.serial_number].some((v) =>
          String(v || '').toLowerCase().includes(term)
        );
      return okCat && okStatus && okText;
    });
  }, [equipments, q, cat, status]);

  const toggleMaintenance = async (item) => {
    if (item.status === 'maintenance') {
      const record = maintenance.find((m) => m.equipment_id === item.id && m.status === 'in_progress');
      if (record) {
        await completeMaintenanceFlow(record, refresh);
      } else {
        try {
          await api.put(`/equipments/${item.id}`, { ...item, status: 'available' });
          await refresh();
          toast('success', 'อุปกรณ์พร้อมใช้งานแล้ว');
        } catch (e) {
          showError(errMsg(e));
        }
      }
    } else if (item.status === 'rented') {
      showError('อุปกรณ์ชิ้นนี้อยู่กับลูกค้า กรุณารับคืนก่อนส่งซ่อม', 'ส่งซ่อมไม่ได้');
    } else {
      await maintenanceFlow(equipments, refresh, item.id);
    }
  };

  const maintLabel = (s) => (s === 'maintenance' ? 'ปิดงานซ่อม' : 'ส่งซ่อม');

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="กล้องและอุปกรณ์"
        description="จัดการรูปภาพ ราคาเช่า และสถานะของอุปกรณ์ทุกชิ้นในร้าน"
        actions={
          <button onClick={() => openEquipment(null)} className="btn btn-primary">
            <Plus size={17} /> เพิ่มอุปกรณ์
          </button>
        }
      />

      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchBox className="min-w-0 flex-1" value={q} onChange={setQ} placeholder="ค้นหาชื่อ ยี่ห้อ รหัส หรือ Serial..." />
          <div className="flex gap-2 sm:shrink-0">
            <select className="input min-w-0 flex-1 sm:!w-44 sm:flex-none" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">ทุกสถานะ</option>
              <option value="available">พร้อมใช้งาน</option>
              <option value="rented">กำลังถูกเช่า</option>
              <option value="maintenance">ซ่อมบำรุง</option>
            </select>
            <div className="flex shrink-0 rounded-xl border border-line bg-surface p-1">
              {[['card', LayoutGrid], ['table', List]].map(([id, Icon]) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  aria-label={id}
                  className={`flex h-9 w-10 items-center justify-center rounded-lg transition ${view === id ? 'bg-ink text-bg' : 'text-mute hover:text-ink'}`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <Segmented
          value={cat}
          onChange={setCat}
          options={[{ value: 'all', label: 'ทั้งหมด', count: counts.all }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.label, count: counts[c.id] }))]}
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="ไม่พบอุปกรณ์"
          description={equipments.length ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง' : 'เพิ่มอุปกรณ์ชิ้นแรกพร้อมรูปจากเครื่องของคุณ'}
          action={!equipments.length && <button onClick={() => openEquipment(null)} className="btn btn-primary"><Plus size={16} /> เพิ่มอุปกรณ์</button>}
        />
      ) : view === 'card' ? (
        <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {list.map((item, i) => {
            const Icon = categoryOf(item.category).icon;
            return (
              <Tilt as="article" key={item.id} max={6} style={{ '--i': Math.min(i, 12) }} className="card vf group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-accent" onClick={() => setSelectedEquipment(item)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedEquipment(item); } }} role="button" tabIndex={0} aria-label={`ดูรายละเอียด ${item.name}`}>
                <div className="relative">
                  <EquipmentPhoto item={item} className="aspect-[4/3] w-full" iconSize={40} zoom />
                  <span className="absolute left-3 top-3 rounded-lg bg-surface/90 px-2 py-1 font-mono text-[11px] font-semibold backdrop-blur">
                    {item.code}
                  </span>
                  <div className="absolute right-3 top-3"><StatusBadge status={item.status} className="!bg-surface/90 backdrop-blur" /></div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 font-serif text-[1.02rem] font-semibold leading-snug">{item.name}</h3>
                      <p className="mt-1 truncate text-xs text-mute">{[item.brand, item.model].filter(Boolean).join(' ') || '—'}</p>
                    </div>
                    <Icon size={18} className="mt-0.5 shrink-0 text-mute" strokeWidth={1.5} />
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] text-mute">ค่าเช่า / วัน</p>
                      <p className="font-num text-[1.7rem] font-semibold leading-none text-accent">{baht(item.rental_rate_per_day)}</p>
                    </div>
                    <p className="max-w-[45%] truncate font-mono text-[11px] text-mute">{item.serial_number || ''}</p>
                  </div>

                  {item.defects && (
                    <p className="mt-3 flex gap-2 rounded-xl bg-warn/10 px-3 py-2 text-xs leading-relaxed text-warn">
                      <AlertTriangle size={13} className="mt-0.5 shrink-0" /> {item.defects}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-1.5 border-t border-line pt-4">
                    <button
                      onClick={(event) => { event.stopPropagation(); openBooking([item.id]); }}
                      disabled={item.status === 'maintenance'}
                      className="btn btn-ghost btn-sm flex-1"
                    >
                      <CalendarPlus size={15} /> จอง
                    </button>
                    <button onClick={(event) => { event.stopPropagation(); toggleMaintenance(item); }} title={maintLabel(item.status)} aria-label={maintLabel(item.status)} className="icon-btn !h-9 !w-9">
                      {item.status === 'maintenance' ? <CheckCircle2 size={17} /> : <Wrench size={17} />}
                    </button>
                    <button onClick={(event) => { event.stopPropagation(); openEquipment(item); }} title="แก้ไข" aria-label="แก้ไขอุปกรณ์" className="icon-btn !h-9 !w-9 text-info hover:!bg-info/10">
                      <Pencil size={16} />
                    </button>
                    <button onClick={(event) => { event.stopPropagation(); deleteEquipmentFlow(item, refresh); }} title="ลบ" aria-label="ลบอุปกรณ์" className="icon-btn !h-9 !w-9 text-bad hover:!bg-bad/10">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Tilt>
            );
          })}
        </div>
      ) : (
        <>
        <ul className="space-y-2.5 md:hidden">
          {list.map((item) => (
            <li key={item.id} className="card flex items-center gap-3 p-2.5">
              <EquipmentPhoto item={item} className="h-14 w-14 shrink-0 rounded-xl" iconSize={18} />
              <div className="min-w-0 flex-1" onClick={() => setSelectedEquipment(item)}>
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="truncate font-mono text-[11px] text-mute">{item.code}</p>
                <div className="mt-1 flex items-center gap-2"><StatusBadge status={item.status} /><span className="text-xs text-mute">{baht(item.rental_rate_per_day)}/วัน</span></div>
              </div>
              <button onClick={() => openBooking([item.id])} disabled={item.status === 'maintenance'} className="icon-btn !h-10 !w-10" aria-label="จอง"><CalendarPlus size={17} /></button>
            </li>
          ))}
        </ul>
        <div className="card hidden overflow-hidden md:block">
          <div className="scroll-thin overflow-x-auto">
            <table className="tbl min-w-[780px]">
              <thead>
                <tr><th>อุปกรณ์</th><th>รหัส / Serial</th><th className="text-right">ค่าเช่า/วัน</th><th>สถานะ</th><th /></tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <EquipmentPhoto item={item} className="h-12 w-12 shrink-0 rounded-xl" iconSize={18} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.name}</p>
                          <p className="text-xs text-mute">{categoryOf(item.category).label} · {item.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-mono text-xs font-semibold">{item.code}</p>
                      <p className="font-mono text-[11px] text-mute">{item.serial_number || '-'}</p>
                    </td>
                    <td className="text-right font-medium">{baht(item.rental_rate_per_day)}</td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openBooking([item.id])} disabled={item.status === 'maintenance'} className="icon-btn !h-9 !w-9" title="จอง"><CalendarPlus size={16} /></button>
                        <button onClick={() => toggleMaintenance(item)} className="icon-btn !h-9 !w-9" title={maintLabel(item.status)}><Wrench size={16} /></button>
                        <button onClick={() => openEquipment(item)} className="icon-btn !h-9 !w-9 text-info" title="แก้ไข"><Pencil size={16} /></button>
                        <button onClick={() => deleteEquipmentFlow(item, refresh)} className="icon-btn !h-9 !w-9 text-bad" title="ลบ"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
      <p className="mt-4 text-xs text-mute">แสดง {list.length} จาก {equipments.length} รายการ</p>

      {selectedEquipment && (
        <Drawer
          title={selectedEquipment.name || 'รายละเอียดอุปกรณ์'}
          subtitle={`${selectedEquipment.code || 'ไม่มีรหัส'} · ${categoryOf(selectedEquipment.category).label || selectedEquipment.category || 'ไม่ระบุหมวดหมู่'}`}
          onClose={() => setSelectedEquipment(null)}
          footer={
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button onClick={() => { const item = selectedEquipment; setSelectedEquipment(null); openEquipment(item); }} className="btn btn-ghost">
                <Pencil size={16} /> แก้ไขข้อมูล
              </button>
              <button onClick={() => { const item = selectedEquipment; setSelectedEquipment(null); openBooking([item.id]); }} disabled={selectedEquipment.status === 'maintenance'} className="btn btn-primary">
                <CalendarPlus size={16} /> จองอุปกรณ์นี้
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            <EquipmentPhoto item={selectedEquipment} className="aspect-[4/3] w-full rounded-2xl border border-line" iconSize={48} />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-surface2/60 p-3">
                <p className="text-xs text-mute">รหัสอุปกรณ์</p><p className="mt-1 break-words font-mono text-sm font-semibold">{selectedEquipment.code || '—'}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface2/60 p-3">
                <p className="text-xs text-mute">สถานะ</p><div className="mt-1"><StatusBadge status={selectedEquipment.status} /></div>
              </div>
              <div className="rounded-xl border border-line bg-surface2/60 p-3">
                <p className="text-xs text-mute">ค่าเช่าต่อวัน</p><p className="mt-1 font-num text-lg font-semibold text-accent">{baht(selectedEquipment.rental_rate_per_day)}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface2/60 p-3">
                <p className="text-xs text-mute">หมวดหมู่</p><p className="mt-1 text-sm font-medium">{categoryOf(selectedEquipment.category).label || selectedEquipment.category || '—'}</p>
              </div>
            </div>
            <section className="space-y-3 rounded-xl border border-line p-4">
              <h3 className="text-sm font-semibold">ข้อมูลอุปกรณ์</h3>
              {[[ 'แบรนด์', selectedEquipment.brand ], ['รุ่น', selectedEquipment.model], ['Serial number', selectedEquipment.serial_number]].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 text-sm"><span className="shrink-0 text-mute">{label}</span><span className="break-all text-right font-medium">{value || '—'}</span></div>
              ))}
            </section>
            {selectedEquipment.defects && <div className="rounded-xl border border-warn/25 bg-warn/10 p-4 text-sm leading-relaxed text-warn"><p className="mb-1 font-semibold"><AlertTriangle size={15} className="mr-1 inline" />หมายเหตุ / ตำหนิ</p>{selectedEquipment.defects}</div>}
          </div>
        </Drawer>
      )}
    </>
  );
}

/* ═════ pages/Maintenance.jsx ═════ */
function Maintenance() {
  const { maintenance, equipments, refresh } = useApp();
  const [tab, setTab] = useState('in_progress');

  const counts = useMemo(
    () => ({
      in_progress: maintenance.filter((m) => m.status === 'in_progress').length,
      completed: maintenance.filter((m) => m.status === 'completed').length,
    }),
    [maintenance]
  );
  const rows = maintenance.filter((m) => tab === 'all' || m.status === tab);
  const totalCost = maintenance.reduce((s, m) => s + Number(m.cost || 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Maintenance"
        title="ซ่อมบำรุง"
        description="อุปกรณ์ที่ส่งซ่อมจะถูกล็อกไม่ให้จอง จนกว่าจะปิดงาน"
        actions={
          <button onClick={() => maintenanceFlow(equipments, refresh)} className="btn btn-primary">
            <Plus size={17} /> บันทึกงานซ่อม
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'in_progress', label: 'กำลังซ่อม', count: counts.in_progress },
            { value: 'completed', label: 'เสร็จสิ้น', count: counts.completed },
            { value: 'all', label: 'ทั้งหมด', count: maintenance.length },
          ]}
        />
        <p className="text-sm text-mute">ค่าซ่อมรวม <b className="font-num text-lg text-ink">{baht(totalCost)}</b></p>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Wrench} title="ไม่มีงานซ่อมบำรุง" description="อุปกรณ์ทุกชิ้นอยู่ในสภาพพร้อมใช้งาน" />
      ) : (
        <ul className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((m, i) => {
            const linkedEquipment = equipments.find((e) => String(e.id) === String(m.equipment_id)) || equipments.find((e) => e.code && e.code === m.equipment_code) || { id: m.equipment_id, name: m.equipment_name, code: m.equipment_code, category: m.category, image_url: m.image_url };
            return (
            <li key={m.id} style={{ '--i': Math.min(i, 8) }} className="card card-hover overflow-hidden">
              <EquipmentPhoto item={linkedEquipment} className="aspect-[16/9] w-full" iconSize={36} />
              <div className="card-pad">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-semibold text-accent">{m.equipment_code}</p>
                  <h3 className="mt-0.5 truncate font-serif text-lg font-semibold">{m.equipment_name}</h3>
                </div>
                <StatusBadge status={m.status} />
              </div>
              <p className="mt-3 text-sm font-medium">{m.title}</p>
              {m.description && <p className="mt-1 text-sm leading-relaxed text-mute">{m.description}</p>}
              <div className="mt-4 flex items-center justify-between border-t border-dashed border-line pt-4">
                <p className="text-xs text-mute">{fmtDate(m.maintenance_date)} · <b className="text-ink">{baht(m.cost)}</b></p>
                {m.status === 'in_progress' && (
                  <button onClick={() => completeMaintenanceFlow(m, refresh)} className="btn btn-primary btn-sm">
                    <CheckCircle2 size={15} /> ปิดงาน
                  </button>
                )}
              </div>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* ═════ pages/Customers.jsx ═════ */
const initials = (name) => (name || '?').trim().slice(0, 1);

function Customers() {
  const { customers, bookings, openDetail, refresh } = useApp();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return customers.filter(
      (c) => !term || [c.fullname, c.phone, c.email].some((v) => String(v || '').toLowerCase().includes(term))
    );
  }, [customers, q]);

  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="ลูกค้า"
        description="ประวัติผู้เช่าทั้งหมด สร้างอัตโนมัติจากการจอง — พิมพ์เบอร์เดิมระบบจะจำชื่อให้"
      />
      <SearchBox className="mb-5" value={q} onChange={setQ} placeholder="ค้นหาชื่อ เบอร์โทร หรืออีเมล..." />

      {list.length === 0 ? (
        <EmptyState icon={Users} title="ยังไม่มีลูกค้า" description="พอมีใบจองแรก ชื่อลูกค้าจะมาอยู่ตรงนี้เอง" />
      ) : (
        <ul className="stagger space-y-3">
          {list.map((c, i) => {
            const isOpen = open === c.id;
            const history = bookings.filter((b) => b.customer_id === c.id);
            return (
              <li key={c.id} style={{ '--i': Math.min(i, 10) }} className="card overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : c.id)} className="flex w-full items-center gap-4 p-4 text-left sm:p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/12 font-serif text-lg font-semibold text-accent">
                    {initials(c.fullname)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{c.fullname}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-mute"><Phone size={12} /> {c.phone}</span>
                  </span>
                  <span className="hidden text-right sm:block">
                    <span className="block text-xs text-mute">เช่าสำเร็จ</span>
                    <b className="font-num text-xl">{c.returned_count ?? 0} ครั้ง</b>
                  </span>
                  <span className="text-right">
                    <span className="block text-xs text-mute">ยอดที่ชำระแล้ว</span>
                    <b className="font-num text-xl text-accent">{baht(c.total_spent)}</b>
                  </span>
                  <ChevronDown size={18} className={`shrink-0 text-mute transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="page-in border-t border-line bg-surface2/40 p-4 sm:p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-mute">
                        {c.contact_channel ? `ช่องทางติดต่อ: ${c.contact_channel} · ` : ''}
                        จองทั้งหมด {c.booking_count} ครั้ง · {c.last_booking ? `ล่าสุด ${fmtDate(c.last_booking)}` : 'ยังไม่เคยจอง'}
                      </p>
                      <button type="button" onClick={() => editCustomerFlow(c, refresh)} className="btn btn-ghost !min-h-9 !px-3 text-xs"><Pencil size={13} /> แก้ไข / ช่องทางติดต่อ</button>
                    </div>
                    <ContactChips contacts={c.contacts} className="mb-3" />
                    {history.length === 0 ? (
                      <p className="text-sm text-mute">ไม่มีประวัติการจอง</p>
                    ) : (
                      <ul className="space-y-2">
                        {history.map((b) => (
                          <li key={b.id}>
                            <button onClick={() => openDetail(b.id)} className="flex w-full items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-left text-sm transition hover:translate-x-1">
                              <span className="min-w-0">
                                <span className="block truncate font-medium">{equipmentTitle(b)}</span>
                                <span className="font-mono text-[11px] text-mute">{b.booking_no} · {fmtDate(b.start_date)}</span>
                              </span>
                              <span className="flex shrink-0 items-center gap-3">
                                <span className="hidden font-medium sm:block">{baht(b.net_total)}</span>
                                <StatusBadge status={effectiveStatus(b)} />
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* ═════ pages/Finance.jsx ═════ */
function Finance() {
  const { transactions, bookings, report, refresh, openDetail } = useApp();
  const [type, setType] = useState('all');
  const [deposits, setDeposits] = useState(null);

  useEffect(() => {
    let off = false;
    api.get('/deposits')
      .then(({ data }) => { if (!off) setDeposits(data); })
      .catch(() => { if (!off) setDeposits(null); });
    return () => { off = true; };
  }, [bookings]);

  const months = useMemo(() => {
    const map = new Map((report?.monthly || []).map((m) => [m.month, m]));
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - (11 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const hit = map.get(key);
      return {
        label: MONTHS_SHORT[d.getMonth()],
        full: `${MONTHS_SHORT[d.getMonth()]} ${String(d.getFullYear() + 543).slice(-2)}`,
        income: Number(hit?.income) || 0,
        expense: Number(hit?.expense) || 0,
      };
    });
  }, [report]);

  const [cmpA, setCmpA] = useState(11);
  const [cmpB, setCmpB] = useState(10);
  const pct = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : cur > 0 ? null : 0);
  const maxIncome = Math.max(1, ...months.map((m) => m.income));
  const A = months[cmpA];
  const B = months[cmpB];

  /* ยอดสะสมต้องไม่หายระหว่างโหลดรอบใหม่: ใช้ยอดจากรายงาน → ไม่มีก็รวมจากรายการรายรับ–รายจ่าย → ไม่มีอีกก็คงค่าล่าสุดที่เคยถูกต้องไว้ */
  const lastTotals = useRef(null);
  const totals = useMemo(() => {
    let t = null;
    if (report?.totals) t = { income: Number(report.totals.income) || 0, expense: Number(report.totals.expense) || 0 };
    else if (transactions.length) {
      t = transactions.reduce((a, x) => {
        if (x.type === 'income') a.income += Number(x.amount) || 0;
        if (x.type === 'expense') a.expense += Number(x.amount) || 0;
        return a;
      }, { income: 0, expense: 0 });
    }
    return t || lastTotals.current || { income: 0, expense: 0 };
  }, [report, transactions]);
  useEffect(() => { lastTotals.current = totals; }, [totals]);
  const profit = totals.income - totals.expense;
  const assets = report?.assets || { total_cost: 0, total_value: 0, equipment_count: 0 };

  const list = useMemo(
    () => transactions.filter((t) => type === 'all' || t.type === type),
    [transactions, type]
  );

  const exportCsv = () => {
    const ok = downloadCsv(
      'transactions.csv',
      list.map((t) => ({
        วันที่: t.transaction_date,
        ประเภท: t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
        หมวดหมู่: t.category,
        จำนวนเงิน: t.amount,
        การจอง: t.booking_no || '',
        รายละเอียด: t.description || '',
      }))
    );
    toast(ok ? 'success' : 'info', ok ? 'ส่งออกไฟล์ CSV แล้ว' : 'ยังไม่มีข้อมูลให้ส่งออก');
  };

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="รายรับ–รายจ่าย"
        description="รายรับจากการรับคืนอุปกรณ์ถูกบันทึกให้อัตโนมัติ เพิ่มรายจ่ายหรือรายรับอื่นๆ ได้เอง"
        actions={
          <>
            <button onClick={exportCsv} className="btn btn-ghost"><Download size={16} /> CSV</button>
            <button onClick={() => transactionFlow(bookings, refresh, 'expense')} className="btn btn-ghost">
              <TrendingDown size={16} /> รายจ่าย
            </button>
            <button onClick={() => transactionFlow(bookings, refresh, 'income')} className="btn btn-primary">
              <Plus size={16} /> รายการใหม่
            </button>
          </>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat index={0} label="รายรับสะสม" value={totals.income} prefix="฿" icon={TrendingUp} tone="ok" caption="ทั้งหมดในระบบ" />
        <Stat index={1} label="รายจ่ายสะสม" value={totals.expense} prefix="฿" icon={TrendingDown} tone="bad" caption="ซ่อมบำรุงและอื่นๆ" />
        <Stat index={2} label="กำไรสุทธิ" value={profit} prefix="฿" icon={Wallet} tone={profit >= 0 ? 'accent' : 'bad'} caption="รายรับ − รายจ่าย" />
        <Stat index={3} label="มูลค่าอุปกรณ์" value={assets.total_value} prefix="฿" icon={Landmark} tone="info" caption={`ทุน ${baht(assets.total_cost)} · ${assets.equipment_count} ชิ้น`} />
      </div>

      {deposits?.needs_setup && (
        <p className="mb-6 rounded-xl bg-warn/10 p-4 text-sm text-warn">ยังไม่ได้เพิ่มคอลัมน์เงินประกันในฐานข้อมูล รัน SQL เงินประกันใน Supabase ก่อน จึงจะเห็นยอดเงินประกันที่ถือไว้ที่นี่</p>
      )}
      {deposits?.count > 0 && (
        <section className="card card-pad mb-6 anim-i" style={{ '--i': 4 }}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-lg font-semibold">เงินประกันที่ถือไว้</h2>
              <p className="text-xs text-mute">ยังไม่ใช่รายรับของร้าน ต้องคืนลูกค้าเมื่อรับกล้องคืน</p>
            </div>
            <p className="font-num text-3xl font-semibold text-warn">{baht(deposits.held_total)}</p>
          </div>
          <ul className="mt-4 divide-y divide-line/60">
            {deposits.rows.map((d) => (
              <li key={d.id}>
                <button onClick={() => openDetail(d.id)} className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{d.customer_name || '-'}</span>
                    <span className="block font-mono text-[11px] text-mute">{d.booking_no} · คืนกล้อง {fmtDateTime(d.end_date)}</span>
                  </span>
                  <span className="font-num shrink-0 font-medium">{baht(d.deposit)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card card-pad mb-6 anim-i" style={{ '--i': 4 }}>
        <h2 className="mb-5 font-serif text-lg font-semibold">แนวโน้ม 12 เดือน</h2>
        <BarChart data={months} height={190} />
      </section>

      <section className="card card-pad mb-6 anim-i" style={{ '--i': 5 }}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-lg font-semibold">เปรียบเทียบรายได้รายเดือน</h2>
          <div className="flex items-center gap-2 text-sm">
            <select className="input !min-h-9 !w-auto" value={cmpA} onChange={(e) => setCmpA(Number(e.target.value))}>
              {months.map((m, i) => <option key={i} value={i}>{m.full}</option>)}
            </select>
            <span className="text-mute">เทียบกับ</span>
            <select className="input !min-h-9 !w-auto" value={cmpB} onChange={(e) => setCmpB(Number(e.target.value))}>
              {months.map((m, i) => <option key={i} value={i}>{m.full}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            ['รายรับ', A.income, B.income],
            ['รายจ่าย', A.expense, B.expense],
            ['กำไรสุทธิ', A.income - A.expense, B.income - B.expense],
          ].map(([label, a, b]) => {
            const diff = a - b;
            const p = pct(a, b);
            const good = label === 'รายจ่าย' ? diff <= 0 : diff >= 0;
            return (
              <div key={label} className="rounded-2xl border border-line bg-surface2/40 p-4">
                <p className="text-xs text-mute">{label} · {A.full}</p>
                <p className="font-num mt-1 text-2xl font-semibold">{baht(a)}</p>
                <p className="mt-1 text-xs text-mute">{B.full}: {baht(b)}</p>
                <p className={`mt-2 text-sm font-medium ${diff === 0 ? 'text-mute' : good ? 'text-ok' : 'text-bad'}`}>
                  {diff > 0 ? '▲ +' : diff < 0 ? '▼ −' : ''}{baht(Math.abs(diff))}
                  {p === null ? ' (ใหม่)' : diff !== 0 ? ` (${p > 0 ? '+' : ''}${p}%)` : ' (เท่ากัน)'}
                </p>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:min-w-[560px]">
            <thead>
              <tr className="text-left text-xs text-mute">
                <th className="pb-2 font-medium">เดือน</th>
                <th className="pb-2 text-right font-medium">รายรับ</th>
                <th className="pb-2 text-right font-medium">รายจ่าย</th>
                <th className="pb-2 text-right font-medium">กำไร</th>
                <th className="hidden pb-2 text-right font-medium sm:table-cell">เทียบเดือนก่อน</th>
                <th className="hidden w-32 pb-2 sm:table-cell" />
              </tr>
            </thead>
            <tbody>
              {months.map((m, i) => {
                const prev = i > 0 ? months[i - 1] : null;
                const p = prev ? pct(m.income, prev.income) : 0;
                return (
                  <tr key={m.full} className="border-t border-line/60">
                    <td className="py-2.5 font-medium">{m.full}</td>
                    <td className="py-2.5 text-right">{baht(m.income)}</td>
                    <td className="py-2.5 text-right text-mute">{baht(m.expense)}</td>
                    <td className={`py-2.5 text-right ${m.income - m.expense < 0 ? 'text-bad' : ''}`}>{baht(m.income - m.expense)}</td>
                    <td className={`hidden py-2.5 text-right text-xs sm:table-cell ${!prev || p === 0 ? 'text-mute' : p === null || p > 0 ? 'text-ok' : 'text-bad'}`}>
                      {!prev ? '—' : p === null ? 'ใหม่' : p === 0 ? '—' : `${p > 0 ? '▲ +' : '▼ '}${p}%`}
                    </td>
                    <td className="hidden py-2.5 pl-3 sm:table-cell">
                      <div className="h-2 rounded-full bg-line/50">
                        <div className="h-2 rounded-full bg-accent" style={{ width: `${(m.income / maxIncome) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Segmented
        className="mb-4"
        value={type}
        onChange={setType}
        options={[
          { value: 'all', label: 'ทั้งหมด', count: transactions.length },
          { value: 'income', label: 'รายรับ', count: transactions.filter((t) => t.type === 'income').length },
          { value: 'expense', label: 'รายจ่าย', count: transactions.filter((t) => t.type === 'expense').length },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState icon={Wallet} title="ยังไม่มีรายการ" description="เพิ่มรายการแรกด้วยปุ่ม “รายการใหม่”" />
      ) : (
        <ul className="card divide-y divide-line/70 overflow-hidden">
          {list.map((t, i) => {
            const income = t.type === 'income';
            return (
              <li key={t.id} className="anim-i group flex items-center gap-4 px-4 py-3.5 sm:px-6" style={{ '--i': Math.min(i, 10) }}>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${income ? 'bg-ok/10 text-ok' : 'bg-bad/10 text-bad'}`}>
                  {income ? <TrendingUp size={17} /> : <TrendingDown size={17} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.category}{t.booking_no && <span className="ml-2 font-mono text-[11px] text-accent">{t.booking_no}</span>}</p>
                  <p className="truncate text-xs text-mute">{t.description || '—'} · {fmtDateTime(parseDate(t.transaction_date))}</p>
                </div>
                <p className={`font-num text-xl font-semibold ${income ? 'text-ok' : 'text-bad'}`}>
                  {income ? '+' : '−'}{baht(t.amount)}
                </p>
                <button onClick={() => deleteTransactionFlow(t, refresh)} className="icon-btn !h-9 !w-9 text-bad opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100" aria-label="ลบ">
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/* ═════ pages/History.jsx ═════ */
function History() {
  const { bookings } = useApp();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const done = useMemo(() => bookings.filter((b) => ['returned', 'cancelled'].includes(b.status)), [bookings]);
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return done.filter(
      (b) =>
        (filter === 'all' || b.status === filter) &&
        (!term || [b.booking_no, b.customer_name, b.phone, b.equipment_names].some((v) => String(v || '').toLowerCase().includes(term)))
    );
  }, [done, q, filter]);

  const exportCsv = () => {
    const ok = downloadCsv(
      'booking-history.csv',
      rows.map((b) => ({
        เลขที่จอง: b.booking_no,
        ผู้เช่า: b.customer_name,
        เบอร์โทร: b.phone,
        อุปกรณ์: b.equipment_names,
        วันรับ: b.start_date,
        วันคืน: b.end_date,
        ค่าปรับ: b.fine_amount,
        ยอดสุทธิ: b.net_total,
        สถานะ: b.status === 'returned' ? 'คืนแล้ว' : 'ยกเลิก',
      }))
    );
    toast(ok ? 'success' : 'info', ok ? 'ส่งออกประวัติเป็น CSV แล้ว' : 'ยังไม่มีข้อมูลให้ส่งออก');
  };

  return (
    <>
      <PageHeader
        eyebrow="Archive"
        title="ประวัติการเช่า"
        description="รายการที่คืนแล้วหรือยกเลิก เก็บไว้ตรวจสอบย้อนหลัง"
        actions={<button onClick={exportCsv} className="btn btn-ghost"><Download size={16} /> ส่งออก CSV</button>}
      />
      <div className="mb-5 space-y-3">
        <SearchBox value={q} onChange={setQ} placeholder="ค้นหาเลขจอง ชื่อ หรืออุปกรณ์..." />
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'ทั้งหมด', count: done.length },
            { value: 'returned', label: 'คืนแล้ว', count: done.filter((b) => b.status === 'returned').length },
            { value: 'cancelled', label: 'ยกเลิก', count: done.filter((b) => b.status === 'cancelled').length },
          ]}
        />
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="ยังไม่มีประวัติ" description="รายการที่คืนหรือยกเลิกแล้วจะแสดงที่นี่" />
      ) : (
        <BookingList rows={rows} showActions={false} />
      )}
    </>
  );
}

/* ═════ pages/Settings.jsx ═════ */
function Group({ title, caption, children, index = 0 }) {
  return (
    <section className="card card-pad anim-i" style={{ '--i': index }}>
      <h2 className="font-serif text-lg font-semibold">{title}</h2>
      {caption && <p className="mt-1 text-sm text-mute">{caption}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Option({ on, onClick, children, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`group relative flex flex-col items-stretch gap-2 rounded-2xl border p-2.5 text-left transition-all duration-300 ${
        on ? 'border-accent bg-accent/10 ring-2 ring-accent/50' : 'border-line hover:border-accent/50'
      }`}
    >
      {children}
      <span className="flex items-center justify-between px-1 text-xs font-medium">
        {label}
        {on && <Check size={14} className="text-accent" />}
      </span>
    </button>
  );
}

/* ภาพย่อแสดงรูปแบบเลย์เอาต์ */
function Thumb({ kind, side = 'left' }) {
  const bar = 'bg-ink/80';
  return (
    <div className="relative h-16 overflow-hidden rounded-lg border border-line bg-bg">
      {kind === 'sidebar' && <div className={`absolute inset-y-0 w-9 ${bar} ${side === 'left' ? 'left-0' : 'right-0'}`} />}
      {kind === 'rail' && <div className={`absolute inset-y-0 w-4 ${bar} ${side === 'left' ? 'left-0' : 'right-0'}`} />}
      {kind === 'topbar' && <div className={`absolute inset-x-0 top-0 h-3.5 ${bar}`} />}
      {kind === 'dock' && <div className={`absolute bottom-1.5 left-1/2 h-3 w-14 -translate-x-1/2 rounded-full ${bar}`} />}
      <div
        className="absolute rounded bg-line"
        style={{
          top: kind === 'topbar' ? 20 : 8,
          bottom: kind === 'dock' ? 20 : 8,
          left: kind === 'sidebar' && side === 'left' ? 44 : kind === 'rail' && side === 'left' ? 24 : 8,
          right: kind === 'sidebar' && side === 'right' ? 44 : kind === 'rail' && side === 'right' ? 24 : 8,
        }}
      />
    </div>
  );
}

function Settings() {
  const [csvTable, setCsvTable] = useState('bookings');
  const { settings, update, reset } = useSettings();
  const { leave } = useApp();
  const sideRelevant = ['sidebar', 'rail'].includes(settings.navStyle);

  const row = 'grid grid-cols-2 gap-3 sm:grid-cols-4';

  return (
    <>
      <PageHeader
        eyebrow="Appearance"
        title="ตั้งค่าการแสดงผล"
        description="ปรับหน้าตาและการจัดวางได้เต็มที่ — บันทึกในเครื่องนี้อัตโนมัติ และมีผลทันที"
        actions={
          <button
            onClick={() => {
              reset();
              toast('success', 'คืนค่าเริ่มต้นแล้ว');
            }}
            className="btn btn-ghost"
          >
            <RotateCcw size={16} /> คืนค่าเริ่มต้น
          </button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Group index={0} title="รูปแบบเมนูนำทาง" caption="บนมือถือจะใช้แท็บบาร์ด้านล่างเสมอ ส่วนแท็บเล็ตจะย่อ Sidebar เป็นแถบไอคอนอัตโนมัติ">
          <div className={row}>
            {[
              ['sidebar', 'Sidebar เต็ม'],
              ['rail', 'แถบไอคอน'],
              ['topbar', 'แท็บด้านบน'],
              ['dock', 'Dock ลอย'],
            ].map(([id, label]) => (
              <Option key={id} on={settings.navStyle === id} onClick={() => update({ navStyle: id })} label={label}>
                <Thumb kind={id} side={settings.side} />
              </Option>
            ))}
          </div>
          {sideRelevant && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">ตำแหน่งแถบเมนู</p>
              <div className="grid grid-cols-2 gap-3 sm:w-1/2">
                {[['left', 'ซ้าย'], ['right', 'ขวา']].map(([id, label]) => (
                  <Option key={id} on={settings.side === id} onClick={() => update({ side: id })} label={label}>
                    <Thumb kind={settings.navStyle} side={id} />
                  </Option>
                ))}
              </div>
            </div>
          )}
        </Group>

        <Group index={1} title="รูปทรงและความหนาแน่น">
          <p className="mb-2 text-sm font-medium">ความโค้งของมุม</p>
          <div className="grid grid-cols-3 gap-3">
            {[['sharp', 'เหลี่ยม', '4px'], ['soft', 'นุ่ม', '14px'], ['round', 'มน', '24px']].map(([id, label, r]) => (
              <Option key={id} on={settings.radius === id} onClick={() => update({ radius: id })} label={label}>
                <div className="h-12 border-2 border-ink/70 bg-surface2" style={{ borderRadius: r }} />
              </Option>
            ))}
          </div>
          <p className="mb-2 mt-6 text-sm font-medium">ความหนาแน่นของเนื้อหา</p>
          <div className="grid grid-cols-2 gap-3 sm:w-2/3">
            {[['comfortable', 'โปร่งสบาย'], ['compact', 'กระชับ']].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => update({ density: id })}
                className="chip justify-center"
                data-on={settings.density === id}
              >
                {label}
              </button>
            ))}
          </div>
        </Group>

        <Group index={2} title="สีธีมของระบบ" caption="เปลี่ยนสีหลักทั้งระบบพร้อมกัน — เมนู ปุ่ม กราฟ หน้าแนะนำระบบ และหน้าต่างแจ้งเตือน">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {Object.entries(THEME_COLORS).map(([id, t]) => (
              <button
                key={id}
                type="button"
                onClick={() => update({ color: id })}
                aria-pressed={settings.color === id}
                className="chip flex-col !gap-2 !py-3"
                data-on={settings.color === id}
              >
                <span className="relative block h-8 w-8 rounded-full ring-2 ring-white/70" style={{ background: t.main, boxShadow: `0 8px 18px -8px ${t.main}` }}>
                  {settings.color === id && <Check size={16} strokeWidth={3} className="absolute inset-0 m-auto text-white" />}
                </span>
                <span className="text-xs">{t.label}</span>
              </button>
            ))}
          </div>
        </Group>

        <Group index={3} title="ความปลอดภัย" caption="เปลี่ยนรหัสผ่านเข้าระบบของเจ้าของร้านได้ที่นี่ ไม่ต้องแก้โค้ดหรือตั้งค่าเซิร์ฟเวอร์">
          <button type="button" className="btn btn-primary" onClick={() => changePasswordFlow()}>
            เปลี่ยนรหัสผ่าน
          </button>
        </Group>

        <Group index={4} title="สำรองข้อมูลและส่งออก" caption="เลือกรูปแบบที่ต้องการ ไฟล์ไม่มีรหัสผ่านร้าน แนะนำให้สำรองไฟล์เต็ม (JSON) สัปดาห์ละครั้ง">
          <div className="grid gap-3 sm:grid-cols-3">
            <button type="button" className="btn btn-primary" onClick={backupPdfFlow}>
              <Printer size={16} /> รายงาน PDF
            </button>
            <div className="flex gap-2 sm:col-span-1">
              <select className="input min-w-0 flex-1" value={csvTable} onChange={(e) => setCsvTable(e.target.value)} aria-label="เลือกข้อมูลที่จะส่งออก">
                {CSV_TABLES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
              <button type="button" className="btn shrink-0" onClick={() => backupCsvFlow(csvTable)}>
                <Download size={16} /> Excel
              </button>
            </div>
            <button type="button" className="btn" onClick={backupJsonFlow}>
              <Download size={16} /> ไฟล์สำรองเต็ม (JSON)
            </button>
          </div>
        </Group>
      </div>
    </>
  );
}

/* ═════ App.jsx ═════ */
/* ───────── สำรองข้อมูล / ส่งออก ───────── */
async function fetchBackup() {
  showLoading('กำลังรวบรวมข้อมูล...');
  try {
    const { data } = await api.get('/backup');
    Swal.close();
    return data;
  } catch (error) {
    await showError(errMsg(error, 'ดึงข้อมูลไม่สำเร็จ'));
    return null;
  }
}

const BOOKING_STATUS_TH = (st) => STATUS_META[st]?.label || st || '';

function backupMaps(data) {
  const t = data.tables || {};
  const customers = new Map((t.customers || []).map((c) => [c.id, c]));
  const equipments = new Map((t.equipments || []).map((e) => [e.id, e]));
  const itemsByBooking = new Map();
  (t.booking_items || []).forEach((it) => {
    const list = itemsByBooking.get(it.booking_id) || [];
    list.push(equipments.get(it.equipment_id)?.name || `#${it.equipment_id}`);
    itemsByBooking.set(it.booking_id, list);
  });
  return { t, customers, equipments, itemsByBooking };
}

const CSV_TABLES = [
  ['bookings', 'รายการจอง'],
  ['customers', 'ลูกค้า'],
  ['equipments', 'อุปกรณ์'],
  ['transactions', 'รายรับ–รายจ่าย'],
];

function buildCsvRows(table, data) {
  const { t, customers, itemsByBooking } = backupMaps(data);
  if (table === 'bookings') {
    return (t.bookings || []).map((b) => ({
      'เลขที่จอง': b.booking_no,
      'ผู้เช่า': customers.get(b.customer_id)?.fullname || '',
      'เบอร์โทร': customers.get(b.customer_id)?.phone || '',
      'อุปกรณ์': (itemsByBooking.get(b.id) || []).join(' / '),
      'รับกล้อง': fmtDateTime(b.start_date),
      'คืนกล้อง': fmtDateTime(b.end_date),
      'รูปแบบ': b.rental_type === 'hourly' ? `${b.rental_hours || ''} ชม.` : `${b.total_days || ''} วัน`,
      'ค่าเช่า': b.subtotal,
      'ส่วนลด': b.discount,
      'ค่าใช้จ่ายเพิ่ม': b.extra_charges,
      'ค่าปรับ': b.fine_amount,
      'ยอดสุทธิ': b.net_total,
      'เงินประกัน': b.deposit,
      'สถานะเงินประกัน': DEPOSIT_LABEL[b.deposit_status || 'pending'] || '',
      'หักเงินประกัน': b.deposit_deducted || 0,
      'สถานะ': BOOKING_STATUS_TH(b.status),
    }));
  }
  if (table === 'customers') {
    const count = new Map();
    (t.bookings || []).forEach((b) => count.set(b.customer_id, (count.get(b.customer_id) || 0) + 1));
    return (t.customers || []).map((c) => ({ 'ชื่อ': c.fullname, 'เบอร์โทร': c.phone, 'อีเมล': c.email || '', 'จำนวนครั้งที่เช่า': count.get(c.id) || 0 }));
  }
  if (table === 'equipments') {
    return (t.equipments || []).map((e) => ({
      'รหัส': e.code, 'ชื่อ': e.name, 'ยี่ห้อ': e.brand || '', 'รุ่น': e.model || '', 'หมวด': categoryOf(e.category).label,
      'Serial': e.serial_number || '', 'ค่าเช่า/วัน': e.rental_rate_per_day, 'สถานะ': BOOKING_STATUS_TH(e.status),
    }));
  }
  return (t.transactions || []).map((r) => ({
    'วันที่': fmtDateTime(r.transaction_date), 'ประเภท': r.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    'หมวด': r.category || '', 'จำนวนเงิน': r.amount, 'รายละเอียด': r.description || '',
  }));
}

async function backupCsvFlow(table) {
  const data = await fetchBackup();
  if (!data) return;
  const rows = buildCsvRows(table, data);
  const ok = downloadCsv(`${SHOP.name.replace(/\s+/g, '-')}-${table}-${toDateOnly(new Date())}.csv`, rows);
  toast(ok ? 'success' : 'info', ok ? `ส่งออก ${rows.length} รายการแล้ว (เปิดด้วย Excel / Google Sheets)` : 'ยังไม่มีข้อมูลให้ส่งออก');
}

async function backupJsonFlow() {
  const data = await fetchBackup();
  if (!data) return;
  // แปลงตัวอักษรไทยเป็น \uXXXX — เปิดในโปรแกรมไหนบนมือถือก็ไม่เพี้ยน
  const text = JSON.stringify(data, null, 2).replace(/[\u0080-￿]/g, (ch) => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'));
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${SHOP.name.replace(/\s+/g, '-')}-backup-${toDateOnly(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  const c = data.counts || {};
  toast('success', `สำรองแล้ว: การจอง ${c.bookings ?? 0} · ลูกค้า ${c.customers ?? 0} · อุปกรณ์ ${c.equipments ?? 0}`);
}

async function backupPdfFlow() {
  const data = await fetchBackup();
  if (!data) return;
  const { t, customers, itemsByBooking } = backupMaps(data);
  const x = (v) => esc(v ?? '');
  const income = (t.transactions || []).filter((r) => r.type === 'income').reduce((a, r) => a + Number(r.amount || 0), 0);
  const expense = (t.transactions || []).filter((r) => r.type === 'expense').reduce((a, r) => a + Number(r.amount || 0), 0);
  const held = (t.bookings || []).filter((b) => b.deposit_status === 'held').reduce((a, b) => a + Number(b.deposit || 0), 0);
  const kpi = (k, v) => '<div>' + k + '<b>' + v + '</b></div>';

  const bookingRows = [...(t.bookings || [])].sort((a, b) => String(b.start_date).localeCompare(String(a.start_date))).map((b) =>
    '<tr><td>' + x(b.booking_no) + '<small>' + x(BOOKING_STATUS_TH(b.status)) + '</small></td>'
    + '<td>' + x(customers.get(b.customer_id)?.fullname) + '<small>' + x((itemsByBooking.get(b.id) || []).join(' / ')) + '</small></td>'
    + '<td>' + x(fmtDateTime(b.start_date)) + '<small>ถึง ' + x(fmtDateTime(b.end_date)) + '</small></td>'
    + '<td class="r">' + x(baht(b.net_total)) + '<small>ประกัน ' + x(baht(b.deposit)) + '</small></td></tr>').join('');
  const customerRows = (t.customers || []).map((c) => '<tr><td>' + x(c.fullname) + '</td><td>' + x(c.phone) + '</td><td>' + x(c.email) + '</td></tr>').join('');
  const equipmentRows = (t.equipments || []).map((e) => '<tr><td>' + x(e.name) + '<small>' + x(e.code) + '</small></td><td>' + x(BOOKING_STATUS_TH(e.status)) + '</td><td class="r">' + x(baht(e.rental_rate_per_day)) + '/วัน</td></tr>').join('');
  const txRows = [...(t.transactions || [])].sort((a, b) => String(b.transaction_date).localeCompare(String(a.transaction_date))).map((r) =>
    '<tr><td>' + x(fmtDateTime(r.transaction_date)) + '</td><td>' + x(r.category) + '<small>' + x(r.description) + '</small></td><td class="r">' + (r.type === 'income' ? '+' : '−') + x(baht(r.amount)) + '</td></tr>').join('');

  const body = '<div class="top"><div><h1>' + x(SHOP.name) + '</h1><div>รายงานสรุปข้อมูลร้าน</div></div><div class="no">ออกเมื่อ<b>' + x(fmtDateTime(new Date())) + '</b></div></div>'
    + '<div class="kpi">' + kpi('รายรับสะสม', x(baht(income))) + kpi('รายจ่ายสะสม', x(baht(expense))) + kpi('กำไรสุทธิ', x(baht(income - expense))) + kpi('เงินประกันที่ถือไว้', x(baht(held))) + '</div>'
    + '<h2>รายการจอง (' + (t.bookings || []).length + ')</h2><div class="tw"><table><thead><tr><th>เลขที่</th><th>ผู้เช่า / อุปกรณ์</th><th>ช่วงเวลา</th><th class="r">ยอด</th></tr></thead><tbody>' + bookingRows + '</tbody></table></div>'
    + '<h2>รายรับ–รายจ่าย (' + (t.transactions || []).length + ')</h2><div class="tw"><table><thead><tr><th>วันที่</th><th>รายการ</th><th class="r">จำนวน</th></tr></thead><tbody>' + txRows + '</tbody></table></div>'
    + '<h2>ลูกค้า (' + (t.customers || []).length + ')</h2><div class="tw"><table><thead><tr><th>ชื่อ</th><th>เบอร์โทร</th><th>อีเมล</th></tr></thead><tbody>' + customerRows + '</tbody></table></div>'
    + '<h2>อุปกรณ์ (' + (t.equipments || []).length + ')</h2><div class="tw"><table><thead><tr><th>ชื่อ</th><th>สถานะ</th><th class="r">ค่าเช่า</th></tr></thead><tbody>' + equipmentRows + '</tbody></table></div>';
  openPrintDoc({ title: `${SHOP.name} รายงาน ${toDateOnly(new Date())}`, size: 'A4', body });
}

function NotFound() {
  const { navigate } = useApp();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center py-10">
      <p className="font-num text-[clamp(5rem,18vw,9rem)] font-semibold leading-none text-accent/80">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">หน้านี้ไม่มีอยู่ หรือถูกย้ายไปแล้ว</h1>
      <p className="mt-2 text-sm leading-relaxed text-mute">ลิงก์ที่เปิดอาจพิมพ์ผิด ลองกลับไปที่หน้าภาพรวม หรือเลือกเมนูด้านข้างได้เลย</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => navigate('dashboard')} className="btn btn-primary">ไปหน้าภาพรวม</button>
        <button onClick={() => navigate('bookings')} className="btn">ดูรายการจอง</button>
      </div>
    </div>
  );
}

const PAGES = {
  notfound: NotFound,
  dashboard: Dashboard,
  bookings: Bookings,
  operations: Operations,
  calendar: CalendarPage,
  equipments: Equipments,
  maintenance: Maintenance,
  customers: Customers,
  finance: Finance,
  history: History,
  settings: Settings,
};

/* กันหน้าจอดำทั้งหน้า: ถ้าหน้าใดพัง จะแสดงข้อความ error แทน และกดลองใหม่ได้ */
class PageBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('Page crashed:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="card card-pad mx-auto mt-10 max-w-xl text-center">
        <h2 className="font-serif text-lg font-semibold">หน้านี้แสดงผลไม่สำเร็จ</h2>
        <p className="mt-2 break-words text-sm text-mute">{String(this.state.error?.message || this.state.error)}</p>
        <button className="btn btn-primary mt-5" onClick={() => this.setState({ error: null })}>ลองใหม่</button>
      </div>
    );
  }
}

/* ═════ รหัสผ่าน: หน้าต่างเข้าสู่ระบบ + เปลี่ยนรหัสผ่าน ═════ */
const LG_MARK = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m14.31 8 5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"/></svg>';
const LG_LOCK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

const lgField = (id, label, placeholder, autocomplete) => `
  <label class="lg-label" for="${id}">${label}</label>
  <div class="lg-field">${LG_LOCK}
    <input id="${id}" type="password" placeholder="${placeholder}" autocomplete="${autocomplete}" autocapitalize="off" spellcheck="false" />
    <button type="button" class="lg-eye" data-eye="${id}">แสดง</button>
  </div>`;

// ปุ่มแสดง/ซ่อนรหัสผ่าน + เตือน Caps Lock
const bindPasswordFields = (root) => {
  root.querySelectorAll('[data-eye]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = root.querySelector(`#${btn.dataset.eye}`);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'ซ่อน' : 'แสดง';
      input.focus();
    });
  });
  const caps = root.querySelector('.lg-caps');
  root.querySelectorAll('input[type="password"], input[type="text"]').forEach((input) => {
    input.addEventListener('keyup', (e) => {
      if (caps && e.getModifierState) caps.hidden = !e.getModifierState('CapsLock');
    });
  });
};

const shakeField = (root, id) => {
  const box = root.querySelector(`#${id}`)?.closest('.lg-field');
  if (!box) return;
  box.classList.remove('lg-shake');
  void box.offsetWidth;
  box.classList.add('lg-shake');
};

const passwordScore = (pw) => {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(4, score);
};

const lgPopupClasses = {
  popup: 'sw-popup sw-in auth-login-popup lg-popup',
  htmlContainer: 'sw-html lg-html',
  actions: 'sw-actions',
  confirmButton: 'btn btn-primary',
  cancelButton: 'btn btn-ghost',
};

async function changePasswordFlow({ force = false, current = '' } = {}) {
  const result = await Swal.fire({
    title: '',
    html: `
      <div class="lg-mark">${LG_MARK}</div>
      <p class="lg-eyebrow">SECURITY</p>
      <h2 class="lg-title">${force ? 'ตั้งรหัสผ่านของคุณเอง' : 'เปลี่ยนรหัสผ่าน'}</h2>
      <p class="lg-sub">${force
        ? 'ตอนนี้ยังใช้รหัสชั่วคราวอยู่ กรุณาตั้งรหัสผ่านใหม่ที่มีแต่เจ้าของร้านรู้'
        : 'ใช้รหัสที่คาดเดายาก ยาวอย่างน้อย 8 ตัวอักษร'}</p>
      ${current ? '' : lgField('pw-cur', 'รหัสผ่านปัจจุบัน', 'รหัสผ่านปัจจุบัน', 'current-password')}
      ${lgField('pw-new', 'รหัสผ่านใหม่', 'อย่างน้อย 8 ตัวอักษร', 'new-password')}
      <div class="lg-meter" data-s="0"><i></i><i></i><i></i><i></i></div>
      <p class="lg-meter-t" id="pw-meter-t">ผสมตัวพิมพ์เล็ก-ใหญ่ ตัวเลข และสัญลักษณ์ให้รหัสแข็งแรงขึ้น</p>
      ${lgField('pw-new2', 'ยืนยันรหัสผ่านใหม่', 'พิมพ์รหัสใหม่อีกครั้ง', 'new-password')}
      <p class="lg-caps" hidden>⚠ Caps Lock เปิดอยู่</p>`,
    customClass: lgPopupClasses,
    showClass: { popup: 'sw-in' },
    hideClass: { popup: 'sw-out' },
    showCancelButton: true,
    confirmButtonText: force ? 'ตั้งรหัสผ่านและเข้าใช้งาน' : 'บันทึกรหัสผ่านใหม่',
    cancelButtonText: force ? 'ข้ามไปก่อน (จะถามอีกครั้งตอนเข้าครั้งหน้า)' : 'ยกเลิก',
    focusConfirm: false,
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading() && !force,
    didOpen: (popup) => {
      bindPasswordFields(popup);
      const next = popup.querySelector('#pw-new');
      const meter = popup.querySelector('.lg-meter');
      const text = popup.querySelector('#pw-meter-t');
      const labels = ['', 'อ่อน', 'พอใช้', 'ดี', 'แข็งแรง'];
      next.addEventListener('input', () => {
        const s = next.value ? passwordScore(next.value) : 0;
        meter.dataset.s = String(s);
        text.textContent = s ? `ความแข็งแรง: ${labels[s]}` : 'ผสมตัวพิมพ์เล็ก-ใหญ่ ตัวเลข และสัญลักษณ์ให้รหัสแข็งแรงขึ้น';
      });
      popup.querySelectorAll('input').forEach((input) => input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); Swal.clickConfirm(); }
      }));
      (popup.querySelector('#pw-cur') || next).focus();
    },
    preConfirm: async () => {
      const popup = Swal.getPopup();
      const cur = current || popup.querySelector('#pw-cur')?.value || '';
      const next = popup.querySelector('#pw-new').value;
      const again = popup.querySelector('#pw-new2').value;
      const fail = (id, msg) => { shakeField(popup, id); Swal.showValidationMessage(msg); return false; };
      if (!cur) return fail('pw-cur', 'กรุณากรอกรหัสผ่านปัจจุบัน');
      if (next.length < 8) return fail('pw-new', 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร');
      if (next === cur) return fail('pw-new', 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม');
      if (next !== again) return fail('pw-new2', 'รหัสผ่านใหม่และช่องยืนยันไม่ตรงกัน');
      try {
        await api.post('/auth/change-password', { current: cur, next }, { timeout: 15000 });
        return true;
      } catch (error) {
        return fail(current ? 'pw-new' : 'pw-cur', errMsg(error, 'เปลี่ยนรหัสผ่านไม่สำเร็จ'));
      }
    },
  });
  if (result.isConfirmed) toast('success', 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว');
  return result.isConfirmed;
}

function Root() {
  const { entered, enter, page, bookingModal, equipmentModal, detailId } = useApp();
  const [iris, setIris] = useState({ state: '', x: '50%', y: '50%' });

  // เอฟเฟกต์ชัตเตอร์: วงกลมสีม่วงขยายเต็มจอ → เข้าระบบ → หดเปิดออก
  const handleEnter = useCallback(async (x, y) => {
    let mustChange = false;
    let typed = '';
    const result = await Swal.fire({
      title: '',
      html: `
        <div class="lg-mark">${LG_MARK}</div>
        <p class="lg-eyebrow">OWNER ACCESS</p>
        <h2 class="lg-title">เข้าสู่ระบบเจ้าของร้าน</h2>
        <p class="lg-sub">กรอกรหัสผ่านเพื่อเข้าถึงข้อมูลการจอง อุปกรณ์ และรายรับ–รายจ่ายอย่างปลอดภัย</p>
        ${lgField('lg-pass', 'รหัสผ่าน', 'กรอกรหัสผ่านเจ้าของร้าน', 'current-password')}
        <p class="lg-caps" hidden>⚠ Caps Lock เปิดอยู่</p>
        <p class="lg-hint">ลืมรหัสผ่าน? ติดต่อผู้ดูแลระบบที่ส่งมอบเว็บให้คุณ</p>`,
      customClass: lgPopupClasses,
      showClass: { popup: 'sw-in' },
      hideClass: { popup: 'sw-out' },
      showCancelButton: true,
      confirmButtonText: 'เข้าสู่ระบบ',
      cancelButtonText: 'ยกเลิก',
      focusConfirm: false,
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      didOpen: (popup) => {
        bindPasswordFields(popup);
        const input = popup.querySelector('#lg-pass');
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); Swal.clickConfirm(); }
        });
        input.focus();
      },
      preConfirm: async () => {
        const popup = Swal.getPopup();
        const password = popup.querySelector('#lg-pass').value;
        if (!password) { shakeField(popup, 'lg-pass'); Swal.showValidationMessage('กรุณากรอกรหัสผ่าน'); return false; }
        try {
          const { data } = await axios.post(`${API_ORIGIN}/api/auth/login`, { password }, { timeout: 15000 });
          sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);
          mustChange = Boolean(data.mustChange);
          typed = password;
          return true;
        } catch (error) {
          shakeField(popup, 'lg-pass');
          Swal.showValidationMessage(error?.response?.data?.error || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ');
          return false;
        }
      },
    });
    if (!result.isConfirmed) return;
    if (mustChange) await changePasswordFlow({ force: true, current: typed });
    typed = '';
    setIris({ state: 'close', x: `${x}px`, y: `${y}px` });
    setTimeout(() => {
      enter();
      setIris({ state: 'open', x: '50%', y: '50%' });
      setTimeout(() => setIris({ state: '', x: '50%', y: '50%' }), 1000);
    }, 880);
  }, [enter]);

  useEffect(() => {
    const onExpired = () => { window.location.hash = ''; window.location.reload(); };
    window.addEventListener('lensdesk:auth-expired', onExpired);
    return () => window.removeEventListener('lensdesk:auth-expired', onExpired);
  }, []);

  const Page = PAGES[page] || Dashboard;

  /* กลับหน้าแรกจากในระบบ: ชัตเตอร์เปิดออกจากกลางจอ + แจ้งเตือนต้อนรับกลับ */
  const wasEntered = useRef(entered);
  useEffect(() => {
    if (wasEntered.current && !entered) {
      setIris({ state: 'open', x: '50%', y: '50%' });
      const t1 = setTimeout(() => setIris({ state: '', x: '50%', y: '50%' }), 1000);
      const t2 = setTimeout(() => toast('success', 'ออกจากระบบแล้ว — ข้อมูลทั้งหมดถูกบันทึกเรียบร้อย'), 650);
      wasEntered.current = entered;
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    wasEntered.current = entered;
    return undefined;
  }, [entered]);

  const { settings: shopSettings } = useSettings();
  useEffect(() => {
    const name = shopSettings.shopName || SHOP.name;
    document.title = page === 'notfound' ? `ไม่พบหน้า — ${name}` : `${name} — ระบบจัดการร้านเช่ากล้อง`;
    let link = document.querySelector('link[rel="icon"]');
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = SHOP.logo || 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${themeHex()}"/><circle cx="16" cy="16" r="8" fill="none" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="#fff"/></svg>`);
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
    meta.content = themeHex('95');
  }, [shopSettings.shopName, shopSettings.color, page]);

  return (
    <>
      {entered ? (
        <>
          <Shell>
            <PageBoundary key={page}>
              <Page />
            </PageBoundary>
          </Shell>
          {bookingModal.open && <BookingForm />}
          {equipmentModal.open && <EquipmentForm />}
          {detailId && <BookingDetail />}
        </>
      ) : (
        <Landing onEnter={handleEnter} />
      )}
      <div
        className="iris"
        data-state={iris.state}
        style={{ '--ix': iris.x, '--iy': iris.y }}
        aria-hidden="true"
      />
    </>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SettingsProvider>
  );
}

export default App;