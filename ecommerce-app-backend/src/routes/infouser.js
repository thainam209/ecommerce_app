const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Lấy thông tin người dùng theo id
router.get('/', async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const infouser = await User.findOne({
    where: { id: req.user.id },
    attributes: { 
      exclude: ['password'] // Không trả về password
    }
  });

  if (!infouser) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ infouser });
});


module.exports = router;