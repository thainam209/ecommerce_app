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
  //nếu email trùng thì sẽ trả về lỗi
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already in use' });
  }
  const user = await User.create({ username, email, password: hashedPassword, role: 'user' });
  res.json(user);
});

// Đăng nhập
router.post('/login', async (req, res) => {
  const { email, password, apikey } = req.body;
  const user = await User.findOne({ where: { email } });
  //console.log('apikey:'+apikey);
  if (!apikey || apikey !== process.env.API_KEY) { // Hardcode ở .env, nhưng demo leakage bằng cách log hoặc expose
    return res.status(401).json({ error: 'Invalid API key' + apikey});
  }
  //console.log(password);
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Tạo JWT sau khi xác thực thành công dùng để ủy quyền người dùng
  // Token được lưu ở phía client (frontend) và gửi kèm trong header Authorization của các request sau này
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  //giả sử demo lộ key qua log
  //console.log(`Apikey: ${apikey}`);
  //hoặc có thể demo lộ api key khi vô tình expose trong response
  //res.json({ token, apikey });
  res.json({token: token,
    role: user.role});
  //res.json("Login successful");
});


module.exports = router;