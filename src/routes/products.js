const express = require('express');
const router = express.Router();
const { Product } = require('../models');

// router.get('/', async (req, res) => {
//   const products = await Product.findAll();
//   res.json(products);
// });

//api lấy danh sách sản phẩm với phân trang
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

//api tìm kiếm sản phẩm
router.get('/search', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    let search = req.query.search?.trim() || '';

    const offset = (page - 1) * limit;

    // Tạo điều kiện tìm kiếm thủ công cho SQL Server
    let whereClause = '';
    let replacements = {};

    if (search) {
      // Dùng LOWER() + LIKE để không phân biệt hoa thường + có dấu/không dấu (nếu DB dùng collation CI)
      whereClause = `LOWER([name]) LIKE LOWER(:search)`;
      replacements.search = `%${search}%`;
    }

    // Query đếm tổng (count)
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM [Products] 
      ${whereClause ? 'WHERE ' + whereClause : ''}
    `;

    // Query lấy dữ liệu (có phân trang)
    const dataQuery = `
      SELECT [id], [name], [description], [image], [price]
      FROM [Products]
      ${whereClause ? 'WHERE ' + whereClause : ''}
      ORDER BY [id] ASC
      OFFSET :offset ROWS
      FETCH NEXT :limit ROWS ONLY
    `;

    // Thực thi raw query
    const [countResult] = await Product.sequelize.query(countQuery, {
      replacements,
      type: Product.sequelize.QueryTypes.SELECT
    });

    const rows = await Product.sequelize.query(dataQuery, {
      replacements: { ...replacements, offset, limit },
      type: Product.sequelize.QueryTypes.SELECT
    });

    const total = countResult.total || 0;

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      search: search || null,
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ 
      message: 'Lỗi tìm kiếm sản phẩm', 
      error: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  res.json(product || { error: 'Not found' });
});

//api lấy sản phẩm theo categoryId
router.get('/category/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId;
  const products = await Product.findAll({ where: { categoryId } });
  res.json(products);
});

//API DÀNH CHO ADMIN (thêm sửa xóa)
//đẩy ảnh từ thiết bị lên cloudinary rồi lưu URL vào database, có thể dùng multer để xử lý upload file
//trước khi đẩy tự resize ảnh về kích thước phù hợp (nếu cần) để tiết kiệm băng thông và dung lượng lưu trữ

router.post('/admin', async (req, res) => {
  try {
  const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

router.put('/admin/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (product) {
    await product.update(req.body);
    res.json(product);
  } else res.status(404).json({ error: 'Not found' });
});

router.delete('/admin/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (product) {
    await product.destroy();
    res.json({ message: 'Deleted' });
  } else res.status(404).json({ error: 'Not found' });
});



module.exports = router;