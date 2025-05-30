
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { generateMathProblem, type GenerateMathProblemOutput } from '@/ai/flows/generate-math-problem';
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
const ANIMATION_AND_FEEDBACK_DURATION = 2000; // ms

type GameState =
  | "initial"
  | "loading_problem"
  | "operator_selection"
  | "number_selection"
  | "animating"
  | "game_over";

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("initial");
  
  const [startFloor, setStartFloor] = useState<number>(0);
  const [targetFloor, setTargetFloor] = useState<number>(0);
  const [selectedOperator, setSelectedOperator] = useState<'+' | '-' | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  
  const [currentElevatorFloor, setCurrentElevatorFloor] = useState<number>(0); // Actual elevator car position
  const [isAnimatingCorrect, setIsAnimatingCorrect] = useState<boolean>(false); // For feedback during animation

  const [score, setScore] = useState<number>(0);
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchNewProblem = useCallback(async (newDifficulty: number) => {
    setIsLoading(true);
    setGameState("loading_problem");
    setSelectedOperator(null);
    setSelectedNumber(null);
    try {
      const problemData = await generateMathProblem({ difficulty: newDifficulty });
      setStartFloor(problemData.startFloor);
      setTargetFloor(problemData.targetFloor);
      setCurrentElevatorFloor(problemData.startFloor); // Elevator starts at the startFloor
      setGameState("operator_selection");
    } catch (error) {
      console.error("Failed to generate math problem:", error);
      // TODO: Show user friendly error
      setGameState("initial"); 
    }
    setIsLoading(false);
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
      // ProblemStatement will update based on this. User submits next.
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
    
    // Ensure calculated floor is within visual bounds for the elevator display
    const visuallyBoundedFloor = Math.max(MIN_FLOOR, Math.min(MAX_FLOOR, calculatedResultFloor));


    const correct = calculatedResultFloor === targetFloor;
    setIsAnimatingCorrect(correct);
    setGameState("animating");

    // Trigger elevator movement to the actual calculated floor (or its bounded version for display)
    setCurrentElevatorFloor(visuallyBoundedFloor); 

    setTimeout(() => {
      if (correct) {
        setScore(prev => prev + 10);
      }

      if (questionNumber < TOTAL_QUESTIONS) {
        const nextQuestionNumber = questionNumber + 1;
        setQuestionNumber(nextQuestionNumber);
        const nextDifficulty = Math.min(10, 1 + Math.floor((nextQuestionNumber - 1) / 2));
        setDifficulty(nextDifficulty);
        fetchNewProblem(nextDifficulty); // This will reset states and fetch new problem
      } else {
        setGameState("game_over");
      }
    }, ANIMATION_AND_FEEDBACK_DURATION);
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
      default: // loading_problem, operator_selection, number_selection, animating
        return (
          <>
            <Scoreboard 
              score={score} 
              questionNumber={questionNumber} 
              totalQuestions={TOTAL_QUESTIONS}
              currentDifficulty={difficulty}
            />
            <ProblemStatement
              isLoading={gameState === "loading_problem"}
              startFloor={startFloor}
              targetFloor={targetFloor}
              selectedOperator={selectedOperator}
              selectedNumber={selectedNumber}
              gameState={gameState}
            />
            <div className="relative mt-4 mb-4">
              <ElevatorDisplay 
                currentElevatorFloor={currentElevatorFloor} 
                minFloor={MIN_FLOOR} 
                maxFloor={MAX_FLOOR}
                showCorrectIndicator={gameState === "animating"}
                isCorrect={isAnimatingCorrect}
              />
               <CelebrationEffect active={gameState === "animating" && isAnimatingCorrect} />
            </div>
            <Controls 
              gameState={gameState}
              selectedOperator={selectedOperator}
              selectedNumber={selectedNumber}
              onOperatorSelect={handleOperatorSelect}
              onNumberSelect={handleNumberSelect}
              onSubmit={handleSubmitAnswer}
            />
          </>
        );
    }
  };

  let footerMessage = "";
  if (gameState === "operator_selection") footerMessage = "Choose an operation (+ or -).";
  else if (gameState === "number_selection") footerMessage = "Choose how many floors (1-10).";
  else if (gameState === "animating") footerMessage = "Whee! Checking your answer...";


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/10 pb-4 pt-6 text-center">
           <h1 className="text-3xl font-bold text-primary tracking-tight">
            Elevator Math Mania
          </h1>
        </CardHeader>
        <CardContent className="p-6 min-h-[450px] flex flex-col justify-between">
          {renderGameContent()}
        </CardContent>
        { (gameState === "operator_selection" || gameState === "number_selection" || gameState === "animating") &&
          <CardFooter className="text-xs text-muted-foreground justify-center pb-4 pt-2">
            {footerMessage}
          </CardFooter>
        }
      </Card>
    </div>
  );
}
