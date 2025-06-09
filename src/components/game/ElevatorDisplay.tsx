
import type React from 'react';
import { cn } from '@/lib/utils';

type MonkeyPosition = 'hidden' | 'entering' | 'inside' | 'exiting';
type MonkeyEmotion = 'neutral' | 'happy' | 'confused';

interface ElevatorDisplayProps {
  currentElevatorFloor: number;
  minFloor: number; // The minimum floor label to display (dynamic)
  maxFloor: number; // The maximum floor label to display (dynamic)
  monkeyPosition: MonkeyPosition;
  monkeyEmotion: MonkeyEmotion;
  isElevatorMoving: boolean;
}

const FLOOR_HEIGHT_REM = 2; // h-8 (2rem = 32px)
const MONKEY_SIZE_REM = 1.75; // For w-7 h-7
const SHAFT_WIDTH_REM = 12;
const ELEVATOR_SHAFT_VISIBLE_FLOORS = 11; // Should match VIEWPORT_TOTAL_FLOORS in page.tsx
const SHAFT_TOTAL_HEIGHT_REM = ELEVATOR_SHAFT_VISIBLE_FLOORS * FLOOR_HEIGHT_REM; // 11 * 2 = 22rem

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
  minFloor: displayMinFloor,
  maxFloor: displayMaxFloor,
  monkeyPosition,
  monkeyEmotion,
  isElevatorMoving,
}) => {
  const displayableFloors = Array.from({ length: displayMaxFloor - displayMinFloor + 1 }, (_, i) => displayMaxFloor - i);

  const elevatorCarTopPositionRem = (displayMaxFloor - currentElevatorFloor) * FLOOR_HEIGHT_REM;

  let monkeyTopRem = elevatorCarTopPositionRem + (FLOOR_HEIGHT_REM - MONKEY_SIZE_REM) / 2;
  let monkeyLeftRem = (SHAFT_WIDTH_REM / 2) - (MONKEY_SIZE_REM / 2) ;
  let monkeyOpacity = 0;

  if (monkeyPosition === 'hidden') {
    monkeyOpacity = 0;
  } else if (monkeyPosition === 'entering') {
    monkeyOpacity = 1;
    monkeyLeftRem = -MONKEY_SIZE_REM * 1.5;
  } else if (monkeyPosition === 'inside') {
    monkeyOpacity = 1;
  } else if (monkeyPosition === 'exiting') {
    monkeyOpacity = 1;
    monkeyLeftRem = SHAFT_WIDTH_REM + MONKEY_SIZE_REM * 0.5;
  }

  const monkeyStyle: React.CSSProperties = {
    top: `${monkeyTopRem}rem`,
    left: monkeyPosition === 'entering' && !isElevatorMoving ? `${(SHAFT_WIDTH_REM / 2) - (MONKEY_SIZE_REM / 2)}rem` : `${monkeyLeftRem}rem`,
    width: `${MONKEY_SIZE_REM}rem`,
    height: `${MONKEY_SIZE_REM}rem`,
    opacity: monkeyOpacity,
    transition: `top ${isElevatorMoving ? '1.5s' : '0s'} ease-in-out, left 0.7s ease-in-out, opacity 0.5s ease-in-out`,
    zIndex: 15,
  };
  if (monkeyPosition === 'entering' && isElevatorMoving) {
     monkeyStyle.transition = `top ${isElevatorMoving ? '1.5s' : '0s'} ease-in-out, opacity 0.5s ease-in-out`;
  }


  return (
    <div
        className={cn(
            "relative bg-secondary/30 rounded-lg shadow-inner border-2 border-primary/50 overflow-hidden"
          )}
        style={{
            width: `${SHAFT_WIDTH_REM}rem`,
            height: `${SHAFT_TOTAL_HEIGHT_REM}rem`
        }}
    >
      {/* Monkey */}
      <div
        className={cn(
            "absolute",
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
          "absolute left-1/2 transform -translate-x-1/2 w-10 border-2 border-primary bg-primary/70 rounded-md transition-all duration-[1500ms] ease-in-out flex items-center justify-center"
        )}
        style={{
          height: `${FLOOR_HEIGHT_REM - 0.25}rem`,
          top: `${elevatorCarTopPositionRem}rem`,
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
