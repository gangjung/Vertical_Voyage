// components/vertical-voyage/ElevatorShaft.tsx
import type { Person, ElevatorState } from '@/hooks/useElevatorSimulation';
import { ElevatorCar } from './ElevatorCar';
import { cn } from '@/lib/utils';

interface ElevatorShaftProps {
  numFloors: number;
  elevator: ElevatorState;
  waitingPassengers: Person[][];
  numElevators: number;
}

export function ElevatorShaft({ numFloors, elevator, waitingPassengers, numElevators }: ElevatorShaftProps) {
  const floorHeightPercentage = 100 / numFloors;
  
  // Elevator car's bottom position based on current floor
  const elevatorBottomPercentage = elevator.floor * floorHeightPercentage;

  const widthClass = numElevators === 2 ? 'w-1/4' : 'w-1/6';

  return (
    <div className={cn(
        "relative bg-muted/10 p-1 sm:p-2 border-x border-primary/10",
        widthClass
      )} data-ai-hint="elevator shaft">
      <ElevatorCar
        style={{
          height: `${floorHeightPercentage}%`,
          bottom: `${elevatorBottomPercentage}%`,
        }}
        floor={elevator.floor}
        passengers={elevator.passengers}
        direction={elevator.direction}
        distanceTraveled={elevator.distanceTraveled}
        waitingPassengers={waitingPassengers}
        numFloors={numFloors}
      />
    </div>
  );
}
