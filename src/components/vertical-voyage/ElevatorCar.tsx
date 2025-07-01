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
    const passengerDestinations = passengers.map(p => p.destinationFloor);
    const waitingFloorsWithCalls = waitingPassengers
        .map((floor, index) => floor.length > 0 ? index : -1)
        .filter(f => f !== -1);

    // If moving up, the target MUST be above.
    if (direction === 'up') {
        const upwardTargets = [
            ...passengerDestinations.filter(d => d > floor),
            ...waitingFloorsWithCalls.filter(f => f > floor)
        ];
        return upwardTargets.length > 0 ? Math.min(...upwardTargets) : null;
    }

    // If moving down, the target MUST be below.
    if (direction === 'down') {
        const downwardTargets = [
            ...passengerDestinations.filter(d => d < floor),
            ...waitingFloorsWithCalls.filter(f => f < floor)
        ];
        return downwardTargets.length > 0 ? Math.max(...downwardTargets) : null;
    }

    // If idle, find the closest target in any direction.
    if (direction === 'idle') {
        const allTargets = [...passengerDestinations, ...waitingFloorsWithCalls];
        if (allTargets.length === 0) {
            return null;
        }

        const closestTarget = allTargets.reduce((prev, curr) => {
            return Math.abs(curr - floor) < Math.abs(prev - floor) ? curr : prev;
        });

        // Don't show a target for the current floor
        return closestTarget !== floor ? closestTarget : null;
    }

    // Should not be reached, but as a fallback.
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
