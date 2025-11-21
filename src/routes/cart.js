const express = require('express');
const router = express.Router();
const { CartItem, Product } = require('../models');

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [{
        model: Product,
        as: 'product',
      }],
      order: [['createdAt', 'DESC']]
    });

    const totalPrice = cartItems.reduce((sum, item) => 
      sum + (item.quantity * item.product.price), 0
    );

    res.json({
      items: cartItems,
      totalItems: cartItems.length,
      totalPrice
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy giỏ hàng' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

    // Tìm item đã có chưa
    let cartItem = await CartItem.findOne({
      where: { userId, productId }
    });

    if (cartItem) {
      // Đã có → cộng dồn số lượng
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Chưa có → tạo mới
      cartItem = await CartItem.create({
        userId,
        productId,
        quantity
      });
    }

    // Trả về item mới nhất (có thông tin sản phẩm)
    const result = await CartItem.findByPk(cartItem.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.json({
      message: 'Đã thêm vào giỏ hàng!',
      item: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thêm route mới
router.post('/clear-selected', async (req, res) => {
  const { cartItemIds } = req.body;

  if (!Array.isArray(cartItemIds) || cartItemIds.length === 0) {
    return res.status(400).json({ error: 'Không có sản phẩm để xóa' });
  }

  try {
    await CartItem.destroy({
      where: {
        id: cartItemIds,
        userId: req.user.id
      }
    });

    res.json({ success: true, deleted: cartItemIds.length });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xóa giỏ hàng' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await CartItem.destroy({
      where: {
        id: req.params.id,
        userId: req.user.id  // chỉ xóa của chính mình
      }
    });

    if (deleted) {
      res.json({ message: 'Đã xóa khỏi giỏ hàng' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy hoặc không phải của bạn' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) {
      return router.delete(`/${req.params.id}`)(req, res); // xóa luôn
    }

    const updated = await CartItem.update(
      { quantity },
      { where: { id: req.params.id, userId: req.user.id } }
    );

    if (updated[0] > 0) {
      const item = await CartItem.findByPk(req.params.id, { include: [Product] });
      res.json({ message: 'Đã cập nhật', item });
    } else {
      res.status(404).json({ message: 'Không tìm thấy' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;