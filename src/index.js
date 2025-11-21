const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Kết nối Sequelize
const sequelize = require('./config/database');

// Khởi tạo associations (sau khi tất cả model được load)
Object.keys(sequelize.models).forEach(modelName => {
  if (sequelize.models[modelName].associate) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

sequelize.sync().then(() => console.log('DB connected')).catch(err => console.error(err));

// Middleware xác thực
// Middleware xác thực JWT để bảo vệ các route cần đăng nhập
const authenticate = (req, res, next) => {
  // Lấy token từ header Authorization theo định dạng Bearer <token> 
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  // Xác thực token và gán thông tin user vào req.user nếu hợp lệ 
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const cateRoutes = require('./routes/cate');
const orderItemRoutes = require('./routes/orderitems');
const chatRoutes = require('./routes/chat');
const infouserRoutes = require('./routes/infouser');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', authenticate, cartRoutes);
app.use('/api/orders', authenticate, orderRoutes);
app.use('/api/categories', cateRoutes);
app.use('/api/orderitems', authenticate, orderItemRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/infouser', authenticate, infouserRoutes);

app.listen(PORT, () => console.log(`Server on port ${PORT}`));