/*
backend/
├── config/         → Configuration setup files
├── controllers/    → Business logic (what to DO with requests)
├── middleware/     → Request interceptors (run BEFORE controllers)
├── models/         → Database structure definitions
├── routes/         → URL endpoint definitions (which URL calls which controller)
├── utils/          → Helper/utility functions
├── .env            → Secret keys & environment variables
├── package.json    → Dependencies list
└── server.js       → Entry point - starts everything
*/

import dotenv from 'dotenv' // Keeps the secret keys and passwords out of your code.
dotenv.config();
import express from 'express' // Makes it easy to build APIs and web servers with routing, middleware, and request handling
import cors from 'cors'; // By default, browsers **block** requests between different URLs (React on port 5173, Backend on port 5000). CORS removes that block and says: "Hey browser, it's okay for localhost:5173 to talk to localhost:5000"
import path from 'path'; // Node.js core module for working with file and directory paths
import url from 'url'; // Converts a file URL into a file system path
import errorHandler from './middleware/errorHandler.js';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

// ES6 module __dirname alternative : 
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// initialize express app : 
const app = express();

// connect to mongoDB
connectDB();

// Middleware to handle CORS : allow specific origin
app.use(
    cors({
        origin: [
            "http://localhost:5173",  // Local development
            "https://ai-learning-backend-4w9l.onrender.com",  // Your own backend
            "https://your-frontend-domain.onrender.com"  // ← Add your actual frontend URL here
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// static foder for uploads : 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes : 
app.use('/api/auth',authRoutes)
app.use('/api/documents',documentRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/ai',aiRoutes);
app.use('/api/quizzes',quizRoutes);
app.use('/api/progress',progressRoutes);


// Global error handler 
app.use(errorHandler);
// 404 Handler : 
app.use((req, res)=>{
    res.status(404).json({
        success: false,
        error: 'Route not found',
        statusCode: 404
    });
});

// Start server : 
const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>{
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
})

process.on('unhandledRejection', (err)=>{
    console.error(`Error : ${err.message}`);
    process.exit(1);
});
