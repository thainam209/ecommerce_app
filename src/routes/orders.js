const express = require('express');
const router = express.Router();
const { Order, OrderItem, CartItem, Product } = require('../models');
const { Sequelize } = require('sequelize');

router.get('/', async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    include: [{ model: OrderItem, include: [Product] }]
  });
  res.json(orders);
});

router.post('/', async (req, res) => {
  const cartItems = await CartItem.findAll({ where: { userId: req.user.id }, include: [Product] });
  if (cartItems.length === 0) return res.status(400).json({ error: 'Cart empty' });

  const total = cartItems.reduce((sum, item) => sum + item.quantity * item.Product.price, 0);
  const order = await Order.create({ userId: req.user.id, status: 'pending', total });

  for (const item of cartItems) {
    await OrderItem.create({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.Product.price
    });
    await item.destroy();  // Xóa giỏ hàng sau khi đặt hàng
  }

  res.json(order);
});

module.exports = router;