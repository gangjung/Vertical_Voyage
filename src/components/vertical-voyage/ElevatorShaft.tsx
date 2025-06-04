// components/vertical-voyage/ElevatorShaft.tsx
import type { Person } from '@/hooks/useElevatorSimulation';
import { ElevatorCar } from './ElevatorCar';

interface ElevatorShaftProps {
  numFloors: number;
  currentFloor: number;
  passengers: Person[];
  direction: 'up' | 'down' | 'idle';
}

export function ElevatorShaft({ numFloors, currentFloor, passengers, direction }: ElevatorShaftProps) {
  const floorHeightPercentage = 100 / numFloors;
  
  // Elevator car's bottom position based on current floor
  const elevatorBottomPercentage = currentFloor * floorHeightPercentage;

  return (
    <div className="w-1/3 relative bg-muted/10 p-1 sm:p-2" data-ai-hint="elevator shaft">
      <ElevatorCar
        style={{
          height: `${floorHeightPercentage}%`,
          bottom: `${elevatorBottomPercentage}%`,
        }}
        passengers={passengers}
        direction={direction}
      />
    </div>
  );
}
