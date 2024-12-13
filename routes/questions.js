const express = require('express');
const { Op } = require('sequelize');
const { Question, RelatedQuestion } = require('../models');

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
 *               question:
 *                 type: string
 *               option1:
 *                 type: string
 *               option2:
 *                 type: string
 *               option3:
 *                 type: string
 *               option4:
 *                 type: string
 *               correct_option:
 *                 type: integer
 *               level:
 *                 type: string
 *               related_ids:
 *                 type: array
 *     responses:
 *       201:
 *         description: Question created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *  *            properties:
 *                 message:
 *                   type: string

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
router.post('/', async (req, res) => {
    const {
        name,
        question,
        option1,
        option2,
        option3,
        option4,
        correct_option,
        level,
        related_ids,
    } = req.body;
    const currentUserId = req.session.userId;

    try {
        // Validate the request body
        if (
            !name ||
            !question ||
            !option1 ||
            !option2 ||
            !option3 ||
            !option4 ||
            !correct_option ||
            !level
        ) {
            return res.status(400).json({ error: 'All required fields must be provided.' });
        }

        // Validate the correct_option value
        if (![1, 2, 3, 4].includes(correct_option)) {
            return res
                .status(400)
                .json({ error: 'Correct option must be an integer between 1 and 4.' });
        }

        // Create the new question
        const newQuestion = await Question.create({
            creator_id: currentUserId,
            name: name,
            question: question,
            option1: option1,
            option2: option2,
            option3: option3,
            option4: option4,
            correct_option: correct_option,
            level: level,
        });

        // Handle related questions if provided
        if (related_ids && Array.isArray(related_ids)) {
            const relatedQuestionPromises = related_ids.map((relatedId) =>
                RelatedQuestion.create({
                    question_id: newQuestion.id,
                    related_id: relatedId,
                })
            );
            await Promise.all(relatedQuestionPromises);
        }

        res.status(201).json({
            message: 'Question created successfully.',
        });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ error: 'Failed to create question.' });
    }
});

module.exports = router;