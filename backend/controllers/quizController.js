import Quiz from "../models/Quiz.js";

// @desc    Get all quizzes for a document
// @route   get /API/quizzes/:documentId
// @access  Private
export const getQuizzes = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single quiz by ID
// @route   GET /api/quizzes/quiz/:id
// @access  Private
export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if(!quiz){
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};


// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;  
    const { answers } = req.body;

    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    let correctCount = 0;
    const detailedResults = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers.find(
        (a) => a.questionId === question._id.toString()
      );

      const selectedAnswer = userAnswer?.selectedAnswer?.trim() || '';
      let correctAnswer = question.correctAnswer?.trim() || '';
      
      const optionMatch = correctAnswer.match(/^O(\d+)/i);

        if (optionMatch) {
            const optionNum = parseInt(optionMatch[1]) - 1;

            if (optionNum >= 0 && optionNum < question.options.length) {
                correctAnswer = question.options[optionNum];
        }
    }

      const isCorrect = selectedAnswer.toLowerCase() === correctAnswer.toLowerCase();

      if (isCorrect) {
        correctCount++;
      }

      detailedResults.push({
        questionId: question._id,
        question: question.question,
        selectedAnswer: userAnswer?.selectedAnswer || 'Not answered',
        correctAnswer: correctAnswer, // ✅ Now contains full text
        isCorrect,
        explanation: question.explanation,
      });
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    // Update quiz with results
    quiz.score = score;
    quiz.totalQuestions = quiz.questions.length;
    quiz.completedAt = new Date();
    
    // ✅ Save user answers correctly
    quiz.userAnswers = quiz.questions.map((question, index) => {
      const userAnswer = answers.find(a => a.questionId === question._id.toString());
      
      if (!userAnswer) {
        return {
          questionIndex: index,
          selectedAnswer: 'Not answered',
          isCorrect: false,
          answeredAt: new Date()
        };
      }

      const selectedAnswer = userAnswer.selectedAnswer?.trim() || '';
      let correctAnswer = question.correctAnswer?.trim() || '';
      
      // ✅ Handle "O1", "O2" format here too
      if (correctAnswer.match(/^O\d+$/i)) {
        const optionNum = parseInt(correctAnswer.substring(1)) - 1;
        if (optionNum >= 0 && optionNum < question.options.length) {
          correctAnswer = question.options[optionNum];
        }
      }
      
      const isCorrect = selectedAnswer.toLowerCase() === correctAnswer.toLowerCase();
      
      return {
        questionIndex: index,
        selectedAnswer: userAnswer.selectedAnswer,
        isCorrect: isCorrect,
        answeredAt: new Date()
      };
    });

    await quiz.save();

    console.log('\n📊 QUIZ RESULTS:');
    console.log('Score:', score);
    console.log('Correct:', correctCount, '/', quiz.questions.length);
    console.log('\nDetailed Results:');
    detailedResults.forEach((result, i) => {
      console.log(`Q${i + 1}: ${result.isCorrect ? '✅ CORRECT' : '❌ WRONG'}`);
      console.log(`  Selected: "${result.selectedAnswer}"`);
      console.log(`  Correct:  "${result.correctAnswer}"`);
    });

    res.status(200).json({
      success: true,
      data: {
        score,
        correctAnswers: correctCount,
        totalQuestions: quiz.questions.length,
        detailedResults,
      },
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    next(error);
  }
};
// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private
export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId', 'title');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if (!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: 'Quiz not completed yet',
                statusCode: 400
            }); 
       }

       // Build detailed results : 
       const detailedResults = quiz.questions.map((question, index)=>{
        const userAnswer = quiz.userAnswers.find(a=>a.questionIndex === index);
        return {
            questionIndex: index,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            selectedAnswer: userAnswer?.selectedAnswer || null,
            isCorrect: userAnswer?.isCorrect || false,
            explanation: question.explanation
        };
       });

       res.status(200).json({
        success: true,
        data: {
            quiz: {
                id: quiz._id,
                title: quiz.title,
                document: quiz.documentId,
                score: quiz.score,
                totalQuestions: quiz.totalQuestions,
            },
            results: detailedResults
        }
       });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
export const deleteQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if(!quiz){
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        await quiz.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};