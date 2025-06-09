
import type React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  const { t } = useLocale();
  
  const isAnimatingOrLoading = 
    gameState === "loading_problem" ||
    gameState === "monkey_entering" ||
    gameState === "elevator_moving" ||
    gameState === "monkey_exiting";

  const disableOperatorButtons = isAnimatingOrLoading || gameState === "initial" || gameState === "game_over";
  
  const disableNumberButtons = 
    isAnimatingOrLoading || 
    gameState === "initial" || 
    gameState === "game_over" ||
    (gameState === "operator_selection" && !selectedOperator); // Disable numbers if operator not selected in operator_selection state

  const disableSubmitButton = 
    isAnimatingOrLoading || 
    selectedOperator === null || 
    selectedNumber === null || 
    gameState !== "number_selection" || 
    gameState === "initial" || 
    gameState === "game_over";
  
  const showControls = 
    gameState === "operator_selection" || 
    gameState === "number_selection" ||
    gameState === "elevator_moving" || 
    gameState === "monkey_exiting" ||
    gameState === "loading_problem" || 
    gameState === "monkey_entering";

  if (!showControls) {
    return null; 
  }

  return (
    <Card className="shadow-md"> {/* Removed mt-2 */}
      <CardContent className="p-4 flex flex-col items-center space-y-3">
        {/* Operator Selection */}
        <div className="flex space-x-3 mb-2">
          <Button
            onClick={() => onOperatorSelect('+')}
            disabled={disableOperatorButtons}
            variant={selectedOperator === '+' ? "default" : "outline"}
            size="lg"
            className={selectedOperator === '+' ? "bg-primary text-primary-foreground" : "bg-primary/10 hover:bg-primary/20 border-primary text-primary"}
            aria-label={t('controls.ariaSelectUp')}
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
          <Button
            onClick={() => onOperatorSelect('-')}
            disabled={disableOperatorButtons}
            variant={selectedOperator === '-' ? "default" : "outline"}
            size="lg"
            className={selectedOperator === '-' ? "bg-primary text-primary-foreground" : "bg-primary/10 hover:bg-primary/20 border-primary text-primary"}
            aria-label={t('controls.ariaSelectDown')}
          >
            <ArrowDown className="h-6 w-6" />
          </Button>
        </div>

        {/* Number Selection */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {NumbersToSelect.map((num) => (
            <Button
              key={num}
              onClick={() => onNumberSelect(num)}
              disabled={disableNumberButtons}
              variant={selectedNumber === num ? "default" : "outline"}
              size="md" 
              className={selectedNumber === num ? "bg-secondary text-secondary-foreground" : ""}
              aria-label={t('controls.ariaSelectNumber', { num })}
            >
              {num}
            </Button>
          ))}
        </div>
        
        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={disableSubmitButton}
          size="lg"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          aria-label={t('controls.ariaSubmitAnswer')}
        >
          <CheckCircle className="h-6 w-6 mr-2" /> {t('controls.submit')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Controls;
