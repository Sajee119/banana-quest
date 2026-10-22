function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    return res.status(401).json({ success: false, message: 'Authentication required' });
}

function ensureGuest(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return res.status(403).json({ success: false, message: 'Already authenticated' });
    }
    next();
}

module.exports = {
    ensureAuthenticated,
    ensureGuest,
};