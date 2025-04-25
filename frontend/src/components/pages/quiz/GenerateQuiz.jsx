import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Youtube, Video, Music, FileUp, ChevronDown, Upload, AlertCircle } from "lucide-react";
import { 
    generateQuizFromYoutube, 
    generateQuizFromMedia, 
    generateQuizFromDocument, 
    generateQuizFromMediaUrl 
} from '../../../services/quiz/QuizService';

const GenerateQuiz = () => {
    const [selectedInput, setSelectedInput] = useState(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] = useState(false)
    const [isQuestionCountDropdownOpen, setIsQuestionCountDropdownOpen] = useState(false)
    const [isQuestionTypeDropdownOpen, setIsQuestionTypeDropdownOpen] = useState(false)
    const [file, setFile] = useState(null)
    const [inputValue, setInputValue] = useState("")
    const [error, setError] = useState("")
    const [difficulty, setDifficulty] = useState(null)
    const [questionCount, setQuestionCount] = useState(null)
    const [questionType, setQuestionType] = useState(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef(null)
    const navigate = useNavigate()
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
    const [cloudinaryData, setCloudinaryData] = useState(null);
    console.log(loading);
    

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
        // {
        // id: "topic",
        // name: "Specific Topic",
        // description: "Use AI to generate content and questions based on the topic",
        // icon: <BrainCircuit className="h-5 w-5" />,
        // placeholder: "Enter your topic here...",
        // acceptsFile: false,
        // },
    ]

    const difficultyLevels = [
        { id: "easy", name: "Easy" },
        { id: "medium", name: "Medium "},
        { id: "hard", name: "Hard" }
    ]

    const questionCounts = [
        { id: "5", name: "5 Questions" },
        { id: "10", name: "10 Questions" }
    ]

    const questionTypes = [
        { id: "MCQ", name: "Multiple Choice Questions" },
        { id: "TF", name: "True/False Questions" },
        { id: "ASSERTION_REASONING", name: "Assertion and Reasoning Questions" },
        { id: "SHORT_ANSWER", name: "Short Answer Questions" },
        { id: "LONG_ANSWER", name: "Long Answer Questions" },
        { id: "ESSAY", name: "Essay Questions" },
        { id: "FILL_IN_BLANK", name: "Fill in the Blank Questions" },
        { id: "MATCHING", name: "Matching Questions" }
    ]

    const handleInputTypeSelect = (inputType) => {
        setSelectedInput(inputType)
        setIsDropdownOpen(false)
        setError("")
        setFile(null)
        setInputValue("")
    }

    const handleDifficultySelect = (difficultyLevel) => {
        setDifficulty(difficultyLevel)
        setIsDifficultyDropdownOpen(false)
    }

    const handleQuestionCountSelect = (count) => {
        setQuestionCount(count)
        setIsQuestionCountDropdownOpen(false)
    }

    const handleQuestionTypeSelect = (type) => {
        setQuestionType(type);
        setIsQuestionTypeDropdownOpen(false);
    }

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
                    const { uploadToCloudinary, getResourceType } = await import('../../../utils/cloudinaryUtils');
                    
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
        setInputValue(e.target.value)
        setError("")
    }

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

        setLoading(true);
        setError(null);

        try {
            let data;
            
            if (selectedInput.id === "youtube") {
                data = await generateQuizFromYoutube(inputValue, questionCount.id, difficulty.id, questionType.id);
                console.log("data", data);
            } 
            else if (selectedInput.id === "mp4-local" || selectedInput.id === "mp3-local") {
                // Use cloudinaryUrl if available, otherwise fall back to direct upload
                if (cloudinaryUrl && cloudinaryData) {
                    data = await generateQuizFromMediaUrl(
                        cloudinaryUrl, 
                        questionCount.id, 
                        difficulty.id,
                        questionType.id,
                        {
                            deleteAfterProcessing: true,
                            cloudinaryPublicId: cloudinaryData.public_id,
                            resourceType: cloudinaryData.resource_type || 'video'
                        }
                    );
                } else {
                    data = await generateQuizFromMedia(
                        file, 
                        questionCount.id, 
                        difficulty.id, 
                        questionType.id,
                        true // Try to use Cloudinary if not already uploaded
                    );
                }
            }
            else if (selectedInput.id === "mp4-url" || selectedInput.id === "mp3-url") {
                data = await generateQuizFromMediaUrl(inputValue, questionCount.id, difficulty.id, questionType.id);
            } 
            else if (selectedInput.id === "document") {
                data = await generateQuizFromDocument(file, questionCount.id, difficulty.id, questionType.id);
            } 
            else {
                throw new Error("Unsupported input type");
            }
            
            navigate(`/attemptquiz/${data.assessmentId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click()
    }

    return (
        <section className="py-16 bg-slate-900 -mt-2 min-h-screen">
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-900 bg-opacity-75 z-50">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-300 text-lg">Generating quiz...</p>
                    </div>
                </div>
            )}
            <div className="container mx-auto px-6 -mt-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Generate Your Quiz</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-indigo-600 mx-auto mb-6"></div>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="bg-slate-950 rounded-xl p-8 border border-cyan-900/30 shadow-lg">
                        {/* Input Type Selector */}
                        <div className="mb-8">
                            <label className="block text-slate-300 mb-2 font-medium">Select Input Type</label>
                            <div className="relative">
                                <button
                                    className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-4 text-left transition-all"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    {selectedInput ? (
                                        <div className="flex items-center">
                                            <div className="bg-gradient-to-br from-cyan-500 to-indigo-600 p-2 rounded-lg mr-3">
                                                {selectedInput.icon}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-200">{selectedInput.name}</div>
                                                <div className="text-sm text-slate-400">{selectedInput.description}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">Choose an input method...</span>
                                    )}
                                    <ChevronDown
                                        className={`h-5 w-5 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                                        {inputTypes.map((inputType) => (
                                            <div
                                                key={inputType.id}
                                                className="flex items-center p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0"
                                                onClick={() => handleInputTypeSelect(inputType)}
                                            >
                                                <div className="bg-gradient-to-br from-cyan-500 to-indigo-600 p-2 rounded-lg mr-3">
                                                    {inputType.icon}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-200">{inputType.name}</div>
                                                    <div className="text-sm text-slate-400">{inputType.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Area */}
                        {selectedInput && (
                            <div className="mb-6">
                                <label className="block text-slate-300 mb-2 font-medium">
                                    {selectedInput.acceptsFile ? "Upload File" : "Enter Input"}
                                </label>

                                {selectedInput.acceptsFile ? (
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all hover:border-cyan-500/50 ${error ? "border-red-500" : "border-slate-700"}`}
                                        onClick={triggerFileInput}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept={selectedInput.fileType}
                                            onChange={handleFileChange}
                                        />

                                        {file ? (
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center justify-center mb-2">
                                                    <FileUp className="h-6 w-6 text-cyan-500 mr-2" />
                                                    <span className="text-slate-300">{file.name}</span>
                                                    <span className="text-slate-500 ml-2">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                                </div>
                                                
                                                {isUploading && (
                                                    <div className="w-full mt-2">
                                                        <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full"
                                                                style={{width: `${uploadProgress}%`}}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-slate-400 mt-1">Uploading to cloud: {uploadProgress}%</p>
                                                    </div>
                                                )}
                                                
                                                {cloudinaryUrl && (
                                                    <div className="mt-2 text-xs text-emerald-500">
                                                        Successfully uploaded to cloud
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                                                <p className="text-slate-400 mb-1">Drag and drop your file here or click to browse</p>
                                                <p className="text-slate-500 text-sm">
                                                    Maximum file size: {selectedInput.id === "document" ? "25MB" : "100MB"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        className={`w-full bg-slate-900 border rounded-lg p-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                                            error ? "border-red-500" : "border-slate-700"
                                        }`}
                                        placeholder={selectedInput.placeholder}
                                        value={inputValue}
                                        onChange={handleInputChange}
                                    />
                                )}

                                {error && (
                                    <div className="flex items-center mt-2 text-red-500">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quiz Configuration - only show if input is selected */}
                        {selectedInput && (
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Difficulty Selector */}
                                <div>
                                    <label className="block text-slate-300 mb-2 font-medium">Difficulty Level</label>
                                    <div className="relative">
                                        <button
                                            className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-4 text-left transition-all"
                                            onClick={() => setIsDifficultyDropdownOpen(!isDifficultyDropdownOpen)}
                                        >
                                            {difficulty ? (
                                                <div>
                                                    <div className="font-medium text-slate-200">{difficulty.name}</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">Select difficulty...</span>
                                            )}
                                            <ChevronDown
                                                className={`h-5 w-5 text-slate-400 transition-transform ${isDifficultyDropdownOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>

                                        {isDifficultyDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
                                                {difficultyLevels.map((level) => (
                                                    <div
                                                        key={level.id}
                                                        className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0"
                                                        onClick={() => handleDifficultySelect(level)}
                                                    >
                                                        <div className="font-medium text-slate-200">{level.name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Question Count Selector */}
                                <div>
                                    <label className="block text-slate-300 mb-2 font-medium">Number of Questions</label>
                                    <div className="relative">
                                        <button
                                            className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-4 text-left transition-all"
                                            onClick={() => setIsQuestionCountDropdownOpen(!isQuestionCountDropdownOpen)}
                                        >
                                            {questionCount ? (
                                                <div>
                                                    <div className="font-medium text-slate-200">{questionCount.name}</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">Select question count...</span>
                                            )}
                                            <ChevronDown
                                                className={`h-5 w-5 text-slate-400 transition-transform ${isQuestionCountDropdownOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>

                                        {isQuestionCountDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
                                                {questionCounts.map((count) => (
                                                    <div
                                                        key={count.id}
                                                        className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0"
                                                        onClick={() => handleQuestionCountSelect(count)}
                                                    >
                                                        <div className="font-medium text-slate-200">{count.name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Question Type Selector */}
                                <div>
                                    <label className="block text-slate-300 mb-2 font-medium">Type of Question</label>
                                    <div className="relative">
                                        <button
                                            className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-4 text-left transition-all"
                                            onClick={() => setIsQuestionTypeDropdownOpen(!isQuestionTypeDropdownOpen)}
                                        >
                                            {questionType ? (
                                                <div>
                                                    <div className="font-medium text-slate-200">{questionType.name}</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">Select question type...</span>
                                            )}
                                            <ChevronDown
                                                className={`h-5 w-5 text-slate-400 transition-transform ${isQuestionTypeDropdownOpen ? "rotate-180" : ""}`}
                                            />
                                        </button>

                                        {isQuestionTypeDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
                                                {questionTypes.map((type) => (
                                                    <div
                                                        key={type.id}
                                                        className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0"
                                                        onClick={() => handleQuestionTypeSelect(type)}
                                                    >
                                                        <div className="font-medium text-slate-200">{type.name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        {selectedInput && (
                            <button
                                className={`w-full py-4 ${
                                    isUploading || loading
                                    ? "bg-slate-700 cursor-not-allowed"
                                    : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700"
                                } text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all`}
                                onClick={handleSubmit}
                                disabled={isUploading || loading}
                            >
                                {isUploading ? "Uploading..." : loading ? "Generating..." : "Generate Quiz"}
                            </button>
                        )}

                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GenerateQuiz;