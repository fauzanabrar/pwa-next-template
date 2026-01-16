import {
  createDefaultStats,
  generateQuestion,
  getAccuracy,
  getAverageMs,
  getTargetMs,
  getWeakestSkill,
  MAX_LEVEL,
  pickSkill,
  SKILL_LABELS,
  SKILL_SYMBOLS,
  updateStats,
  type Question,
  type SkillKey,
} from "@/lib/math";
import type {
  AnswerParseResult,
  SettingControl,
  TrainingProvider,
  TrainingSettingsBase,
} from "../types";

type MathSettings = TrainingSettingsBase & {
  negativeLevel: number;
};

const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const DEFAULT_SETTINGS: MathSettings = {
  questionCount: 10,
  timeLimitSeconds: 10,
  negativeLevel: 0,
};

const SKILL_ORDER: SkillKey[] = ["add", "sub", "mul", "div"];

const SKILL_DEFINITIONS = {
  add: {
    label: SKILL_LABELS.add,
    symbol: SKILL_SYMBOLS.add,
    subtitle: "Sum drills",
  },
  sub: {
    label: SKILL_LABELS.sub,
    symbol: SKILL_SYMBOLS.sub,
    subtitle: "Minus drills",
  },
  mul: {
    label: SKILL_LABELS.mul,
    symbol: SKILL_SYMBOLS.mul,
    subtitle: "Times tables",
  },
  div: {
    label: SKILL_LABELS.div,
    symbol: SKILL_SYMBOLS.div,
    subtitle: "Quotient practice",
  },
} satisfies Record<SkillKey, { label: string; symbol: string; subtitle: string }>;

const settingControls: SettingControl<MathSettings>[] = [
  {
    id: "questionCount",
    label: "Questions per session",
    hint: "Default is 10",
    min: 5,
    max: 50,
    step: 1,
    getValue: (settings) => settings.questionCount,
    setValue: (settings, value) => ({
      ...settings,
      questionCount: clampValue(value, 5, 50),
    }),
  },
  {
    id: "timeLimitSeconds",
    label: "Time per question",
    hint: "Seconds allowed",
    min: 5,
    max: 60,
    step: 5,
    getValue: (settings) => settings.timeLimitSeconds,
    setValue: (settings, value) => ({
      ...settings,
      timeLimitSeconds: clampValue(value, 5, 60),
    }),
    formatValue: (value) => `${value}s`,
  },
  {
    id: "negativeLevel",
    label: "Negative answers (subtraction)",
    hint: "Start showing negatives from a level.",
    min: 0,
    max: MAX_LEVEL,
    step: 1,
    getValue: (settings) => settings.negativeLevel,
    setValue: (settings, value) => ({
      ...settings,
      negativeLevel: clampValue(value, 0, MAX_LEVEL),
    }),
    formatValue: (value) => (value === 0 ? "Off" : `Level ${value}+`),
  },
];

const allowNegativeAnswer = (question: Question, settings: MathSettings) =>
  question.skill === "sub" &&
  settings.negativeLevel > 0 &&
  question.level >= settings.negativeLevel;

const sanitizeNumericInput = (
  raw: string,
  allowNegative: boolean
): string => {
  let cleaned = raw.replace(/[^0-9-]/g, "");
  if (!allowNegative) {
    cleaned = cleaned.replace(/-/g, "");
  } else if (cleaned.includes("-")) {
    cleaned = cleaned.replace(/(?!^)-/g, "");
  }
  return cleaned;
};

const parseNumericInput = (
  value: string
): AnswerParseResult<number> => {
  if (!value) {
    return { error: "empty" };
  }
  if (value === "-") {
    return { error: "incomplete" };
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return { error: "invalid" };
  }
  return { value: numeric };
};

export const mathTrainingProvider: TrainingProvider<
  SkillKey,
  Question,
  MathSettings,
  number
> = {
  id: "math",
  title: "Math Training",
  description: "Adaptive arithmetic drills across four skills.",
  skillOrder: SKILL_ORDER,
  skills: SKILL_DEFINITIONS,
  maxLevel: MAX_LEVEL,
  createDefaultStats,
  createQuestion: ({ skill, level, settings }) => {
    const allowNegative =
      skill === "sub" &&
      settings.negativeLevel > 0 &&
      level >= settings.negativeLevel;
    return generateQuestion(skill, level, { allowNegative });
  },
  getQuestionText: (question) => question.text,
  updateStats: (stats, { skill, correct, elapsedMs }) =>
    updateStats(stats, skill, correct, elapsedMs),
  getAccuracy,
  getAverageMs,
  getTargetMs,
  getWeakestSkill,
  pickSkill,
  answer: {
    inputMode: "numeric",
    placeholder: "Type your answer",
    keypad: {
      enabled: true,
      rows: ({ allowNegative }) =>
        allowNegative
          ? [
              ["7", "8", "9"],
              ["4", "5", "6"],
              ["1", "2", "3"],
              ["-", "0", "DEL", "CLR"],
            ]
          : [
              ["7", "8", "9"],
              ["4", "5", "6"],
              ["1", "2", "3"],
              ["CLR", "0", "DEL"],
            ],
    },
    allowNegative: allowNegativeAnswer,
    sanitizeInput: (raw, { allowNegative }) =>
      sanitizeNumericInput(raw, allowNegative),
    parseInput: (value) => parseNumericInput(value),
    isCorrect: (value, question) => value === question.answer,
    formatExpected: (question) => String(question.answer),
    errors: {
      empty: "Type an answer.",
      emptyKeypad: "Tap numbers to continue.",
      incomplete: "Type a number.",
      invalid: "Numbers only for now.",
    },
  },
  settings: {
    defaultValue: DEFAULT_SETTINGS,
    controls: settingControls,
  },
};
