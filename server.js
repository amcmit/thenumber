const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'number.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Very small persistence layer for the aggregate number
function loadTotalCents() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (typeof parsed.amount_cents === 'number') {
      return parsed.amount_cents;
    }
  } catch (_) {
    // fall through and initialise below
  }
  // Default starting value: 0; you can edit number.json to seed this.
  return 0;
}

function saveTotalCents(amountCents) {
  const payload = { amount_cents: amountCents };
  fs.writeFileSync(DATA_PATH, JSON.stringify(payload, null, 2), 'utf8');
}

// Public endpoint the frontend calls to get the current number
app.get('/api/total', (req, res) => {
  const totalCents = loadTotalCents();
  res.json({
    amount_cents: totalCents,
    amount: (totalCents / 100).toFixed(2),
    currency: 'USD',
  });
});

// Ko-fi webhook endpoint.
// Configure this URL in your Ko-fi dashboard as the payment webhook target.
app.post('/api/kofi-webhook', (req, res) => {
  try {
    // Ko-fi sends a form field called "data" that contains JSON.
    const raw = req.body.data;
    if (!raw) {
      return res.status(400).send('Missing data field');
    }

    const payload = JSON.parse(raw);
    const amount = parseFloat(payload.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(200).send('Ignored (no positive amount)');
    }

    let totalCents = loadTotalCents();
    totalCents += Math.round(amount * 100);
    saveTotalCents(totalCents);

    res.status(200).send('OK');
  } catch (err) {
    console.error('Failed to process Ko-fi webhook:', err);
    res.status(500).send('Error');
  }
});

app.listen(PORT, () => {
  console.log(`Number backend listening on http://localhost:${PORT}`);
});

