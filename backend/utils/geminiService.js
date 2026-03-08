import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

if (!process.env.GROQ_API_KEY) {
    console.error('FATAL ERROR: GROQ_API_KEY is not set in the environment variables.');
    process.exit(1);
}

export const generateFlashcards = async (text, count = 10) => {
    const prompt = `Generate exactly ${count} educational flashcards from the following text. Format each flashcard as:
    Q: [Clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level: easy, medium, or hard]

    Separate each flashcard with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2048,
        });

        const generatedText = response.choices[0].message.content;
        const flashcards = [];
        const cards = generatedText.split('---').filter(c => c.trim());

        for (const card of cards) {
            const lines = card.trim().split('\n');
            let question = '', answer = '', difficulty = 'medium';

            for (const line of lines) {
                if (line.startsWith('Q:')) question = line.substring(2).trim();
                else if (line.startsWith('A:')) answer = line.substring(2).trim();
                else if (line.startsWith('D:')) {
                    const diff = line.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) difficulty = diff;
                }
            }

            if (question && answer) flashcards.push({ question, answer, difficulty });
        }

        return flashcards.slice(0, count);
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to generate flashcards');
    }
};

export const generateQuiz = async (text, numQuestions = 5) => {
    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    Format each question as:
    Q: [Question]
    O1: [Option 1]
    O2: [Option 2]
    O3: [Option 3]
    O4: [Option 4]
    C: [Correct option - exactly as written above]
    E: [Brief explanation]
    D: [Difficulty: easy, medium, or hard]

    Separate questions with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 2048,
        });

        const generatedText = response.choices[0].message.content;
        const questions = [];
        const questionBlocks = generatedText.split('---').filter(q => q.trim());

        for (const block of questionBlocks) {
            const lines = block.trim().split('\n');
            let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('Q:')) question = trimmed.substring(2).trim();
                else if (trimmed.match(/^O\d:/)) options.push(trimmed.substring(3).trim());
                else if (trimmed.startsWith('C:')) correctAnswer = trimmed.substring(2).trim();
                else if (trimmed.startsWith('E:')) explanation = trimmed.substring(2).trim();
                else if (trimmed.startsWith('D:')) {
                    const diff = trimmed.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) difficulty = diff;
                }
            }

            if (question && options.length === 4 && correctAnswer) {
                questions.push({ question, options, correctAnswer, explanation, difficulty });
            }
        }

        return questions.slice(0, numQuestions);
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to generate quiz');
    }
};

export const generateSummary = async (text) => {
    const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points. Keep the summary clear and structured.

    Text:
    ${text.substring(0, 20000)}`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1024,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to generate summary');
    }
};

export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

    const prompt = `Based on the following context from a document, analyse the context and answer the user's question. If the answer is not in the context, say so.

    Context:
    ${context}

    Question: ${question}

    Answer:`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1024,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to process chat request');
    }
};

export const explainConcept = async (concept, context) => {
    const prompt = `Explain the concept of "${concept}" based on the following context. Provide a clear, educational explanation that's easy to understand. Include examples if relevant.

    Context:
    ${context.substring(0, 10000)}`;

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1024,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Groq API error:', error);
        throw new Error('Failed to explain concept');
    }
};