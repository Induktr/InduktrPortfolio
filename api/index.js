// Serverless function for Vercel
const express = require('express');
const session = require('express-session');
const { registerRoutes } = require('../server/routes');
const commentsRouter = require('../server/routes/comments');

// Initialize express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add session middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  })
);

// Register routes
app.use(commentsRouter);
registerRoutes(app);

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error("Error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

// Export the Express API as a Vercel serverless function
module.exports = (req, res) => {
  app(req, res);
}; 