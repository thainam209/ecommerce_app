const express = require('express');
const router = express.Router();
const { Combo, ComboItem } = require('../models');

//api lấy danh sách sản phẩm với phân trang
router.get('/', async (req, res) => {
  try {
    // Lấy tham số từ query string: ?page=1&limit=...
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    // Tính offset (bản ghi bắt đầu)
    const offset = (page - 1) * limit;

    // Truy vấn với phân trang
    const { count, rows } = await Combo.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']], // tùy chọn: sắp xếp
      attributes: ['id', 'name', 'description', 'image', 'price','priceSale'], // chỉ lấy các field cần
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
      FROM [Combos] 
      ${whereClause ? 'WHERE ' + whereClause : ''}
    `;

    // Query lấy dữ liệu (có phân trang)
    const dataQuery = `
      SELECT [id], [name], [description], [image], [price]
      FROM [Combos]
      ${whereClause ? 'WHERE ' + whereClause : ''}
      ORDER BY [id] ASC
      OFFSET :offset ROWS
      FETCH NEXT :limit ROWS ONLY
    `;

    // Thực thi raw query
    const [countResult] = await Combo.sequelize.query(countQuery, {
      replacements,
      type: Combo.sequelize.QueryTypes.SELECT
    });

    const rows = await Combo.sequelize.query(dataQuery, {
      replacements: { ...replacements, offset, limit },
      type: Combo.sequelize.QueryTypes.SELECT
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
    console.error('Search Combos error:', error);
    res.status(500).json({ 
      message: 'Lỗi tìm kiếm sản phẩm', 
      error: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  const combo = await Combo.findByPk(req.params.id);
  res.json(combo || { error: 'Not found' });
});

router.get('/category/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId;
  const Combos = await Combo.findAll({ where: { categoryId } });
  res.json(Combos);
});

router.post('/', async (req, res) => {
  try {
    const combo = await Combo.create(req.body);
    res.json(combo);
  } catch (err) {
    console.error('Create combo error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const combo = await Combo.findByPk(req.params.id);
    if (!combo) {
      return res.status(404).json({ error: 'Not found' });
    }

    await combo.update(req.body);
    res.json(combo);
  } catch (err) {
    console.error('Update combo error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const combo = await Combo.findByPk(req.params.id);
    if (!combo) {
      return res.status(404).json({ error: 'Not found' });
    }

    await combo.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete combo error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

//------------------------------------//
//------Các api comboitem-------------//
//------------------------------------//

//api lấy combo item theo comboId
router.get('/comboitems/:comboId',async(req, res) => {
  const comboId = req.params.comboId;

  const comboitem = await ComboItem.findAll({ where: { comboId } })

  res.json(comboitem);

});

module.exports = router;