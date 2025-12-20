const express = require('express');
const router = express.Router();
const { Voucher } = require('../models');


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