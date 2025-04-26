const UrlInputField = ({ selectedInput, inputValue, onChange, error }) => {
  return (
    <input
      type="text"
      className={`w-full bg-slate-900 border rounded-lg p-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
        error ? "border-red-500" : "border-slate-700"
      }`}
      placeholder={selectedInput.placeholder}
      value={inputValue}
      onChange={onChange}
    />
  );
};

export default UrlInputField;
