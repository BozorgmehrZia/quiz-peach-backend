const authenticateUser = (req, res, next) => {
    console.log(req.session);
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    req.userId = req.session.userId; // Attach the user ID to the request for later use
    next();
};

module.exports = authenticateUser;