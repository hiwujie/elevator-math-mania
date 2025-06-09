
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Play } from 'lucide-react';

import Scoreboard from '@/components/game/Scoreboard';
import ProblemStatement from '@/components/game/ProblemStatement';
import ElevatorDisplay from '@/components/game/ElevatorDisplay';
import Controls from '@/components/game/Controls';
import CelebrationEffect from '@/components/game/CelebrationEffect';
import { useLocale, type Locale } from '@/context/i18n';

const MIN_FLOOR_LOGIC = -10; // Min/max for problem logic target/start
const MAX_FLOOR_LOGIC = 10;
const TOTAL_QUESTIONS = 10;

const MONKEY_ENTER_DURATION = 1000;
const ELEVATOR_MOVE_DURATION = 1500;
const MONKEY_EXIT_EMOTE_DURATION = 1500;

const VIEWPORT_TOTAL_FLOORS = 11; // Total number of floors visible in the shaft
const VIEWPORT_HALF_SPAN = Math.floor(VIEWPORT_TOTAL_FLOORS / 2); // e.g., 5 if 11 total

type GameState =
  | "initial"
  | "loading_problem"
  | "monkey_entering"
  | "operator_selection"
  | "number_selection"
  | "elevator_moving"
  | "monkey_exiting"
  | "game_over";

type MonkeyPosition = 'hidden' | 'entering' | 'inside' | 'exiting';
type MonkeyEmotion = 'neutral' | 'happy' | 'confused';

interface AlgorithmicProblem {
  startFloor: number;
  targetFloor: number;
}

function generateProblemAlgorithmically(difficulty: number): AlgorithmicProblem {
  let startFloor: number;
  let targetFloor: number;

  let level: 1 | 2 | 3;
  if (difficulty <= 3) level = 1;
  else if (difficulty <= 6) level = 2;
  else level = 3;

  let attempts = 0;
  while (true) {
    attempts++;
    if (attempts > 200) {
      startFloor = 0;
      targetFloor = Math.floor(Math.random() * 5) + 1;
      targetFloor = Math.min(targetFloor, MAX_FLOOR_LOGIC);
      console.error("Problem generator reached max attempts. Using simple fallback.", {startFloor, targetFloor});
      if (startFloor === targetFloor && targetFloor < MAX_FLOOR_LOGIC) targetFloor++;
      else if (startFloor === targetFloor && targetFloor > MIN_FLOOR_LOGIC) targetFloor--;
      break;
    }

    const potentialDifference = Math.floor(Math.random() * 10) + 1;

    if (level === 1) {
      startFloor = Math.floor(Math.random() * 10); // 0 to 9
      if (Math.random() < 0.5) targetFloor = startFloor + potentialDifference;
      else targetFloor = startFloor - potentialDifference;

      if (targetFloor >= 0 && targetFloor <= MAX_FLOOR_LOGIC && startFloor !== targetFloor &&
          startFloor >= MIN_FLOOR_LOGIC && startFloor <= MAX_FLOOR_LOGIC &&
          startFloor >= 0 && Math.abs(targetFloor-startFloor) <=10) { 
        break;
      }
    } else if (level === 2) {
      startFloor = Math.floor(Math.random() * 19) - 9; // -9 to 9
      if (Math.random() < 0.5) targetFloor = startFloor + potentialDifference;
      else targetFloor = startFloor - potentialDifference;

      if (targetFloor >= MIN_FLOOR_LOGIC && targetFloor <= MAX_FLOOR_LOGIC && startFloor !== targetFloor &&
          startFloor >= MIN_FLOOR_LOGIC && startFloor <= MAX_FLOOR_LOGIC  && Math.abs(targetFloor-startFloor) <=10) {
         break;
      }
    } else { 
      startFloor = Math.floor(Math.random() * (MAX_FLOOR_LOGIC - MIN_FLOOR_LOGIC + 1)) + MIN_FLOOR_LOGIC; // -10 to 10
      if (Math.random() < 0.5) targetFloor = startFloor + potentialDifference;
      else targetFloor = startFloor - potentialDifference;

      if (targetFloor >= MIN_FLOOR_LOGIC && targetFloor <= MAX_FLOOR_LOGIC && startFloor !== targetFloor &&
          startFloor >= MIN_FLOOR_LOGIC && startFloor <= MAX_FLOOR_LOGIC && Math.abs(targetFloor-startFloor) <=10) {
        break;
      }
    }
  }
  return { startFloor, targetFloor };
}


export default function GamePage() {
  const { locale, setLocale, t } = useLocale();

  const [gameState, setGameState] = useState<GameState>("initial");

  const [startFloor, setStartFloor] = useState<number>(0);
  const [targetFloor, setTargetFloor] = useState<number>(0);
  const [selectedOperator, setSelectedOperator] = useState<'+' | '-' | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const [currentElevatorFloor, setCurrentElevatorFloor] = useState<number>(0);
  const [displayMinFloor, setDisplayMinFloor] = useState<number>(0 - VIEWPORT_HALF_SPAN);
  const [displayMaxFloor, setDisplayMaxFloor] = useState<number>(0 + VIEWPORT_HALF_SPAN);


  const [monkeyPosition, setMonkeyPosition] = useState<MonkeyPosition>('hidden');
  const [monkeyEmotion, setMonkeyEmotion] = useState<MonkeyEmotion>('neutral');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<number>(1);

  const fetchNewProblem = useCallback(async (newDifficulty: number) => {
    setGameState("loading_problem");
    setSelectedOperator(null);
    setSelectedNumber(null);
    setMonkeyPosition('hidden');
    setMonkeyEmotion('neutral');
    setShowCelebration(false);

    await new Promise(resolve => setTimeout(resolve, 100)); 

    const problemData = generateProblemAlgorithmically(newDifficulty);
    setStartFloor(problemData.startFloor);
    setTargetFloor(problemData.targetFloor);
    
    const initialViewMin = problemData.startFloor - VIEWPORT_HALF_SPAN;
    const initialViewMax = initialViewMin + VIEWPORT_TOTAL_FLOORS - 1;
    setDisplayMinFloor(initialViewMin);
    setDisplayMaxFloor(initialViewMax);
    setCurrentElevatorFloor(problemData.startFloor);

    setGameState("monkey_entering");
    setMonkeyPosition('entering');

    setTimeout(() => {
      setMonkeyPosition('inside');
      setGameState("operator_selection");
    }, MONKEY_ENTER_DURATION);

  }, []);

  const startGame = () => {
    setScore(0);
    setQuestionNumber(1);
    const initialDifficulty = 1;
    setDifficulty(initialDifficulty);
    fetchNewProblem(initialDifficulty);
  };

  const handleOperatorSelect = (operator: '+' | '-') => {
    if (gameState === "operator_selection" || gameState === "number_selection") {
      setSelectedOperator(operator);
      setGameState("number_selection"); 
    }
  };

  const handleNumberSelect = (number: number) => {
    if (gameState === "number_selection" || gameState === "operator_selection") {
      setSelectedNumber(number);
      if (!selectedOperator && gameState === "operator_selection") {
        // If operator not yet selected, don't change game state yet
      } else {
        setGameState("number_selection"); // Ensure game state is number_selection
      }
    }
  };
  

  const handleSubmitAnswer = () => {
    if (gameState !== "number_selection" || selectedOperator === null || selectedNumber === null) return;

    let calculatedResultFloor: number;
    if (selectedOperator === '+') {
      calculatedResultFloor = startFloor + selectedNumber;
    } else {
      calculatedResultFloor = startFloor - selectedNumber;
    }

    const correct = calculatedResultFloor === targetFloor;

    const newViewMin = calculatedResultFloor - VIEWPORT_HALF_SPAN;
    const newViewMax = newViewMin + VIEWPORT_TOTAL_FLOORS - 1;
    setDisplayMinFloor(newViewMin);
    setDisplayMaxFloor(newViewMax);

    setGameState("elevator_moving");
    setCurrentElevatorFloor(calculatedResultFloor); 

    setTimeout(() => {
      setGameState("monkey_exiting"); 
      if (correct) {
        setMonkeyPosition('exiting');
        setMonkeyEmotion('happy');
        setShowCelebration(true);
      } else {
        setMonkeyPosition('inside'); 
        setMonkeyEmotion('confused');
        setShowCelebration(false);
      }

      setTimeout(() => {
        setShowCelebration(false);
        let nextProblemDifficulty = difficulty;

        if (correct) {
          setScore(prev => prev + 10);
          nextProblemDifficulty = Math.min(10, difficulty + 1); 
        } else {
           nextProblemDifficulty = Math.max(1, difficulty -1); // Decrease difficulty if incorrect, min 1
        }
        setDifficulty(nextProblemDifficulty);


        if (questionNumber < TOTAL_QUESTIONS) {
          const nextQuestionNumber = questionNumber + 1;
          setQuestionNumber(nextQuestionNumber);
          fetchNewProblem(nextProblemDifficulty);
        } else {
          setGameState("game_over");
          setMonkeyPosition('hidden');
        }
      }, MONKEY_EXIT_EMOTE_DURATION);
    }, ELEVATOR_MOVE_DURATION);
  };

  const renderGameContent = () => {
    switch (gameState) {
      case "initial":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <CardTitle className="text-3xl sm:text-4xl font-bold mb-4 text-primary">{t('initialScreen.title')}</CardTitle>
            <CardDescription className="text-md sm:text-lg mb-8 text-center">
              {t('initialScreen.description')}
            </CardDescription>
            <Button onClick={startGame} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Play className="mr-2 h-6 w-6" /> {t('initialScreen.startGame')}
            </Button>
          </div>
        );
      case "game_over":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CardTitle className="text-3xl sm:text-4xl font-bold mb-4 text-primary">{t('gameOverScreen.title')}</CardTitle>
            <CardDescription className="text-xl sm:text-2xl mb-2">
              <span className="font-bold text-accent">{t('gameOverScreen.yourFinalScore', { score })}</span>
            </CardDescription>
            <CardDescription className="text-md sm:text-lg mb-8">
              {t('gameOverScreen.answeredCorrectly', { correctCount: score / 10, totalQuestions: TOTAL_QUESTIONS })}
            </CardDescription>
            <Button onClick={startGame} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <RefreshCw className="mr-2 h-6 w-6" /> {t('gameOverScreen.playAgain')}
            </Button>
          </div>
        );
      default:
        const showProblem = gameState === "operator_selection" || gameState === "number_selection" || gameState === "elevator_moving" || gameState === "monkey_exiting";
        const isLoadingProblem = gameState === "loading_problem" || gameState === "monkey_entering";
        return (
          <>
            <Scoreboard
              score={score}
              questionNumber={questionNumber}
              totalQuestions={TOTAL_QUESTIONS}
              currentDifficulty={difficulty}
            />
            
            <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 my-6">
              <div className="relative mx-auto md:mx-0">
                <ElevatorDisplay
                  currentElevatorFloor={currentElevatorFloor}
                  minFloor={displayMinFloor}
                  maxFloor={displayMaxFloor}
                  monkeyPosition={monkeyPosition}
                  monkeyEmotion={monkeyEmotion}
                  isElevatorMoving={gameState === "elevator_moving"}
                />
                <CelebrationEffect active={showCelebration && monkeyPosition === 'exiting'} />
              </div>
              <div className="flex flex-col w-full md:w-[300px] space-y-4">
                <ProblemStatement
                  isLoading={isLoadingProblem || !showProblem}
                  startFloor={startFloor}
                  targetFloor={targetFloor}
                  selectedOperator={selectedOperator}
                  selectedNumber={selectedNumber}
                  gameState={gameState}
                />
                <Controls
                  gameState={gameState}
                  selectedOperator={selectedOperator}
                  selectedNumber={selectedNumber}
                  onOperatorSelect={handleOperatorSelect}
                  onNumberSelect={handleNumberSelect}
                  onSubmit={handleSubmitAnswer}
                />
              </div>
            </div>
          </>
        );
    }
  };

  let footerMessage = "";
  if (gameState === "operator_selection") footerMessage = t('controls.operatorPrompt');
  else if (gameState === "number_selection") footerMessage = t('controls.numberPrompt');
  else if (gameState === "elevator_moving") footerMessage = t('controls.elevatorMoving');
  else if (gameState === "monkey_exiting") footerMessage = monkeyEmotion === 'happy' ? t('controls.monkeyHappy') : t('controls.monkeyConfused');
  else if (gameState === "monkey_entering" || gameState === "loading_problem") footerMessage = t('controls.monkeyGettingReady');


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-3xl shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/10 pb-4 pt-6 text-center relative">
           <h1 className="text-3xl font-bold text-primary tracking-tight">
            {t('page.mainTitle')}
          </h1>
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              variant={locale === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocale('en')}
              className="text-xs"
            >
              {t('common.english')}
            </Button>
            <Button
              variant={locale === 'zh' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocale('zh')}
              className="text-xs"
            >
              {t('common.chinese')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 min-h-[550px] flex flex-col justify-between">
          {renderGameContent()}
        </CardContent>
        { (gameState !== "initial" && gameState !== "game_over") &&
          <CardFooter className="text-xs text-muted-foreground justify-center pb-4 pt-2">
            {footerMessage || <>&nbsp;</>}
          </CardFooter>
        }
      </Card>
    </div>
  );
}

    