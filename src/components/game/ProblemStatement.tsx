
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type GameState =
  | "initial"
  | "loading_problem"
  | "monkey_entering"
  | "operator_selection"
  | "number_selection"
  | "elevator_moving"
  | "monkey_exiting"
  | "game_over";

interface ProblemStatementProps {
  isLoading: boolean; // True during AI call or monkey_entering
  startFloor: number;
  targetFloor: number;
  selectedOperator: '+' | '-' | null;
  selectedNumber: number | null;
  gameState: GameState;
}

const ProblemStatement: React.FC<ProblemStatementProps> = ({ 
  isLoading, 
  startFloor, 
  targetFloor, 
  selectedOperator, 
  selectedNumber,
  gameState
}) => {
  
  let problemString = "";
  const showSkeleton = isLoading || gameState === "loading_problem" || gameState === "monkey_entering";

  if (showSkeleton) {
    problemString = "Loading problem..."; // Placeholder, skeleton will be shown
  } else {
    // gameState is operator_selection, number_selection, elevator_moving, or monkey_exiting
    const operatorDisplay = selectedOperator ?? '?';
    const numberDisplay = selectedNumber !== null ? selectedNumber : '?';

    if (gameState === "operator_selection") {
      problemString = `${startFloor} ? ? = ${targetFloor}`;
    } else if (gameState === "number_selection" && selectedOperator) {
      if (selectedNumber !== null) {
        problemString = `${startFloor} ${selectedOperator} ${selectedNumber} = ${targetFloor}`;
      } else {
        problemString = `${startFloor} ${selectedOperator} ? = ${targetFloor}`;
      }
    } else if ((gameState === "elevator_moving" || gameState === "monkey_exiting") && selectedOperator && selectedNumber !== null) {
      // Show the completed equation during animation and exit
      problemString = `${startFloor} ${selectedOperator} ${selectedNumber} = ${targetFloor}`;
    } else {
        // Fallback for any other active game state before selections are made
        problemString = `${startFloor} ? ? = ${targetFloor}`;
    }
  }


  return (
    <Card className="mb-6 text-center shadow-md">
      <CardHeader className="pb-2 pt-4">
        {showSkeleton ? (
            <Skeleton className="h-7 w-3/4 mx-auto" />
        ) : (
            <CardTitle className="text-xl md:text-2xl font-bold text-primary">Monkey at Floor {startFloor} wants to go to Floor {targetFloor}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        {showSkeleton ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-1/2 mx-auto" />
          </div>
        ) : (
          <p className="text-3xl md:text-4xl font-mono font-semibold text-foreground">
            {problemString}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProblemStatement;
