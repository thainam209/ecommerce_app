const express = require('express');
const router = express.Router();
const { CartItem, Product } = require('../models');

router.get('/', async (req, res) => {
  const cartItems = await CartItem.findAll({
    where: { userId: req.user.id },
    include: [Product]
  });
  res.json(cartItems);
});

router.post('/', async (req, res) => {
  const { productId, quantity } = req.body;
  const cartItem = await CartItem.create({ userId: req.user.id, productId, quantity });
  res.json(cartItem);
});

router.delete('/:id', async (req, res) => {
  const cartItem = await CartItem.findByPk(req.params.id);
  if (cartItem && cartItem.userId === req.user.id) {
    await cartItem.destroy();
    res.json({ message: 'Removed' });
  } else res.status(404).json({ error: 'Not found' });
});

module.exports = router;