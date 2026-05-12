// src/routes/chat.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Product } = require('../models');

// ===== Intent detectors =====
const INTENTS = [
  { key: 'CHEAPEST_ITEM',  test: msg => /r(?:e|ẻ)\s*nhất|cheapest/i.test(msg) },
  { key: 'MOST_EXPENSIVE_ITEM', test: msg => /đắt\s*nhất|expensive/i.test(msg) },
  { key: 'ITEM_UNDER_PRICE', test: msg => /(dưới|<=|less\s*than)\s*([\d\. ,]+)\s*(k|nghìn|ngàn|vnd|đ)?/i.test(msg) },
  { key: 'SEARCH_BY_NAME', test: msg => /(tìm|search)\s+(món|dish|đồ)\s+(.+)/i.test(msg) || /món\s+(.+)\??$/i.test(msg) },
  { key: 'STOCK_STATUS', test: msg => /(còn\s*hàng|hết\s*hàng|availability|in\s*stock)/i.test(msg) }
];

// ===== Helpers =====
function parseMoneyToVND(msg) {
  // match: dưới 30k / dưới 30.000 đ / <= 30000
  const m = /(dưới|<=|less\s*than)\s*([\d\. ,]+)\s*(k|nghìn|ngàn|vnd|đ)?/i.exec(msg);
  if (!m) return null;
  let raw = m[2].replace(/[.\s,]/g, ''); // "30.000" -> "30000"
  let val = parseInt(raw, 10);
  if (Number.isNaN(val)) return null;
  // "k/nghìn/ngàn" -> * 1000
  if (m[3] && /k|nghìn|ngàn/i.test(m[3])) val *= 1000;
  return val;
}

function extractName(msg) {
  let m = /(tìm|search)\s+(món|dish|đồ)\s+(.+)/i.exec(msg);
  if (m) return m[3].trim();
  m = /món\s+(.+)\??$/i.exec(msg);
  if (m) return m[1].trim();
  return null;
}

const fmtVND = n => Number(n || 0).toLocaleString('vi-VN') + '₫';

// ===== Handlers =====
async function handleCheapest() {
  const item = await Product.findOne({ order: [['price','ASC']], limit: 1 });
  if (!item) return 'Chưa có món nào trong hệ thống.';
  return `Món rẻ nhất là **${item.name}** (${fmtVND(item.price)}).`;
}

async function handleMostExpensive() {
  const item = await Product.findOne({ order: [['price','DESC']], limit: 1 });
  if (!item) return 'Chưa có món nào trong hệ thống.';
  return `Món đắt nhất là **${item.name}** (${fmtVND(item.price)}).`;
}

async function handleUnderPrice(msg) {
  const max = parseMoneyToVND(msg);
  if (!max) return 'Bạn muốn tìm món dưới mức giá bao nhiêu? (vd: dưới 30k)';
  const items = await Product.findAll({
    where: { price: { [Op.lte]: max } },
    order: [['price','ASC']],
    limit: 10
  });
  if (!items.length) return `Không có món nào dưới ${fmtVND(max)}.`;
  const lines = items.map(i => `• ${i.name} — ${fmtVND(i.price)} (stock: ${i.stock ?? 0})`);
  return `Các món dưới ${fmtVND(max)}:\n` + lines.join('\n');
}

async function handleSearchByName(msg) {
  const name = extractName(msg);
  if (!name) return 'Bạn muốn tìm món nào? (vd: tìm món gà rán)';
  const items = await Product.findAll({
    where: { name: { [Op.like]: `%${name}%` } },
    order: [['price','ASC']],
    limit: 10
  });
  if (!items.length) return `Không tìm thấy món nào khớp “${name}”.`;
  const lines = items.map(i => `• ${i.name} — ${fmtVND(i.price)} (stock: ${i.stock ?? 0})`);
  return `Kết quả cho “${name}”:\n` + lines.join('\n');
}

async function handleStockStatus(msg) {
  // Nếu người dùng chỉ hỏi chung “còn hàng không?” → liệt kê 5 món còn hàng
  const items = await Product.findAll({
    where: { stock: { [Op.gt]: 0 } },
    order: [['updatedAt','DESC']],
    limit: 5
  });
  if (!items.length) return 'Tất cả các món đều còn hàng, bạn hãy order ngay.';
  const lines = items.map(i => `• ${i.name} — còn ${i.stock} — ${fmtVND(i.price)}`);
  return 'Một số món đang còn hàng:\n' + lines.join('\n');
}

// ===== Route =====
router.post('/', async (req, res) => {
  try {
    const msg = String(req.body?.message || '').trim();
    if (!msg) return res.json({ reply: "Bạn hãy nhập câu hỏi nhé (vd: 'món rẻ nhất?')." });

    const intent = INTENTS.find(i => i.test(msg))?.key;
    let reply;

    switch (intent) {
      case 'CHEAPEST_ITEM':       reply = await handleCheapest(); break;
      case 'MOST_EXPENSIVE_ITEM': reply = await handleMostExpensive(); break;
      case 'ITEM_UNDER_PRICE':    reply = await handleUnderPrice(msg); break;
      case 'SEARCH_BY_NAME':      reply = await handleSearchByName(msg); break;
      case 'STOCK_STATUS':        reply = await handleStockStatus(msg); break;
      default:
        reply = [
          'Mình có thể giúp:',
          "• 'món rẻ nhất?'",
          "• 'món đắt nhất?'",
          "• 'món dưới 30k'",
          "• 'tìm món ...'",
          "• 'còn hàng không?'"
        ].join('\n');
    }

    res.json({ reply });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ reply: 'Đã có lỗi xảy ra, thử lại sau nhé.' });
  }
});

module.exports = router;