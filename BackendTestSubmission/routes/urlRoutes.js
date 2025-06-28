const express = require('express');
const router = express.Router();
const db = require('../data/db');
const generateShortCode = require('../utils/generateCode');
const moment = require('moment');

router.post('/', (req, res) => {
    const { url, validity = 30, shortcode } = req.body;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    let finalCode = shortcode || generateShortCode();

    if (db.has(finalCode)) {
        return res.status(409).json({ error: 'Shortcode already exists' });
    }

    const createdAt = new Date();
    const expiry = new Date(createdAt.getTime() + validity * 60000); 

    db.set(finalCode, {
        originalUrl: url,
        createdAt,
        expiry,
        clicks: [],
    });

    res.status(201).json({
        shortLink: `http://localhost:3000/${finalCode}`,
        expiry: expiry.toISOString()
    });
});

router.get('/:shortcode', (req, res) => {
    const code = req.params.shortcode;
    const data = db.get(code);

    if (!data) {
        return res.status(404).json({ error: 'Shortcode not found' });
    }

    res.json({
        originalUrl: data.originalUrl,
        createdAt: data.createdAt,
        expiry: data.expiry,
        totalClicks: data.clicks.length,
        clickData: data.clicks
    });
});


module.exports = router;
