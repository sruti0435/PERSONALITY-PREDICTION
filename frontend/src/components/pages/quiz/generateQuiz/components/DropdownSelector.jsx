import { useState } from "react";
import { ChevronDown } from "lucide-react";

const DropdownSelector = ({ 
  label, 
  options, 
  selectedOption, 
  onSelect, 
  placeholder = "Select option..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div>
      <label className="block text-slate-300 mb-2 font-medium">{label}</label>
      <div className="relative">
        <button
          className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-4 text-left transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOption ? (
            <div>
              <div className="font-medium text-slate-200">
                {selectedOption.name}
              </div>
            </div>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl">
            {options.map((option) => (
              <div
                key={option.id}
                className="p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0"
                onClick={() => handleSelect(option)}
              >
                <div className="font-medium text-slate-200">{option.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownSelector;
