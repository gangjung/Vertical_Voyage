// components/vertical-voyage/FloorsDisplay.tsx
import type { Person } from '@/hooks/useElevatorSimulation';
import { FloorLine } from './FloorLine';

interface FloorsDisplayProps {
  numFloors: number;
  waitingPassengers: Person[][];
  elevatorCurrentFloor: number;
}

export function FloorsDisplay({ numFloors, waitingPassengers, elevatorCurrentFloor }: FloorsDisplayProps) {
  return (
    <div className="w-2/3 flex flex-col-reverse bg-background/30 overflow-y-auto">
      {Array.from({ length: numFloors }).map((_, i) => (
        <FloorLine
          key={i}
          floorNumber={i}
          passengers={waitingPassengers[i] || []}
          isElevatorPresent={elevatorCurrentFloor === i}
        />
      ))}
    </div>
  );
}
