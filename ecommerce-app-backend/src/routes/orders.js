// routes/orders.js
const express = require('express');
const router = express.Router();
const { Order, User } = require('../models');
const { where } = require('sequelize');

router.get('/', async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']]
  });
  res.json({ orders });
});

router.post('/', async (req, res) => {
  const { total, status, recipientName, recipientPhone, shippingAddress, note } = req.body;

  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const totalAmount = Number(total);
  if (isNaN(totalAmount) || totalAmount <= 0) {
    return res.status(400).json({ error: 'Tổng tiền không hợp lệ' });
  }

  try {
    const order = await Order.create({
      userId: req.user.id,
      total: totalAmount,
      status: status?.trim() || 'pending',
      recipientName: recipientName,
      recipientPhone: recipientPhone,
      shippingAddress: shippingAddress,
      note: note
    });

    res.json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      order: {
        id: order.id,
        userId: order.userId,
        total: Number(order.total),
        status: order.status,
        createdAt: order.createdAt
      }
    });

  } catch (err) {
    console.error('LỖI TẠO ORDER:', err);
    res.status(500).json({
      error: 'Không thể tạo đơn hàng',
      details: err.message || 'Lỗi không xác định'
    });
  }
});

//api sửa trạng thái đơn hàng thành cancle
router.put('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // tìm order theo id
    const order = await Order.findOne({ where: { id: orderId, userId: req.user.id } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // cập nhật status
    order.status = 'canceled';
    await order.save();

    return res.json({
      message: 'Order canceled successfully',
      order
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error',
      error
    });
  }
});

//api lấy toàn bộ đơn hàng cho admin
router.get('/admin', async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const admin = await User.findByPk(req.user.id);

  console.log(admin.role);  
  if(admin.role === 'admin'){
    const fullOrders = await Order.findAll();
    res.json(fullOrders);
  }
  res.json('not admin');
}); 


module.exports = router;