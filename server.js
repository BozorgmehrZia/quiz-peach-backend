const express = require('express');
const cors = require('cors'); // Import CORS
const setupSwagger = require('./swagger');
const userRoutes = require('./routes/users');
const tagRoutes = require('./routes/tags');
const questionRoutes = require('./routes/questions');
const app = express();
const port = process.env.PORT || 9090;

// Middleware to enable CORS
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Swagger setup
setupSwagger(app);

// Routes
app.use('/api/user', userRoutes);
app.use('/api/tag', tagRoutes);
app.use('/api/question', questionRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`API documentation available at http://localhost:${port}/api-docs`);
});