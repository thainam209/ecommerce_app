const express = require('express');
const router = express.Router();
const { Voucher } = require('../models');


//api cho admin
// GET /api/vouchers/admin/all  => Admin xem tất cả voucher của mọi user
router.get('/admin/all', async (req, res) => {
  try {
    // Nếu đã có auth + isAdmin thì dùng: isAdmin ở middleware index
    const vouchers = await Voucher.findAll({
      include: [
        {
          association: 'user',
          attributes: ['id', 'username', 'email'], // tuỳ User model của em
        },
      ],
      order: [['id', 'DESC']],
    });

    res.json({ vouchers });
  } catch (error) {
    console.error('Admin get all vouchers error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.post('/admin/assign', async (req, res) => {
  try {
    const { name, discount, userIds } = req.body;

    if (!name || !Number.isInteger(discount)) {
      return res.status(400).json({ error: 'name và discount là bắt buộc' });
    }
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds phải là mảng và không rỗng' });
    }

    const now = new Date();
    const vouchersToCreate = userIds.map((userId) => ({
      name,
      discount,
      userId,
      createdAt: now,
      updatedAt: now,
    }));

    const created = await Voucher.bulkCreate(vouchersToCreate);

    res.json({ created });
  } catch (error) {
    console.error('Admin assign vouchers error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.delete('/admin/:id', async (req, res) => {
  try {
    const id = parseInt(String(req.params.id).trim(), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid voucher id' });
    }

    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    await voucher.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Admin delete voucher error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});


//api lấy danh sách voucher theo id người dùng
router.get('/', async (req, res) => {
  try {
    if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const vouchers = await Voucher.findAll({
        where: { userId: req.user.id }
    });

    res.json({ vouchers });
    
  } catch (error) {
    console.error('Get voucher error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.delete('/:id',async (req, res) =>{
  try{
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const voucher = await Voucher.findByPk(req.params.id);
    if(voucher){
      await voucher.destroy();
      res.json({ message: 'Deleted' });
    }
  }catch(error){
    console.log('delete voucher errol: ',error);
    res.status(404).json({ message: 'not found' });
  }
})



module.exports = router;