import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { storage } from "@/lib/storage";
import type {
  SettingControl,
  TrainingMode,
  TrainingProvider,
  TrainingQuestion,
  TrainingSettingsBase,
} from "./types";

type Screen = "menu" | "drill" | "settings" | "summary" | "stats";

type Feedback<SkillKey extends string> = {
  correct: boolean;
  expected: string;
  ms: number;
  skill: SkillKey;
  level: number;
  timedOut?: boolean;
};

type SessionCounts = {
  correct: number;
  wrong: number;
};

type UseTrainingSessionOptions<
  SkillKey extends string,
  Question extends TrainingQuestion<SkillKey>,
  Settings extends TrainingSettingsBase,
  AnswerValue
> = {
  provider: TrainingProvider<SkillKey, Question, Settings, AnswerValue>;
  storageKeys: {
    session: string;
    settings: string;
  };
  onSessionComplete?: () => void;
};

const normalizeSettings = <Settings,>(
  settings: Settings,
  controls: SettingControl<Settings>[]
) => {
  let next = { ...settings } as Settings;
  controls.forEach((control) => {
    const value = control.getValue(next);
    const clamped = Math.min(Math.max(value, control.min), control.max);
    if (value !== clamped) {
      next = control.setValue(next, clamped);
    }
  });
  return next;
};

export const useTrainingSession = <
  SkillKey extends string,
  Question extends TrainingQuestion<SkillKey>,
  Settings extends TrainingSettingsBase,
  AnswerValue
>({
  provider,
  storageKeys,
  onSessionComplete,
}: UseTrainingSessionOptions<
  SkillKey,
  Question,
  Settings,
  AnswerValue
>) => {
  type Mode = TrainingMode<SkillKey>;

  const initialState = useMemo(() => {
    const savedSession = storage.readJSON<{
      stats?: ReturnType<typeof provider.createDefaultStats>;
      mode?: Mode;
    }>(storageKeys.session);
    const savedSettings = storage.readJSON<Partial<Settings>>(
      storageKeys.settings
    );
    const merged = {
      ...provider.settings.defaultValue,
      ...savedSettings,
    } as Settings;
    const normalizedSettings = normalizeSettings(
      merged,
      provider.settings.controls
    );
    return {
      stats: savedSession?.stats ?? provider.createDefaultStats(),
      mode: savedSession?.mode ?? "mix",
      settings: normalizedSettings,
      timeLeft: normalizedSettings.timeLimitSeconds,
    };
  }, [provider, storageKeys]);

  const [stats, setStats] = useState(initialState.stats);
  const [mode, setMode] = useState<Mode>(initialState.mode);
  const [screen, setScreen] = useState<Screen>("menu");
  const [settings, setSettings] = useState<Settings>(initialState.settings);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback<SkillKey> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionCounts>({
    correct: 0,
    wrong: 0,
  });
  const [questionIndex, setQuestionIndex] = useState(1);
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft);
  const [answered, setAnswered] = useState(false);

  const startTimeRef = useRef<number>(0);
  const advanceTimerRef = useRef<number | null>(null);
  const statsRef = useRef(stats);
  const modeRef = useRef(mode);

  useEffect(() => {
    storage.writeJSON(storageKeys.session, { stats, mode });
  }, [stats, mode, storageKeys]);

  useEffect(() => {
    storage.writeJSON(storageKeys.settings, settings);
  }, [settings, storageKeys]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  const allowNegativeAnswer = useMemo(() => {
    if (!question || !provider.answer.allowNegative) {
      return false;
    }
    return provider.answer.allowNegative(question, settings);
  }, [provider.answer, question, settings]);

  const keypadRows = useMemo(() => {
    if (!provider.answer.keypad?.enabled) {
      return null;
    }
    return provider.answer.keypad.rows({ allowNegative: allowNegativeAnswer });
  }, [provider.answer.keypad, allowNegativeAnswer]);

  const beginQuestion = useCallback(
    (nextQuestion: Question) => {
      setQuestion(nextQuestion);
      setAnswer("");
      setError(null);
      setFeedback(null);
      setAnswered(false);
      startTimeRef.current = Date.now();
      setTimeLeft(settings.timeLimitSeconds);
    },
    [settings.timeLimitSeconds]
  );

  const createQuestion = useCallback(
    (selectedMode: Mode) => {
      const skill =
        selectedMode === "mix"
          ? provider.pickSkill(statsRef.current)
          : selectedMode;
      const level = statsRef.current[skill].level;
      return provider.createQuestion({
        skill,
        level,
        settings,
        stats: statsRef.current,
      });
    },
    [provider, settings]
  );

  const startSession = useCallback(
    (nextMode: Mode) => {
      clearAdvanceTimer();
      setMode(nextMode);
      modeRef.current = nextMode;
      setSession({ correct: 0, wrong: 0 });
      setQuestionIndex(1);
      setScreen("drill");
      const nextQuestion = createQuestion(nextMode);
      beginQuestion(nextQuestion);
    },
    [beginQuestion, clearAdvanceTimer, createQuestion]
  );

  const goToMenu = useCallback(() => {
    clearAdvanceTimer();
    setScreen("menu");
    setQuestion(null);
    setFeedback(null);
    setError(null);
    setAnswer("");
    setAnswered(false);
  }, [clearAdvanceTimer]);

  const applyResult = useCallback(
    (correct: boolean, elapsed: number, timedOut = false) => {
      if (!question) {
        return;
      }
      const nextStats = provider.updateStats(statsRef.current, {
        skill: question.skill,
        correct,
        elapsedMs: elapsed,
      });
      statsRef.current = nextStats;
      setStats(nextStats);
      setFeedback({
        correct,
        expected: provider.answer.formatExpected(question),
        ms: elapsed,
        skill: question.skill,
        level: question.level,
        timedOut,
      });
      setSession((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        wrong: prev.wrong + (correct ? 0 : 1),
      }));
      setError(null);
      setAnswered(true);
    },
    [provider, question]
  );

  const handleSubmit = useCallback((options?: { useKeypad?: boolean }) => {
    if (!question || answered) {
      return;
    }
    const prefersKeypadErrors = Boolean(options?.useKeypad);
    const allowNegative = allowNegativeAnswer;
    const cleaned = provider.answer.sanitizeInput(answer.trim(), {
      allowNegative,
    });
    const parsed = provider.answer.parseInput(cleaned, { allowNegative });
    if (parsed.error) {
      if (parsed.error === "empty") {
        setError(
          prefersKeypadErrors
            ? provider.answer.errors.emptyKeypad ??
                provider.answer.errors.empty
            : provider.answer.errors.empty
        );
        return;
      }
      if (parsed.error === "incomplete") {
        setError(provider.answer.errors.incomplete);
        return;
      }
      setError(provider.answer.errors.invalid);
      return;
    }

    const elapsed = Date.now() - startTimeRef.current;
    const correct = provider.answer.isCorrect(
      parsed.value as AnswerValue,
      question
    );

    clearAdvanceTimer();
    applyResult(correct, elapsed);
  }, [
    allowNegativeAnswer,
    answer,
    answered,
    applyResult,
    clearAdvanceTimer,
    provider.answer,
    question,
  ]);

  const handleAnswerChange = useCallback(
    (rawValue: string) => {
      const cleaned = provider.answer.sanitizeInput(rawValue, {
        allowNegative: allowNegativeAnswer,
      });
      setAnswer(cleaned);
      setError(null);
    },
    [allowNegativeAnswer, provider.answer]
  );

  const handleKeypadPress = useCallback(
    (key: string) => {
      if (answered) {
        return;
      }
      setError(null);
      if (key === "CLR") {
        setAnswer("");
        return;
      }
      if (key === "DEL") {
        setAnswer((prev) => prev.slice(0, -1));
        return;
      }
      if (key === "-") {
        if (!allowNegativeAnswer) {
          return;
        }
        setAnswer((prev) => {
          if (prev.startsWith("-")) {
            return prev.slice(1);
          }
          if (prev.length === 0) {
            return "-";
          }
          if (prev === "0") {
            return "-0";
          }
          return `-${prev}`;
        });
        return;
      }
      setAnswer((prev) => {
        if (prev === "0") {
          return key;
        }
        if (prev === "-0") {
          return `-${key}`;
        }
        return prev + key;
      });
    },
    [allowNegativeAnswer, answered]
  );

  const handleNext = useCallback(() => {
    if (!question || !answered) {
      return;
    }
    clearAdvanceTimer();
    const nextIndex = questionIndex + 1;
    if (nextIndex > settings.questionCount) {
      setScreen("summary");
      setQuestion(null);
      setAnswered(false);
      if (onSessionComplete) {
        onSessionComplete();
      }
      return;
    }
    setQuestionIndex(nextIndex);
    const nextQuestion = createQuestion(modeRef.current);
    beginQuestion(nextQuestion);
  }, [
    answered,
    beginQuestion,
    clearAdvanceTimer,
    createQuestion,
    onSessionComplete,
    question,
    questionIndex,
    settings.questionCount,
  ]);

  const handleTimeout = useCallback(() => {
    if (!question || answered) {
      return;
    }
    const elapsed = Date.now() - startTimeRef.current;
    applyResult(false, elapsed, true);
  }, [answered, applyResult, question]);

  const resetStats = useCallback(() => {
    const fresh = provider.createDefaultStats();
    statsRef.current = fresh;
    setStats(fresh);
  }, [provider]);

  const adjustSetting = useCallback(
    (controlId: string, delta: number) => {
      const control = provider.settings.controls.find(
        (item) => item.id === controlId
      );
      if (!control) {
        return;
      }
      setSettings((prev) => {
        const current = control.getValue(prev);
        const nextValue = Math.min(
          Math.max(current + control.step * delta, control.min),
          control.max
        );
        return control.setValue(prev, nextValue);
      });
    },
    [provider.settings.controls]
  );

  useEffect(() => {
    if (screen !== "drill" || !question || answered) {
      return;
    }
    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [answered, handleTimeout, question, screen, settings.timeLimitSeconds]);

  useEffect(() => {
    if (!feedback || (!feedback.correct && !feedback.timedOut)) {
      return;
    }
    clearAdvanceTimer();
    advanceTimerRef.current = window.setTimeout(() => {
      handleNext();
    }, 700);
    return () => {
      clearAdvanceTimer();
    };
  }, [feedback, clearAdvanceTimer, handleNext]);

  return {
    screen,
    setScreen,
    stats,
    mode,
    settings,
    question,
    answer,
    feedback,
    error,
    session,
    questionIndex,
    timeLeft,
    answered,
    allowNegativeAnswer,
    keypadRows,
    startSession,
    goToMenu,
    handleSubmit,
    handleNext,
    handleTimeout,
    handleAnswerChange,
    handleKeypadPress,
    resetStats,
    adjustSetting,
  };
};

export type TrainingScreen = Screen;
