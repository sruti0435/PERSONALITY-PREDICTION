import DropdownSelector from "./DropdownSelector";

const ConfigurationOptions = ({
  difficulty,
  questionCount,
  questionType,
  difficultyLevels,
  questionCounts,
  questionTypes,
  onDifficultySelect,
  onQuestionCountSelect,
  onQuestionTypeSelect,
}) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Difficulty Selector */}
      <DropdownSelector
        label="Difficulty Level"
        options={difficultyLevels}
        selectedOption={difficulty}
        onSelect={onDifficultySelect}
        placeholder="Select difficulty..."
      />

      {/* Question Count Selector */}
      <DropdownSelector
        label="Number of Questions"
        options={questionCounts}
        selectedOption={questionCount}
        onSelect={onQuestionCountSelect}
        placeholder="Select question count..."
      />

      {/* Question Type Selector */}
      <DropdownSelector
        label="Type of Question"
        options={questionTypes}
        selectedOption={questionType}
        onSelect={onQuestionTypeSelect}
        placeholder="Select question type..."
      />
    </div>
  );
};

export default ConfigurationOptions;
