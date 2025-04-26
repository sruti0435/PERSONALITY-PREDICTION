const LoadingOverlay = ({ loading, isDownloading }) => {
  if (!loading) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900 bg-opacity-80 backdrop-blur-sm z-50">
      <div className="bg-slate-800/90 p-8 rounded-xl border border-slate-700 shadow-lg text-center max-w-md">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
        <p className="text-slate-200 text-xl font-medium">
          {isDownloading ? "Preparing your assessment..." : "Generating assessment..."}
        </p>
        <p className="text-slate-400 mt-2">
          {isDownloading 
            ? "We're creating a comprehensive PDF with questions and answers. This may take a moment." 
            : "Analyzing content and creating questions. Please wait."}
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
