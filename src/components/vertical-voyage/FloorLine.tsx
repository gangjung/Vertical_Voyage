// components/vertical-voyage/FloorLine.tsx
import type { Person } from '@/hooks/useElevatorSimulation';
import { PersonIcon } from './PersonIcon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FloorLineProps {
  floorNumber: number;
  passengers: Person[];
  isElevatorPresent: boolean;
}

export function FloorLine({ floorNumber, passengers, isElevatorPresent }: FloorLineProps) {
  return (
    <div className={cn(
      "flex-1 border-b border-primary/20 flex items-center p-1 sm:p-2 relative min-h-[40px] sm:min-h-[50px] transition-colors duration-300",
      isElevatorPresent && "bg-accent/10"
    )}>
      <Badge variant="outline" className={cn(
        "mr-1 sm:mr-2 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm shrink-0 transition-colors duration-300",
        isElevatorPresent ? "border-accent text-accent font-bold scale-110" : "border-primary/50"
        )}>
        {floorNumber}
      </Badge>
      <div className="flex-1 flex flex-wrap gap-1 items-center">
        {passengers.map(person => (
          <PersonIcon key={person.id} person={person} />
        ))}
      </div>
    </div>
  );
}
