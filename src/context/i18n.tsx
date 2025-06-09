
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Locale = 'en' | 'zh';

interface Translations {
  [key: string]: string | Translations;
}

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const translations: Record<Locale, Translations> = {
  en: {
    page: {
      mainTitle: "Play games ,Learn Math",
    },
    initialScreen: {
      title: "Elevator Math Mania!",
      description: "Help the monkey reach the target floor using math!",
      startGame: "Start Game",
    },
    gameOverScreen: {
      title: "Game Over!",
      yourFinalScore: "Your Final Score: {score}",
      answeredCorrectly: "You answered {correctCount} out of {totalQuestions} questions correctly.",
      playAgain: "Play Again",
    },
    problemStatement: {
      loading: "Loading problem...",
      monkeyWantsToGo: "Monkey at Floor {startFloor} wants to go to Floor {targetFloor}",
    },
    scoreboard: {
      score: "Score: {score}",
      difficulty: "Difficulty: {difficulty}",
      question: "Question: {questionNumber} / {totalQuestions}",
    },
    controls: {
      operatorPrompt: "Choose an operation (+ or -).",
      numberPrompt: "Choose how many floors (1-10).",
      elevatorMoving: "Elevator moving...",
      monkeyHappy: "Monkey is happy!",
      monkeyConfused: "Monkey is confused...",
      monkeyGettingReady: "Monkey is getting ready...",
      submit: "Submit",
      ariaSelectUp: "Select Up Operator",
      ariaSelectDown: "Select Down Operator",
      ariaSelectNumber: "Select number {num}",
      ariaSubmitAnswer: "Submit answer",
    },
    common: {
      english: "English",
      chinese: "Chinese",
      selectLanguagePlaceholder: "Language",
      englishShortTrigger: "EN",
      chineseShortTrigger: "CN",
    }
  },
  zh: {
    page: {
      mainTitle: "玩游戏，学数学",
    },
    initialScreen: {
      title: "电梯数学大挑战！",
      description: "帮助猴子用数学到达目标楼层！",
      startGame: "开始游戏",
    },
    gameOverScreen: {
      title: "游戏结束！",
      yourFinalScore: "你的最终得分：{score}",
      answeredCorrectly: "你答对了 {totalQuestions} 道题中的 {correctCount} 道。",
      playAgain: "再玩一次",
    },
    problemStatement: {
      loading: "正在加载题目...",
      monkeyWantsToGo: "猴子在 {startFloor} 楼，想去 {targetFloor} 楼",
    },
    scoreboard: {
      score: "得分：{score}",
      difficulty: "难度：{difficulty}",
      question: "问题：{questionNumber} / {totalQuestions}",
    },
    controls: {
      operatorPrompt: "选择一个运算符号（+ 或 -）。",
      numberPrompt: "选择移动的楼层数（1-10）。",
      elevatorMoving: "电梯运行中...",
      monkeyHappy: "猴子很开心！",
      monkeyConfused: "猴子很困惑...",
      monkeyGettingReady: "猴子准备中...",
      submit: "提交",
      ariaSelectUp: "选择向上",
      ariaSelectDown: "选择向下",
      ariaSelectNumber: "选择数字 {num}",
      ariaSubmitAnswer: "提交答案",
    },
    common: {
      english: "英文",
      chinese: "中文",
      selectLanguagePlaceholder: "语言",
      englishShortTrigger: "EN",
      chineseShortTrigger: "CN",
    }
  },
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('en'); // Default to English

  useEffect(() => {
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    if (storedLocale && (storedLocale === 'en' || storedLocale === 'zh')) {
      setLocaleState(storedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result: string | Translations | undefined = translations[locale];
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k] as string | Translations;
      } else {
        // Fallback to English if key not found in current locale, then to key itself
        let fallbackResult: string | Translations | undefined = translations['en'];
        for (const k_fb of keys) {
             if (fallbackResult && typeof fallbackResult === 'object' && k_fb in fallbackResult) {
                fallbackResult = fallbackResult[k_fb] as string | Translations;
             } else {
                return key; // Key not found in English either
             }
        }
        result = fallbackResult; // Assign the fallback result
        break;
      }
    }

    if (typeof result === 'string') {
      if (replacements) {
        return Object.entries(replacements).reduce((acc, [placeholder, value]) => {
          return acc.replace(`{${placeholder}}`, String(value));
        }, result);
      }
      return result;
    }
    return key; // Fallback if key path doesn't lead to a string
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
