// components/vertical-voyage/PersonIcon.tsx
import type { Person } from '@/hooks/useElevatorSimulation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonIconProps {
  person: Person;
  inElevator?: boolean;
}

export function PersonIcon({ person, inElevator = false }: PersonIconProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex items-center justify-center gap-0.5 p-0.5 rounded-md animate-fadeIn"
            aria-label={`Person ${person.id} from floor ${person.originFloor} going to floor ${person.destinationFloor}`}
          >
            <div
              className={cn(
                'w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow-md shrink-0',
                inElevator ? 'bg-background border-2 border-primary' : 'bg-primary',
                'transition-all duration-300'
              )}
              data-ai-hint="person silhouette"
            />
            <span className={cn(
              "text-xs font-mono font-bold leading-none",
              inElevator ? 'text-accent-foreground' : 'text-primary'
            )}>
              {person.destinationFloor}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-popover text-popover-foreground p-1 px-2 rounded-md shadow-lg text-xs">
          <p>
            P{person.id}: {person.originFloor} <ArrowRight className="inline w-2.5 h-2.5 mx-0.5" /> {person.destinationFloor}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
