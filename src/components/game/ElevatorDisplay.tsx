
import type React from 'react';
import { cn } from '@/lib/utils';

interface ElevatorDisplayProps {
  currentElevatorFloor: number;
  minFloor: number; // Min displayable floor
  maxFloor: number; // Max displayable floor
  showCorrectIndicator?: boolean; // True when in "animating" state
  isCorrect?: boolean; // True if the animation is for a correct answer
}

const FLOOR_HEIGHT_REM = 2; // h-8 (2rem = 32px)

const ElevatorDisplay: React.FC<ElevatorDisplayProps> = ({
  currentElevatorFloor,
  minFloor,
  maxFloor,
  showCorrectIndicator = false,
  isCorrect = false,
}) => {
  const displayableFloors = Array.from({ length: maxFloor - minFloor + 1 }, (_, i) => maxFloor - i);
  
  // Calculate top position based on the full range of displayable floors
  const elevatorCarTopPosition = (maxFloor - currentElevatorFloor) * FLOOR_HEIGHT_REM;

  // Ensure the elevator car doesn't visually go beyond the displayed shaft
  const boundedElevatorCarTop = Math.max(
    0, 
    Math.min(elevatorCarTopPosition, (displayableFloors.length -1) * FLOOR_HEIGHT_REM)
  );


  return (
    <div className="relative w-48 h-[34rem] bg-secondary/30 rounded-lg shadow-inner mx-auto border-2 border-primary/50 overflow-hidden">
      {/* Elevator Car */}
      <div
        className={cn(
          "absolute left-1/2 transform -translate-x-1/2 w-10 border-2 border-primary bg-primary/70 rounded-md transition-all duration-500 ease-in-out flex items-center justify-center",
          showCorrectIndicator && isCorrect && "bg-green-500 border-green-700", // Correct answer color
          showCorrectIndicator && !isCorrect && "bg-destructive border-red-700 animate-shake" // Incorrect answer color & shake
        )}
        style={{
          height: `${FLOOR_HEIGHT_REM - 0.25}rem`, // slightly smaller than floor height
          top: `${boundedElevatorCarTop}rem`, // Use bounded position
          zIndex: 10,
        }}
        aria-label={`Elevator at floor ${currentElevatorFloor}`}
      >
        {/* Simple icon for elevator car, replace if you have a monkey SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="M12 3v18m-3-3l3 3 3-3m-3-12l-3 3 3 3"/></svg>
      </div>

      {/* Floors */}
      <div className="relative">
        {displayableFloors.map((floorNum) => (
          <div
            key={floorNum}
            className={cn(
              "flex items-center justify-start text-xs font-medium text-muted-foreground border-b border-primary/20",
              // Highlight floor 0 if it's in view
              floorNum === 0 && "border-b-2 border-primary font-bold text-primary" 
            )}
            style={{ height: `${FLOOR_HEIGHT_REM}rem` }}
            aria-label={`Floor ${floorNum}`}
          >
             {/* Highlight the number of the current actual floor */}
            <span className={cn("ml-2", floorNum === currentElevatorFloor && "text-primary font-bold scale-110")}>{floorNum}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElevatorDisplay;
