// components/vertical-voyage/ElevatorCar.tsx
import type { Person } from '@/hooks/useElevatorSimulation';
import { PersonIcon } from './PersonIcon';
import { ArrowUp, ArrowDown, MinusSquare } from 'lucide-react'; // MinusSquare for idle
import { cn } from '@/lib/utils';

interface ElevatorCarProps {
  style: React.CSSProperties;
  passengers: Person[];
  direction: 'up' | 'down' | 'idle';
}

export function ElevatorCar({ style, passengers, direction }: ElevatorCarProps) {
  const DirectionIcon = direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : MinusSquare;
  return (
    <div
      className={cn(
        "absolute left-1 right-1 sm:left-2 sm:right-2 bg-accent rounded shadow-lg flex flex-col items-center justify-between p-1",
        "transition-[bottom] duration-500 ease-in-out" // CSS transition for smooth movement
        )}
      style={style}
      aria-label={`Elevator car. Direction: ${direction}. Passengers: ${passengers.length}`}
      data-ai-hint="elevator cabin"
    >
      <DirectionIcon className="w-3 h-3 sm:w-4 sm:h-4 text-accent-foreground shrink-0" />
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
