
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type GameState =
  | "initial"
  | "loading_problem"
  | "operator_selection"
  | "number_selection"
  | "animating"
  | "game_over";

interface ProblemStatementProps {
  isLoading: boolean;
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

  if (isLoading || gameState === "loading_problem" || gameState === "initial") {
    problemString = "Loading problem...";
  } else {
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
    } else if (gameState === "animating" && selectedOperator && selectedNumber !== null) {
      // Show the completed equation during animation
      problemString = `${startFloor} ${selectedOperator} ${selectedNumber} = ${targetFloor}`;
    } else {
        // Fallback or default problem string if needed
        problemString = `${startFloor} ? ? = ${targetFloor}`;
    }
  }


  return (
    <Card className="mb-6 text-center shadow-md">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xl md:text-2xl font-bold text-primary">Monkey at Floor {startFloor} wants to go to Floor {targetFloor}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        {isLoading || gameState === "loading_problem" ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-3/4 mx-auto" />
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
