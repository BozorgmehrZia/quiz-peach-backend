const express = require('express');
const { Op } = require('sequelize');
const { User } = require('../models');

const router = express.Router();

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Retrieve a list of users for scoreboard
 *     description: Retrieve users with the current user at the top and other users sorted by score and optional name filter.
 *     parameters:
 *       - in: query
 *         name: currentUserId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the current user making the request.
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
router.get('/users', async (req, res) => {
    try {
        const { currentUserId, name, sort = 'desc' } = req.query;

        // Validate the required parameter
        if (!currentUserId) {
            return res.status(400).json({ error: 'currentUserId is required.' });
        }

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

router.post('/register', async (req, res) => {
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


module.exports = router;
