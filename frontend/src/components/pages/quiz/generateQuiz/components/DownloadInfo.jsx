import { FileCheck, Download, Bookmark } from "lucide-react";

const DownloadInfo = () => {
  return (
    <div className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 border border-cyan-900/50 shadow-lg">
      <div className="flex items-start mb-4">
        <div className="bg-cyan-600/20 p-2 rounded-full">
          <FileCheck className="h-6 w-6 text-cyan-400" />
        </div>
        <h3 className="ml-3 text-lg font-semibold text-slate-200">
          Your Assessment Package Details
        </h3>
      </div>
      
      <p className="text-slate-300 mb-4">
        You'll receive a professionally formatted PDF assessment with:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* MCQ Section */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center mb-2">
            <div className="bg-indigo-500/20 p-1.5 rounded-md">
              <span className="font-mono text-xs font-bold text-indigo-400">01</span>
            </div>
            <h4 className="ml-2 font-medium text-indigo-300">Multiple Choice</h4>
          </div>
          <p className="text-slate-400 text-sm">5 questions with options to test knowledge recall and application</p>
        </div>
        
        {/* Short Answer Section */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center mb-2">
            <div className="bg-cyan-500/20 p-1.5 rounded-md">
              <span className="font-mono text-xs font-bold text-cyan-400">02</span>
            </div>
            <h4 className="ml-2 font-medium text-cyan-300">Short Answer</h4>
          </div>
          <p className="text-slate-400 text-sm">5 questions requiring brief explanations of key concepts</p>
        </div>
        
        {/* Long Answer Section */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center mb-2">
            <div className="bg-blue-500/20 p-1.5 rounded-md">
              <span className="font-mono text-xs font-bold text-blue-400">03</span>
            </div>
            <h4 className="ml-2 font-medium text-blue-300">Long Answer</h4>
          </div>
          <p className="text-slate-400 text-sm">5 in-depth questions for comprehensive understanding</p>
        </div>
      </div>
      
      <div className="flex items-start bg-slate-900 rounded-lg p-4 border border-slate-700/70">
        <Bookmark className="h-5 w-5 text-cyan-400 mt-0.5" />
        <div className="ml-3">
          <h5 className="font-medium text-cyan-300 text-sm">PDF Format Features</h5>
          <ul className="list-disc pl-5 mt-1 text-slate-400 text-sm space-y-1">
            <li>All questions organized by type</li>
            <li>Answer key with detailed explanations</li>
            <li>References to source material</li>
            <li>Professionally formatted for printing or digital use</li>
          </ul>
        </div>
      </div>
      
      <div className="flex items-center justify-center mt-4 pt-4 border-t border-slate-700">
        <Download className="h-4 w-4 text-cyan-400 mr-2" />
        <p className="text-cyan-300 text-sm">
          Click the download button below to generate your assessment PDF
        </p>
      </div>
    </div>
  );
};

export default DownloadInfo;
