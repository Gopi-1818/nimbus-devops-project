const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;
const API_SERVICE_URL = process.env.API_SERVICE_URL || 'http://localhost:3001';

const orders = [];
let nextOrderId = 1;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/orders', async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const response = await axios.get(`${API_SERVICE_URL}/products`);
    const product = response.data.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const order = {
      id: nextOrderId++,
      productId,
      productName: product.name,
      quantity,
      totalPrice: product.price * quantity
    };
    orders.push(order);
    res.status(201).json(order);

  } catch (err) {
    console.error('Failed to reach api-service:', err.message);
    res.status(502).json({ error: 'Could not reach api-service' });
  }
});

app.get('/orders', (req, res) => {
  res.status(200).json(orders);
});

app.listen(PORT, () => {
  console.log(`orders-service listening on port ${PORT}`);
});
