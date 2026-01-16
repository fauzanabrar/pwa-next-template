import { appConfig } from "./app";
import { mathTrainingProvider } from "@/features/training/providers/mathTrainingProvider";

type ProviderSkillKey = keyof typeof mathTrainingProvider.skills;
type TrainingModeKey = ProviderSkillKey | "mix";

const storagePrefix = appConfig.storagePrefix;

const mixMode: {
  key: TrainingModeKey;
  label: string;
  subtitle: string;
  icon: string;
} = {
  key: "mix" as const,
  label: "Random mix",
  subtitle: "Adaptive blend",
  icon: "M",
};

const skillModes: Array<{
  key: ProviderSkillKey;
  label: string;
  subtitle: string;
  icon: string;
}> = mathTrainingProvider.skillOrder.map((skill) => ({
  key: skill,
  label: mathTrainingProvider.skills[skill].label,
  subtitle: mathTrainingProvider.skills[skill].subtitle,
  icon: mathTrainingProvider.skills[skill].symbol,
}));

export const trainingConfig = {
  provider: mathTrainingProvider,
  storageKeys: {
    session: `${storagePrefix}:session`,
    settings: `${storagePrefix}:settings`,
    theme: `${storagePrefix}:theme`,
  },
  modes: [mixMode, ...skillModes] as Array<{
    key: TrainingModeKey;
    label: string;
    subtitle: string;
    icon: string;
  }>,
  copy: {
    brand: {
      name: appConfig.name,
      shortName: appConfig.shortName,
    },
    menu: {
      title: "Choose a drill",
      description:
        "Pick a focus or use Random mix to adapt to your weakest skill.",
      statsAction: "Statistics",
      settingsAction: "Settings",
      questionsSuffix: "questions",
      timeSuffix: "s per question",
      weakestPrefix: "Weakest:",
      negativesLabel: "Negatives:",
      negativesOff: "Off",
      negativesFormat: (value: number) => `Lvl ${value}+`,
    },
    drill: {
      subtitle: "Answer fast and correct to level up.",
      questionLabel: "Question",
      timeLabel: "Time",
      skillLabel: "Category",
      levelLabel: "Level",
      targetLabel: "Target",
      answerPlaceholder: "Type your answer",
      answerPlaceholderKeypad: "Tap to answer",
      checkAction: "Check",
      nextAction: "Next",
      loading: "Loading your prompt...",
      sessionScoreLabel: "Session score",
      sessionHint: "Stay focused and keep moving.",
    },
    stats: {
      title: "Statistics",
      intro:
        "Recent performance across your drills (last 12 attempts per skill).",
      overallTitle: "Overall",
      overallIntro: "Based on your recent attempts across all skills.",
      accuracyLabel: "Accuracy",
      attemptsLabel: "Attempts",
      avgTimeLabel: "Avg time",
      noData: "No data yet",
      noAttempts: "No attempts yet",
    },
    summary: {
      title: "Session complete",
      accuracyLabel: "Accuracy",
      correctLabel: "Correct",
      wrongLabel: "Wrong",
      practiceAgain: "Practice again",
      backToMenu: "Back to menu",
    },
    settings: {
      title: "Settings",
      intro: "Tune the session size and time per question.",
      themeLabel: "Theme",
      themeLight: "Light",
      themeDark: "Dark",
      resetStats: "Reset all stats",
      backToMenu: "Back to menu",
    },
    appBar: {
      menu: appConfig.name,
      drillSuffix: "drill",
      summary: "Session summary",
      stats: "Statistics",
      settings: "Settings",
    },
    feedback: {
      correctPrefix: "Correct.",
      wrongPrefix: "Not yet. Answer:",
      timeoutPrefix: "Time's up. Answer:",
    },
  },
};
