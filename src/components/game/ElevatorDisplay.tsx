import type React from 'react';
import { cn } from '@/lib/utils';

interface ElevatorDisplayProps {
  currentElevatorFloor: number;
  minFloor: number;
  maxFloor: number;
  showCorrectIndicator?: boolean;
  isCorrect?: boolean;
}

const FLOOR_HEIGHT_REM = 2; // h-8 (2rem = 32px)

const ElevatorDisplay: React.FC<ElevatorDisplayProps> = ({
  currentElevatorFloor,
  minFloor,
  maxFloor,
  showCorrectIndicator = false,
  isCorrect = false,
}) => {
  const floors = Array.from({ length: maxFloor - minFloor + 1 }, (_, i) => maxFloor - i);
  const elevatorCarTopPosition = (maxFloor - currentElevatorFloor) * FLOOR_HEIGHT_REM;

  return (
    <div className="relative w-48 h-[34rem] bg-secondary/30 rounded-lg shadow-inner mx-auto border-2 border-primary/50 overflow-hidden">
      {/* Elevator Car */}
      <div
        className={cn(
          "absolute left-1/2 transform -translate-x-1/2 w-10 border-2 border-primary bg-primary/70 rounded-md transition-all duration-500 ease-in-out flex items-center justify-center",
          showCorrectIndicator && isCorrect && "bg-green-500 border-green-700",
          showCorrectIndicator && !isCorrect && "bg-destructive border-red-700 animate-shake"
        )}
        style={{
          height: `${FLOOR_HEIGHT_REM - 0.25}rem`, // slightly smaller than floor height
          top: `${elevatorCarTopPosition}rem`,
          zIndex: 10,
        }}
        aria-label={`Elevator at floor ${currentElevatorFloor}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="M12 3v18m-3-3l3 3 3-3m-3-12l-3 3 3 3"/></svg>
      </div>

      {/* Floors */}
      <div className="relative">
        {floors.map((floorNum) => (
          <div
            key={floorNum}
            className={cn(
              "flex items-center justify-start text-xs font-medium text-muted-foreground border-b border-primary/20",
              floorNum === 0 && "border-b-2 border-primary font-bold text-primary"
            )}
            style={{ height: `${FLOOR_HEIGHT_REM}rem` }}
            aria-label={`Floor ${floorNum}`}
          >
            <span className={cn("ml-2", floorNum === currentElevatorFloor && "text-primary font-bold")}>{floorNum}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElevatorDisplay;