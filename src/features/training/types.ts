export type TrainingMode<SkillKey extends string> = SkillKey | "mix";

export interface Result {
  correct: boolean;
  ms: number;
}

export interface SkillStats {
  level: number;
  streak: number;
  mistakeStreak: number;
  history: Result[];
}

export type Stats<SkillKey extends string> = Record<SkillKey, SkillStats>;

export type TrainingQuestion<SkillKey extends string> = {
  id: string;
  skill: SkillKey;
  level: number;
};

export type TrainingSettingsBase = {
  questionCount: number;
  timeLimitSeconds: number;
};

export type SettingControl<Settings> = {
  id: string;
  label: string;
  hint?: string;
  min: number;
  max: number;
  step: number;
  getValue: (settings: Settings) => number;
  setValue: (settings: Settings, value: number) => Settings;
  formatValue?: (value: number, settings: Settings) => string;
};

export type AnswerParseError = "empty" | "incomplete" | "invalid";

export type AnswerParseResult<AnswerValue> =
  | { value: AnswerValue; error?: undefined }
  | { value?: undefined; error: AnswerParseError };

export type KeypadConfig = {
  enabled: boolean;
  rows: (options: { allowNegative: boolean }) => string[][];
};

export type AnswerConfig<Settings, Question, AnswerValue> = {
  inputMode: "numeric" | "text";
  placeholder: string;
  keypad?: KeypadConfig;
  allowNegative?: (question: Question, settings: Settings) => boolean;
  sanitizeInput: (raw: string, options: { allowNegative: boolean }) => string;
  parseInput: (
    value: string,
    options: { allowNegative: boolean }
  ) => AnswerParseResult<AnswerValue>;
  isCorrect: (value: AnswerValue, question: Question) => boolean;
  formatExpected: (question: Question) => string;
  errors: {
    empty: string;
    emptyKeypad?: string;
    incomplete: string;
    invalid: string;
  };
};

export type SkillDefinition = {
  label: string;
  symbol: string;
  subtitle: string;
};

export type TrainingProvider<
  SkillKey extends string,
  Question extends TrainingQuestion<SkillKey>,
  Settings extends TrainingSettingsBase,
  AnswerValue
> = {
  id: string;
  title: string;
  description: string;
  skillOrder: SkillKey[];
  skills: Record<SkillKey, SkillDefinition>;
  maxLevel: number;
  createDefaultStats: () => Stats<SkillKey>;
  createQuestion: (args: {
    skill: SkillKey;
    level: number;
    settings: Settings;
    stats: Stats<SkillKey>;
  }) => Question;
  getQuestionText: (question: Question) => string;
  updateStats: (stats: Stats<SkillKey>, args: {
    skill: SkillKey;
    correct: boolean;
    elapsedMs: number;
  }) => Stats<SkillKey>;
  getAccuracy: (stats: SkillStats) => number;
  getAverageMs: (stats: SkillStats) => number;
  getTargetMs: (level: number) => number;
  getWeakestSkill: (stats: Stats<SkillKey>) => SkillKey;
  pickSkill: (stats: Stats<SkillKey>) => SkillKey;
  answer: AnswerConfig<Settings, Question, AnswerValue>;
  settings: {
    defaultValue: Settings;
    controls: SettingControl<Settings>[];
  };
};

export type AnyTrainingProvider = TrainingProvider<
  string,
  TrainingQuestion<string>,
  TrainingSettingsBase,
  unknown
>;

type ProviderParts<T> = T extends TrainingProvider<
  infer SkillKey,
  infer Question,
  infer Settings,
  infer AnswerValue
>
  ? {
      skillKey: SkillKey;
      question: Question;
      settings: Settings;
      answerValue: AnswerValue;
    }
  : never;

export type ProviderSkillKey<T> = ProviderParts<T>["skillKey"];
export type ProviderQuestion<T> = ProviderParts<T>["question"];
export type ProviderSettings<T> = ProviderParts<T>["settings"];
export type ProviderAnswerValue<T> = ProviderParts<T>["answerValue"];
