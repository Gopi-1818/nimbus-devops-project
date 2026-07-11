const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

// Sample in-memory product data (no database yet - that comes later)
const products = [
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Headphones', price: 199 },
  { id: 3, name: 'Keyboard', price: 79 }
];

// Health check endpoint - Kubernetes will use this later to know if the app is alive
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Main API endpoint
app.get('/products', (req, res) => {
  res.status(200).json(products);
});

app.listen(PORT, () => {
  console.log(`api-service listening on port ${PORT}`);
});
