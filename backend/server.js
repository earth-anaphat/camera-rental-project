
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
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
    return callback(new Error('CORS_ORIGIN_DENIED'));
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

app.post('/api/auth/login', rateLimit({ windowMs: 15 * 60_000, max: 8, message: 'เข้าสู่ระบบไม่สำเร็จหลายครั้ง กรุณารอ 15 นาที' }), (req, res) => {
  if (!OWNER_PASSWORD || !AUTH_SECRET) return res.status(503).json({ error: 'ยังไม่ได้ตั้งค่า OWNER_PASSWORD และ AUTH_SECRET ในไฟล์ .env' });
  const password = req.body?.password;
  if (typeof password !== 'string' || !safeEqual(password, OWNER_PASSWORD)) {
    return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }
  const now = Math.floor(Date.now() / 1000);
  const token = signToken({ sub: 'owner', role: 'owner', iat: now, exp: now + TOKEN_TTL_SECONDS });
  res.setHeader('Cache-Control', 'no-store');
  res.json({ token, expiresIn: TOKEN_TTL_SECONDS, role: 'owner' });
});
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

// ==========================================
// FILE UPLOAD (รูปอุปกรณ์จากเครื่องของผู้ใช้)
// ==========================================
const UPLOAD_DIR = path.join(__dirname, '../uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

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

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = ALLOWED_MIME[file.mimetype] || '.jpg';
      cb(null, `eq-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME[file.mimetype]) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
});

// ลบไฟล์ที่เราอัปโหลดเอง (ไม่แตะลิงก์ภายนอกหรือไฟล์นอกโฟลเดอร์)
const removeUploadedFile = (imageUrl) => {
  try {
    if (!imageUrl || !String(imageUrl).startsWith('/uploads/')) return;
    const filePath = path.join(UPLOAD_DIR, path.basename(imageUrl));
    if (filePath.startsWith(UPLOAD_DIR) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn('Cannot remove file:', err.message);
  }
};

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'ไม่พบไฟล์รูปภาพ' });
  }

  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    size: req.file.size,
    message: 'อัปโหลดรูปสำเร็จ',
  });
});

// ==========================================
// DATABASE CONNECTION
// ==========================================
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'camera_rental_db',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const toDateTime = (value) => {
  if (!value) return null;

  // รองรับค่า datetime-local จาก HTML
  return String(value).replace('T', ' ');
};

const calculateDays = (start, end) => {
  const milliseconds = new Date(end).getTime() - new Date(start).getTime();

  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    throw new Error('วันและเวลาคืนต้องอยู่หลังวันและเวลาเริ่มเช่า');
  }

  // คิดค่าเช่าเป็นรายวัน ปัดเศษขึ้น และอย่างน้อย 1 วัน
  return Math.max(1, Math.ceil(milliseconds / 86400000));
};

const makeBookingNo = () => {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${time}-${random}`;
};

const getBookingEquipmentIds = async (connection, bookingId) => {
  const [rows] = await connection.query(
    'SELECT equipment_id FROM booking_items WHERE booking_id = ?',
    [bookingId]
  );

  return rows.map((row) => row.equipment_id);
};

const saveInspection = async (
  connection,
  bookingId,
  type,
  body = {}
) => {
  const accessories = body.accessories_checked ?? null;
  const images = body.images ?? null;

  await connection.query(
    `INSERT INTO inspections
      (booking_id, type, inspection_date, accessories_checked,
       condition_notes, images)
     VALUES (?, ?, NOW(), ?, ?, ?)`,
    [
      bookingId,
      type,
      accessories === null ? null : JSON.stringify(accessories),
      body.condition_notes || null,
      images === null ? null : JSON.stringify(images),
    ]
  );
};

// ==========================================
// 1. DASHBOARD API
// ==========================================
app.get('/api/dashboard', asyncHandler(async (req, res) => {
  const [statusRows] = await db.query(`
    SELECT status, COUNT(*) AS count
    FROM equipments
    GROUP BY status
  `);

  const statusCounts = {};
  for (const row of statusRows) {
    statusCounts[row.status] = Number(row.count);
  }

  const [todayBookings] = await db.query(`
    SELECT
      b.*,
      c.fullname AS customer_name,
      c.phone,
      (
        SELECT GROUP_CONCAT(e.name SEPARATOR ', ')
        FROM booking_items bi
        JOIN equipments e ON e.id = bi.equipment_id
        WHERE bi.booking_id = b.id
      ) AS equipment_names
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    WHERE DATE(b.start_date) = CURDATE()
       OR DATE(b.end_date) = CURDATE()
    ORDER BY b.start_date ASC
  `);

  const [overdueBookings] = await db.query(`
    SELECT
      b.*,
      c.fullname AS customer_name,
      c.phone,
      (
        SELECT GROUP_CONCAT(e.name SEPARATOR ', ')
        FROM booking_items bi
        JOIN equipments e ON e.id = bi.equipment_id
        WHERE bi.booking_id = b.id
      ) AS equipment_names
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    WHERE b.end_date < NOW()
      AND b.status = 'picked_up'
    ORDER BY b.end_date ASC
  `);

  // รายการรับอุปกรณ์ที่กำลังจะมาถึงใน 7 วันข้างหน้า
  const [upcomingBookings] = await db.query(`
    SELECT
      b.*,
      c.fullname AS customer_name,
      c.phone,
      (
        SELECT GROUP_CONCAT(e.name SEPARATOR ', ')
        FROM booking_items bi
        JOIN equipments e ON e.id = bi.equipment_id
        WHERE bi.booking_id = b.id
      ) AS equipment_names
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    WHERE b.status IN ('pending', 'confirmed')
      AND b.start_date >= NOW()
      AND b.start_date < DATE_ADD(NOW(), INTERVAL 7 DAY)
    ORDER BY b.start_date ASC
    LIMIT 10
  `);

  const [[monthRow]] = await db.query(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense
    FROM transactions
    WHERE YEAR(transaction_date) = YEAR(CURDATE())
      AND MONTH(transaction_date) = MONTH(CURDATE())
  `);

  const [[depositRow]] = await db.query(`
    SELECT COALESCE(SUM(deposit), 0) AS holding
    FROM bookings
    WHERE status IN ('pending', 'confirmed', 'picked_up')
  `);

  res.json({
    statusCounts,
    todayBookings,
    overdueBookings,
    upcomingBookings,
    monthIncome: Number(monthRow.income),
    monthExpense: Number(monthRow.expense),
    depositHolding: Number(depositRow.holding),
  });
}));

// ==========================================
// 2. EQUIPMENTS API
// ==========================================

// GET all equipment
app.get('/api/equipments', asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT *
    FROM equipments
    ORDER BY id DESC
  `);

  res.json(rows);
}));

// GET one equipment
app.get('/api/equipments/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM equipments WHERE id = ?',
    [req.params.id]
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'ไม่พบอุปกรณ์นี้' });
  }

  res.json(rows[0]);
}));

// CREATE equipment
app.post('/api/equipments', asyncHandler(async (req, res) => {
  const {
    code,
    name,
    category,
    brand,
    model,
    image_url,
    serial_number,
    cost_price,
    current_value,
    rental_rate_per_day,
    status,
    defects,
  } = req.body;

  if (!code || !name || !category || rental_rate_per_day == null) {
    return res.status(400).json({
      error: 'กรุณากรอกรหัส ชื่อ หมวดหมู่ และราคาเช่าต่อวัน',
    });
  }

  const validCategories = ['camera', 'lens', 'flash', 'accessory'];
  const validStatuses = ['available', 'booked', 'rented', 'maintenance'];

  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'หมวดหมู่อุปกรณ์ไม่ถูกต้อง' });
  }

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'สถานะอุปกรณ์ไม่ถูกต้อง' });
  }

  if (
    !Number.isFinite(Number(rental_rate_per_day)) ||
    Number(rental_rate_per_day) < 0
  ) {
    return res.status(400).json({ error: 'ราคาเช่าไม่ถูกต้อง' });
  }

  const [result] = await db.query(
    `INSERT INTO equipments
    (code, name, category, brand, model, image_url, serial_number,
    cost_price, current_value, rental_rate_per_day, status, defects)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
    code,
    name,
    category,
    brand || null,
    model || null,
    image_url || null,
    serial_number || null,
    cost_price || 0,
    current_value || 0,
    rental_rate_per_day,
    status || 'available',
    defects || '',
]
  );

  res.status(201).json({
    id: result.insertId,
    message: 'บันทึกอุปกรณ์สำเร็จ',
  });
}));

// UPDATE equipment
app.put('/api/equipments/:id', asyncHandler(async (req, res) => {
  const {
    code,
    name,
    category,
    brand,
    model,
    image_url,
    serial_number,
    cost_price,
    current_value,
    rental_rate_per_day,
    status,
    defects,
  } = req.body;

  const validCategories = ['camera', 'lens', 'flash', 'accessory'];
  const validStatuses = ['available', 'booked', 'rented', 'maintenance'];

  if (!code || !name || !category || rental_rate_per_day == null) {
    return res.status(400).json({ error: 'ข้อมูลอุปกรณ์ไม่ครบถ้วน' });
  }

  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'หมวดหมู่อุปกรณ์ไม่ถูกต้อง' });
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'สถานะอุปกรณ์ไม่ถูกต้อง' });
  }

  const [oldRows] = await db.query(
    'SELECT image_url FROM equipments WHERE id = ?',
    [req.params.id]
  );

  const [result] = await db.query(
    `UPDATE equipments
        SET code = ?, name = ?, category = ?, brand = ?, model = ?,
            image_url = ?, serial_number = ?, cost_price = ?, current_value = ?,
            rental_rate_per_day = ?, status = ?, defects = ?
        WHERE id = ?`,
        [
        code,
        name,
        category,
        brand || null,
        model || null,
        image_url || null,
        serial_number || null,
        cost_price || 0,
        current_value || 0,
        rental_rate_per_day,
        status,
        defects || '',
        req.params.id,
        ]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ error: 'ไม่พบอุปกรณ์นี้' });
  }

  // ถ้าเปลี่ยนรูปใหม่ ให้ลบไฟล์รูปเก่าออกจากเครื่อง
  if (oldRows.length && oldRows[0].image_url !== (image_url || null)) {
    removeUploadedFile(oldRows[0].image_url);
  }

  res.json({ message: 'อัปเดตอุปกรณ์สำเร็จ' });
}));

// DELETE equipment
app.delete('/api/equipments/:id', asyncHandler(async (req, res) => {
  try {
    const [oldRows] = await db.query(
      'SELECT image_url FROM equipments WHERE id = ?',
      [req.params.id]
    );

    // ฐานข้อมูลตั้ง ON DELETE CASCADE ไว้ การลบอุปกรณ์จะทำให้ประวัติการจองหาย
    // จึงบล็อกการลบถ้าอุปกรณ์เคยอยู่ในรายการจองใดๆ
    const [used] = await db.query(
      'SELECT COUNT(*) AS count FROM booking_items WHERE equipment_id = ?',
      [req.params.id]
    );

    if (Number(used[0].count) > 0) {
      return res.status(409).json({
        error:
          'อุปกรณ์นี้มีประวัติการจอง ลบไม่ได้เพื่อไม่ให้ประวัติสูญหาย (ใช้สถานะซ่อมบำรุงเพื่อพักการใช้งานแทนได้)',
      });
    }

    const [result] = await db.query(
      'DELETE FROM equipments WHERE id = ?',
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'ไม่พบอุปกรณ์นี้' });
    }

    if (oldRows.length) removeUploadedFile(oldRows[0].image_url);

    res.json({ message: 'ลบอุปกรณ์สำเร็จ' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        error: 'ไม่สามารถลบอุปกรณ์ที่มีประวัติการจองหรือการซ่อมบำรุงได้',
      });
    }

    throw err;
  }
}));

// ==========================================
// 3. BOOKINGS API
// ==========================================

// GET bookings
app.get('/api/bookings', asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT
      b.*,
      c.fullname AS customer_name,
      c.phone,
      c.email,
      (
        SELECT bi.equipment_id
        FROM booking_items bi
        WHERE bi.booking_id = b.id
        ORDER BY bi.id
        LIMIT 1
      ) AS equipment_id,
      (
        SELECT GROUP_CONCAT(e.name SEPARATOR ', ')
        FROM booking_items bi
        JOIN equipments e ON e.id = bi.equipment_id
        WHERE bi.booking_id = b.id
      ) AS equipment_names,
      (
        SELECT GROUP_CONCAT(bi.equipment_id)
        FROM booking_items bi
        WHERE bi.booking_id = b.id
      ) AS equipment_ids
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    ORDER BY b.id DESC
  `);

  res.json(rows);
}));

// GET booking details
app.get('/api/bookings/:id', asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT b.*, c.fullname AS customer_name, c.phone, c.email
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    WHERE b.id = ?
  `, [req.params.id]);

  if (!rows.length) {
    return res.status(404).json({ error: 'ไม่พบรายการจองนี้' });
  }

  const [items] = await db.query(`
    SELECT bi.*, e.code, e.name, e.brand, e.model, e.image_url, e.category
    FROM booking_items bi
    JOIN equipments e ON e.id = bi.equipment_id
    WHERE bi.booking_id = ?
  `, [req.params.id]);

  const [inspections] = await db.query(
    'SELECT * FROM inspections WHERE booking_id = ? ORDER BY id DESC',
    [req.params.id]
  );

  res.json({
    ...rows[0],
    items,
    inspections,
  });
}));

// CREATE booking: persist idempotency result so retries do not create duplicate bookings.
app.post('/api/bookings', rateLimit({ windowMs: 60_000, max: 20 }), asyncHandler(async (req, res, next) => {
  const key = String(req.get('Idempotency-Key') || '').trim();
  if (!/^[A-Za-z0-9._:-]{16,128}$/.test(key)) {
    return res.status(400).json({ error: 'คำขอจองต้องมี Idempotency-Key ที่ถูกต้อง กรุณารีเฟรชหน้าแล้วลองใหม่' });
  }
  const bodyHash = crypto.createHash('sha256').update(JSON.stringify(req.body || {})).digest('hex');
  try {
    await db.query("INSERT INTO api_idempotency (idem_key, body_hash, state, created_at) VALUES (?, ?, 'processing', NOW())", [key, bodyHash]);
    req.idempotency = { key, bodyHash };
  } catch (err) {
    if (err.code !== 'ER_DUP_ENTRY') throw err;
    const [rows] = await db.query('SELECT body_hash, state, response_status, response_body FROM api_idempotency WHERE idem_key = ? LIMIT 1', [key]);
    const saved = rows[0];
    if (!saved) return res.status(409).json({ error: 'กำลังตรวจสอบคำขอเดิม กรุณารอสักครู่' });
    if (saved.body_hash !== bodyHash) return res.status(409).json({ error: 'Idempotency-Key นี้ถูกใช้กับข้อมูลคนละชุด กรุณาเริ่มรายการใหม่' });
    if (saved.state !== 'complete') return res.status(409).json({ error: 'คำขอเดิมกำลังดำเนินการ กรุณารอสักครู่ก่อนตรวจสอบรายการจอง' });
    res.setHeader('Idempotency-Replayed', 'true');
    return res.status(Number(saved.response_status) || 201).json(JSON.parse(saved.response_body || '{}'));
  }
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const status = res.statusCode;
    const payload = JSON.stringify(body ?? {});
    db.query("UPDATE api_idempotency SET state = 'complete', response_status = ?, response_body = ? WHERE idem_key = ?", [status, payload, key])
      .catch(err => console.error('Cannot save idempotency response:', err.message));
    return originalJson(body);
  };
  res.on('close', () => {
    if (!res.writableEnded) db.query("DELETE FROM api_idempotency WHERE idem_key = ? AND state = 'processing'", [key]).catch(() => {});
  });
  next();
}), asyncHandler(async (req, res) => {
  const {
    customer_name,
    phone,
    equipment_id,
    equipment_ids,
    start_date,
    end_date,
    notes,
    discount = 0,
    deposit,
    rental_type = 'daily',
    rental_hours = null,
    rental_region = 'local',
    delivery_method = 'meetup',
    custom_price = null,
  } = req.body;

  const equipmentIds = [
    ...new Set(
      (Array.isArray(equipment_ids) ? equipment_ids : [equipment_id])
        .filter((id) => id !== undefined && id !== null && id !== '')
        .map(Number)
    ),
  ];

  if (!customer_name || !phone || equipmentIds.length === 0 || !start_date || !end_date) {
    return res.status(400).json({
      error: 'กรุณากรอกชื่อลูกค้า เบอร์โทร กล้อง และช่วงเวลาเช่า',
    });
  }

  if (!['daily', 'hourly'].includes(rental_type)) {
    return res.status(400).json({ error: 'รูปแบบการเช่าไม่ถูกต้อง' });
  }
  if (!['local', 'south', 'other'].includes(rental_region)) {
    return res.status(400).json({ error: 'พื้นที่เช่าไม่ถูกต้อง' });
  }
  if (!['meetup', 'van', 'grab', 'post'].includes(delivery_method)) {
    return res.status(400).json({ error: 'วิธีรับกล้องไม่ถูกต้อง' });
  }

  const start = toDateTime(start_date);
  const end = toDateTime(end_date);
  const startDate = new Date(String(start).replace(' ', 'T'));
  const endDate = new Date(String(end).replace(' ', 'T'));
  const durationMs = endDate.getTime() - startDate.getTime();

  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return res.status(400).json({ error: 'วันและเวลาคืนต้องอยู่หลังวันและเวลาเริ่มเช่า' });
  }

  let totalDays = 1;
  let hours = null;
  if (rental_type === 'hourly') {
    hours = Number(rental_hours);
    if (rental_region !== 'local') {
      return res.status(400).json({ error: 'รายชั่วโมงให้บริการเฉพาะพื้นที่สงขลา–เก้าเส้ง' });
    }
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

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [customerRows] = await connection.query(
      'SELECT id FROM customers WHERE phone = ? LIMIT 1 FOR UPDATE',
      [phone]
    );

    let customerId;
    if (customerRows.length) {
      customerId = customerRows[0].id;
      await connection.query('UPDATE customers SET fullname = ? WHERE id = ?', [customer_name, customerId]);
    } else {
      const [customerResult] = await connection.query(
        'INSERT INTO customers (fullname, phone) VALUES (?, ?)',
        [customer_name, phone]
      );
      customerId = customerResult.insertId;
    }

    let calculatedSubtotal = 0;
    const itemRates = [];
    for (const equipmentId of equipmentIds) {
      if (!Number.isInteger(equipmentId) || equipmentId <= 0) {
        throw new Error('รหัสกล้องไม่ถูกต้อง');
      }

      const [equipmentRows] = await connection.query(
        'SELECT * FROM equipments WHERE id = ? FOR UPDATE',
        [equipmentId]
      );
      if (!equipmentRows.length) throw new Error(`ไม่พบกล้องรหัส ${equipmentId}`);

      const equipment = equipmentRows[0];
      if (equipment.status === 'maintenance') throw new Error(`กล้อง ${equipment.name} อยู่ระหว่างซ่อมบำรุง`);

      const [conflicts] = await connection.query(
        `SELECT b.id, b.booking_no, b.start_date, b.end_date
         FROM bookings b
         JOIN booking_items bi ON bi.booking_id = b.id
         WHERE bi.equipment_id = ?
           AND b.status IN ('pending', 'confirmed', 'picked_up')
           AND b.start_date < ?
           AND b.end_date > ?
         LIMIT 1
         FOR UPDATE`,
        [equipmentId, end, start]
      );
      if (conflicts.length) {
        throw new Error(
          `กล้อง ${equipment.name} ถูกจองซ้ำกับรายการ ${conflicts[0].booking_no} (${conflicts[0].start_date} ถึง ${conflicts[0].end_date})`
        );
      }

      const rate = Number(equipment.rental_rate_per_day || 0);
      itemRates.push({ equipmentId, rate });
      calculatedSubtotal += rental_type === 'hourly' ? (rate / 24) * hours : rate * totalDays;
    }

    const subtotal = suppliedPrice === null ? calculatedSubtotal : suppliedPrice;
    if (discountAmount > subtotal) throw new Error('ส่วนลดต้องไม่เกินราคาเช่าที่ตกลง');
    const netTotal = Math.max(0, subtotal - discountAmount);

    const [bookingResult] = await connection.query(
      `INSERT INTO bookings
        (booking_no, customer_id, start_date, end_date, total_days,
         subtotal, discount, deposit, extra_charges, fine_amount,
         net_total, status, notes, rental_type, rental_hours, rental_region,
         delivery_method, custom_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 'confirmed', ?, ?, ?, ?, ?, ?)`,
      [
        makeBookingNo(),
        customerId,
        start,
        end,
        totalDays,
        subtotal,
        discountAmount,
        depositAmount,
        netTotal,
        notes || null,
        rental_type,
        hours,
        rental_region,
        delivery_method,
        suppliedPrice,
      ]
    );

    const bookingId = bookingResult.insertId;
    for (const item of itemRates) {
      await connection.query(
        'INSERT INTO booking_items (booking_id, equipment_id, daily_rate) VALUES (?, ?, ?)',
        [bookingId, item.equipmentId, item.rate]
      );
    }

    await connection.commit();
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
  } catch (err) {
    await connection.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
}));

// CANCEL booking
app.patch('/api/bookings/:id/cancel', asyncHandler(async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT * FROM bookings WHERE id = ? FOR UPDATE',
      [req.params.id]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'ไม่พบรายการจองนี้' });
    }

    const booking = rows[0];

    if (!['pending', 'confirmed'].includes(booking.status)) {
      await connection.rollback();
      return res.status(400).json({
        error: 'ยกเลิกได้เฉพาะรายการที่ยังไม่ได้รับอุปกรณ์',
      });
    }

    await connection.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [booking.id]
    );

    await connection.commit();

    res.json({ message: 'ยกเลิกรายการจองสำเร็จ' });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}));

// ==========================================
// 4. CHECKOUT: HAND OVER EQUIPMENT
// ==========================================
app.post('/api/bookings/:id/checkout', asyncHandler(async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT * FROM bookings WHERE id = ? FOR UPDATE',
      [req.params.id]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'ไม่พบรายการจองนี้' });
    }

    const booking = rows[0];

    if (!['pending', 'confirmed'].includes(booking.status)) {
      await connection.rollback();
      return res.status(400).json({
        error: 'รายการนี้ไม่สามารถรับอุปกรณ์ออกได้',
      });
    }

    const equipmentIds = await getBookingEquipmentIds(
      connection,
      booking.id
    );

    if (!equipmentIds.length) {
      await connection.rollback();
      return res.status(400).json({
        error: 'รายการจองนี้ไม่มีอุปกรณ์',
      });
    }

    for (const equipmentId of equipmentIds) {
      const [equipmentRows] = await connection.query(
        'SELECT * FROM equipments WHERE id = ? FOR UPDATE',
        [equipmentId]
      );

      if (!equipmentRows.length) {
        throw new Error(`ไม่พบอุปกรณ์รหัส ${equipmentId}`);
      }

      if (equipmentRows[0].status === 'maintenance') {
        throw new Error(
          `อุปกรณ์ ${equipmentRows[0].name} อยู่ระหว่างซ่อมบำรุง`
        );
      }

      await connection.query(
        "UPDATE equipments SET status = 'rented' WHERE id = ?",
        [equipmentId]
      );
    }

    await saveInspection(
      connection,
      booking.id,
      'checkout',
      req.body
    );

    await connection.query(
      "UPDATE bookings SET status = 'picked_up' WHERE id = ?",
      [booking.id]
    );

    await connection.commit();

    res.json({ message: 'บันทึกการรับอุปกรณ์ออกสำเร็จ' });
  } catch (err) {
    await connection.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
}));

// ==========================================
// 5. RETURN: RECEIVE EQUIPMENT
// ==========================================
app.post('/api/bookings/:id/return', asyncHandler(async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT * FROM bookings WHERE id = ? FOR UPDATE',
      [req.params.id]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'ไม่พบรายการจองนี้' });
    }

    const booking = rows[0];

    if (booking.status !== 'picked_up') {
      await connection.rollback();
      return res.status(400).json({
        error: 'รับคืนได้เฉพาะรายการที่รับอุปกรณ์ออกแล้ว',
      });
    }

    const equipmentIds = await getBookingEquipmentIds(
      connection,
      booking.id
    );

    const extraCharges = Number(req.body.extra_charges ?? 0);
    const fineAmount = Number(req.body.fine_amount ?? 0);

    if (
      !Number.isFinite(extraCharges) ||
      !Number.isFinite(fineAmount) ||
      extraCharges < 0 ||
      fineAmount < 0
    ) {
      await connection.rollback();
      return res.status(400).json({
        error: 'ค่าใช้จ่ายเพิ่มเติมหรือค่าปรับไม่ถูกต้อง',
      });
    }

    for (const equipmentId of equipmentIds) {
      const [equipmentRows] = await connection.query(
        'SELECT * FROM equipments WHERE id = ? FOR UPDATE',
        [equipmentId]
      );

      if (!equipmentRows.length) continue;

      // ไม่เปลี่ยนอุปกรณ์ที่อยู่ระหว่างซ่อมกลับเป็น available
      if (equipmentRows[0].status !== 'maintenance') {
        await connection.query(
          "UPDATE equipments SET status = 'available' WHERE id = ?",
          [equipmentId]
        );
      }
    }

    await saveInspection(
      connection,
      booking.id,
      'checkin',
      req.body
    );

    const netTotal =
      Number(booking.subtotal) -
      Number(booking.discount) +
      extraCharges +
      fineAmount;

    await connection.query(
      `UPDATE bookings
       SET status = 'returned',
           extra_charges = ?,
           fine_amount = ?,
           net_total = ?
       WHERE id = ?`,
      [
        extraCharges,
        fineAmount,
        Math.max(0, netTotal),
        booking.id,
      ]
    );

    // บันทึกรายรับเข้าระบบการเงินอัตโนมัติเมื่อรับคืนอุปกรณ์
    const rentalIncome = Math.max(
      0,
      Number(booking.subtotal) - Number(booking.discount)
    );

    const incomeRows = [
      ['ค่าเช่าอุปกรณ์', rentalIncome, `รับชำระค่าเช่าจอง ${booking.booking_no}`],
      ['ค่าใช้จ่ายเพิ่มเติม', extraCharges, `ค่าใช้จ่ายเพิ่มเติม ${booking.booking_no}`],
      ['ค่าปรับ', fineAmount, `ค่าปรับ ${booking.booking_no}`],
    ];

    for (const [category, amount, description] of incomeRows) {
      if (amount > 0) {
        await connection.query(
          `INSERT INTO transactions
            (type, category, booking_id, amount, transaction_date, description)
           VALUES ('income', ?, ?, ?, NOW(), ?)`,
          [category, booking.id, amount, description]
        );
      }
    }

    await connection.commit();

    res.json({
      message: 'บันทึกการคืนอุปกรณ์สำเร็จ',
      extra_charges: extraCharges,
      fine_amount: fineAmount,
      net_total: Math.max(0, netTotal),
    });
  } catch (err) {
    await connection.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
}));

// ==========================================
// 6. RENTAL HISTORY
// ==========================================
app.get('/api/history', asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT
      b.*,
      c.fullname AS customer_name,
      c.phone,
      (
        SELECT GROUP_CONCAT(e.name SEPARATOR ', ')
        FROM booking_items bi
        JOIN equipments e ON e.id = bi.equipment_id
        WHERE bi.booking_id = b.id
      ) AS equipment_names
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    WHERE b.status IN ('returned', 'cancelled')
    ORDER BY b.id DESC
  `);

  res.json(rows);
}));

// ==========================================
// 7. INSPECTIONS
// ==========================================
app.get('/api/bookings/:id/inspections', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM inspections WHERE booking_id = ? ORDER BY id DESC',
    [req.params.id]
  );

  res.json(rows);
}));

// ==========================================
// 8. MAINTENANCE RECORDS
// ==========================================
app.get('/api/maintenance', asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT m.*, e.code AS equipment_code, e.name AS equipment_name
    FROM maintenance_records m
    JOIN equipments e ON e.id = m.equipment_id
    ORDER BY m.id DESC
  `);

  res.json(rows);
}));

app.post('/api/maintenance', asyncHandler(async (req, res) => {
  const {
    equipment_id,
    title,
    description,
    cost = 0,
    maintenance_date,
  } = req.body;

  if (!equipment_id || !title || !maintenance_date) {
    return res.status(400).json({
      error: 'กรุณาระบุอุปกรณ์ หัวข้อ และวันที่ซ่อมบำรุง',
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [equipmentRows] = await connection.query(
      'SELECT id FROM equipments WHERE id = ? FOR UPDATE',
      [equipment_id]
    );

    if (!equipmentRows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'ไม่พบอุปกรณ์นี้' });
    }

    const [result] = await connection.query(
      `INSERT INTO maintenance_records
        (equipment_id, title, description, cost, maintenance_date, status)
       VALUES (?, ?, ?, ?, ?, 'in_progress')`,
      [
        equipment_id,
        title,
        description || null,
        cost,
        maintenance_date,
      ]
    );

    await connection.query(
      "UPDATE equipments SET status = 'maintenance' WHERE id = ?",
      [equipment_id]
    );

    await connection.commit();

    res.status(201).json({
      id: result.insertId,
      message: 'บันทึกงานซ่อมบำรุงสำเร็จ',
    });
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}));

app.patch(
  '/api/maintenance/:id/complete',
  asyncHandler(async (req, res) => {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [rows] = await connection.query(
        'SELECT * FROM maintenance_records WHERE id = ? FOR UPDATE',
        [req.params.id]
      );

      if (!rows.length) {
        await connection.rollback();
        return res.status(404).json({ error: 'ไม่พบรายการซ่อมบำรุง' });
      }

      const record = rows[0];

      if (record.status === 'completed') {
        await connection.rollback();
        return res.status(400).json({ error: 'งานซ่อมนี้ปิดไปแล้ว' });
      }

      const finalCost =
        req.body.cost !== undefined && Number.isFinite(Number(req.body.cost))
          ? Math.max(0, Number(req.body.cost))
          : Number(record.cost || 0);

      await connection.query(
        "UPDATE maintenance_records SET status = 'completed', cost = ? WHERE id = ?",
        [finalCost, record.id]
      );

      // บันทึกค่าซ่อมเป็นรายจ่ายอัตโนมัติ (ถ้าผู้ใช้เลือก)
      if (req.body.record_expense && finalCost > 0) {
        await connection.query(
          `INSERT INTO transactions
            (type, category, booking_id, amount, transaction_date, description)
           VALUES ('expense', 'ซ่อมบำรุง', NULL, ?, NOW(), ?)`,
          [finalCost, `ค่าซ่อมบำรุง: ${record.title}`]
        );
      }

      const [activeJobs] = await connection.query(
        `SELECT COUNT(*) AS count
         FROM maintenance_records
         WHERE equipment_id = ?
           AND status = 'in_progress'`,
        [record.equipment_id]
      );

      if (Number(activeJobs[0].count) === 0) {
        const [activeRentals] = await connection.query(
          `SELECT COUNT(*) AS count
           FROM booking_items bi
           JOIN bookings b ON b.id = bi.booking_id
           WHERE bi.equipment_id = ?
             AND b.status = 'picked_up'`,
          [record.equipment_id]
        );

        await connection.query(
          'UPDATE equipments SET status = ? WHERE id = ?',
          [
            Number(activeRentals[0].count) > 0 ? 'rented' : 'available',
            record.equipment_id,
          ]
        );
      }

      await connection.commit();

      res.json({ message: 'ปิดงานซ่อมบำรุงสำเร็จ' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  })
);

// ==========================================
// 9. TRANSACTIONS
// ==========================================
app.get('/api/transactions', asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT t.*, b.booking_no
    FROM transactions t
    LEFT JOIN bookings b ON b.id = t.booking_id
    ORDER BY t.transaction_date DESC, t.id DESC
  `);

  res.json(rows);
}));

app.post('/api/transactions', asyncHandler(async (req, res) => {
  const {
    type,
    category,
    booking_id = null,
    amount,
    transaction_date,
    description,
  } = req.body;

  if (
    !['income', 'expense'].includes(type) ||
    !category ||
    amount == null ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) < 0 ||
    !transaction_date
  ) {
    return res.status(400).json({
      error: 'กรุณาตรวจสอบประเภท หมวดหมู่ จำนวนเงิน และวันที่',
    });
  }

  const [result] = await db.query(
    `INSERT INTO transactions
      (type, category, booking_id, amount, transaction_date, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      type,
      category,
      booking_id || null,
      amount,
      toDateTime(transaction_date),
      description || null,
    ]
  );

  res.status(201).json({
    id: result.insertId,
    message: 'บันทึกรายการทางการเงินสำเร็จ',
  });
}));

app.delete('/api/transactions/:id', asyncHandler(async (req, res) => {
  const [result] = await db.query(
    'DELETE FROM transactions WHERE id = ?',
    [req.params.id]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ error: 'ไม่พบรายการนี้' });
  }

  res.json({ message: 'ลบรายการสำเร็จ' });
}));

// ==========================================
// 10. CUSTOMERS
// ==========================================
app.get('/api/customers', asyncHandler(async (req, res) => {
  const [rows] = await db.query(`
    SELECT
      c.*,
      COUNT(b.id) AS booking_count,
      COALESCE(SUM(CASE WHEN b.status = 'returned' THEN b.net_total END), 0)
        AS total_spent,
      MAX(b.start_date) AS last_booking
    FROM customers c
    LEFT JOIN bookings b ON b.customer_id = c.id
    GROUP BY c.id
    ORDER BY last_booking DESC, c.id DESC
  `);

  res.json(rows);
}));

// ==========================================
// 11. AVAILABILITY (อุปกรณ์ที่ไม่ว่างในช่วงเวลาที่เลือก)
// ==========================================
app.get('/api/availability', asyncHandler(async (req, res) => {
  const start = toDateTime(req.query.start);
  const end = toDateTime(req.query.end);

  if (!start || !end) {
    return res.status(400).json({ error: 'กรุณาระบุช่วงเวลา' });
  }

  const [rows] = await db.query(
    `SELECT DISTINCT bi.equipment_id, b.booking_no, b.start_date, b.end_date
     FROM booking_items bi
     JOIN bookings b ON b.id = bi.booking_id
     WHERE b.status IN ('pending', 'confirmed', 'picked_up')
       AND b.start_date < ?
       AND b.end_date > ?`,
    [end, start]
  );

  res.json(rows);
}));

// ==========================================
// 12. REPORTS
// ==========================================
app.get('/api/reports/summary', asyncHandler(async (req, res) => {
  const [monthly] = await db.query(`
    SELECT
      DATE_FORMAT(transaction_date, '%Y-%m') AS month,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense
    FROM transactions
    WHERE transaction_date >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 11 MONTH)
    GROUP BY month
    ORDER BY month ASC
  `);

  const [topEquipment] = await db.query(`
    SELECT
      e.id, e.name, e.code, e.image_url,
      COUNT(bi.id) AS rental_count,
      COALESCE(SUM(bi.daily_rate * b.total_days), 0) AS revenue
    FROM booking_items bi
    JOIN bookings b ON b.id = bi.booking_id
    JOIN equipments e ON e.id = bi.equipment_id
    WHERE b.status IN ('picked_up', 'returned')
    GROUP BY e.id
    ORDER BY rental_count DESC, revenue DESC
    LIMIT 5
  `);

  const [[totals]] = await db.query(`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense
    FROM transactions
  `);

  const [[assets]] = await db.query(`
    SELECT
      COUNT(*) AS equipment_count,
      COALESCE(SUM(cost_price), 0) AS total_cost,
      COALESCE(SUM(current_value), 0) AS total_value
    FROM equipments
  `);

  res.json({
    monthly: monthly.map((m) => ({
      month: m.month,
      income: Number(m.income),
      expense: Number(m.expense),
    })),
    topEquipment: topEquipment.map((t) => ({
      ...t,
      rental_count: Number(t.rental_count),
      revenue: Number(t.revenue),
    })),
    totals: {
      income: Number(totals.income),
      expense: Number(totals.expense),
    },
    assets: {
      equipment_count: Number(assets.equipment_count),
      total_cost: Number(assets.total_cost),
      total_value: Number(assets.total_value),
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
    return res.status(413).json({ error: 'ไฟล์รูปใหญ่เกินไป (สูงสุด 8 MB)' });
  }

  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(415).json({
      error: 'รองรับเฉพาะไฟล์ JPG, PNG, WEBP หรือ GIF',
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'ข้อมูลซ้ำ เช่น รหัสอุปกรณ์หรือหมายเลขซีเรียล',
    });
  }

  if (
    err.code === 'ER_NO_REFERENCED_ROW_2' ||
    err.code === 'ER_ROW_IS_REFERENCED_2'
  ) {
    return res.status(409).json({
      error: 'ข้อมูลเชื่อมโยงกับรายการอื่นในฐานข้อมูล',
    });
  }

  res.status(500).json({
    error: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์',
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5001;

async function ensureBookingColumns(connection) {
  const additions = [
    ['rental_type', "ALTER TABLE bookings ADD COLUMN rental_type ENUM('daily','hourly') NOT NULL DEFAULT 'daily'"],
    ['rental_hours', 'ALTER TABLE bookings ADD COLUMN rental_hours INT NULL'],
    ['rental_region', "ALTER TABLE bookings ADD COLUMN rental_region ENUM('local','south','other') NOT NULL DEFAULT 'local'"],
    ['delivery_method', "ALTER TABLE bookings ADD COLUMN delivery_method ENUM('meetup','van','grab','post') NOT NULL DEFAULT 'meetup'"],
    ['custom_price', 'ALTER TABLE bookings ADD COLUMN custom_price DECIMAL(10,2) NULL'],
  ];

  for (const [column, alterSql] of additions) {
    const [rows] = await connection.query('SHOW COLUMNS FROM bookings LIKE ?', [column]);
    if (!rows.length) {
      await connection.query(alterSql);
      console.log(`Database migration: added bookings.${column}`);
    }
  }
}

async function ensureDefaultCameras(connection) {
  const cameras = [
    { code: 'RIC-GR3-1', name: 'Ricoh gr iiix (1)', brand: 'Ricoh', model: 'GR IIIx' },
    { code: 'RIC-GR3-2', name: 'Ricoh gr iiix (2)', brand: 'Ricoh', model: 'GR IIIx' },
    { code: 'CAN-IXUS-285-HS-A', name: 'Canon ixus 285 hs a', brand: 'Canon', model: 'IXUS 285 HS A' },
    { code: 'FUJI-XT100', name: 'Fuji film x-t100', brand: 'Fujifilm', model: 'X-T100' },
  ];

  for (const camera of cameras) {
    const [found] = await connection.query(
      'SELECT id FROM equipments WHERE name = ? OR code = ? LIMIT 1',
      [camera.name, camera.code]
    );
    if (found.length) continue;
    await connection.query(
      `INSERT INTO equipments
        (code, name, category, brand, model, rental_rate_per_day, status, defects)
       VALUES (?, ?, 'camera', ?, ?, 0, 'available', '')`,
      [camera.code, camera.name, camera.brand, camera.model]
    );
    console.log(`Seeded default camera: ${camera.name}`);
  }
}

async function startServer() {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    await connection.query(`CREATE TABLE IF NOT EXISTS api_idempotency (
      idem_key VARCHAR(128) NOT NULL PRIMARY KEY,
      body_hash CHAR(64) NOT NULL,
      state ENUM('processing','complete') NOT NULL DEFAULT 'processing',
      response_status SMALLINT NULL,
      response_body MEDIUMTEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_api_idempotency_created (created_at)
    ) ENGINE=InnoDB`);
    // Remove old idempotency records after 7 days to keep the table bounded.
    await connection.query('DELETE FROM api_idempotency WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)').catch(() => {});
    await ensureBookingColumns(connection);
    await ensureDefaultCameras(connection);
    connection.release();

    const HOST = process.env.HOST || '127.0.0.1';
    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log('MariaDB connected successfully');
    });
  } catch (err) {
    console.error('Cannot connect to MariaDB:', err.message);
    process.exit(1);
  }
}

startServer();