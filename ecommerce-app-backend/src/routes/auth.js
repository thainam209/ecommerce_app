// const express = require('express'); // Sử dụng Express framework để tạo router 
// const router = express.Router();
// const { User } = require('../models');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken'); // Thư viện tạo JWT dùng để xác thực và ủy quyền người dùng 
// const dotenv = require('dotenv'); // Thư viện quản lý biến môi trường dùng để bảo mật thông tin nhạy cảm như khóa bí mật JWT
// dotenv.config();

// // Đăng ký
// router.post('/register', async (req, res) => {
//   const { username, email, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = await User.create({ username, email, password: hashedPassword, role: 'user' });
//   res.json(user);
// });

// // Đăng nhập
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ where: { email } });
//   console.log(password);
//   if (!user || !await bcrypt.compare(password, user.password)) {
//     return res.status(401).json({ error: 'Invalid credentials' });
//   }
//   // Tạo JWT sau khi xác thực thành công dùng để ủy quyền người dùng
//   // Token được lưu ở phía client (frontend) và gửi kèm trong header Authorization của các request sau này
//   const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   res.json({ token });
// });
// module.exports = router;


const express = require('express'); // Sử dụng Express framework để tạo router 
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Thư viện tạo JWT dùng để xác thực và ủy quyền người dùng 
const dotenv = require('dotenv'); // Thư viện quản lý biến môi trường dùng để bảo mật thông tin nhạy cảm như khóa bí mật JWT
dotenv.config();

// Hàm tạo token dùng chung
function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// =======================
// ĐĂNG KÝ USER THƯỜNG
// POST /api/auth/register
// =======================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Thiếu username / email / password' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user'
    });

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Register user error:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
});

// =======================
// ĐĂNG KÝ ADMIN
// POST /api/auth/register-admin
// =======================
// body: { username, email, password, adminSecret? }
router.post('/register-admin', async (req, res) => {
  try {
    const { username, email, password, adminSecret } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Thiếu username / email / password' });
    }

    // Tuỳ dự án, em có thể bỏ đoạn check secret này nếu chỉ dùng nội bộ
    if (process.env.ADMIN_SECRET) {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: 'Sai ADMIN_SECRET, không được tạo admin' });
      }
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    const token = signToken(admin);

    res.json({
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Register admin error:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
});

// =======================
// ĐĂNG NHẬP (USER HOẶC ADMIN)
// POST /api/auth/login
// =======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const token = signToken(user);

    // Trả về cả user + token để frontend dùng luôn role
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi server', details: err.message });
  }
});

module.exports = router;