const express = require('express');
const { Op } = require('sequelize');
const { User } = require('../models');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const router = express.Router();

// Set up session middleware
router.use(
    session({
        store: new SQLiteStore({ db: 'db/sessions.sqlite' }),
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Retrieve a list of users for scoreboard
 *     description: Retrieve users with the current user at the top and other users sorted by score and optional name filter.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter users by name (case-insensitive, partial match).
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: false
 *         description: Sort users by score in ascending (asc) or descending (desc) order. Default is desc.
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   score:
 *                     type: integer
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error.
 */
router.get('/', async (req, res) => {
    try {
        const { name, sort = 'desc' } = req.query;

        const currentUserId = req.session.userId;

        // Fetch the current user
        const currentUser = await User.findByPk(currentUserId);
        if (!currentUser) {
            return res.status(400).json({ error: 'Current user not found.' });
        }

        // Build query filters for other users
        const where = name
            ? {
                  id: { [Op.ne]: currentUserId }, // Exclude the current user
                  name: { [Op.like]: `%${name}%` }, // Case-insensitive partial match
              }
            : { id: { [Op.ne]: currentUserId } }; // Exclude the current user

        // Fetch other users sorted by score
        const otherUsers = await User.findAll({
            where,
            order: [['score', sortOrder]],
        });

        // Combine current user and other users
        const result = [currentUser, ...otherUsers];
        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user with a unique name and email.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Unique name of the user.
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 description: Unique email of the user.
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: Password for the user.
 *                 example: securepassword123
 *     responses:
 *       201:
 *         description: User successfully registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the newly created user.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Name of the newly created user.
 *                   example: johndoe
 *                 email:
 *                   type: string
 *                   description: Email of the newly created user.
 *                   example: johndoe@example.com
 *                 score:
 *                   type: integer
 *                   description: Initial score of the user.
 *                   example: 0
 *       400:
 *         description: Validation error or user already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: A user with this name or email already exists.
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to register user.
 */
router.post('/', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        // Check if a user with the same email or name already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { name: name },
                    { email: email },
                ],
            },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'A user with this name or email already exists.' });
        }

        // Create a new user
        const newUser = await User.create({
            name,
            email,
            password, // In production, make sure to hash the password before storing it
        });

        // Return the created user (excluding the password for security reasons)
        const { id, score } = newUser;
        res.status(201).json({ id, name, email, score });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to register user.' });
    }
});

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticate a user and start a session.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user.
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: Password for the user.
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful.
 *       400:
 *         description: Validation error or invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email or password.
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to log in.
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // Find the user by email
        const user = await User.findOne({ where: { email } });
        if (!user || user.password !== password) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        // Store user information in session
        req.session.userId = user.id;
        res.status(200).json({ message: 'Login successful.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log in.' });
    }
});

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     summary: Log out a user
 *     description: Destroy the session for the logged-in user.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Logout successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful.
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to log out.
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to log out.' });
        }
        res.status(200).json({ message: 'Logout successful.' });
    });
});

module.exports = router;
