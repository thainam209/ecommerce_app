const express = require('express');
const router = express.Router();
const { Product } = require('../models');

// router.get('/', async (req, res) => {
//   const products = await Product.findAll();
//   res.json(products);
// });

router.get('/', async (req, res) => {
  try {
    // Lấy tham số từ query string: ?page=1&limit=...
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Tính offset (bản ghi bắt đầu)
    const offset = (page - 1) * limit;

    // Truy vấn với phân trang
    const { count, rows } = await Product.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']], // tùy chọn: sắp xếp
      attributes: ['id', 'name', 'description', 'image', 'price'], // chỉ lấy các field cần
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
  const product = await Product.findByPk(req.params.id);
  res.json(product || { error: 'Not found' });
});

router.post('/', async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

router.put('/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (product) {
    await product.update(req.body);
    res.json(product);
  } else res.status(404).json({ error: 'Not found' });
});

router.delete('/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (product) {
    await product.destroy();
    res.json({ message: 'Deleted' });
  } else res.status(404).json({ error: 'Not found' });
});

//api tìm kiếm sản phẩm
router.get('/search', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search?.trim();

    const offset = (page - 1) * limit;

    // Điều kiện WHERE (dùng LOWER + LIKE để không phân biệt hoa thường)
    const whereClause = search
      ? {
          name: {
            [Op.like]: `%${search}%` // SQL Server + Sequelize sẽ tự convert thành LOWER(name) LIKE '%name%'
          }
        }
      : {};

    // Truy vấn có phân trang + tìm kiếm
    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['id', 'ASC']],
      attributes: ['id', 'name', 'description', 'image', 'price'],
    });

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasMore: page * limit < count,
      },
      search: search || null,
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;