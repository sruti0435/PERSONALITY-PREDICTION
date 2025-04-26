import { AlertCircle } from "lucide-react";

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="flex items-center mt-2 text-red-500">
      <AlertCircle className="h-4 w-4 mr-1" />
      <span className="text-sm">{error}</span>
    </div>
  );
};

export default ErrorMessage;
