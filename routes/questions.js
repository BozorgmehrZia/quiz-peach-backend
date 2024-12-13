const express = require('express');
const { Op } = require('sequelize');
const { Question } = require('../models');

const router = express.Router();

/**
 * @swagger
 * /api/question:
 *   post:
 *     summary: Add a new question
 *     description: Add a new question to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tag1
 *     responses:
 *       201:
 *         description: Tag created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 question_number:
 *                   type: integer
 *       400:
 *         description: Validation or duplication error.
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
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        // Validate the request body
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Name is required and must be a string.' });
        }

        // Check if the tag already exists
        const existingTag = await Tag.findOne({ where: { name } });
        if (existingTag) {
            return res.status(400).json({ error: 'Tag already exists.' });
        }

        // Create the new tag
        const tag = await Tag.create({ name });
        res.status(201).json(tag);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create tag' });
    }
});

module.exports = router;