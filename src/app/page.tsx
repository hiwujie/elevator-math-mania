
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { generateMathProblem } from '@/ai/flows/generate-math-problem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Play } from 'lucide-react';

import Scoreboard from '@/components/game/Scoreboard';
import ProblemStatement from '@/components/game/ProblemStatement';
import ElevatorDisplay from '@/components/game/ElevatorDisplay';
import Controls from '@/components/game/Controls';
import CelebrationEffect from '@/components/game/CelebrationEffect';

const MIN_FLOOR = -10; // Min possible floor value overall
const MAX_FLOOR = 10;  // Max possible floor value overall
const TOTAL_QUESTIONS = 10;

const MONKEY_ENTER_DURATION = 1000; // ms
const ELEVATOR_MOVE_DURATION = 1500; // ms
const MONKEY_EXIT_EMOTE_DURATION = 1500; // ms

type GameState =
  | "initial"
  | "loading_problem" // AI Call
  | "monkey_entering"   // Monkey walking to elevator
  | "operator_selection"// Problem shown, player action
  | "number_selection"  // Player action
  | "elevator_moving"   // Elevator car moving
  | "monkey_exiting"    // Covers monkey exiting happy OR staying inside confused (result display phase)
  | "game_over";

type MonkeyPosition = 'hidden' | 'entering' | 'inside' | 'exiting';
type MonkeyEmotion = 'neutral' | 'happy' | 'confused';

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
  const [isLoading, setIsLoading] = useState<boolean>(false); // For general loading/AI call

  const fetchNewProblem = useCallback(async (newDifficulty: number) => {
    setIsLoading(true);
    setGameState("loading_problem");
    setSelectedOperator(null);
    setSelectedNumber(null);
    setMonkeyPosition('hidden'); // Ensure monkey is hidden before starting
    setMonkeyEmotion('neutral');
    setShowCelebration(false);

    try {
      const problemData = await generateMathProblem({ difficulty: newDifficulty });
      setStartFloor(problemData.startFloor);
      setTargetFloor(problemData.targetFloor);
      setCurrentElevatorFloor(problemData.startFloor); // Elevator car is at startFloor
      
      setGameState("monkey_entering");
      setMonkeyPosition('entering'); // Start monkey entering animation

      setTimeout(() => {
        setMonkeyPosition('inside');
        setIsLoading(false); // Problem is ready
        setGameState("operator_selection");
      }, MONKEY_ENTER_DURATION);

    } catch (error) {
      console.error("Failed to generate math problem:", error);
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
    // Monkey is already 'inside', will move with elevator
    setCurrentElevatorFloor(visuallyBoundedResultFloor); 

    setTimeout(() => { // After elevator movement
      setGameState("monkey_exiting"); // This state now means "showing result"
      if (correct) {
        setMonkeyPosition('exiting');
        setMonkeyEmotion('happy');
        setShowCelebration(true);
      } else {
        setMonkeyPosition('inside'); // Keep monkey inside
        setMonkeyEmotion('confused');
        setShowCelebration(false); // Ensure no celebration
      }

      setTimeout(() => { // After monkey emotion display (either exiting happy or staying inside confused)
        setShowCelebration(false); // Ensure celebration is off
        if (correct) {
          setScore(prev => prev + 10);
        }

        if (questionNumber < TOTAL_QUESTIONS) {
          const nextQuestionNumber = questionNumber + 1;
          setQuestionNumber(nextQuestionNumber);
          const nextDifficulty = Math.min(10, 1 + Math.floor((nextQuestionNumber - 1) / 2));
          setDifficulty(nextDifficulty);
          // fetchNewProblem will reset monkeyPosition to 'hidden' then 'entering'
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
      default: // loading_problem, monkey_entering, operator_selection, number_selection, elevator_moving, monkey_exiting
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
                {/* CelebrationEffect is active only if showCelebration is true AND monkey is exiting */}
                <CelebrationEffect active={showCelebration && monkeyPosition === 'exiting'} />
              </div>
              <div className="w-[260px]"> {/* Increased width to better accommodate controls */}
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
  else if (gameState === "monkey_entering") footerMessage = "Monkey is getting ready...";


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-3xl shadow-2xl rounded-xl overflow-hidden"> {/* Increased max-width for better layout */}
        <CardHeader className="bg-primary/10 pb-4 pt-6 text-center">
           <h1 className="text-3xl font-bold text-primary tracking-tight">
            Elevator Math Mania
          </h1>
        </CardHeader>
        <CardContent className="p-6 min-h-[550px] flex flex-col justify-between">
          {renderGameContent()}
        </CardContent>
        { (gameState !== "initial" && gameState !== "game_over" && gameState !== "loading_problem") &&
          <CardFooter className="text-xs text-muted-foreground justify-center pb-4 pt-2">
            {footerMessage}
          </CardFooter>
        }
      </Card>
    </div>
  );
}

