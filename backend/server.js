const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// LAN/local-only CORS allowlist. Override with comma-separated CORS_ORIGINS if needed.
const privateOrigin = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?$/i;
const configuredOrigins = (process.env.CORS_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || privateOrigin.test(origin) || configuredOrigins.includes(origin)) return callback(null, true);
    // ไม่ throw error: ปล่อยให้เบราว์เซอร์เป็นคนบล็อก (ถ้า throw จะได้ 500 ที่ไม่มี header CORS)
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  maxAge: 600,
}));
app.use(express.json({ limit: '2mb', strict: true }));

// Lightweight in-memory rate limiter (single local server process).
const rateBuckets = new Map();
function rateLimit({ windowMs = 60_000, max = 120, message = 'ส่งคำขอถี่เกินไป กรุณารอสักครู่' } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    let bucket = rateBuckets.get(key);
    if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + windowMs };
    bucket.count += 1;
    rateBuckets.set(key, bucket);
    if (rateBuckets.size > 5000) for (const [k, v] of rateBuckets) if (v.resetAt <= now) rateBuckets.delete(k);
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - bucket.count));
    if (bucket.count > max) {
      res.setHeader('Retry-After', Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ error: message });
    }
    next();
  };
}

const OWNER_PASSWORD = process.env.OWNER_PASSWORD || '';
const AUTH_SECRET = process.env.AUTH_SECRET || '';
const TOKEN_TTL_SECONDS = 12 * 60 * 60;
const safeEqual = (a, b) => {
  const aa = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
};
function signToken(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}
function verifyToken(token) {
  if (!token || !AUTH_SECRET) return null;
  const [encoded, signature] = String(token).split('.');
  if (!encoded || !signature) return null;
  const expected = crypto.createHmac('sha256', AUTH_SECRET).update(encoded).digest('base64url');
  if (!safeEqual(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch { return null; }
}

// ห่อ async handler (asyncHandler ถูกประกาศไว้ท้ายไฟล์ จึงใช้ตัวของส่วนนี้เอง)
const authAsync = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

// ---------- รหัสผ่านเจ้าของร้าน ----------
// ลำดับการตรวจ: 1) hash ที่เจ้าของตั้งเองในตาราง app_settings  2) ถ้ายังไม่เคยตั้ง ใช้ OWNER_PASSWORD จาก env
const PASSWORD_KEY = 'owner_password_hash';

const hashPassword = (plain) => {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
};

const verifyHash = (plain, stored) => {
  try {
    const [alg, saltHex, hashHex] = String(stored).split('$');
    if (alg !== 'scrypt' || !saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(plain, Buffer.from(saltHex, 'hex'), expected.length);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
};

async function getStoredHash() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', PASSWORD_KEY)
    .maybeSingle();
  if (error) {
    // ตารางยังไม่ถูกสร้าง => ใช้รหัสผ่านจาก env ต่อไป
    console.warn('app_settings unavailable:', error.message);
    return null;
  }
  return data?.value || null;
}

// คืนค่า { ok, mustChange } — mustChange = ยังใช้รหัสตั้งต้นจาก env อยู่
async function checkOwnerPassword(plain) {
  if (typeof plain !== 'string' || !plain) return { ok: false, mustChange: false };
  const stored = await getStoredHash();
  if (stored) return { ok: verifyHash(plain, stored), mustChange: false };
  if (OWNER_PASSWORD) {
    const ok = safeEqual(plain, OWNER_PASSWORD);
    return { ok, mustChange: ok };
  }
  return { ok: false, mustChange: false, notConfigured: true };
}

app.post('/api/auth/login', rateLimit({ windowMs: 15 * 60_000, max: 8, message: 'เข้าสู่ระบบไม่สำเร็จหลายครั้ง กรุณารอ 15 นาที' }), authAsync(async (req, res) => {
  if (!AUTH_SECRET) return res.status(503).json({ error: 'ยังไม่ได้ตั้งค่า AUTH_SECRET ใน Environment Variables' });
  const result = await checkOwnerPassword(req.body?.password);
  if (result.notConfigured) return res.status(503).json({ error: 'ยังไม่ได้ตั้งรหัสผ่านเริ่มต้น (OWNER_PASSWORD) ใน Environment Variables' });
  if (!result.ok) return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  const now = Math.floor(Date.now() / 1000);
  const token = signToken({ sub: 'owner', role: 'owner', iat: now, exp: now + TOKEN_TTL_SECONDS });
  res.setHeader('Cache-Control', 'no-store');
  res.json({ token, expiresIn: TOKEN_TTL_SECONDS, role: 'owner', mustChange: result.mustChange });
}));
app.get('/api/auth/verify', (req, res) => {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  res.json({ ok: true, role: user.role, expiresAt: user.exp });
});
app.use('/api', (req, res, next) => {
  if (req.path === '/auth/login' || req.path === '/auth/verify') return next();
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const user = verifyToken(token);
  if (!user || user.role !== 'owner') return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบเจ้าของระบบก่อนใช้งาน' });
  req.user = user;
  next();
});
app.use('/api', rateLimit({ windowMs: 60_000, max: 240 }));

// เปลี่ยนรหัสผ่าน (ต้องล็อกอินอยู่ และยืนยันรหัสเดิมอีกครั้ง)
app.post('/api/auth/change-password', rateLimit({ windowMs: 15 * 60_000, max: 10, message: 'ลองเปลี่ยนรหัสผ่านถี่เกินไป กรุณารอสักครู่' }), authAsync(async (req, res) => {
  const { current, next } = req.body || {};
  if (typeof next !== 'string' || next.length < 8 || next.length > 128) {
    return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องยาว 8–128 ตัวอักษร' });
  }
  const check = await checkOwnerPassword(current);
  if (!check.ok) return res.status(401).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
  if (current === next) return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม' });

  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: PASSWORD_KEY, value: hashPassword(next), updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) {
    console.error('change-password failed:', error.message);
    return res.status(500).json({ error: 'บันทึกรหัสผ่านไม่สำเร็จ — ตรวจว่าสร้างตาราง app_settings ใน Supabase แล้ว' });
  }
  res.json({ ok: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
}));

// ==========================================
// FILE UPLOAD (รูปอุปกรณ์จากเครื่องของผู้ใช้)
// ==========================================
const UPLOAD_DIR = path.join(__dirname, '../uploads');
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (err) {
  // Vercel เป็นระบบไฟล์แบบอ่านอย่างเดียว — ข้ามได้ เพราะรูปจะเก็บใน Supabase Storage
  console.warn('Skip local uploads dir:', err.message);
}

app.use(
  '/uploads',
  express.static(UPLOAD_DIR, { maxAge: '7d', immutable: true })
);

const ALLOWED_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// รูปอุปกรณ์เก็บใน Supabase Storage (bucket สาธารณะ) เพราะ Vercel เขียนไฟล์ลงดิสก์ไม่ได้
const STORAGE_BUCKET = process.env.SUPABASE_BUCKET || 'equipment-images';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // Vercel จำกัด request ~4.5MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME[file.mimetype]) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
});

const storagePathOf = (imageUrl) => {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const i = String(imageUrl || '').indexOf(marker);
  return i === -1 ? null : decodeURIComponent(String(imageUrl).slice(i + marker.length).split('?')[0]);
};

const removeUploadedFile = (imageUrl) => {
  try {
    const key = storagePathOf(imageUrl);
    if (key) {
      supabase.storage.from(STORAGE_BUCKET).remove([key]).catch(() => {});
      return;
    }
    if (!imageUrl || !String(imageUrl).startsWith('/uploads/')) return;
    const filePath = path.join(UPLOAD_DIR, path.basename(imageUrl));
    if (filePath.startsWith(UPLOAD_DIR) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('Cannot remove file:', err.message);
  }
};

// asyncHandler ถูกประกาศทีหลังในไฟล์ จึงต้องใช้ตัวห่อของ route นี้เอง ไม่งั้นจะ crash ตอนโหลดไฟล์
const wrapAsync = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

app.post('/api/upload', upload.single('image'), wrapAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'ไม่พบไฟล์รูปภาพ' });
  }

  const name = `eq-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ALLOWED_MIME[req.file.mimetype] || '.jpg'}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(name, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

  if (error) {
    return res.status(500).json({
      error: `อัปโหลดรูปไม่สำเร็จ (ตรวจว่าสร้าง bucket "${STORAGE_BUCKET}" แบบ Public แล้ว): ${error.message}`,
    });
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(name);
  res.status(201).json({
    url: data.publicUrl,
    size: req.file.size,
    message: 'อัปโหลดรูปสำเร็จ',
  });
}));

// ==========================================
// DATABASE CONNECTION (SUPABASE)
// ==========================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Missing SUPABASE_URL or SUPABASE_KEY in .env file');
}

// ใช้ Custom Fetch เพื่อป้องกันปัญหาสายหลุด/DNS resolution บน macOS local dev
const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: { persistSession: false },
  global: {
    fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
  },
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

// เวลาที่หน้าเว็บส่งมาไม่มี timezone (เช่น 2026-10-12T14:30) ให้ถือเป็นเวลาไทย (+07:00)
// เพราะ Vercel รันเป็น UTC ถ้าไม่ระบุ เวลาจะเลื่อนไป 7 ชั่วโมงและทำให้เช็กจองซ้ำผิด
const SHOP_TZ = process.env.SHOP_TZ_OFFSET || '+07:00';
const toISO = (value) => {
  if (!value) return null;
  let str = String(value).trim().replace(' ', 'T');
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/i.test(str);
  if (!hasZone) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) str += 'T00:00:00';
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) str += ':00';
    str += SHOP_TZ;
  }
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

// เดือน/ปีตามเวลาไทย (ไม่ขึ้นกับ timezone ของเซิร์ฟเวอร์)
const bkkParts = (value) => {
  const d = new Date(new Date(value).getTime() + 7 * 3600000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), key: d.toISOString().slice(0, 7) };
};

const makeBookingNo = () => {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${time}-${random}`;
};

const getBookingEquipmentIds = async (bookingId) => {
  const { data, error } = await supabase
    .from('booking_items')
    .select('equipment_id')
    .eq('booking_id', bookingId);

  if (error) throw error;
  return (data || []).map((row) => row.equipment_id);
};

const saveInspection = async (bookingId, type, body = {}) => {
  const accessories = body.accessories_checked ?? null;
  const images = body.images ?? null;

  const { error } = await supabase.from('inspections').insert([{
    booking_id: bookingId,
    type,
    inspection_date: new Date().toISOString(),
    accessories_checked: accessories,
    condition_notes: body.condition_notes || null,
    images: images,
  }]);

  if (error) throw error;
};

// ==========================================
// 1. DASHBOARD API
// ==========================================
// เวลาเริ่มต้นเดือน (ตามเวลาไทย) เป็น ISO — offset 0 = เดือนนี้, 1 = เดือนหน้า
const monthStartIso = (offset = 0) => {
  const bkk = new Date(Date.now() + 7 * 3600000);
  return new Date(Date.UTC(bkk.getUTCFullYear(), bkk.getUTCMonth() + offset, 1) - 7 * 3600000).toISOString();
};

app.get('/api/dashboard', asyncHandler(async (req, res) => {
  // ยิงทุกคำถามพร้อมกัน (เดิมรอทีละอัน ช้าเพราะแต่ละรอบไป–กลับระหว่าง Vercel กับ Supabase)
  const [
    { data: equipments, error: eqErr },
    { data: bookingsData, error: bkErr },
    { data: txData, error: txErr },
    { data: depData, error: depErr },
  ] = await Promise.all([
    supabase.from('equipments').select('status'),
    supabase
      .from('bookings')
      .select('*, customers!inner(fullname, phone), booking_items(equipments(name))')
      .order('start_date', { ascending: true }),
    // ดึงเฉพาะรายการของเดือนนี้ (ตามเวลาไทย) ไม่ต้องดึงทั้งตาราง — ข้อมูลเยอะขึ้นก็ไม่ช้าลง
    supabase.from('transactions').select('type, amount, transaction_date')
      .gte('transaction_date', monthStartIso(0)).lt('transaction_date', monthStartIso(1)),
    supabase.from('bookings').select('deposit').in('status', ['pending', 'confirmed', 'picked_up']),
  ]);
  if (eqErr) throw eqErr;

  const statusCounts = {};
  for (const row of equipments || []) {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
  }

  if (bkErr) throw bkErr;

  const formattedBookings = (bookingsData || []).map(b => ({
    ...b,
    customer_name: b.customers?.fullname,
    phone: b.customers?.phone,
    equipment_names: (b.booking_items || []).map(bi => bi.equipments?.name).filter(Boolean).join(', ')
  }));

  const nowIso = new Date().toISOString();
  const todayStr = nowIso.split('T')[0];

  // "วันนี้" ต้องนับตามเวลาไทย ไม่ใช่ UTC (ไม่งั้นรายการตี 0–7 โมงไปอยู่วันก่อน)
  const bkkDay = (v) => (v ? new Date(new Date(v).getTime() + 7 * 3600000).toISOString().slice(0, 10) : '');
  const todayBkk = bkkDay(nowIso);
  const todayBookings = formattedBookings.filter(b =>
    bkkDay(b.start_date) === todayBkk || bkkDay(b.end_date) === todayBkk
  );

  const overdueBookings = formattedBookings.filter(b => 
    b.status === 'picked_up' && b.end_date < nowIso
  ).sort((a, b) => new Date(a.end_date) - new Date(b.end_date));

  const next7Days = new Date();
  next7Days.setDate(next7Days.getDate() + 7);
  const next7DaysIso = next7Days.toISOString();

  const upcomingBookings = formattedBookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status) &&
    b.start_date >= nowIso &&
    b.start_date < next7DaysIso
  ).slice(0, 10);

  if (txErr) throw txErr;

  const nowBkk = bkkParts(new Date());
  const curYear = nowBkk.y;
  const curMonth = nowBkk.m;

  let monthIncome = 0;
  let monthExpense = 0;

  for (const t of txData || []) {
    const tp = bkkParts(t.transaction_date);
    if (tp.y === curYear && tp.m === curMonth) {
      if (t.type === 'income') monthIncome += Number(t.amount || 0);
      if (t.type === 'expense') monthExpense += Number(t.amount || 0);
    }
  }

  if (depErr) throw depErr;

  const depositHolding = (depData || []).reduce((sum, b) => sum + Number(b.deposit || 0), 0);

  res.json({
    statusCounts,
    todayBookings,
    overdueBookings,
    upcomingBookings,
    monthIncome,
    monthExpense,
    depositHolding,
  });
}));

// ==========================================
// 2. EQUIPMENTS API
// ==========================================
app.get('/api/equipments', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('equipments')
    .select('*')
    .order('id', { ascending: false });

  if (error) throw error;
  res.json(data);
}));

app.get('/api/equipments/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('equipments')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'ไม่พบอุปกรณ์นี้' });
  res.json(data);
}));

app.post('/api/equipments', asyncHandler(async (req, res) => {
  const {
    code, name, category, brand, model, image_url, serial_number,
    cost_price, current_value, rental_rate_per_day, status, defects,
  } = req.body;

  if (!code || !name || !category || rental_rate_per_day == null) {
    return res.status(400).json({ error: 'กรุณากรอกรหัส ชื่อ หมวดหมู่ และราคาเช่าต่อวัน' });
  }

  const validCategories = ['camera', 'lens', 'flash', 'accessory'];
  const validStatuses = ['available', 'booked', 'rented', 'maintenance'];

  if (!validCategories.includes(category)) return res.status(400).json({ error: 'หมวดหมู่อุปกรณ์ไม่ถูกต้อง' });
  if (status && !validStatuses.includes(status)) return res.status(400).json({ error: 'สถานะอุปกรณ์ไม่ถูกต้อง' });

  if (!Number.isFinite(Number(rental_rate_per_day)) || Number(rental_rate_per_day) < 0) {
    return res.status(400).json({ error: 'ราคาเช่าไม่ถูกต้อง' });
  }

  const { data, error } = await supabase
    .from('equipments')
    .insert([{
      code, name, category,
      brand: brand || null,
      model: model || null,
      image_url: image_url || null,
      serial_number: serial_number || null,
      cost_price: cost_price || 0,
      current_value: current_value || 0,
      rental_rate_per_day,
      status: status || 'available',
      defects: defects || '',
    }])
    .select();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'ข้อมูลซ้ำ เช่น รหัสอุปกรณ์หรือหมายเลขซีเรียล' });
    throw error;
  }

  res.status(201).json({ id: data[0].id, message: 'บันทึกอุปกรณ์สำเร็จ' });
}));

app.put('/api/equipments/:id', asyncHandler(async (req, res) => {
  const {
    code, name, category, brand, model, image_url, serial_number,
    cost_price, current_value, rental_rate_per_day, status, defects,
  } = req.body;

  const validCategories = ['camera', 'lens', 'flash', 'accessory'];
  const validStatuses = ['available', 'booked', 'rented', 'maintenance'];

  if (!code || !name || !category || rental_rate_per_day == null) {
    return res.status(400).json({ error: 'ข้อมูลอุปกรณ์ไม่ครบถ้วน' });
  }
  if (!validCategories.includes(category)) return res.status(400).json({ error: 'หมวดหมู่อุปกรณ์ไม่ถูกต้อง' });
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'สถานะอุปกรณ์ไม่ถูกต้อง' });

  const { data: oldRows } = await supabase.from('equipments').select('image_url').eq('id', req.params.id);

  const { data, error } = await supabase
    .from('equipments')
    .update({
      code, name, category,
      brand: brand || null,
      model: model || null,
      image_url: image_url || null,
      serial_number: serial_number || null,
      cost_price: cost_price || 0,
      current_value: current_value || 0,
      rental_rate_per_day,
      status,
      defects: defects || '',
      updated_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select();

  if (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'ข้อมูลซ้ำ เช่น รหัสอุปกรณ์หรือหมายเลขซีเรียล' });
    throw error;
  }

  if (!data || !data.length) return res.status(404).json({ error: 'ไม่พบอุปกรณ์นี้' });

  if (oldRows && oldRows.length && oldRows[0].image_url !== (image_url || null)) {
    removeUploadedFile(oldRows[0].image_url);
  }

  res.json({ message: 'อัปเดตอุปกรณ์สำเร็จ' });
}));

app.delete('/api/equipments/:id', asyncHandler(async (req, res) => {
  try {
    const { data: oldRows } = await supabase.from('equipments').select('image_url').eq('id', req.params.id);

    const { data: used, error: usedErr } = await supabase
      .from('booking_items')
      .select('id')
      .eq('equipment_id', req.params.id);

    if (usedErr) throw usedErr;

    if (used && used.length > 0) {
      return res.status(409).json({
        error: 'อุปกรณ์นี้มีประวัติการจอง ลบไม่ได้เพื่อไม่ให้ประวัติสูญหาย (ใช้สถานะซ่อมบำรุงเพื่อพักการใช้งานแทนได้)',
      });
    }

    const { data, error } = await supabase.from('equipments').delete().eq('id', req.params.id).select();
    if (error) throw error;

    if (!data || !data.length) return res.status(404).json({ error: 'ไม่พบอุปกรณ์นี้' });

    if (oldRows && oldRows.length) removeUploadedFile(oldRows[0].image_url);

    res.json({ message: 'ลบอุปกรณ์สำเร็จ' });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'ไม่สามารถลบอุปกรณ์ที่มีประวัติการจองหรือการซ่อมบำรุงได้' });
    }
    throw err;
  }
}));

// ==========================================
// 3. BOOKINGS API
// ==========================================
app.get('/api/bookings', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers!inner(fullname, phone, email), booking_items(equipment_id, equipments(name))')
    .order('id', { ascending: false });

  if (error) throw error;

  const formatted = (data || []).map(b => {
    const items = b.booking_items || [];
    const firstItem = items[0];
    return {
      ...b,
      customer_name: b.customers?.fullname,
      phone: b.customers?.phone,
      email: b.customers?.email,
      equipment_id: firstItem ? firstItem.equipment_id : null,
      equipment_names: items.map(bi => bi.equipments?.name).filter(Boolean).join(', '),
      equipment_ids: items.map(bi => bi.equipment_id).join(',')
    };
  });

  res.json(formatted);
}));

app.get('/api/bookings/:id', asyncHandler(async (req, res) => {
  const { data: booking, error: bkErr } = await supabase
    .from('bookings')
    .select('*, customers!inner(fullname, phone, email)')
    .eq('id', req.params.id)
    .single();

  if (bkErr || !booking) return res.status(404).json({ error: 'ไม่พบรายการจองนี้' });

  const { data: items, error: itErr } = await supabase
    .from('booking_items')
    .select('*, equipments(code, name, brand, model, image_url, category)')
    .eq('booking_id', req.params.id);

  if (itErr) throw itErr;

  const formattedItems = (items || []).map(item => ({
    ...item,
    ...(item.equipments || {})
  }));

  const { data: inspections, error: inspErr } = await supabase
    .from('inspections')
    .select('*')
    .eq('booking_id', req.params.id)
    .order('id', { ascending: false });

  if (inspErr) throw inspErr;

  res.json({
    ...booking,
    customer_name: booking.customers?.fullname,
    phone: booking.customers?.phone,
    email: booking.customers?.email,
    items: formattedItems,
    inspections: inspections || [],
  });
}));

// CREATE booking with Idempotency
const CONTACT_KEYS = ['line', 'facebook', 'instagram', 'tiktok', 'whatsapp', 'other'];
const sanitizeContacts = (raw) => {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const k of CONTACT_KEYS) {
    const v = String(raw[k] ?? '').trim().slice(0, 120);
    if (v) out[k] = v;
  }
  return out;
};
// คอลัมน์ contacts ต้องเพิ่มใน Supabase ก่อน (customer-contacts.sql) — ถ้ายังไม่เพิ่มจะไม่ทำให้การจองล้มเหลว
const saveCustomerContacts = async (id, contacts) => {
  const { error } = await supabase.from('customers').update({ contacts }).eq('id', id);
  if (error && !/contacts/i.test(error.message || '')) throw error;
};

app.post('/api/bookings', rateLimit({ windowMs: 60_000, max: 20 }), asyncHandler(async (req, res, next) => {
  const key = String(req.get('Idempotency-Key') || '').trim();
  if (!/^[A-Za-z0-9._:-]{16,128}$/.test(key)) {
    return res.status(400).json({ error: 'คำขอจองต้องมี Idempotency-Key ที่ถูกต้อง กรุณารีเฟรชหน้าแล้วลองใหม่' });
  }
  const bodyHash = crypto.createHash('sha256').update(JSON.stringify(req.body || {})).digest('hex');

  const { error: idemInsertErr } = await supabase
    .from('api_idempotency')
    .insert([{ idem_key: key, body_hash: bodyHash, state: 'processing', created_at: new Date().toISOString() }]);

  if (idemInsertErr) {
    if (idemInsertErr.code === '23505') { // Duplicate key
      const { data: savedRows } = await supabase
        .from('api_idempotency')
        .select('body_hash, state, response_status, response_body')
        .eq('idem_key', key)
        .limit(1);

      const saved = savedRows?.[0];
      if (!saved) return res.status(409).json({ error: 'กำลังตรวจสอบคำขอเดิม กรุณารอสักครู่' });
      if (saved.body_hash !== bodyHash) return res.status(409).json({ error: 'Idempotency-Key นี้ถูกใช้กับข้อมูลคนละชุด กรุณาเริ่มรายการใหม่' });
      if (saved.state !== 'complete') return res.status(409).json({ error: 'คำขอเดิมกำลังดำเนินการ กรุณารอสักครู่ก่อนตรวจสอบรายการจอง' });

      res.setHeader('Idempotency-Replayed', 'true');
      return res.status(Number(saved.response_status) || 201).json(JSON.parse(saved.response_body || '{}'));
    }
    throw idemInsertErr;
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const status = res.statusCode;
    const payload = JSON.stringify(body ?? {});
    supabase
      .from('api_idempotency')
      .update({ state: 'complete', response_status: status, response_body: payload })
      .eq('idem_key', key)
      .then(() => {})
      .catch(err => console.error('Cannot save idempotency response:', err.message));
    return originalJson(body);
  };

  res.on('close', () => {
    if (!res.writableEnded) {
      supabase.from('api_idempotency').delete().eq('idem_key', key).eq('state', 'processing').then(() => {}).catch(() => {});
    }
  });
  next();
}), asyncHandler(async (req, res) => {
  const {
    customer_name, phone, contacts, equipment_id, equipment_ids,
    start_date, end_date, notes, discount = 0, deposit,
    rental_type = 'daily', rental_hours = null, rental_region = 'local',
    delivery_method = 'meetup', custom_price = null,
  } = req.body;

  const equipmentIds = [
    ...new Set(
      (Array.isArray(equipment_ids) ? equipment_ids : [equipment_id])
        .filter((id) => id !== undefined && id !== null && id !== '')
        .map(Number)
    ),
  ];

  if (!customer_name || !phone || equipmentIds.length === 0 || !start_date || !end_date) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อลูกค้า เบอร์โทร กล้อง และช่วงเวลาเช่า' });
  }

  if (!['daily', 'hourly'].includes(rental_type)) return res.status(400).json({ error: 'รูปแบบการเช่าไม่ถูกต้อง' });
  if (!['local', 'south', 'other'].includes(rental_region)) return res.status(400).json({ error: 'พื้นที่เช่าไม่ถูกต้อง' });
  if (!['meetup', 'van', 'grab', 'post'].includes(delivery_method)) return res.status(400).json({ error: 'วิธีรับกล้องไม่ถูกต้อง' });

  const startIso = toISO(start_date);
  const endIso = toISO(end_date);
  if (!startIso || !endIso) return res.status(400).json({ error: 'รูปแบบวันที่ไม่ถูกต้อง' });

  const startDate = new Date(startIso);
  const endDate = new Date(endIso);
  const durationMs = endDate.getTime() - startDate.getTime();

  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return res.status(400).json({ error: 'วันและเวลาคืนต้องอยู่หลังวันและเวลาเริ่มเช่า' });
  }

  let totalDays = 1;
  let hours = null;
  if (rental_type === 'hourly') {
    hours = Number(rental_hours);
    if (rental_region !== 'local') return res.status(400).json({ error: 'รายชั่วโมงให้บริการเฉพาะพื้นที่สงขลา–เก้าเส้ง' });
    if (!Number.isInteger(hours) || hours < 2 || hours > 23) {
      return res.status(400).json({ error: 'การเช่ารายชั่วโมงเริ่มต้น 2 ชั่วโมง และเลือกได้สูงสุด 23 ชั่วโมง' });
    }
    if (Math.abs(durationMs - hours * 3600000) > 60000) {
      return res.status(400).json({ error: 'ช่วงเวลาคืนไม่ตรงกับจำนวนชั่วโมงที่เลือก' });
    }
  } else {
    const startHour = startDate.getHours();
    const endHour = endDate.getHours();
    const startMinute = startDate.getMinutes();
    const endMinute = endDate.getMinutes();
    if (startHour !== endHour || startMinute !== endMinute) {
      return res.status(400).json({ error: 'การเช่ารายวันต้องคืนกล้องเวลาเดียวกับเวลารับกล้อง' });
    }
    totalDays = Math.max(1, Math.round(durationMs / 86400000));
    const minDays = rental_region === 'south' ? 2 : rental_region === 'other' ? 5 : 1;
    if (totalDays < minDays) {
      return res.status(400).json({
        error: rental_region === 'south'
          ? 'ต่างจังหวัดโซนภาคใต้เช่ารายวันขั้นต่ำ 2 วัน'
          : rental_region === 'other'
            ? 'ต่างจังหวัดภาคอื่น ๆ เช่ารายวันขั้นต่ำ 5 วัน'
            : 'การเช่ารายวันขั้นต่ำ 1 วัน',
      });
    }
  }

  const discountAmount = Number(discount);
  const depositAmount = deposit === undefined || deposit === null || deposit === ''
    ? equipmentIds.length * 500
    : Number(deposit);
  const suppliedPrice = custom_price === undefined || custom_price === null || custom_price === ''
    ? null
    : Number(custom_price);

  if (
    !Number.isFinite(discountAmount) || discountAmount < 0 ||
    !Number.isFinite(depositAmount) || depositAmount < 0 ||
    (suppliedPrice !== null && (!Number.isFinite(suppliedPrice) || suppliedPrice < 0))
  ) {
    return res.status(400).json({ error: 'ราคา ส่วนลด หรือเงินประกันไม่ถูกต้อง' });
  }

  // ลูกค้า + ตรวจกล้อง ทำพร้อมกัน (ไม่ต้องรอกันและกัน)
  const resolveCustomer = async () => {
    const cleanContacts = sanitizeContacts(contacts);
    const hasContacts = Object.keys(cleanContacts).length > 0;
    const { data: existingCustomer } = await supabase.from('customers').select('id').eq('phone', phone).limit(1);
    if (existingCustomer && existingCustomer.length) {
      const id = existingCustomer[0].id;
      await supabase.from('customers').update({ fullname: customer_name }).eq('id', id);
      if (hasContacts) await saveCustomerContacts(id, cleanContacts);
      return id;
    }
    const { data: newCust, error: custErr } = await supabase.from('customers').insert([{ fullname: customer_name, phone }]).select();
    if (custErr) throw custErr;
    if (hasContacts) await saveCustomerContacts(newCust[0].id, cleanContacts);
    return newCust[0].id;
  };

  const checkEquipment = async (eqId) => {
    if (!Number.isInteger(eqId) || eqId <= 0) throw new Error('รหัสกล้องไม่ถูกต้อง');

    const [{ data: eqData }, { data: conflicts }] = await Promise.all([
      supabase.from('equipments').select('*').eq('id', eqId).single(),
      supabase
        .from('booking_items')
        .select('bookings!inner(id, booking_no, start_date, end_date, status)')
        .eq('equipment_id', eqId)
        .in('bookings.status', ['pending', 'confirmed', 'picked_up'])
        .lt('bookings.start_date', endIso)
        .gt('bookings.end_date', startIso)
        .limit(1),
    ]);
    if (!eqData) throw new Error(`ไม่พบกล้องรหัส ${eqId}`);
    if (eqData.status === 'maintenance') throw new Error(`กล้อง ${eqData.name} อยู่ระหว่างซ่อมบำรุง`);

    if (conflicts && conflicts.length) {
      const cBk = conflicts[0].bookings;
      throw new Error(`กล้อง ${eqData.name} ถูกจองซ้ำกับรายการ ${cBk.booking_no} (${cBk.start_date} ถึง ${cBk.end_date})`);
    }
    return { equipmentId: eqId, rate: Number(eqData.rental_rate_per_day || 0) };
  };

  const [customerId, itemRates] = await Promise.all([
    resolveCustomer(),
    Promise.all(equipmentIds.map(checkEquipment)),
  ]);

  const calculatedSubtotal = itemRates.reduce(
    (sum, it) => sum + (rental_type === 'hourly' ? (it.rate / 24) * hours : it.rate * totalDays),
    0
  );

  const subtotal = suppliedPrice === null ? calculatedSubtotal : suppliedPrice;
  if (discountAmount > subtotal) throw new Error('ส่วนลดต้องไม่เกินราคาเช่าที่ตกลง');
  const netTotal = Math.max(0, subtotal - discountAmount);

  // Create Booking Record
  const { data: bookingData, error: bkInsertErr } = await supabase
    .from('bookings')
    .insert([{
      booking_no: makeBookingNo(),
      customer_id: customerId,
      start_date: startIso,
      end_date: endIso,
      total_days: totalDays,
      subtotal,
      discount: discountAmount,
      deposit: depositAmount,
      extra_charges: 0,
      fine_amount: 0,
      net_total: netTotal,
      status: 'confirmed',
      notes: notes || null,
      rental_type,
      rental_hours: hours,
      rental_region,
      delivery_method,
      custom_price: suppliedPrice,
    }])
    .select();

  if (bkInsertErr) throw bkInsertErr;

  const bookingId = bookingData[0].id;
  const itemsToInsert = itemRates.map(item => ({
    booking_id: bookingId,
    equipment_id: item.equipmentId,
    daily_rate: item.rate
  }));

  const { error: itemsErr } = await supabase.from('booking_items').insert(itemsToInsert);
  if (itemsErr) throw itemsErr;

  res.status(201).json({
    id: bookingId,
    message: 'สร้างรายการจองสำเร็จ',
    total_days: totalDays,
    rental_type,
    rental_hours: hours,
    rental_region,
    delivery_method,
    subtotal,
    discount: discountAmount,
    deposit: depositAmount,
    net_total: netTotal,
  });
}));

// CANCEL booking
app.patch('/api/bookings/:id/cancel', asyncHandler(async (req, res) => {
  const { data: booking } = await supabase.from('bookings').select('*').eq('id', req.params.id).single();
  if (!booking) return res.status(404).json({ error: 'ไม่พบรายการจองนี้' });

  if (!['pending', 'confirmed'].includes(booking.status)) {
    return res.status(400).json({ error: 'ยกเลิกได้เฉพาะรายการที่ยังไม่ได้รับอุปกรณ์' });
  }

  const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
  if (error) throw error;

  res.json({ message: 'ยกเลิกรายการจองสำเร็จ' });
}));

// ==========================================
// 4. CHECKOUT & RETURN
// ==========================================
app.post('/api/bookings/:id/checkout', asyncHandler(async (req, res) => {
  // ลดจำนวนรอบไป–กลับฐานข้อมูล: อ่านพร้อมกัน → ตรวจ → เขียนพร้อมกัน
  const [{ data: booking }, equipmentIds] = await Promise.all([
    supabase.from('bookings').select('*').eq('id', req.params.id).single(),
    getBookingEquipmentIds(req.params.id),
  ]);
  if (!booking) return res.status(404).json({ error: 'ไม่พบรายการจองนี้' });

  if (!['pending', 'confirmed'].includes(booking.status)) {
    return res.status(400).json({ error: 'รายการนี้ไม่สามารถรับอุปกรณ์ออกได้' });
  }
  if (!equipmentIds.length) return res.status(400).json({ error: 'รายการจองนี้ไม่มีอุปกรณ์' });

  const { data: eqs, error: eqErr } = await supabase.from('equipments').select('id, name, status').in('id', equipmentIds);
  if (eqErr) throw eqErr;
  const found = new Map((eqs || []).map((e) => [e.id, e]));
  for (const id of equipmentIds) {
    const eq = found.get(id);
    if (!eq) throw new Error(`ไม่พบอุปกรณ์รหัส ${id}`);
    if (eq.status === 'maintenance') throw new Error(`อุปกรณ์ ${eq.name} อยู่ระหว่างซ่อมบำรุง`);
  }

  const holdDeposit = Number(booking.deposit) > 0 && (!booking.deposit_status || booking.deposit_status === 'pending');
  const [eqUpdate, , bkUpdate] = await Promise.all([
    supabase.from('equipments').update({ status: 'rented' }).in('id', equipmentIds),
    saveInspection(booking.id, 'checkout', req.body),
    supabase.from('bookings').update({ status: 'picked_up' }).eq('id', booking.id),
    // รับกล้องออก = ถือว่ารับเงินประกันแล้ว — ไม่ error ถ้ายังไม่ได้เพิ่มคอลัมน์
    holdDeposit
      ? supabase.from('bookings').update({ deposit_status: 'held', deposit_updated_at: new Date().toISOString() }).eq('id', booking.id)
      : Promise.resolve(),
  ]);
  if (eqUpdate.error) throw eqUpdate.error;
  if (bkUpdate.error) throw bkUpdate.error;

  res.json({ message: 'บันทึกการรับอุปกรณ์ออกสำเร็จ' });
}));

app.post('/api/bookings/:id/return', asyncHandler(async (req, res) => {
  const [{ data: booking }, equipmentIds] = await Promise.all([
    supabase.from('bookings').select('*').eq('id', req.params.id).single(),
    getBookingEquipmentIds(req.params.id),
  ]);
  if (!booking) return res.status(404).json({ error: 'ไม่พบรายการจองนี้' });

  if (booking.status !== 'picked_up') {
    return res.status(400).json({ error: 'รับคืนได้เฉพาะรายการที่รับอุปกรณ์ออกแล้ว' });
  }

  const extraCharges = Number(req.body.extra_charges ?? 0);
  const fineAmount = Number(req.body.fine_amount ?? 0);

  if (!Number.isFinite(extraCharges) || !Number.isFinite(fineAmount) || extraCharges < 0 || fineAmount < 0) {
    return res.status(400).json({ error: 'ค่าใช้จ่ายเพิ่มเติมหรือค่าปรับไม่ถูกต้อง' });
  }

  const netTotal = Number(booking.subtotal) - Number(booking.discount) + extraCharges + fineAmount;
  const rentalIncome = Math.max(0, Number(booking.subtotal) - Number(booking.discount));
  const now = new Date().toISOString();
  const incomeRows = [
    ['ค่าเช่าอุปกรณ์', rentalIncome, `รับชำระค่าเช่าจอง ${booking.booking_no}`],
    ['ค่าใช้จ่ายเพิ่มเติม', extraCharges, `ค่าใช้จ่ายเพิ่มเติม ${booking.booking_no}`],
    ['ค่าปรับ', fineAmount, `ค่าปรับ ${booking.booking_no}`],
  ].filter(([, amount]) => amount > 0).map(([category, amount, description]) => ({
    type: 'income',
    category,
    booking_id: booking.id,
    amount,
    transaction_date: now,
    description,
  }));

  // อุปกรณ์ที่อยู่ระหว่างซ่อมต้องไม่ถูกเปลี่ยนเป็น "ว่าง"
  const { data: eqs, error: eqErr } = equipmentIds.length
    ? await supabase.from('equipments').select('id, status').in('id', equipmentIds)
    : { data: [], error: null };
  if (eqErr) throw eqErr;
  const freeIds = (eqs || []).filter((e) => e.status !== 'maintenance').map((e) => e.id);

  const [eqUpdate, , bkUpdate] = await Promise.all([
    freeIds.length
      ? supabase.from('equipments').update({ status: 'available' }).in('id', freeIds)
      : Promise.resolve({ error: null }),
    saveInspection(booking.id, 'checkin', req.body),
    supabase.from('bookings').update({
      status: 'returned',
      extra_charges: extraCharges,
      fine_amount: fineAmount,
      net_total: Math.max(0, netTotal),
    }).eq('id', booking.id),
  ]);
  if (eqUpdate.error) throw eqUpdate.error;
  if (bkUpdate.error) throw bkUpdate.error;

  // บันทึกรายรับหลังจากบันทึกการคืนสำเร็จแล้วเท่านั้น (กันมีรายรับทั้งที่การคืนไม่สำเร็จ)
  if (incomeRows.length) {
    const { error: txError } = await supabase.from('transactions').insert(incomeRows);
    if (txError) throw txError;
  }

  res.json({
    message: 'บันทึกการคืนอุปกรณ์สำเร็จ',
    extra_charges: extraCharges,
    fine_amount: fineAmount,
    net_total: Math.max(0, netTotal),
  });
}));

// ==========================================
// เงินประกัน + สำรองข้อมูล
// ==========================================
const DEPOSIT_STATUSES = ['pending', 'held', 'returned', 'partial'];
const DEPOSIT_DEDUCT_CATEGORY = 'หักเงินประกัน';
const columnMissing = (error) => !!error && /deposit_status|deposit_deducted|deposit_note|deposit_updated_at|column/i.test(error.message || '');

app.patch('/api/bookings/:id/deposit', asyncHandler(async (req, res) => {
  const status = String(req.body.status || '');
  if (!DEPOSIT_STATUSES.includes(status)) return res.status(400).json({ error: 'สถานะเงินประกันไม่ถูกต้อง' });

  const { data: booking } = await supabase.from('bookings').select('*').eq('id', req.params.id).maybeSingle();
  if (!booking) return res.status(404).json({ error: 'ไม่พบรายการจองนี้' });

  const deposit = Number(booking.deposit || 0);
  if (deposit <= 0) return res.status(400).json({ error: 'รายการนี้ไม่มีเงินประกัน' });

  let deducted = 0;
  if (status === 'partial') {
    deducted = Number(req.body.deducted);
    if (!Number.isFinite(deducted) || deducted <= 0 || deducted > deposit) {
      return res.status(400).json({ error: `จำนวนเงินที่หักต้องมากกว่า 0 และไม่เกิน ${deposit} บาท` });
    }
  }
  const note = String(req.body.note || '').trim().slice(0, 300);
  if (status === 'partial' && !note) return res.status(400).json({ error: 'กรุณาระบุเหตุผลที่หักเงินประกัน' });

  const { error } = await supabase.from('bookings').update({
    deposit_status: status,
    deposit_deducted: deducted,
    deposit_note: note || null,
    deposit_updated_at: new Date().toISOString(),
  }).eq('id', booking.id);

  if (error) {
    if (columnMissing(error)) {
      return res.status(500).json({ error: 'ยังไม่ได้เพิ่มคอลัมน์เงินประกันในฐานข้อมูล กรุณารัน SQL ที่แนะนำใน Supabase ก่อน' });
    }
    throw error;
  }

  // เงินที่หักไว้ถือเป็นรายรับของร้าน — ลบรายการเก่าของใบนี้ก่อน กันบันทึกซ้ำเมื่อแก้ไข
  await supabase.from('transactions').delete().eq('booking_id', booking.id).eq('category', DEPOSIT_DEDUCT_CATEGORY);
  if (status === 'partial') {
    await supabase.from('transactions').insert([{
      type: 'income',
      category: DEPOSIT_DEDUCT_CATEGORY,
      booking_id: booking.id,
      amount: deducted,
      transaction_date: new Date().toISOString(),
      description: `หักเงินประกัน ${booking.booking_no}: ${note}`,
    }]);
  }

  res.json({ message: 'บันทึกสถานะเงินประกันแล้ว', deposit_status: status, deposit_deducted: deducted });
}));

app.get('/api/deposits', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, booking_no, deposit, deposit_status, status, end_date, customers(fullname, phone)')
    .eq('deposit_status', 'held')
    .gt('deposit', 0)
    .order('end_date', { ascending: true });

  if (error) {
    if (columnMissing(error)) return res.json({ held_total: 0, count: 0, rows: [], needs_setup: true });
    throw error;
  }

  const rows = (data || []).map((b) => ({
    id: b.id,
    booking_no: b.booking_no,
    deposit: Number(b.deposit || 0),
    status: b.status,
    end_date: b.end_date,
    customer_name: b.customers?.fullname,
    phone: b.customers?.phone,
  }));
  res.json({ held_total: rows.reduce((sum, r) => sum + r.deposit, 0), count: rows.length, rows });
}));

const BACKUP_TABLES = ['customers', 'equipments', 'bookings', 'booking_items', 'inspections', 'maintenance_records', 'transactions'];

async function fetchAllRows(table) {
  const out = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await supabase.from(table).select('*').order('id', { ascending: true }).range(from, from + size - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...(data || []));
    if (!data || data.length < size) break;
  }
  return out;
}

// ไม่รวม app_settings (รหัสผ่าน) และ api_idempotency
app.get('/api/backup', rateLimit({ windowMs: 60_000, max: 5, message: 'ขอสำรองข้อมูลถี่เกินไป ลองใหม่ในอีกสักครู่' }), asyncHandler(async (req, res) => {
  const tables = {};
  for (const t of BACKUP_TABLES) tables[t] = await fetchAllRows(t);
  res.json({
    app: 'LensDesk',
    version: 1,
    exported_at: new Date().toISOString(),
    counts: Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, v.length])),
    tables,
  });
}));

app.get('/api/history', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers!inner(fullname, phone), booking_items(equipments(name))')
    .in('status', ['returned', 'cancelled'])
    .order('id', { ascending: false });

  if (error) throw error;

  const formatted = (data || []).map(b => ({
    ...b,
    customer_name: b.customers?.fullname,
    phone: b.customers?.phone,
    equipment_names: (b.booking_items || []).map(bi => bi.equipments?.name).filter(Boolean).join(', ')
  }));

  res.json(formatted);
}));

app.get('/api/bookings/:id/inspections', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('booking_id', req.params.id)
    .order('id', { ascending: false });

  if (error) throw error;
  res.json(data);
}));

app.get('/api/maintenance', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('maintenance_records')
    .select('*, equipments!inner(code, name)')
    .order('id', { ascending: false });

  if (error) throw error;

  const formatted = (data || []).map(m => ({
    ...m,
    equipment_code: m.equipments?.code,
    equipment_name: m.equipments?.name,
  }));

  res.json(formatted);
}));

app.post('/api/maintenance', asyncHandler(async (req, res) => {
  const { equipment_id, title, description, cost = 0, maintenance_date } = req.body;
  if (!equipment_id || !title || !maintenance_date) {
    return res.status(400).json({ error: 'กรุณาระบุอุปกรณ์ หัวข้อ และวันที่ซ่อมบำรุง' });
  }

  const { data: eq } = await supabase.from('equipments').select('id').eq('id', equipment_id).single();
  if (!eq) return res.status(404).json({ error: 'ไม่พบอุปกรณ์นี้' });

  const { data, error } = await supabase
    .from('maintenance_records')
    .insert([{
      equipment_id,
      title,
      description: description || null,
      cost,
      maintenance_date,
      status: 'in_progress'
    }])
    .select();

  if (error) throw error;

  await supabase.from('equipments').update({ status: 'maintenance' }).eq('id', equipment_id);

  res.status(201).json({ id: data[0].id, message: 'บันทึกงานซ่อมบำรุงสำเร็จ' });
}));

app.patch('/api/maintenance/:id/complete', asyncHandler(async (req, res) => {
  const { data: record } = await supabase.from('maintenance_records').select('*').eq('id', req.params.id).single();
  if (!record) return res.status(404).json({ error: 'ไม่พบรายการซ่อมบำรุง' });
  if (record.status === 'completed') return res.status(400).json({ error: 'งานซ่อมนี้ปิดไปแล้ว' });

  const finalCost = req.body.cost !== undefined && Number.isFinite(Number(req.body.cost))
    ? Math.max(0, Number(req.body.cost))
    : Number(record.cost || 0);

  await supabase
    .from('maintenance_records')
    .update({ status: 'completed', cost: finalCost })
    .eq('id', record.id);

  if (req.body.record_expense && finalCost > 0) {
    await supabase.from('transactions').insert([{
      type: 'expense',
      category: 'ซ่อมบำรุง',
      booking_id: null,
      amount: finalCost,
      transaction_date: new Date().toISOString(),
      description: `ค่าซ่อมบำรุง: ${record.title}`
    }]);
  }

  const { data: activeJobs } = await supabase
    .from('maintenance_records')
    .select('id')
    .eq('equipment_id', record.equipment_id)
    .eq('status', 'in_progress');

  if (!activeJobs || activeJobs.length === 0) {
    const { data: activeRentals } = await supabase
      .from('booking_items')
      .select('bookings!inner(id, status)')
      .eq('equipment_id', record.equipment_id)
      .eq('bookings.status', 'picked_up');

    await supabase.from('equipments').update({
      status: (activeRentals && activeRentals.length > 0) ? 'rented' : 'available'
    }).eq('id', record.equipment_id);
  }

  res.json({ message: 'ปิดงานซ่อมบำรุงสำเร็จ' });
}));

// ดึงข้อมูลทั้งหมดแบบแบ่งหน้า — Supabase จำกัดแถวต่อคำขอ (ปกติ 1,000) ถ้าไม่แบ่งหน้ายอดสะสมจะ "หาย/รีเซ็ต" เมื่อรายการเกินจำนวนนั้น
async function pagedRows(makeQuery, pageSize = 1000) {
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await makeQuery().range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

app.get('/api/transactions', asyncHandler(async (req, res) => {
  const data = await pagedRows(() => supabase
    .from('transactions')
    .select('*, bookings(booking_no)')
    .order('transaction_date', { ascending: false })
    .order('id', { ascending: false }));

  const formatted = (data || []).map(t => ({
    ...t,
    booking_no: t.bookings?.booking_no
  }));

  res.json(formatted);
}));

app.post('/api/transactions', asyncHandler(async (req, res) => {
  const { type, category, booking_id = null, amount, transaction_date, description } = req.body;

  if (
    !['income', 'expense'].includes(type) ||
    !category ||
    amount == null ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) < 0 ||
    !transaction_date
  ) {
    return res.status(400).json({ error: 'กรุณาตรวจสอบประเภท หมวดหมู่ จำนวนเงิน และวันที่' });
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      type,
      category,
      booking_id: booking_id || null,
      amount,
      transaction_date: toISO(transaction_date),
      description: description || null,
    }])
    .select();

  if (error) throw error;

  res.status(201).json({ id: data[0].id, message: 'บันทึกรายการทางการเงินสำเร็จ' });
}));

app.delete('/api/transactions/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('transactions').delete().eq('id', req.params.id).select();
  if (error) throw error;
  if (!data || !data.length) return res.status(404).json({ error: 'ไม่พบรายการนี้' });

  res.json({ message: 'ลบรายการสำเร็จ' });
}));

app.get('/api/customers', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*, bookings(id, net_total, status, start_date)')
    .order('id', { ascending: false });

  if (error) throw error;

  const formatted = (data || []).map(c => {
    const validBookings = c.bookings || [];
    const returnedBookings = validBookings.filter(b => b.status === 'returned');
    const totalSpent = returnedBookings.reduce((sum, b) => sum + Number(b.net_total || 0), 0);
    const startDates = validBookings.map(b => b.start_date).filter(Boolean).sort();
    const lastBooking = startDates.length ? startDates[startDates.length - 1] : null;

    return {
      id: c.id,
      fullname: c.fullname,
      phone: c.phone,
      email: c.email,
      id_card_no: c.id_card_no,
      contact_channel: c.contact_channel,
      notes: c.notes,
      created_at: c.created_at,
      booking_count: validBookings.filter(b => b.status !== 'cancelled').length,
      returned_count: returnedBookings.length,
      contacts: c.contacts || {},
      total_spent: totalSpent,
      last_booking: lastBooking,
    };
  }).sort((a, b) => {
    if (a.last_booking && b.last_booking) return new Date(b.last_booking) - new Date(a.last_booking);
    if (a.last_booking) return -1;
    if (b.last_booking) return 1;
    return b.id - a.id;
  });

  res.json(formatted);
}));

app.patch('/api/customers/:id', asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'รหัสลูกค้าไม่ถูกต้อง' });
  const update = {};
  if (req.body.fullname !== undefined) {
    const name = String(req.body.fullname).trim();
    if (!name) return res.status(400).json({ error: 'กรุณากรอกชื่อลูกค้า' });
    update.fullname = name.slice(0, 120);
  }
  if (req.body.contacts !== undefined) update.contacts = sanitizeContacts(req.body.contacts);
  if (!Object.keys(update).length) return res.status(400).json({ error: 'ไม่มีข้อมูลที่จะแก้ไข' });
  const { error } = await supabase.from('customers').update(update).eq('id', id);
  if (error) {
    if (/contacts/i.test(error.message || '')) return res.status(400).json({ error: 'ยังไม่ได้เพิ่มคอลัมน์ช่องทางติดต่อในฐานข้อมูล กรุณารัน customer-contacts.sql ใน Supabase ก่อน' });
    throw error;
  }
  res.json({ message: 'บันทึกข้อมูลลูกค้าแล้ว' });
}));

app.get('/api/availability', asyncHandler(async (req, res) => {
  const startIso = toISO(req.query.start);
  const endIso = toISO(req.query.end);

  if (!startIso || !endIso) {
    return res.status(400).json({ error: 'กรุณาระบุช่วงเวลา' });
  }

  const { data, error } = await supabase
    .from('booking_items')
    .select('equipment_id, bookings!inner(booking_no, start_date, end_date, status, customers(fullname))')
    .in('bookings.status', ['pending', 'confirmed', 'picked_up'])
    .lt('bookings.start_date', endIso)
    .gt('bookings.end_date', startIso);

  if (error) throw error;

  const formatted = (data || []).map(row => ({
    equipment_id: row.equipment_id,
    booking_no: row.bookings?.booking_no,
    start_date: row.bookings?.start_date,
    end_date: row.bookings?.end_date,
    customer_name: row.bookings?.customers?.fullname,
  }));

  res.json(formatted);
}));

app.get('/api/reports/summary', asyncHandler(async (req, res) => {
  const [transactions, { data: bookingItems }, { data: equipments }] = await Promise.all([
    pagedRows(() => supabase.from('transactions').select('type, amount, transaction_date').order('id', { ascending: true })),
    supabase
      .from('booking_items')
      .select('id, booking_id, daily_rate, equipment_id, equipments(id, name, code, image_url), bookings!inner(status, subtotal, discount, net_total)')
      .eq('bookings.status', 'returned'),
    supabase.from('equipments').select('cost_price, current_value'),
  ]);

  // 1. Monthly Summary
  const monthlyMap = {};
  for (const t of transactions || []) {
    if (!t.transaction_date) continue;
    const monthKey = bkkParts(t.transaction_date).key;
    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { month: monthKey, income: 0, expense: 0 };
    if (t.type === 'income') monthlyMap[monthKey].income += Number(t.amount || 0);
    if (t.type === 'expense') monthlyMap[monthKey].expense += Number(t.amount || 0);
  }
  const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)).slice(-12);

  // 2. Top Equipment — นับเฉพาะรายการที่รับคืนแล้ว และใช้ราคาที่ตกลงจริง (หลังส่วนลด) แบ่งตามสัดส่วนราคากล้องแต่ละตัว
  // เพื่อให้ยอดรวมตรงกับรายรับในบัญชี
  const rateByBooking = {};
  for (const bi of bookingItems || []) {
    rateByBooking[bi.booking_id] = (rateByBooking[bi.booking_id] || 0) + Number(bi.daily_rate || 0);
  }
  const topMap = {};
  for (const bi of bookingItems || []) {
    const eq = bi.equipments;
    if (!eq) continue;
    if (!topMap[eq.id]) {
      topMap[eq.id] = { id: eq.id, name: eq.name, code: eq.code, image_url: eq.image_url, rental_count: 0, revenue: 0 };
    }
    const bk = bi.bookings || {};
    const rentalTotal = Math.max(0, Number(bk.subtotal || 0) - Number(bk.discount || 0));
    const totalRate = rateByBooking[bi.booking_id] || 0;
    const share = totalRate > 0 ? Number(bi.daily_rate || 0) / totalRate : 1 / Math.max(1, (bookingItems || []).filter((x) => x.booking_id === bi.booking_id).length);
    topMap[eq.id].rental_count += 1;
    topMap[eq.id].revenue += rentalTotal * share;
  }
  const topEquipment = Object.values(topMap)
    .sort((a, b) => b.rental_count - a.rental_count || b.revenue - a.revenue)
    .slice(0, 5);

  // 3. Totals & Assets
  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions || []) {
    if (t.type === 'income') totalIncome += Number(t.amount || 0);
    if (t.type === 'expense') totalExpense += Number(t.amount || 0);
  }

  let totalCost = 0;
  let totalValue = 0;
  for (const e of equipments || []) {
    totalCost += Number(e.cost_price || 0);
    totalValue += Number(e.current_value || 0);
  }

  res.json({
    monthly,
    topEquipment,
    totals: { income: totalIncome, expense: totalExpense },
    assets: {
      equipment_count: (equipments || []).length,
      total_cost: totalCost,
      total_value: totalValue,
    },
  });
}));

// ==========================================
// ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  console.error(err);

  if (err.message === 'CORS_ORIGIN_DENIED') return res.status(403).json({ error: 'Origin นี้ไม่ได้รับอนุญาต' });
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) return res.status(400).json({ error: 'รูปแบบ JSON ไม่ถูกต้อง' });
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'ไฟล์รูปใหญ่เกินไป (สูงสุด 4 MB)' });
  }

  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(415).json({ error: 'รองรับเฉพาะไฟล์ JPG, PNG, WEBP หรือ GIF' });
  }

  res.status(500).json({ error: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    const { error } = await supabase.from('equipments').select('id').limit(1);
    if (error) throw error;

    const HOST = process.env.HOST || '127.0.0.1';
    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log('Supabase PostgreSQL connected successfully');
    });
  } catch (err) {
    console.error('Cannot connect to Supabase:', err.message);
    process.exit(1);
  }
}

module.exports = app;

if (require.main === module) {
  startServer();
}