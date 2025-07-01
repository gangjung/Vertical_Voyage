// components/vertical-voyage/FloorsDisplay.tsx
import type { Person } from '@/hooks/useElevatorSimulation';
import { FloorLine } from './FloorLine';
import { cn } from '@/lib/utils';

interface FloorsDisplayProps {
  numFloors: number;
  waitingPassengers: Person[][];
  elevatorFloors: number[];
  numElevators: number;
}

export function FloorsDisplay({ numFloors, waitingPassengers, elevatorFloors, numElevators }: FloorsDisplayProps) {
  const widthClass = numElevators === 2 ? 'w-1/2' : 'w-1/3';
  return (
    <div className={cn(
        "flex flex-col-reverse bg-background/30 overflow-y-auto border-x-2 border-primary/50",
        widthClass
      )}>
      {Array.from({ length: numFloors }).map((_, i) => (
        <FloorLine
          key={i}
          floorNumber={i}
          passengers={waitingPassengers[i] || []}
          isElevatorPresent={elevatorFloors.includes(i)}
        />
      ))}
    </div>
  );
}
