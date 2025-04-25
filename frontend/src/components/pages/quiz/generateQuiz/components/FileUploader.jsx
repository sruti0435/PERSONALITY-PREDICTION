import { FileUp, Upload } from "lucide-react";

const FileUploader = ({ 
  file, 
  error, 
  isUploading, 
  uploadProgress, 
  cloudinaryUrl, 
  fileInputRef, 
  selectedInput, 
  onTriggerFileInput 
}) => {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all hover:border-cyan-500/50 ${
        error ? "border-red-500" : "border-slate-700"
      }`}
      onClick={onTriggerFileInput}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={selectedInput.fileType}
        onChange={(e) => e.target.files[0] && onTriggerFileInput(e)}
      />

      {file ? (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center mb-2">
            <FileUp className="h-6 w-6 text-cyan-500 mr-2" />
            <span className="text-slate-300">{file.name}</span>
            <span className="text-slate-500 ml-2">
              ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>

          {isUploading && (
            <div className="w-full mt-2">
              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Uploading to cloud: {uploadProgress}%
              </p>
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
          <p className="text-slate-400 mb-1">
            Drag and drop your file here or click to browse
          </p>
          <p className="text-slate-500 text-sm">
            Maximum file size:{" "}
            {selectedInput.id === "document" ? "25MB" : "100MB"}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
