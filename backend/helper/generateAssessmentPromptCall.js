import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateAssessmentPromptCall = async (reference, type = "MCQ", numberOfQuestions = 5, difficulty = "medium") => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Define JSON structure based on question type
        let jsonStructure = '';
        let prompt = '';
        
        // Handle MIX type specially
        if (type === "MIX") {
            // For MIX type, we'll create an array of different question types
            const mcqStructure = `{
                "id": "mcq_number",
                "type": "MCQ",
                "question": "the_question_text",
                "options": ["option_a", "option_b", "option_c", "option_d"],
                "correctAnswer": "the_correct_option",
                "explanation": "brief_explanation_of_answer",
                "reference": "specific_part_of_content_this_relates_to"
            }`;
            
            const shortAnswerStructure = `{
                "id": "short_number",
                "type": "SHORT_ANSWER",
                "question": "the_question_text",
                "correctAnswer": "the_correct_answer",
                "explanation": "brief_explanation_of_answer",
                "reference": "specific_part_of_content_this_relates_to"
            }`;
            
            const longAnswerStructure = `{
                "id": "long_number",
                "type": "LONG_ANSWER",
                "question": "the_question_text",
                "correctAnswer": "the_correct_answer",
                "explanation": "comprehensive_explanation_covering_key_points",
                "reference": "specific_part_of_content_this_relates_to"
            }`;
            
            prompt = `
                You are an expert assessment creator. Create a ${difficulty} difficulty mixed assessment based on the following content:
                
                ${reference}
                
                Generate 15 questions total:
                - 5 multiple choice questions (MCQ) with 4 options each and only one correct option
                - 5 short answer questions that require 1-2 sentence responses
                - 5 long answer questions that require paragraph-length responses (3-5 sentences)
                
                Format your response as a structured JSON array without any additional explanation. Each question should follow one of these structures based on its type:
                
                For MCQ questions:
                ${mcqStructure}
                
                For Short Answer questions:
                ${shortAnswerStructure}
                
                For Long Answer questions:
                ${longAnswerStructure}
                
                Ensure all questions are directly relevant to the content, varied in topic coverage, and appropriate for ${difficulty} difficulty level.`;
        } else if (type === "MCQ") {
            jsonStructure = `{
            "id": "unique_number",
            "question": "the_question_text",
            "options": ["option_a", "option_b", "option_c", "option_d"],
            "correctAnswer": "the_correct_option",
            "explanation": "brief_explanation_of_answer",
            "reference": "specific_part_of_content_this_relates_to"
            }`;
        } else if (type === "TF") {
            jsonStructure = `{
            "id": "unique_number",
            "question": "the_question_text",
            "options": ["True", "False"],
            "correctAnswer": "True or False",
            "explanation": "brief_explanation_of_answer",
            "reference": "specific_part_of_content_this_relates_to"
            }`;
        } else if (type === "ASSERTION_REASONING") {
            jsonStructure = `{
            "id": "unique_number",
            "question": "Assertion: [assertion statement]\\nReason: [reason statement]",
            "options": ["Both assertion and reason are true, and the reason correctly explains the assertion", 
                       "Both assertion and reason are true, but the reason does not explain the assertion", 
                       "The assertion is true but the reason is false", 
                       "The assertion is false but the reason is true"],
            "correctAnswer": "the_correct_option",
            "explanation": "brief_explanation_of_the_relationship_between_assertion_and_reason",
            "reference": "specific_part_of_content_this_relates_to"
            }`;
        } else {
            jsonStructure = `{
            "id": "unique_number",
            "question": "the_question_text",
            "correctAnswer": "the_correct_answer",
            "explanation": "",
            "reference": "specific_part_of_content_this_relates_to"
            }`;
        }

        // Create assessment generation prompt based on parameters for non-MIX types
        if (type !== "MIX") {
            prompt = `
                You are an expert assessment creator. Create a ${difficulty} difficulty assessment with ${numberOfQuestions} ${type} questions based on the following content:
    
                ${reference}
    
                ${getQuestionFormatInstructions(type)}
    
                Format your response as a structured JSON array without any additional explanation. Each question should have the following structure:
                ${jsonStructure}
    
                Ensure questions are directly relevant to the content, varied in topic coverage, and appropriate for ${difficulty} difficulty level.`;
        }
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating assessment:', error);
        throw new Error('Failed to generate assessment. Please try again later.');
    }
};

// Helper function to get format instructions based on question type
function getQuestionFormatInstructions(type) {
    switch (type.toUpperCase()) {
        case "MCQ":
            return "Create multiple choice questions with 4 options per question. Ensure only one option is correct.";

        case "TF":
            return "Create true/false questions where the answer is either true or false. Ensure there are always two options: 'true' and 'false'.";

        case "SHORT_ANSWER":
            return "Create questions that require a short (1-2 sentence) response. Include model answers.";
            
        case "LONG_ANSWER":
            return "Create questions that require paragraph-length responses (3-5 sentences). Include comprehensive model answers that cover the key points.";

        case "ESSAY":
            return "Create open-ended questions that require detailed responses. Include key points that should be covered in a good response.";

        case "FILL_IN_BLANK":
            return "Create fill-in-the-blank questions where students need to provide the missing word or phrase.";

        case "MATCHING":
            return "Create matching questions where students need to match items from two different columns.";

        case "ASSERTION_REASONING":
            return "Create assertion-reasoning questions. Each question consists of an assertion (a statement) and a reason (supporting explanation). Students must evaluate both statements and their relationship, choosing from options: A) Both assertion and reason are true, and the reason correctly explains the assertion. B) Both are true, but reason doesn't explain assertion. C) Assertion true, reason false. D) Assertion false, reason true.";

        default:
            return "Create multiple choice questions with 4 options per question. Ensure only one option is correct.";
    }
}

export default generateAssessmentPromptCall;
