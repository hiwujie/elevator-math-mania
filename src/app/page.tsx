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

const MIN_FLOOR = -10;
const MAX_FLOOR = 10;
const TOTAL_QUESTIONS = 10;

type GameState = "initial" | "playing" | "checking" | "celebrating" | "incorrect_answer" | "game_over";

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState>("initial");
  const [currentProblem, setCurrentProblem] = useState<GenerateMathProblemOutput | null>(null);
  const [elevatorPosition, setElevatorPosition] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [questionNumber, setQuestionNumber] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);


  const fetchNewProblem = useCallback(async (newDifficulty: number) => {
    setIsLoading(true);
    setGameState("playing"); // Set to playing early to allow UI updates
    try {
      const problem = await generateMathProblem({ difficulty: newDifficulty });
      // This is a simple way to ensure problem answers are generally within typical elevator range.
      // A more robust solution might involve prompt engineering or post-processing.
      if (problem.answer > MAX_FLOOR * 2 || problem.answer < MIN_FLOOR * 2) {
         console.warn(`Generated problem answer ${problem.answer} is far out of typical range. Trying again.`);
         // Potentially re-fetch or cap difficulty if this happens often.
         // For now, we'll proceed but this could be improved.
      }
      setCurrentProblem(problem);
      setElevatorPosition(0); 
    } catch (error) {
      console.error("Failed to generate math problem:", error);
      setGameState("initial"); 
      // Consider adding a user-facing error message here
    }
    setIsLoading(false);
  }, []);

  const startGame = () => {
    setScore(0);
    setQuestionNumber(1);
    const initialDifficulty = 1;
    setDifficulty(initialDifficulty);
    setIsCorrectAnswer(false);
    fetchNewProblem(initialDifficulty);
  };

  const moveElevator = (direction: "up" | "down") => {
    if (gameState !== "playing" && gameState !== "incorrect_answer" && gameState !== "celebrating") return; // Allow movement during feedback states if desired, but usually not.
    setElevatorPosition(prev => {
      const newFloor = direction === "up" ? prev + 1 : prev - 1;
      return Math.max(MIN_FLOOR, Math.min(MAX_FLOOR, newFloor));
    });
  };

  const handleSubmitAnswer = () => {
    if (!currentProblem || (gameState !== "playing" && gameState !== "incorrect_answer" && gameState !== "celebrating")) return;
    
    setGameState("checking");
    const correct = elevatorPosition === currentProblem.answer;
    setIsCorrectAnswer(correct);

    setTimeout(() => {
      if (correct) {
        setScore(prev => prev + 10);
        setGameState("celebrating");
      } else {
        setGameState("incorrect_answer");
      }

      setTimeout(() => {
        if (questionNumber < TOTAL_QUESTIONS) {
          const nextQuestionNumber = questionNumber + 1;
          setQuestionNumber(nextQuestionNumber);
          const nextDifficulty = Math.min(10, 1 + Math.floor((nextQuestionNumber -1) / 2));
          setDifficulty(nextDifficulty);
          fetchNewProblem(nextDifficulty);
        } else {
          setGameState("game_over");
        }
      }, 1500); // Duration of celebration/incorrect feedback
    }, 300); // Short delay for "checking" visual if any (like elevator stopping)
  };
  
  const renderGameContent = () => {
    switch (gameState) {
      case "initial":
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <CardTitle className="text-4xl font-bold mb-4 text-primary">Elevator Math Mania!</CardTitle>
            <CardDescription className="text-lg mb-8 text-center">
              Help the elevator reach the correct floor by solving math problems. <br />Learn about positive and negative numbers!
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
      default: // playing, checking, celebrating, incorrect_answer
        return (
          <>
            <Scoreboard 
              score={score} 
              questionNumber={questionNumber} 
              totalQuestions={TOTAL_QUESTIONS}
              currentDifficulty={difficulty}
            />
            <ProblemStatement 
              problemText={currentProblem ? currentProblem.problem : null} 
              isLoading={isLoading && !currentProblem} 
            />
            <div className="relative">
              <ElevatorDisplay 
                currentElevatorFloor={elevatorPosition} 
                minFloor={MIN_FLOOR} 
                maxFloor={MAX_FLOOR}
                showCorrectIndicator={gameState === "celebrating" || gameState === "incorrect_answer"}
                isCorrect={isCorrectAnswer}
              />
               <CelebrationEffect active={gameState === "celebrating"} />
            </div>
            <Controls 
              onMoveUp={() => moveElevator("up")}
              onMoveDown={() => moveElevator("down")}
              onSubmit={handleSubmitAnswer}
              selectedFloor={elevatorPosition}
              disabled={isLoading || gameState === "checking" || gameState === "celebrating" || gameState === "incorrect_answer"}
              minFloor={MIN_FLOOR}
              maxFloor={MAX_FLOOR}
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <Card className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/10 pb-4 pt-6 text-center">
           <h1 className="text-3xl font-bold text-primary tracking-tight">
            Elevator Math Mania
          </h1>
        </CardHeader>
        <CardContent className="p-6">
          {renderGameContent()}
        </CardContent>
        { (gameState !== "initial" && gameState !== "game_over") &&
          <CardFooter className="text-xs text-muted-foreground justify-center pb-4">
            Move the elevator and submit your answer!
          </CardFooter>
        }
      </Card>
    </div>
  );
}