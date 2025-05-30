
import type React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Minus, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type GameState =
  | "initial"
  | "loading_problem"
  | "operator_selection"
  | "number_selection"
  | "animating"
  | "game_over";

interface ControlsProps {
  gameState: GameState;
  selectedOperator: '+' | '-' | null;
  selectedNumber: number | null;
  onOperatorSelect: (operator: '+' | '-') => void;
  onNumberSelect: (number: number) => void;
  onSubmit: () => void;
}

const NumbersToSelect = Array.from({ length: 10 }, (_, i) => i + 1);

const Controls: React.FC<ControlsProps> = ({
  gameState,
  selectedOperator,
  selectedNumber,
  onOperatorSelect,
  onNumberSelect,
  onSubmit,
}) => {
  const disableOperatorButtons = gameState !== "operator_selection";
  const disableNumberButtons = gameState !== "number_selection";
  const disableSubmitButton = gameState !== "number_selection" || selectedNumber === null || selectedOperator === null;

  return (
    <Card className="mt-2 shadow-md">
      <CardContent className="p-4 flex flex-col items-center space-y-3">
        {/* Operator Selection */}
        { (gameState === "operator_selection" || (gameState === "number_selection" && selectedOperator) || gameState === "animating") && (
          <div className="flex space-x-3 mb-2">
            <Button
              onClick={() => onOperatorSelect('+')}
              disabled={disableOperatorButtons}
              variant={selectedOperator === '+' ? "default" : "outline"}
              size="lg"
              className={selectedOperator === '+' ? "bg-primary text-primary-foreground" : "bg-primary/10 hover:bg-primary/20 border-primary text-primary"}
              aria-label="Select Plus Operator"
            >
              <Plus className="h-6 w-6" />
            </Button>
            <Button
              onClick={() => onOperatorSelect('-')}
              disabled={disableOperatorButtons}
              variant={selectedOperator === '-' ? "default" : "outline"}
              size="lg"
              className={selectedOperator === '-' ? "bg-primary text-primary-foreground" : "bg-primary/10 hover:bg-primary/20 border-primary text-primary"}
              aria-label="Select Minus Operator"
            >
              <Minus className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Number Selection */}
        { (gameState === "number_selection" || (gameState === "animating" && selectedNumber !== null )) && (
          <div className="grid grid-cols-5 gap-2 mb-3">
            {NumbersToSelect.map((num) => (
              <Button
                key={num}
                onClick={() => onNumberSelect(num)}
                disabled={disableNumberButtons}
                variant={selectedNumber === num ? "default" : "outline"}
                size="md" 
                className={selectedNumber === num ? "bg-secondary text-secondary-foreground" : ""}
                aria-label={`Select number ${num}`}
              >
                {num}
              </Button>
            ))}
          </div>
        )}
        
        {/* Submit Button */}
        { (gameState === "number_selection" || (gameState === "animating" && selectedNumber !== null)) && (
            <Button
            onClick={onSubmit}
            disabled={disableSubmitButton || gameState === "animating"}
            size="lg"
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            aria-label="Submit answer"
            >
            <CheckCircle className="h-6 w-6 mr-2" /> Submit
            </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Controls;
