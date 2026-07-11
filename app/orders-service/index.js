const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
// URL of api-service - configurable via environment variable.
// This matters a lot later: in Kubernetes, this won't be "localhost",
// it'll be a service name. Keeping it as an env var means we never
// have to change code between local/dev/prod.
const API_SERVICE_URL = process.env.API_SERVICE_URL || 'http://localhost:3001';

// In-memory order storage (a real database comes in a later phase)
const orders = [];
let nextOrderId = 1;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Create an order - looks up the product from api-service first
app.post('/orders', async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // Call api-service to verify the product exists and get its price
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
    // If api-service is down or unreachable, we handle it gracefully
    // instead of crashing - this matters a lot in distributed systems.
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
