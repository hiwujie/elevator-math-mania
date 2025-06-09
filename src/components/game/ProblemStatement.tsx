
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale } from '@/context/i18n';

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
  const { t } = useLocale();
  
  let problemString = "";
  const showSkeleton = isLoading || gameState === "loading_problem" || gameState === "monkey_entering";

  if (showSkeleton) {
    problemString = t('problemStatement.loading'); 
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
    } else if ((gameState === "elevator_moving" || gameState === "monkey_exiting") && selectedOperator && selectedNumber !== null) {
      problemString = `${startFloor} ${selectedOperator} ${selectedNumber} = ${targetFloor}`;
    } else {
        problemString = `${startFloor} ? ? = ${targetFloor}`;
    }
  }

  return (
    <Card className="text-center shadow-md">
      <CardHeader className="pb-2 pt-4">
        {showSkeleton ? (
            <Skeleton className="h-7 w-3/4 mx-auto" />
        ) : (
            <CardTitle className="text-xl md:text-2xl font-bold text-primary">
              {t('problemStatement.monkeyWantsToGo', { startFloor, targetFloor })}
            </CardTitle>
        )}
      </CardHeader>
      <CardContent className="pt-2 pb-4">
        {showSkeleton ? (
          <div className="space-y-2">
            <p className="text-xl md:text-2xl font-mono font-semibold text-foreground">
                {t('problemStatement.loading')}
            </p>
            <Skeleton className="h-10 w-1/2 mx-auto" />
          </div>
        ) : (
          <p className="text-xl md:text-2xl font-mono font-semibold text-foreground">
            {problemString}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProblemStatement;
