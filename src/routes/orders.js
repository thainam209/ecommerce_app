// routes/orders.js
const express = require('express');
const router = express.Router();
const { Order } = require('../models');

router.get('/', async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const orders = await Order.findAll({
    where: { userId: req.user.id }
  });
  res.json({ orders });
});

router.post('/', async (req, res) => {
  const { total, status } = req.body;

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
      status: status?.trim() || 'pending'
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

module.exports = router;