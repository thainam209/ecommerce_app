const express = require('express');
const router = express.Router();
const {Categories} = require('../models');

router.get('/', async (req, res) => {
  try {
    // Lấy tham số từ query string: ?page=1&limit=...
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Tính offset (bản ghi bắt đầu)
    const offset = (page - 1) * limit;

    // Truy vấn với phân trang
    const { count, rows } = await Categories.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']], // tùy chọn: sắp xếp
      attributes: ['id', 'name', 'description'], // chỉ lấy các field cần
    });

    // Trả về dữ liệu + thông tin phân trang
    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasMore: page * limit < count // chính xác hơn data.length === limit
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const category = await Categories.findByPk(req.params.id);
  res.json(category || { error: 'Not found' });
});

//API cho admin
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.toString().trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newCategory = await Categories.create({
      name: name.toString().trim(),
      description: description || null
    });

    return res.status(201).json(newCategory);
  } catch (err) {
    console.error('Create category error:', err);
    // nếu là lỗi validate của sequelize, trả thông tin cụ thể
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(String(req.params.id).trim(), 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category id' });
    }

    const category = await Categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Not found' });
    }

    await category.update(req.body);
    res.json(category);
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(String(req.params.id).trim(), 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category id' });
    }

    const category = await Categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Not found' });
    }

    await category.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;