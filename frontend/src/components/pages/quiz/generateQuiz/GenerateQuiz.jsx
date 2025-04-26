import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
    generateQuizFromYoutube, 
    generateQuizFromMedia, 
    generateQuizFromDocument, 
    generateQuizFromMediaUrl 
} from '../../../../services/quiz/QuizService';
import { generateAssessmentPDF } from '../../../../utils/pdfUtils';
import toast from 'react-hot-toast';

// Import components
import InputTypeSelector from './components/InputTypeSelector';
import FileUploader from './components/FileUploader';
import UrlInputField from './components/UrlInputField';
import ActionSelector from './components/ActionSelector';
import ConfigurationOptions from './components/ConfigurationOptions';
import DownloadInfo from './components/DownloadInfo';
import ErrorMessage from './components/ErrorMessage';
import LoadingOverlay from './components/LoadingOverlay';
import { FileText, Youtube, Video, Music } from "lucide-react";

const GenerateQuiz = () => {
    // State management
    const [selectedInput, setSelectedInput] = useState(null);
    const [file, setFile] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");
    const [difficulty, setDifficulty] = useState(null);
    const [questionCount, setQuestionCount] = useState(null);
    const [questionType, setQuestionType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
    const [cloudinaryData, setCloudinaryData] = useState(null);
    const [showOptionsStep, setShowOptionsStep] = useState(false);
    const [assessmentAction, setAssessmentAction] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Input Types definition
    const inputTypes = [
        {
            id: "youtube",
            name: "YouTube URL",
            description: "Generate questions from YouTube video URL",
            icon: <Youtube className="h-5 w-5" />,
            placeholder: "Paste YouTube URL here...",
            acceptsFile: false,
        },
        {
            id: "mp4-local",
            name: "MP4 Video",
            description: "Generate questions from videos uploaded from local",
            icon: <Video className="h-5 w-5" />,
            placeholder: "Upload MP4 video file",
            acceptsFile: true,
            fileType: "video/mp4",
        },
        {
            id: "mp4-url",
            name: "MP4 URL",
            description: "Generate questions from MP4 URL uploaded online",
            icon: <Video className="h-5 w-5" />,
            placeholder: "Paste MP4 video URL here...",
            acceptsFile: false,
        },
        {
            id: "mp3-local",
            name: "MP3 Audio",
            description: "Generate questions from MP3 audio uploaded from local",
            icon: <Music className="h-5 w-5" />,
            placeholder: "Upload MP3 audio file",
            acceptsFile: true,
            fileType: "audio/mpeg",
        },
        {
            id: "mp3-url",
            name: "MP3 URL",
            description: "Generate questions from MP3 URL uploaded online",
            icon: <Music className="h-5 w-5" />,
            placeholder: "Paste MP3 audio URL here...",
            acceptsFile: false,
        },
        {
            id: "document",
            name: "PDF/PPT/TXT",
            description: "Extract and analyze text content from local upload",
            icon: <FileText className="h-5 w-5" />,
            placeholder: "Upload document file",
            acceptsFile: true,
            fileType: ".pdf,.ppt,.pptx,.txt",
        },
    ];

    const difficultyLevels = [
        { id: "easy", name: "Easy" },
        { id: "medium", name: "Medium " },
        { id: "hard", name: "Hard" }
    ];

    const questionCounts = [
        { id: "5", name: "5 Questions" },
        { id: "10", name: "10 Questions" }
    ];

    const questionTypes = [
        { id: "MCQ", name: "Multiple Choice Questions" },
        { id: "TF", name: "True/False Questions" },
        { id: "ASSERTION_REASONING", name: "Assertion and Reasoning Questions" },
        { id: "SHORT_ANSWER", name: "Short Answer Questions" },
        { id: "LONG_ANSWER", name: "Long Answer Questions" },
        { id: "ESSAY", name: "Essay Questions" },
        { id: "FILL_IN_BLANK", name: "Fill in the Blank Questions" },
        { id: "MATCHING", name: "Matching Questions" }
    ];

    // Event handlers
    const handleInputTypeSelect = (inputType) => {
        setSelectedInput(inputType);
        setError("");
        setFile(null);
        setInputValue("");
        setShowOptionsStep(false);
        setAssessmentAction(null);
    };

    const handleDifficultySelect = (difficultyLevel) => {
        setDifficulty(difficultyLevel);
    };

    const handleQuestionCountSelect = (count) => {
        setQuestionCount(count);
    };

    const handleQuestionTypeSelect = (type) => {
        setQuestionType(type);
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            // Check file size (100MB limit for media files, 25MB for documents)
            const maxSize = selectedInput.id === "document" ? 25 * 1024 * 1024 : 100 * 1024 * 1024;
            if (selectedFile.size > maxSize) {
                setError(`File size exceeds ${selectedInput.id === "document" ? "25MB" : "100MB"} limit`);
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setError("");
            setCloudinaryUrl(null);
            
            // If it's a media file and not a document, upload to Cloudinary immediately
            if ((selectedInput.id === "mp4-local" || selectedInput.id === "mp3-local") && 
                process.env.REACT_APP_USE_CLOUDINARY === "true") {
                try {
                    setIsUploading(true);
                    setUploadProgress(0);
                    
                    // Simulate progress updates every 200ms until we reach 90%
                    const progressInterval = setInterval(() => {
                        setUploadProgress(prev => Math.min(prev + 5, 90));
                    }, 200);
                    
                    // Dynamically import cloudinary utils
                    const { uploadToCloudinary, getResourceType } = await import('../../../../utils/cloudinaryUtils');
                    
                    // Upload file to Cloudinary
                    const resourceType = getResourceType(selectedFile);
                    const uploadResult = await uploadToCloudinary(selectedFile, {
                        folder: 'assessments/media',
                        resourceType
                    });
                    
                    // Clear interval and set upload to 100%
                    clearInterval(progressInterval);
                    setUploadProgress(100);
                    setCloudinaryUrl(uploadResult.url);
                    setCloudinaryData(uploadResult); // Save full result object
                    
                    console.log("File uploaded to Cloudinary:", uploadResult.url);
                } catch (error) {
                    console.error("Error uploading to Cloudinary:", error);
                    setError(`Upload failed: ${error.message}. Will use direct upload when generating quiz.`);
                } finally {
                    setIsUploading(false);
                }
            }
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setError("");
    };

    const handleContinue = () => {
        if (!selectedInput) {
            setError("Please select an input type");
            return;
        }

        if (selectedInput.acceptsFile && !file) {
            setError("Please upload a file");
            return;
        }

        if (!selectedInput.acceptsFile && !inputValue) {
            setError("Please enter a valid input");
            return;
        }

        setError("");
        setShowOptionsStep(true);
    };

    const handleActionSelect = (action) => {
        setAssessmentAction(action);
    };

    const triggerFileInput = (e) => {
        if (e?.target?.files?.length) {
            handleFileChange(e);
        } else {
            fileInputRef.current.click();
        }
    };

    const handleSubmit = async () => {
        if (!selectedInput) {
            setError("Please select an input type");
            return;
        }

        if (selectedInput.acceptsFile && !file) {
            setError("Please upload a file");
            return;
        }

        if (!selectedInput.acceptsFile && !inputValue) {
            setError("Please enter a valid input");
            return;
        }

        // For download option, skip difficulty and question count validation
        if (assessmentAction === "take") {
            if (!difficulty) {
                setError("Please select a difficulty level");
                return;
            }

            if (!questionCount) {
                setError("Please select number of questions");
                return;
            }

            if (!questionType) {
                setError("Please select question type");
                return;
            }
        }

        setLoading(true);
        setError(null);
        
        // Set isDownloading based on the action
        setIsDownloading(assessmentAction === "download");

        try {
            let data;
            const quizType = assessmentAction === "download" ? "MIX" : questionType.id;
            const quizCount = assessmentAction === "download" ? "15" : questionCount.id;
            const quizDifficulty = assessmentAction === "download" ? "medium" : difficulty.id;
            
            if (selectedInput.id === "youtube") {
                data = await generateQuizFromYoutube(inputValue, quizCount, quizDifficulty, quizType);
            } 
            else if (selectedInput.id === "mp4-local" || selectedInput.id === "mp3-local") {
                if (cloudinaryUrl && cloudinaryData) {
                    data = await generateQuizFromMediaUrl(
                        cloudinaryUrl, 
                        quizCount, 
                        quizDifficulty,
                        quizType,
                        {
                            deleteAfterProcessing: true,
                            cloudinaryPublicId: cloudinaryData.public_id,
                            resourceType: cloudinaryData.resource_type || 'video'
                        }
                    );
                } else {
                    data = await generateQuizFromMedia(
                        file, 
                        quizCount, 
                        quizDifficulty, 
                        quizType,
                        true
                    );
                }
            }
            else if (selectedInput.id === "mp4-url" || selectedInput.id === "mp3-url") {
                data = await generateQuizFromMediaUrl(inputValue, quizCount, quizDifficulty, quizType);
            } 
            else if (selectedInput.id === "document") {
                data = await generateQuizFromDocument(file, quizCount, quizDifficulty, quizType);
            } 
            else {
                throw new Error("Unsupported input type");
            }
            
            // If action is download, generate and download PDF
            if (assessmentAction === "download") {
                try {
                    // Parse the assessment data
                    let questions;
                    if (data.questions) {
                        questions = data.questions;
                    } else if (data.assessment) {
                        questions = typeof data.assessment === 'string' 
                            ? JSON.parse(data.assessment) 
                            : data.assessment;
                    } else if (typeof data === 'string') {
                        questions = JSON.parse(data);
                    }
                    
                    // Generate a title based on content
                    const sourceTitle = selectedInput.acceptsFile 
                        ? file.name.split('.')[0] 
                        : inputValue.substring(0, 30);
                    
                    const pdfTitle = `Assessment - ${sourceTitle}`;
                    
                    // Generate and download the PDF
                    generateAssessmentPDF(questions, pdfTitle);
                    
                    // Show toast notification for successful download
                    toast.success('Assessment successfully downloaded!', {
                        icon: '📄',
                        duration: 6000,
                        style: {
                            borderRadius: '10px',
                            background: '#0f172a',
                            color: '#fff',
                            border: '1px solid rgba(6, 182, 212, 0.5)',
                            padding: '16px',
                            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.15)'
                        },
                        iconTheme: {
                            primary: '#06b6d4',
                            secondary: '#fff',
                        },
                    });
                    
                    // Navigate to attempt quiz
                    // navigate(`/attemptquiz/${data.assessmentId}`);
                } catch (pdfError) {
                    console.error('Error generating PDF:', pdfError);
                    setError(`PDF generation failed: ${pdfError.message}. Redirecting to quiz page.`);
                    
                    toast.error('Failed to download PDF', {
                        duration: 5000,
                        style: {
                            borderRadius: '10px',
                            background: '#0f172a',
                            color: '#fff',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                        },
                    });
                    
                    // Navigate to attempt quiz if PDF generation fails
                    // setTimeout(() => {
                    //     navigate(`/attemptquiz/${data.assessmentId}`);
                    // }, 3000);
                }
            } else {
                // For "take" action, simply navigate to the quiz
                navigate(`/attemptquiz/${data.assessmentId}`);
            }
        } catch (err) {
            setError(err.message);
            toast.error(`Error: ${err.message}`, {
                style: {
                    borderRadius: '10px',
                    background: '#0f172a',
                    color: '#fff',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                },
            });
        } finally {
            setLoading(false);
            setIsDownloading(false);
        }
    };

    return (
        <section className="py-16 bg-slate-900 -mt-2 min-h-screen">
            {/* Loading overlay */}
            <LoadingOverlay loading={loading} isDownloading={isDownloading} />
            
            <div className="container mx-auto px-6 -mt-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Generate Your Assessment</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-indigo-600 mx-auto mb-6"></div>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="bg-slate-950 rounded-xl p-8 border border-cyan-900/30 shadow-lg">
                        {/* Step 1: Input Type Selection */}
                        {!showOptionsStep && (
                            <>
                                {/* Input Type Selector */}
                                <InputTypeSelector 
                                    inputTypes={inputTypes}
                                    selectedInput={selectedInput}
                                    onSelect={handleInputTypeSelect}
                                />

                                {/* Input Area */}
                                {selectedInput && (
                                    <>
                                        <div className="mb-6">
                                            <label className="block text-slate-300 mb-2 font-medium">
                                                {selectedInput.acceptsFile ? "Upload File" : "Enter Input"}
                                            </label>

                                            {selectedInput.acceptsFile ? (
                                                <FileUploader 
                                                    file={file}
                                                    error={error}
                                                    isUploading={isUploading}
                                                    uploadProgress={uploadProgress}
                                                    cloudinaryUrl={cloudinaryUrl}
                                                    fileInputRef={fileInputRef}
                                                    selectedInput={selectedInput}
                                                    onTriggerFileInput={triggerFileInput}
                                                />
                                            ) : (
                                                <UrlInputField 
                                                    selectedInput={selectedInput}
                                                    inputValue={inputValue}
                                                    onChange={handleInputChange}
                                                    error={error}
                                                />
                                            )}

                                            <ErrorMessage error={error} />
                                        </div>

                                        {/* Continue Button */}
                                        <button
                                            className={`w-full py-4 ${
                                                isUploading
                                                ? "bg-slate-700 cursor-not-allowed"
                                                : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700"
                                            } text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all`}
                                            onClick={handleContinue}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? "Uploading..." : "Continue"}
                                        </button>
                                    </>
                                )}
                            </>
                        )}

                        {/* Step 2: Assessment Options */}
                        {showOptionsStep && (
                            <>
                                {/* Action Selection Options */}
                                {!assessmentAction ? (
                                    <ActionSelector onActionSelect={handleActionSelect} />
                                ) : (
                                    <>
                                        {/* Show configuration options only for "take" option */}
                                        {assessmentAction === "take" && (
                                            <ConfigurationOptions
                                                difficulty={difficulty}
                                                questionCount={questionCount}
                                                questionType={questionType}
                                                difficultyLevels={difficultyLevels}
                                                questionCounts={questionCounts}
                                                questionTypes={questionTypes}
                                                onDifficultySelect={handleDifficultySelect}
                                                onQuestionCountSelect={handleQuestionCountSelect}
                                                onQuestionTypeSelect={handleQuestionTypeSelect}
                                            />
                                        )}
                                        
                                        {/* For download option, show info about what they'll get */}
                                        {assessmentAction === "download" && <DownloadInfo />}

                                        {/* Submit Button */}
                                        <div className="flex gap-4">
                                            <button
                                                className="py-4 px-6 bg-slate-800 text-white font-bold rounded-lg transition-all"
                                                onClick={() => setAssessmentAction(null)}
                                            >
                                                Back
                                            </button>
                                            <button
                                                className={`flex-1 py-4 ${
                                                    loading
                                                    ? "bg-slate-700 cursor-not-allowed"
                                                    : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700"
                                                } text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all`}
                                                onClick={handleSubmit}
                                                disabled={loading}
                                            >
                                                {loading ? "Generating..." : assessmentAction === "download" ? "Download Assessment" : "Take Assessment"}
                                            </button>
                                        </div>
                                    </>
                                )}

                                <ErrorMessage error={error} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GenerateQuiz;