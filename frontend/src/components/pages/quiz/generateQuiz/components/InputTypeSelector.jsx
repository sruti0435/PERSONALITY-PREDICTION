import { useState } from "react";
import { ChevronDown } from "lucide-react";

const InputTypeSelector = ({ inputTypes, selectedInput, onSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSelect = (inputType) => {
    onSelect(inputType);
    setIsDropdownOpen(false);
  };

  return (
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
            className={`h-5 w-5 text-slate-400 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
            {inputTypes.map((inputType) => (
              <div
                key={inputType.id}
                className="flex items-center p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0"
                onClick={() => handleSelect(inputType)}
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
  );
};

export default InputTypeSelector;
