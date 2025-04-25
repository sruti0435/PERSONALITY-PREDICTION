import userAuthenticatedAxiosInstance from "../users/userAuthenticatedAxiosInstance";

const userAxiosInstance1 = userAuthenticatedAxiosInstance(
    "/api/v1/assessmentGenerate"
);
const userAxiosInstance2 = userAuthenticatedAxiosInstance(
    "/api/v1/assessmentResult"
);
const userAxiosInstance3 = userAuthenticatedAxiosInstance("/api/v1/chatbot");
const userAxiosInstance4 = userAuthenticatedAxiosInstance(
    "/api/v1/exploreAssessment"
);
const userAxiosInstance5 = userAuthenticatedAxiosInstance(
    "/api/v1/textEvaluation"
);

const generateQuizFromYoutube = async (
    videoUrl,
    numberOfQuestions = 5,
    difficulty = "medium",
    type = "MCQ"
) => {
    try {
        const response = await userAxiosInstance1.post("/youtube", {
            videoUrl,
            numberOfQuestions,
            difficulty,
            type,
        });
        return response.data;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
};

/**
 * Generate quiz from a media URL (either direct URL or Cloudinary URL)
 */
const generateQuizFromMediaUrl = async (
    mediaUrl,
    numberOfQuestions = 5,
    difficulty = "medium",
    type = "MCQ",
    options = {}
) => {
    const { 
        deleteAfterProcessing = false, 
        cloudinaryPublicId = null,
        resourceType = 'video'  // Default to video for audio/video files
    } = options;
    
    try {
        const response = await userAxiosInstance1.post("/media-url", {
            mediaUrl,
            numberOfQuestions,
            difficulty,
            type,
            deleteAfterProcessing,
            cloudinaryPublicId,
            resourceType
        });
        return response.data;
    } catch (error) {
        console.error("Error generating quiz from media URL:", error);
        throw error;
    }
};

/**
 * Generate quiz from media file with Cloudinary pre-upload
 */
const generateQuizFromMedia = async (
    file,
    numberOfQuestions = 5,
    difficulty = "medium",
    type = "MCQ"
) => {
    try {
        // Always use Cloudinary approach - no fallback to local
        console.log('Preparing file upload to Cloudinary...');
        
        // Dynamically import to avoid bundling issues
        const { uploadToCloudinary, getResourceType } = await import('../../utils/cloudinaryUtils');
        
        // Upload to Cloudinary with appropriate resource type
        const resourceType = getResourceType(file);
        console.log(`Uploading ${file.name} (${file.size} bytes) to Cloudinary as ${resourceType}...`);
        
        const cloudinaryResult = await uploadToCloudinary(file, {
            folder: 'assessments/media',
            resourceType
        });
        
        console.log('File uploaded to Cloudinary:', cloudinaryResult);
        
        // Use the URL-based endpoint for processing
        console.log('Generating assessment from Cloudinary URL...');
        return generateQuizFromMediaUrl(
            cloudinaryResult.url,
            numberOfQuestions,
            difficulty,
            type,
            {
                deleteAfterProcessing: true,
                cloudinaryPublicId: cloudinaryResult.public_id,
                resourceType: cloudinaryResult.resource_type || resourceType
            }
        );
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw error;
    }
};

/**
 * Generate quiz from document URL (PDF, PPT, PPTX)
 */
const generateQuizFromDocumentUrl = async (
    documentUrl,
    numberOfQuestions = 5,
    difficulty = "medium",
    type = "MCQ",
    options = {}
) => {
    const { 
        deleteAfterProcessing = false, 
        cloudinaryPublicId = null,
        resourceType = 'raw'  // Default to raw for documents
    } = options;
    
    try {
        const response = await userAxiosInstance1.post("/document-url", {
            documentUrl,
            numberOfQuestions,
            difficulty,
            type,
            deleteAfterProcessing,
            cloudinaryPublicId,
            resourceType
        });
        return response.data;
    } catch (error) {
        console.error("Error generating quiz from document URL:", error);
        throw error;
    }
};

/**
 * Generate quiz from document file with Cloudinary pre-upload
 */
const generateQuizFromDocument = async (
    file,
    numberOfQuestions = 5,
    difficulty = "medium",
    type = "MCQ"
) => {
    try {
        // Upload document to Cloudinary first
        console.log('Preparing document upload to Cloudinary...');
        
        // Dynamically import to avoid bundling issues
        const { uploadToCloudinary } = await import('../../utils/cloudinaryUtils');
        
        // Upload to Cloudinary as auto resourceType
        console.log(`Uploading ${file.name} (${file.size} bytes) to Cloudinary...`);
        
        const cloudinaryResult = await uploadToCloudinary(file, {
            folder: 'assessments/documents',
            resourceType: 'auto'
        });
        
        console.log('Document uploaded to Cloudinary:', cloudinaryResult);
        
        // Use URL-based endpoint for processing
        console.log('Generating assessment from Cloudinary document URL...');
        return generateQuizFromDocumentUrl(
            cloudinaryResult.url,
            numberOfQuestions,
            difficulty,
            type,
            {
                deleteAfterProcessing: true,
                cloudinaryPublicId: cloudinaryResult.public_id,
                resourceType: cloudinaryResult.resource_type || 'raw'
            }
        );
    } catch (error) {
        console.error("Error generating quiz from document:", error);
        throw error;
    }
};

/**
 * Submit answers for evaluation
 */
const submitQuiz = async (assessmentId, submissionBody) => {
    try {
        // Check if any of the answers are text answers that need AI evaluation
        const hasTextAnswers = submissionBody.answers && 
            submissionBody.answers.some(answer => answer.questionType === 'text');
        
        // If there are text answers, pre-evaluate them before submission
        if (hasTextAnswers) {
            // Extract text answers for evaluation
            const textAnswers = submissionBody.answers.filter(answer => 
                answer.questionType === 'text');
            
            // Run evaluations in parallel
            const evaluationPromises = textAnswers.map(answer =>
                evaluateTextAnswer(answer.userAnswer, answer.correctAnswer)
                    .catch(error => {
                        console.error("Error evaluating answer:", error);
                        // Return a simple evaluation on error
                        return {
                            isCorrect: false,
                            score: 0,
                            feedback: "Unable to evaluate this answer."
                        };
                    })
            );
            
            const evaluationResults = await Promise.all(evaluationPromises);
            
            // Attach evaluation results to answers
            textAnswers.forEach((answer, index) => {
                answer.evaluation = evaluationResults[index];
            });
        }
        
        const response = await userAxiosInstance2.post(
            `/submit/${assessmentId}`,
            submissionBody
        );
        return response.data;
    } catch (error) {
        console.error("Error submitting quiz:", error);
        throw error;
    }
};

/**
 * Fetch quiz result data
 */
const fetchQuizData = async (assessmentId) => {
    //result of quiz
    try {
        const response = await userAxiosInstance2.get(
            `/getResult/${assessmentId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching quiz data:", error);
        throw error;
    }
};

/**
 * Evaluate a text answer using AI
 * @param {string} userAnswer - The user's answer
 * @param {string} correctAnswer - The reference correct answer
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Evaluation result
 */
const evaluateTextAnswer = async (userAnswer, correctAnswer, options = {}) => {
    try {
        if (!userAnswer || !correctAnswer) {
            return {
                isCorrect: false,
                score: 0,
                feedback: "Missing answer or reference answer."
            };
        }

        // Use server-side evaluation if available
        try {
            const response = await userAxiosInstance5.post("/evaluate", {
                userAnswer,
                correctAnswer,
                options
            });
            
            return response.data.evaluation;
        } catch (serverError) {
            console.warn("Server-side evaluation failed, falling back to basic comparison:", serverError);
            
            // If server-side evaluation fails, fall back to basic comparison
            return basicTextEvaluation(userAnswer, correctAnswer, options);
        }
    } catch (error) {
        console.error("Error evaluating text answer:", error);
        // Provide a simple fallback evaluation
        return basicTextEvaluation(userAnswer, correctAnswer, options);
    }
};

/**
 * Basic text comparison for evaluating answers when AI is unavailable
 * @param {string} userAnswer - User submitted answer
 * @param {string} correctAnswer - Expected correct answer
 * @param {Object} options - Evaluation options
 * @returns {Object} - Basic evaluation result
 */
const basicTextEvaluation = (userAnswer, correctAnswer, options = {}) => {
    const threshold = options.threshold || 0.7;
    
    if (!userAnswer || !correctAnswer) {
        return {
            isCorrect: false,
            score: 0,
            feedback: "Missing answer or reference answer"
        };
    }

    // Normalize answers for comparison
    const normalizedUserAnswer = userAnswer.toLowerCase().trim();
    const normalizedCorrectAnswer = correctAnswer.toLowerCase().trim();
    
    // Check for exact match
    if (normalizedUserAnswer === normalizedCorrectAnswer) {
        return {
            isCorrect: true,
            score: 1.0,
            feedback: "Perfect match with the reference answer."
        };
    }
    
    // Check if one contains the other
    const userContainsCorrect = normalizedUserAnswer.includes(normalizedCorrectAnswer);
    const correctContainsUser = normalizedCorrectAnswer.includes(normalizedUserAnswer);
    
    if (userContainsCorrect) {
        return {
            isCorrect: true,
            score: 0.9,
            feedback: "Your answer includes all the expected content."
        };
    }
    
    if (correctContainsUser) {
        const ratio = normalizedUserAnswer.length / normalizedCorrectAnswer.length;
        const score = Math.max(0.5, Math.min(0.8, ratio));
        
        return {
            isCorrect: score >= threshold,
            score,
            feedback: "Your answer is partially correct but missing some key points."
        };
    }
    
    // Check for key words overlap
    const correctKeywords = normalizedCorrectAnswer.split(/\s+/);
    const userKeywords = normalizedUserAnswer.split(/\s+/);
    
    const matchingWords = correctKeywords.filter(word => 
        word.length > 3 && userKeywords.includes(word)
    );
    
    const keywordScore = matchingWords.length / correctKeywords.length;
    
    return {
        isCorrect: keywordScore >= threshold,
        score: keywordScore,
        feedback: keywordScore > 0.5 
            ? "Your answer contains some correct key concepts but could be more complete." 
            : "Your answer is missing most of the key concepts from the reference answer."
    };
};

const askAssessment = async (assessmentId, question) => {
    try {
        const reference = await fetchQuizData(assessmentId);
        console.log(reference.result);
        const response = await userAxiosInstance3.post(
            `/ask-assessment/${assessmentId}`,
            {
                reference,
                question,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error asking assessment:", error);
        throw error;
    }
};

const getAllAssessments = async () => {
    try {
        const response = await userAxiosInstance4.get("/all");
        return response.data;
    } catch (error) {
        console.error("Error fetching assessments:", error);
        throw error;
    }
};

const searchAssessments = async (query, difficulty, type) => {
    try {
        let url = `/search?query=${query || ""}`;
        if (difficulty) url += `&difficulty=${difficulty}`;
        if (type) url += `&type=${type}`;

        const response = await userAxiosInstance4.get(url);
        return response.data;
    } catch (error) {
        console.error("Error searching assessments:", error);
        throw error;
    }
};

export {
    generateQuizFromYoutube,
    generateQuizFromMedia,
    generateQuizFromMediaUrl,
    generateQuizFromDocument,
    generateQuizFromDocumentUrl,
    submitQuiz,
    fetchQuizData,
    askAssessment,
    getAllAssessments,
    searchAssessments,
    evaluateTextAnswer
};