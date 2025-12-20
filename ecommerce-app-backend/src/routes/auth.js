const express = require('express'); // Sử dụng Express framework để tạo router 
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Thư viện tạo JWT dùng để xác thực và ủy quyền người dùng 
const dotenv = require('dotenv'); // Thư viện quản lý biến môi trường dùng để bảo mật thông tin nhạy cảm như khóa bí mật JWT
dotenv.config();

// Đăng ký
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashedPassword, role: 'user' });
  res.json(user);
});

// Đăng nhập
// router.post('/login', async (req, res) => {
//   const { email, password, apikey } = req.body;
//   const user = await User.findOne({ where: { email } });
//   if (!apikey || apikey !== process.env.API_KEY) { // Hardcode ở .env, nhưng demo leakage bằng cách log hoặc expose
//     return res.status(401).json({ error: 'Invalid API key' + apikey});
//   }
//   //console.log(password);
//   if (!user || !await bcrypt.compare(password, user.password)) {
//     return res.status(401).json({ error: 'Invalid credentials' });
//   }
//   // Tạo JWT sau khi xác thực thành công dùng để ủy quyền người dùng
//   // Token được lưu ở phía client (frontend) và gửi kèm trong header Authorization của các request sau này
//   const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   //giả sử demo lộ key qua log
//   console.log(`Apikey: ${apikey}`);
//   //hoặc có thể demo lộ api key khi vô tình expose trong response
//   //res.json({ token, apikey });
//   //res.json({ token });
//   res.json("Login successful");
// });
router.post("/login", async (req, res) => {
  try {
    const { email, password, apikey } = req.body;

    if (apikey !== process.env.API_KEY) {
      return res.status(401).json({ message: "Invalid API key" });
    }

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });

    // 🔴 BẮT BUỘC CHECK
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(500).json({ message: "User password not set" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;