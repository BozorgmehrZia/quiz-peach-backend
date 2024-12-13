const express = require('express');
const { Tag } = require('../models');

const router = express.Router();

/**
 * @swagger
 * /api/tag:
 *   get:
 *     summary: Retrieve a list of tags
 *     description: Retrieve tags filtered by name (optional) and sorted by ID.
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter tags by name (case-insensitive, partial match).
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         required: false
 *         description: Sort tags by question number in ascending (asc) or descending (desc) order. Default is desc.
 *     responses:
 *       200:
 *         description: A list of tags.
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
 *                   question_number:
 *                     type: integer
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const { name, sort = 'desc' } = req.query;

        const where = name
            ? { name: { [Op.like]: `%${name}%` } }
            : undefined;

        const tags = await Tag.findAll({
            where,
            order: [['question_number', sort.toLowerCase() === 'desc' ? 'DESC' : 'ASC']],
        });

        res.json(tags);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

/**
 * @swagger
 * /api/tag:
 *   post:
 *     summary: Add a new tag
 *     description: Add a new tag to the database.
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
