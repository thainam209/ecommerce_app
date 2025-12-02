// routes/orderitems.js – FIX CUỐI CÙNG – DÁN ĐÈ TOÀN BỘ – CHẠY NGON MÃI MÃI
const express = require('express');
const router = express.Router();
const { Order, OrderItem, sequelize } = require('../models');
const jwt = require('jsonwebtoken');

//api tạo orderitem theo orderId
router.post('/orderId/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { productId, comboId, quantity, price } = req.body;
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    // Kiểm tra order có tồn tại và thuộc về user hiện tại không
    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order không tồn tại' });
    }
    // Tạo order item
    // if(productId){
    //   const orderItem = await OrderItem.create({
    //     orderId,
    //     productId,
    //     quantity,
    //     price,
    //   });
    // }
    // else {
    //   const orderItem = await OrderItem.create({
    //     orderId,
    //     quantity,
    //     price,
    //     comboId
    //   });
    // }
    const orderItem = await OrderItem.create({
      orderId,
      productId,
      quantity,
      price,
      comboId
    });

    res.json({
      success: true,
      message: 'Tạo order item thành công',
      item: {
        id: orderItem.id,
        orderId: orderItem.orderId,
        productId: orderItem.productId,
        quantity: orderItem.quantity,
        price: orderItem.price,
        comboId: orderItem.comboId
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//api lấy danh sách order items theo orderId
router.post('/orderId/', async (req, res) => {
  const { orderId } = req.body;
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    // Kiểm tra order có tồn tại và thuộc về user hiện tại không
    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id }
    });
    if (!order) {
      return res.status(404).json({ error: 'Order không tồn tại' });
    }
    // Lấy danh sách order items theo orderId
    const orderItems = await OrderItem.findAll({
      where: { orderId },
    });

    res.json({
      success: true,
      items: orderItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;