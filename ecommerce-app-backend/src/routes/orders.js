// src/routes/orders.js
const express = require('express');
const router = express.Router();
const { Order, User } = require('../models');

// ================== USER: LẤY LIST ĐƠN HÀNG CỦA CHÍNH USER ==================
router.get('/', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.json({ orders });
  } catch (error) {
    console.error('GET /orders error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================== USER: TẠO ĐƠN HÀNG MỚI ==================
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
      recipientName,
      recipientPhone,
      shippingAddress,
      note,
    });

    return res.json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      order: {
        id: order.id,
        userId: order.userId,
        total: Number(order.total),
        status: order.status,
        recipientName: order.recipientName,
        recipientPhone: order.recipientPhone,
        shippingAddress: order.shippingAddress,
        note: order.note,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error('LỖI TẠO ORDER:', err);
    return res.status(500).json({
      error: 'Không thể tạo đơn hàng',
      details: err.message || 'Lỗi không xác định',
    });
  }
});

// ================== ADMIN: LẤY TOÀN BỘ ĐƠN HÀNG ==================
router.get('/admin', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const admin = await User.findByPk(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: not admin' });
    }

    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.json(orders);
  } catch (error) {
    console.error('GET /orders/admin error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================== ADMIN: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG ==================
// Frontend admin gọi: PUT /orders/:id với body { status: 'completed' | 'canceled' | ... }
router.put('/:id', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const admin = await User.findByPk(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: not admin' });
    }

    const orderId = req.params.id;
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Thiếu hoặc sai status' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status.trim();
    await order.save();

    return res.json({
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    console.error('PUT /orders/:id error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ================== USER HOẶC ADMIN: HUỶ ĐƠN (OPTIONAL) ==================
// Nếu em muốn giữ cancel riêng cho user (mobile app) thì dùng route này
router.post('/:id/cancel', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orderId = req.params.id;
    const order = await Order.findOne({
      where: {
        id: orderId,
        userId: req.user.id, // user chỉ được huỷ đơn của chính mình
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found or not owned by user' });
    }

    if (order.status === 'canceled') {
      return res.status(400).json({ error: 'Order already canceled' });
    }

    order.status = 'canceled';
    await order.save();

    return res.json({
      message: 'Order canceled successfully',
      order,
    });
  } catch (error) {
    console.error('POST /orders/:id/cancel error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

// // routes/orders.js
// const express = require('express');
// const router = express.Router();
// const { Order, User } = require('../models');

// router.get('/', async (req, res) => {
//   if (!req.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
//   const orders = await Order.findAll({
//     where: { userId: req.user.id },
//     order: [['createdAt', 'DESC']]
//   });
//   res.json({ orders });
// });

// router.post('/', async (req, res) => {
//   const { total, status, recipientName, recipientPhone, shippingAddress, note } = req.body;

//   if (!req.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   const totalAmount = Number(total);
//   if (isNaN(totalAmount) || totalAmount <= 0) {
//     return res.status(400).json({ error: 'Tổng tiền không hợp lệ' });
//   }

//   try {
//     const order = await Order.create({
//       userId: req.user.id,
//       total: totalAmount,
//       status: status?.trim() || 'pending',
//       recipientName: recipientName,
//       recipientPhone: recipientPhone,
//       shippingAddress: shippingAddress,
//       note: note
//     });

//     res.json({
//       success: true,
//       message: 'Tạo đơn hàng thành công',
//       order: {
//         id: order.id,
//         userId: order.userId,
//         total: Number(order.total),
//         status: order.status,
//         createdAt: order.createdAt
//       }
//     });

//   } catch (err) {
//     console.error('LỖI TẠO ORDER:', err);
//     res.status(500).json({
//       error: 'Không thể tạo đơn hàng',
//       details: err.message || 'Lỗi không xác định'
//     });
//   }
// });

// //api sửa trạng thái đơn hàng thành cancle
// router.put('/:orderId', async (req, res) => {
//   const { orderId } = req.params;
//   if (!req.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     // tìm order theo id
//     const order = await Order.findOne({ where: { id: orderId, userId: req.user.id } });

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     // cập nhật status
//     order.status = 'canceled';
//     await order.save();

//     return res.json({
//       message: 'Order canceled successfully',
//       order
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: 'Server error',
//       error
//     });
//   }
// });

// //api lấy toàn bộ đơn hàng cho admin
// router.get('/admin', async (req, res) => {
//   if (!req.user?.id) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
//   const admin = await User.findByPk(req.user.id);

//   console.log(admin.role);  
//   if(admin.role === 'admin'){
//     const fullOrders = await Order.findAll();
//     res.json(fullOrders);
//   }
//   res.json('not admin');
// }); 

// module.exports = router;
