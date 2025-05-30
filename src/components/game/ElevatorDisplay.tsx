
import type React from 'react';
import { cn } from '@/lib/utils';

type MonkeyPosition = 'hidden' | 'entering' | 'inside' | 'exiting';
type MonkeyEmotion = 'neutral' | 'happy' | 'confused';

interface ElevatorDisplayProps {
  currentElevatorFloor: number;
  minFloor: number; 
  maxFloor: number; 
  monkeyPosition: MonkeyPosition;
  monkeyEmotion: MonkeyEmotion;
  isElevatorMoving: boolean;
}

const FLOOR_HEIGHT_REM = 2; // h-8 (2rem = 32px)
const MONKEY_SIZE_REM = 1.75; // For w-7 h-7
const SHAFT_WIDTH_REM = 12; // w-48. Changed from mx-auto, now part of flex

// Simple Monkey SVG
const MonkeySvg: React.FC<{ emotion: MonkeyEmotion, className?: string }> = ({ emotion, className }) => (
  <svg viewBox="0 0 50 60" className={cn("transition-all duration-300 ease-in-out", className)}>
    <title>Monkey</title>
    {/* Ears */}
    <circle cx="10" cy="15" r="8" className="fill-amber-700" />
    <circle cx="40" cy="15" r="8" className="fill-amber-700" />
    {/* Head */}
    <circle cx="25" cy="20" r="15" className="fill-amber-600" />
    {/* Body */}
    <rect x="15" y="30" width="20" height="25" rx="5" className="fill-amber-700" />
    
    {/* Face - simple centered eyes and mouth */}
    {emotion === 'neutral' && (
      <>
        <circle cx="20" cy="18" r="2.5" fill="black" />
        <circle cx="30" cy="18" r="2.5" fill="black" />
        <path d="M20 25 Q25 27 30 25" stroke="black" strokeWidth="1.5" fill="none" />
      </>
    )}
    {emotion === 'happy' && (
      <>
        <path d="M18 16 Q20 14 22 16" stroke="black" strokeWidth="1.5" fill="none" /> {/* Eye */}
        <path d="M28 16 Q30 14 32 16" stroke="black" strokeWidth="1.5" fill="none" /> {/* Eye */}
        <path d="M18 25 Q25 32 32 25" stroke="black" strokeWidth="2" fill="none" /> {/* Smile */}
      </>
    )}
    {emotion === 'confused' && (
      <>
        {/* Slightly squinted/uneven eyes for confusion */}
        <line x1="18" y1="17" x2="22" y2="19" stroke="black" strokeWidth="1.5" />
        <line x1="22" y1="17" x2="18" y2="19" stroke="black" strokeWidth="1.5" />
        <line x1="28" y1="19" x2="32" y2="17" stroke="black" strokeWidth="1.5" />
        <line x1="32" y1="19" x2="28" y2="17" stroke="black" strokeWidth="1.5" />
        <path d="M20 28 Q25 25 30 28" stroke="black" strokeWidth="1.5" fill="none" /> {/* Wobbly mouth */}
        <text x="35" y="15" fontSize="12" fill="black" className="font-bold">?</text>
      </>
    )}
  </svg>
);


const ElevatorDisplay: React.FC<ElevatorDisplayProps> = ({
  currentElevatorFloor,
  minFloor,
  maxFloor,
  monkeyPosition,
  monkeyEmotion,
  isElevatorMoving,
}) => {
  const displayableFloors = Array.from({ length: maxFloor - minFloor + 1 }, (_, i) => maxFloor - i);
  
  const elevatorCarTopPositionRem = (maxFloor - currentElevatorFloor) * FLOOR_HEIGHT_REM;
  const boundedElevatorCarTopRem = Math.max(
    0, 
    Math.min(elevatorCarTopPositionRem, (displayableFloors.length - 1) * FLOOR_HEIGHT_REM)
  );

  // Monkey positioning
  let monkeyTopRem = boundedElevatorCarTopRem + (FLOOR_HEIGHT_REM - MONKEY_SIZE_REM) / 2; // Center monkey in car vertically
  let monkeyLeftRem = (SHAFT_WIDTH_REM / 2) - (MONKEY_SIZE_REM / 2) ; // Center monkey in shaft horizontally
  let monkeyOpacity = 0;

  if (monkeyPosition === 'hidden') {
    monkeyOpacity = 0;
  } else if (monkeyPosition === 'entering') {
    monkeyOpacity = 1;
    monkeyLeftRem = -MONKEY_SIZE_REM * 1.5; // Start outside to the left
    // Target is centered, CSS transition will handle movement to 'inside' state style
  } else if (monkeyPosition === 'inside') {
    monkeyOpacity = 1;
    // monkeyLeftRem and monkeyTopRem are already set for inside the car
  } else if (monkeyPosition === 'exiting') {
    monkeyOpacity = 1;
    monkeyLeftRem = SHAFT_WIDTH_REM + MONKEY_SIZE_REM * 0.5; // Exit to the right
  }
  
  const monkeyStyle: React.CSSProperties = {
    top: `${monkeyTopRem}rem`,
    left: monkeyPosition === 'entering' && !isElevatorMoving ? `${(SHAFT_WIDTH_REM / 2) - (MONKEY_SIZE_REM / 2)}rem` : `${monkeyLeftRem}rem`, // Target for entering
    width: `${MONKEY_SIZE_REM}rem`,
    height: `${MONKEY_SIZE_REM}rem`,
    opacity: monkeyOpacity,
    transition: `top ${isElevatorMoving ? '0.5s' : '0s'} ease-in-out, left 0.7s ease-in-out, opacity 0.5s ease-in-out`,
    zIndex: 15, // Above elevator car
  };
  if (monkeyPosition === 'entering' && isElevatorMoving) { // Should not happen, but safe
     monkeyStyle.transition = `top 0.5s ease-in-out, opacity 0.5s ease-in-out`; // No left transition if moving with elevator
  }


  return (
    <div className={cn(
        "relative h-[34rem] bg-secondary/30 rounded-lg shadow-inner border-2 border-primary/50 overflow-hidden"
      )}
      style={{width: `${SHAFT_WIDTH_REM}rem`}}
    >
      {/* Monkey */}
      <div
        className={cn(
            "absolute",
            // Shake animation is applied if monkey is confused.
            // This will typically happen when monkeyPosition is 'inside' during the result display phase.
            monkeyEmotion === 'confused' && "animate-shake" 
        )}
        style={monkeyStyle}
        aria-label={`Monkey ${monkeyEmotion}`}
      >
        <MonkeySvg emotion={monkeyEmotion} className="w-full h-full" />
      </div>

      {/* Elevator Car */}
      <div
        className={cn(
          "absolute left-1/2 transform -translate-x-1/2 w-10 border-2 border-primary bg-primary/70 rounded-md transition-all duration-500 ease-in-out flex items-center justify-center"
        )}
        style={{
          height: `${FLOOR_HEIGHT_REM - 0.25}rem`, 
          top: `${boundedElevatorCarTopRem}rem`,
          zIndex: 10,
        }}
        aria-label={`Elevator at floor ${currentElevatorFloor}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="M12 3v18m-3-3l3 3 3-3m-3-12l-3 3 3 3"/></svg>
      </div>

      {/* Floors */}
      <div className="relative">
        {displayableFloors.map((floorNum) => (
          <div
            key={floorNum}
            className={cn(
              "flex items-center justify-start text-xs font-medium text-muted-foreground border-b border-primary/20",
              floorNum === 0 && "border-b-2 border-primary font-bold text-primary" 
            )}
            style={{ height: `${FLOOR_HEIGHT_REM}rem` }}
            aria-label={`Floor ${floorNum}`}
          >
            <span className={cn("ml-2", floorNum === currentElevatorFloor && "text-primary font-bold scale-110")}>{floorNum}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElevatorDisplay;

