import type React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ControlsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSubmit: () => void;
  selectedFloor: number;
  disabled: boolean;
  minFloor: number;
  maxFloor: number;
}

const Controls: React.FC<ControlsProps> = ({
  onMoveUp,
  onMoveDown,
  onSubmit,
  selectedFloor,
  disabled,
  minFloor,
  maxFloor,
}) => {
  return (
    <Card className="mt-6 shadow-md">
      <CardContent className="p-4 flex flex-col items-center space-y-3">
        <div className="flex space-x-3">
          <Button
            onClick={onMoveUp}
            disabled={disabled || selectedFloor >= maxFloor}
            variant="outline"
            size="lg"
            aria-label="Move elevator up"
            className="bg-primary/10 hover:bg-primary/20 border-primary text-primary"
          >
            <ArrowUp className="h-6 w-6 mr-2" /> Up
          </Button>
          <Button
            onClick={onMoveDown}
            disabled={disabled || selectedFloor <= minFloor}
            variant="outline"
            size="lg"
            aria-label="Move elevator down"
            className="bg-primary/10 hover:bg-primary/20 border-primary text-primary"
          >
            <ArrowDown className="h-6 w-6 mr-2" /> Down
          </Button>
        </div>
        <div className="text-lg font-semibold">
          Current Floor: <span className="text-primary">{selectedFloor}</span>
        </div>
        <Button
          onClick={onSubmit}
          disabled={disabled}
          size="lg"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          aria-label="Submit answer"
        >
          <CheckCircle className="h-6 w-6 mr-2" /> Submit Answer
        </Button>
      </CardContent>
    </Card>
  );
};

export default Controls;