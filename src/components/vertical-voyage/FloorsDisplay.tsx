// components/vertical-voyage/FloorsDisplay.tsx
import type { Person } from '@/hooks/useElevatorSimulation';
import { FloorLine } from './FloorLine';

interface FloorsDisplayProps {
  numFloors: number;
  waitingPassengers: Person[][];
  elevatorFloors: number[];
}

export function FloorsDisplay({ numFloors, waitingPassengers, elevatorFloors }: FloorsDisplayProps) {
  return (
    <div className="w-1/3 flex flex-col-reverse bg-background/30 overflow-y-auto border-x-2 border-primary/50">
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
