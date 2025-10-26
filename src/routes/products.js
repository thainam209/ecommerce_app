const express = require('express');
const router = express.Router();
const { Product } = require('../models');

router.get('/', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
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

module.exports = router;