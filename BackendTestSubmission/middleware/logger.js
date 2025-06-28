module.exports = (req, res, next) => {
    const logEntry = {
        method: req.method,
        url: req.originalUrl,
        time: new Date().toISOString(),
        body: req.body,
    };
    require('fs').appendFileSync('access.log', JSON.stringify(logEntry) + '\n');
    next();
};
