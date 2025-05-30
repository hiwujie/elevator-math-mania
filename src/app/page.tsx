
"use client";

import React, { useState, useEffect, useCallback } from 'react';
// Removed: import { generateMathProblem } from '@/ai/flows/generate-math-problem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Play } from 'lucide-react';

import Scoreboard from '@/components/game/Scoreboard';
import ProblemStatement from '@/components/game/ProblemStatement';
import ElevatorDisplay from '@/components/game/ElevatorDisplay';
import Controls from '@/components/game/Controls';
import CelebrationEffect from '@/components/game/CelebrationEffect';

const MIN_FLOOR = -10; // Min possible floor value overall for display
const MAX_FLOOR = 10;  // Max possible floor value overall for display
const TOTAL_QUESTIONS = 10;

const MONKEY_ENTER_DURATION = 1000; // ms
const ELEVATOR_MOVE_DURATION = 1500; // ms
const MONKEY_EXIT_EMOTE_DURATION = 1500; // ms

type GameState =
  | "initial"
  | "loading_problem" // Covers local generation + monkey entering
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

// New algorithmic problem generator
function generateProblemAlgorithmically(difficulty: number): AlgorithmicProblem {
  let startFloor: number;
  let targetFloor: number;
  
  let level: 1 | 2 | 3;
  if (difficulty <= 3) level = 1;
  else if (difficulty <= 6) level = 2;
  else level = 3;

  let attempts = 0;
  // Loop to ensure a valid problem is generated according to level constraints
  // and that startFloor and targetFloor are different and within displayable range.
  while (true) {
    attempts++;
    if (attempts > 200) {
      // Fallback for safety, this should ideally not be hit with sound logic.
      startFloor = 0;
      targetFloor = Math.floor(Math.random() * 5) + 1; // Simple 0 to N problem
      targetFloor = Math.min(targetFloor, MAX_FLOOR); // Ensure it's within bounds
      console.error("Problem generator reached max attempts. Using simple fallback.", {startFloor, targetFloor});
      if (startFloor === targetFloor && targetFloor < MAX_FLOOR) targetFloor++;
      else if (startFloor === targetFloor && targetFloor > MIN_FLOOR) targetFloor--;
      break;
    }

    const potentialDifference = Math.floor(Math.random() * 10) + 1; // Number player must find (1-10)

    if (level === 1) { // "10以内", result >= 0. Floors constrained for display.
      startFloor = Math.floor(Math.random() * 10); // 0-9
      if (Math.random() < 0.5) targetFloor = startFloor + potentialDifference; // Op: +
      else targetFloor = startFloor - potentialDifference; // Op: -

      if (targetFloor >= 0 && targetFloor <= MAX_FLOOR && startFloor !== targetFloor) {
        // Ensure startFloor is also within global MIN_FLOOR/MAX_FLOOR (which it is for 0-9)
        break;
      }
    } else if (level === 2) { // "10以内", result can be < 0. Floors constrained.
      startFloor = Math.floor(Math.random() * 19) - 9; // -9 to 9
      if (Math.random() < 0.5) targetFloor = startFloor + potentialDifference;
      else targetFloor = startFloor - potentialDifference;

      if (targetFloor >= MIN_FLOOR && targetFloor <= MAX_FLOOR && startFloor !== targetFloor) {
         break;
      }
    } else { // Level 3: "20以内" (interpreted as values fit in MIN_FLOOR/MAX_FLOOR), result can be < 0.
      startFloor = Math.floor(Math.random() * (MAX_FLOOR - MIN_FLOOR + 1)) + MIN_FLOOR; // -10 to 10
      if (Math.random() < 0.5) targetFloor = startFloor + potentialDifference;
      else targetFloor = startFloor - potentialDifference;
      
      if (targetFloor >= MIN_FLOOR && targetFloor <= MAX_FLOOR && startFloor !== targetFloor) {
        break;
      }
    }
  }
  return { startFloor, targetFloor };
}


export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("initial");
  
  const [startFloor, setStartFloor] = useState<number>(0);
  const [targetFloor, setTargetFloor] = useState<number>(0);
  const [selectedOperator, setSelectedOperator] = useState<'+' | '-' | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  
  const [currentElevatorFloor, setCurrentElevatorFloor] = useState<number>(0); 

  const [monkeyPosition, setMonkeyPosition] = useState<MonkeyPosition>('hidden');
  const [monkeyEmotion, setMonkeyEmotion] = useState<MonkeyEmotion>('neutral');
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNewProblem = useCallback(async (newDifficulty: number) => {
    setIsLoading(true); // Still useful for UI state during monkey animation
    setGameState("loading_problem");
    setSelectedOperator(null);
    setSelectedNumber(null);
    setMonkeyPosition('hidden');
    setMonkeyEmotion('neutral');
    setShowCelebration(false);

    // Simulate a brief delay if needed for smoother transition, or rely on monkey animation timings
    // await new Promise(resolve => setTimeout(resolve, 50)); // Optional small delay

    try {
      const problemData = generateProblemAlgorithmically(newDifficulty); // Use local generator
      setStartFloor(problemData.startFloor);
      setTargetFloor(problemData.targetFloor);
      setCurrentElevatorFloor(problemData.startFloor);
      
      setGameState("monkey_entering");
      setMonkeyPosition('entering');

      setTimeout(() => {
        setMonkeyPosition('inside');
        setIsLoading(false); 
        setGameState("operator_selection");
      }, MONKEY_ENTER_DURATION);

    } catch (error) {
      console.error("Failed to generate math problem:", error);
      // If local generation fails (e.g. error in algo), reset. Should be rare.
      setGameState("initial"); 
      setIsLoading(false);
    }
  }, []);

  const startGame = () => {
    setScore(0);
    setQuestionNumber(1);
    const initialDifficulty = 1;
    setDifficulty(initialDifficulty);
    fetchNewProblem(initialDifficulty);
  };

  const handleOperatorSelect = (operator: '+' | '-') => {
    if (gameState === "operator_selection") {
      setSelectedOperator(operator);
      setGameState("number_selection");
    }
  };

  const handleNumberSelect = (number: number) => {
    if (gameState === "number_selection") {
      setSelectedNumber(number);
    }
  };

  const handleSubmitAnswer = () => {
    if (gameState !== "number_selection" || selectedOperator === null || selectedNumber === null) return;
    
    let calculatedResultFloor: number;
    if (selectedOperator === '+') {
      calculatedResultFloor = startFloor + selectedNumber;
    } else { // '-'
      calculatedResultFloor = startFloor - selectedNumber;
    }
    
    const visuallyBoundedResultFloor = Math.max(MIN_FLOOR, Math.min(MAX_FLOOR, calculatedResultFloor));
    const correct = calculatedResultFloor === targetFloor;

    setGameState("elevator_moving");
    setCurrentElevatorFloor(visuallyBoundedResultFloor); 

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
        if (correct) {
          setScore(prev => prev + 10);
        }

        if (questionNumber < TOTAL_QUESTIONS) {
          const nextQuestionNumber = questionNumber + 1;
          setQuestionNumber(nextQuestionNumber);
          // Difficulty progression: 2 questions per difficulty level up to 10
          const nextDifficulty = Math.min(10, 1 + Math.floor((nextQuestionNumber -1) / 2));
          setDifficulty(nextDifficulty);
          fetchNewProblem(nextDifficulty); 
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
            <CardTitle className="text-4xl font-bold mb-4 text-primary">Elevator Math Mania!</CardTitle>
            <CardDescription className="text-lg mb-8 text-center">
              Help the monkey reach the target floor using math!
            </CardDescription>
            <Button onClick={startGame} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Play className="mr-2 h-6 w-6" /> Start Game
            </Button>
          </div>
        );
      case "game_over":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CardTitle className="text-4xl font-bold mb-4 text-primary">Game Over!</CardTitle>
            <CardDescription className="text-2xl mb-2">Your Final Score: <span className="font-bold text-accent">{score}</span></CardDescription>
            <CardDescription className="text-lg mb-8">
              You answered {score / 10} out of {TOTAL_QUESTIONS} questions correctly.
            </CardDescription>
            <Button onClick={startGame} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <RefreshCw className="mr-2 h-6 w-6" /> Play Again
            </Button>
          </div>
        );
      default: 
        const showProblem = gameState === "operator_selection" || gameState === "number_selection" || gameState === "elevator_moving" || gameState === "monkey_exiting";
        return (
          <>
            <Scoreboard 
              score={score} 
              questionNumber={questionNumber} 
              totalQuestions={TOTAL_QUESTIONS}
              currentDifficulty={difficulty}
            />
            <ProblemStatement
              isLoading={gameState === "loading_problem" || gameState === "monkey_entering" || !showProblem}
              startFloor={startFloor}
              targetFloor={targetFloor}
              selectedOperator={selectedOperator}
              selectedNumber={selectedNumber}
              gameState={gameState}
            />
            <div className="flex flex-row items-start justify-center gap-6 my-6">
              <div className="relative">
                <ElevatorDisplay
                  currentElevatorFloor={currentElevatorFloor}
                  minFloor={MIN_FLOOR} 
                  maxFloor={MAX_FLOOR} 
                  monkeyPosition={monkeyPosition}
                  monkeyEmotion={monkeyEmotion}
                  isElevatorMoving={gameState === "elevator_moving"}
                />
                <CelebrationEffect active={showCelebration && monkeyPosition === 'exiting'} />
              </div>
              <div className="w-[260px]">
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
  if (gameState === "operator_selection") footerMessage = "Choose an operation (+ or -).";
  else if (gameState === "number_selection") footerMessage = "Choose how many floors (1-10).";
  else if (gameState === "elevator_moving") footerMessage = "Elevator moving...";
  else if (gameState === "monkey_exiting") footerMessage = monkeyEmotion === 'happy' ? "Monkey is happy!" : "Monkey is confused...";
  else if (gameState === "monkey_entering" || gameState === "loading_problem") footerMessage = "Monkey is getting ready...";


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-3xl shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/10 pb-4 pt-6 text-center">
           <h1 className="text-3xl font-bold text-primary tracking-tight">
            Elevator Math Mania
          </h1>
        </CardHeader>
        <CardContent className="p-6 min-h-[550px] flex flex-col justify-between">
          {renderGameContent()}
        </CardContent>
        { (gameState !== "initial" && gameState !== "game_over") &&
          <CardFooter className="text-xs text-muted-foreground justify-center pb-4 pt-2">
            {footerMessage || <>&nbsp;</>} {/* Ensure footer takes space even if message is empty */}
          </CardFooter>
        }
      </Card>
    </div>
  );
}
