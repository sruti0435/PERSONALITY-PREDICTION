// textEvaluationController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

exports.evaluateTextAnswer = async (req, res) => {
  try {
    const { userAnswer, correctAnswer, options = {} } = req.body;
    
    if (!userAnswer || !correctAnswer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters',
        evaluation: {
          isCorrect: false,
          score: 0,
          feedback: "Missing answer or reference answer"
        }
      });
    }

    // Threshold for considering an answer correct
    const threshold = options.threshold || 0.7;
    
    // Create the prompt for Gemini
    const prompt = `
You are an educational assessment evaluator. Please evaluate the student's answer based on the correct reference answer.

REFERENCE ANSWER:
${correctAnswer}

STUDENT ANSWER:
${userAnswer}

Please provide your evaluation in the following JSON format:
{
  "score": [a number between 0 and 1, where 1 means perfect match and 0 means completely incorrect],
  "isCorrect": [boolean - true if score >= ${threshold}, false otherwise],
  "feedback": [brief constructive feedback explaining the evaluation, max 2 sentences],
  "keyPointsIdentified": [array of key concepts correctly identified in student's answer],
  "missingPoints": [array of important points missing from student's answer]
}`;

    // Call the Gemini API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from the response
    let evaluationResult;
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : null;
      
      if (jsonStr) {
        evaluationResult = JSON.parse(jsonStr);
      } else {
        throw new Error('Could not extract JSON from response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback to basic evaluation
      evaluationResult = {
        isCorrect: userAnswer.toLowerCase().includes(correctAnswer.toLowerCase()),
        score: 0.5,
        feedback: "Basic evaluation performed due to processing error."
      };
    }
    
    return res.status(200).json({
      success: true,
      evaluation: evaluationResult
    });
    
  } catch (error) {
    console.error('Error evaluating text answer:', error);
    
    // Return a fallback evaluation
    return res.status(500).json({
      success: false,
      message: 'Error evaluating answer',
      evaluation: {
        isCorrect: false,
        score: 0,
        feedback: "An error occurred during evaluation. Please try again."
      }
    });
  }
};