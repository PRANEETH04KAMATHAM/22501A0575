const express = require('express');
const app = express();
const logger = require('./middleware/logger');
const urlRoutes = require('./routes/urlRoutes');

app.use(express.json());
app.use(logger);

app.use('/shorturls', urlRoutes);

app.get('/:shortcode', (req, res) => {
    const code = req.params.shortcode;
    const db = require('./data/db');
    const entry = db.get(code);

    if (!entry) {
        return res.status(404).json({ error: 'Shortcode not found' });
    }

    const now = new Date();
    if (now > new Date(entry.expiry)) {
        return res.status(410).json({ error: 'Link expired' });
    }

    entry.clicks.push({
        timestamp: now.toISOString(),
        referrer: req.get('Referer') || 'Direct', // Fixed typo here
        ip: req.ip,
        location: 'Simulated'
    });

    res.redirect(entry.originalUrl);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});