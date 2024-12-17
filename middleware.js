const authenticateUser = (req, res, next) => {
    const userId = req.cookies.userId; // Read the userId from cookies
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    req.userId = userId; // Attach the user ID to the request for later use
    next();
};

module.exports = authenticateUser;