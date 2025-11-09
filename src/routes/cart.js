const express = require('express');
const router = express.Router();
const { CartItem, Product } = require('../models');

router.get('/', protect, async (req, res) => {
  const cartItems = await CartItem.findAll({
    where: { userId: req.user.id },
    include: [Product]
  });
  res.json(cartItems);
});

// router.post('/', protect, async (req, res) => {
//   const { productId, quantity } = req.body;
//   const cartItem = await CartItem.create({ userId: req.user.id, productId, quantity });
//   res.json(cartItem);
// });

router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id; // authenticate đã gán req.user
    if (!userId) return res.status(401).json({ message: 'No user' });

    const { productId, quantity = 1 } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const item = await CartItem.create({
      UserId: userId,
      ProductId: productId,
      quantity
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const cartItem = await CartItem.findByPk(req.params.id);
  if (cartItem && cartItem.userId === req.user.id) {
    await cartItem.destroy();
    res.json({ message: 'Removed' });
  } else res.status(404).json({ error: 'Not found' });
});

module.exports = router;