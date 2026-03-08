import express, { Router } from 'express';
import {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// all routes are protected : 
router.use(protect);

router.post('/:id/submit', submitQuiz);      // ← Most specific first
router.get('/:id/results', getQuizResults);  // ← Specific action
router.get('/quiz/:id', getQuizById);        // ← Specific path
router.delete('/:id', deleteQuiz);           // ← Specific method
router.get('/:documentId', getQuizzes);      // ← Generic pattern LAST

export default router;