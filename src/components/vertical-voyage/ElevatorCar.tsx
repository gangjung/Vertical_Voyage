// components/vertical-voyage/ElevatorCar.tsx
import type { Person } from '@/hooks/useElevatorSimulation';
import { PersonIcon } from './PersonIcon';
import { ArrowUp, ArrowDown, MinusSquare, Pin } from 'lucide-react'; // MinusSquare for idle
import { cn } from '@/lib/utils';

interface ElevatorCarProps {
  style: React.CSSProperties;
  passengers: Person[];
  direction: 'up' | 'down' | 'idle';
  distanceTraveled: number;
  floor: number;
  waitingPassengers: Person[][];
  numFloors: number;
}

export function ElevatorCar({ style, passengers, direction, distanceTraveled, floor, waitingPassengers, numFloors }: ElevatorCarProps) {
  const DirectionIcon = direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : MinusSquare;
  
  const getTargetFloor = (): number | null => {
    // 1. Priority: Passengers inside. Target the nearest stop in the current direction.
    if (passengers.length > 0) {
      if (direction === 'up') {
        const upwardDestinations = passengers.filter(p => p.destinationFloor > floor);
        if (upwardDestinations.length > 0) return Math.min(...upwardDestinations.map(p => p.destinationFloor));
      }
      if (direction === 'down') {
        const downwardDestinations = passengers.filter(p => p.destinationFloor < floor);
        if (downwardDestinations.length > 0) return Math.max(...downwardDestinations.map(p => p.destinationFloor));
      }
      // If no one is going in the current direction or if idle, find the closest destination of any passenger.
      const closestDest = passengers.map(p => p.destinationFloor).reduce((prev, curr) => {
          return (Math.abs(curr - floor) < Math.abs(prev - floor) ? curr : prev);
      });
      return closestDest;
    }

    // 2. No passengers: Look for the closest overall call.
    let closestCall: number | null = null;
    let minDistance = Infinity;

    waitingPassengers.forEach((floorWaiting, floorIndex) => {
        if (floorWaiting.length > 0) {
            const distance = Math.abs(floor - floorIndex);
            if (distance < minDistance) {
                minDistance = distance;
                closestCall = floorIndex;
            }
        }
    });

    // Don't show a target if the call is on the current floor.
    if (closestCall !== null && closestCall !== floor) {
        return closestCall;
    }

    return null;
  };

  const targetFloor = getTargetFloor();

  return (
    <div
      className={cn(
        "absolute left-1 right-1 sm:left-2 sm:right-2 bg-accent rounded shadow-lg flex flex-col items-center justify-between p-1",
        "transition-[bottom] duration-500 ease-in-out" // CSS transition for smooth movement
        )}
      style={style}
      aria-label={`Elevator car at floor ${floor}. Direction: ${direction}. Passengers: ${passengers.length}`}
      data-ai-hint="elevator cabin"
    >
      {/* Top part: Direction icon and Distance */}
      <div className="w-full flex justify-between items-center px-0.5">
        <div className="flex items-center gap-1">
          <DirectionIcon className="w-3 h-3 sm:w-4 sm:h-4 text-accent-foreground shrink-0" />
          {targetFloor !== null && (
              <span className="text-[10px] sm:text-xs font-mono font-bold text-accent-foreground">
                  {targetFloor}
              </span>
          )}
        </div>
        
        <div className="flex items-center gap-0.5">
          <Pin className="w-2 h-2 sm:w-3 sm:h-3 text-accent-foreground" />
          <span className="text-[10px] sm:text-xs font-mono text-accent-foreground font-bold">
            {distanceTraveled}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1 my-0.5 sm:my-1 overflow-hidden flex-grow items-center">
        {passengers.map((person) => (
          <PersonIcon key={person.id} person={person} inElevator={true} />
        ))}
      </div>
      <span className="text-xs font-mono text-accent-foreground bg-accent/50 px-1 rounded-sm shrink-0">
        {passengers.length}
      </span>
    </div>
  );
}
