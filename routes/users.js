const express = require('express');
const { User } = require('../models');

const router = express.Router();

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Retrieve all users along with their created questions.
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
 *                   email:
 *                     type: string
 *                   score:
 *                     type: integer
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create a new user
 *     description: Add a new user to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully.
 *       400:
 *         description: Validation error.
 */
router.post('/', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
});

module.exports = router;
