
// components/vertical-voyage/ChallengeOne.tsx
"use client";

import { BuildingLayout } from '@/components/vertical-voyage/BuildingLayout';
import { useElevatorSimulation } from '@/hooks/useElevatorSimulation';
import type { ElevatorState, AlgorithmInput, ElevatorCommand, Person } from '@/hooks/useElevatorSimulation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Users, Footprints, Code, Play, Trophy, Clock, Route, Milestone, Timer, UsersRound, Settings, Building, Pause, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exampleAlgorithms } from '@/ai/example-algorithms';
import { Label } from '@/components/ui/label';
import { generateRandomManifest, passengerScenarios } from '@/ai/passenger-scenarios';
import type { PassengerManifest } from '@/ai/passenger-scenarios';
import { manageElevators as defaultManageElevators } from '@/ai/elevator-algorithm';

const NUM_FLOORS = 10;
const ELEVATOR_CAPACITY = 8;

const ElevatorStatus = ({ elevator }: { elevator: ElevatorState }) => (
  <>
    {`\nElevator ${elevator.id}:\n  Floor: ${elevator.floor}\n  Direction: ${elevator.direction}\n  Passengers: ${elevator.passengers.length}\n  Distance: ${elevator.distanceTraveled || 0} floors\n`}
    {elevator.passengers.map(p => `    - P${p.id} (O:${p.originFloor} D:${p.destinationFloor})`).join('\n')}
  </>
);

export function ChallengeOne() {
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const [code, setCode] = useState(
    `// 엘리베이터가 한 명의 승객만 따라다니는 매우 간단한 기본 알고리즘입니다.
// 이 코드를 수정하거나, 예시를 선택하여 더 효율적인 알고리즘을 만들어보세요!
function manageElevators(input) {
  const { elevators } = input;

  const commands = elevators.map(elevator => {
    // 1. 만약 엘리베이터에 승객이 있다면,
    if (elevator.passengers.length > 0) {
      const firstPassenger = elevator.passengers[0];
      // 첫 번째 승객의 목적지로 이동합니다. (매우 비효율적!)
      if (firstPassenger.destinationFloor > elevator.floor) {
        return 'up';
      }
      if (firstPassenger.destinationFloor < elevator.floor) {
        return 'down';
      }
    }
    
    // 2. 승객이 없거나 목적지에 도착했다면, 그냥 멈춥니다.
    return 'idle';
  });

  return commands;
}`
  );
  const [customAlgorithm, setCustomAlgorithm] = useState<((input: AlgorithmInput) => ElevatorCommand[]) | null>(() => defaultManageElevators);
  
  const [selectedScenarioName, setSelectedScenarioName] = useState(passengerScenarios[0].name);
  const [passengerManifest, setPassengerManifest] = useState<PassengerManifest>(passengerScenarios[0].manifest);
  const [shouldStartAfterRandom, setShouldStartAfterRandom] = useState(false);

  const [numElevators, setNumElevators] = useState(4);

  const { 
    state: simulation, 
    stats,
    isRunning,
    start,
    pause,
    reset
  } = useElevatorSimulation(
    NUM_FLOORS, 
    ELEVATOR_CAPACITY,
    numElevators,
    passengerManifest,
    customAlgorithm || undefined
  );
  
  useEffect(() => {
    setIsClient(true);
    handleApplyCode(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (shouldStartAfterRandom) {
      start();
      setShouldStartAfterRandom(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passengerManifest, shouldStartAfterRandom, start]);
  
  const handleStartClick = () => {
    if (selectedScenarioName === '랜덤') {
      const randomManifest = generateRandomManifest(NUM_FLOORS, 50, 170);
      setShouldStartAfterRandom(true);
      setPassengerManifest(randomManifest);
    } else {
      start();
    }
  };

  const handleApplyCode = (isInitialLoad = false) => {
    if (!code.trim()) {
      toast({ variant: "destructive", title: "코드가 비어있습니다", description: "알고리즘 코드를 입력해주세요." });
      return;
    }

    try {
      const newAlgorithm = new Function('input', `
        ${code}
        
        if (typeof manageElevators !== 'function') {
          throw new Error('코드에서 "manageElevators"라는 이름의 함수를 찾을 수 없습니다.');
        }

        return manageElevators(input);
      `);

      const testElevators = Array.from({ length: numElevators }, (_, i) => ({
        id: i + 1,
        floor: 0,
        direction: 'idle',
        passengers: [],
        distanceTraveled: 0
      }));
      const testResult = newAlgorithm({ currentTime: 0, elevators: testElevators, waitingPassengers: Array.from({ length: NUM_FLOORS }, () => []), numFloors: NUM_FLOORS, elevatorCapacity: ELEVATOR_CAPACITY});
      if (!Array.isArray(testResult) || testResult.length !== numElevators) {
         throw new Error(`함수는 ${numElevators}대의 엘리베이터에 대한 명령어 배열을 반환해야 합니다.`);
      }
      
      setCustomAlgorithm(() => newAlgorithm as any);
      reset(); // Reset the simulation state, but don't start it.

      if (!isInitialLoad) {
        toast({
          title: "성공!",
          description: "새로운 알고리즘이 적용되었습니다. '시작' 버튼을 눌러 시뮬레이션을 실행하세요.",
        });
      }
    } catch (e) {
      console.error("Algorithm Error:", e);
      setCustomAlgorithm(null); 
      toast({
        variant: "destructive",
        title: "알고리즘 오류",
        description: e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다. 브라우저 콘솔을 확인하세요.",
      });
    }
  };


  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center bg-background p-2 sm:p-4">
         <Card className="w-full shadow-2xl border-primary border-2">
            <CardContent className="p-2 sm:p-3">
              <div className="flex w-full h-[calc(100vh-300px)] min-h-[400px] max-h-[700px] items-center justify-center text-muted-foreground">
                Loading Simulation...
              </div>
            </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="w-full shadow-2xl border-primary/50 border">
        <CardContent className="p-2 sm:p-3">
          <BuildingLayout 
            numFloors={NUM_FLOORS}
            elevators={simulation.elevators}
            waitingPassengers={simulation.waitingPassengers}
          />
        </CardContent>
      </Card>
      
      <div className="w-full flex justify-center my-2">
        {stats.totalOperatingTime > 0 ? (
          <Button onClick={handleStartClick} size="lg">
            <RefreshCw className="mr-2 h-4 w-4" />
            Restart Simulation
          </Button>
        ) : isRunning ? (
          <Button onClick={pause} variant="secondary" size="lg">
            <Pause className="mr-2 h-4 w-4" />
            Pause Simulation
          </Button>
        ) : (
          <Button onClick={handleStartClick} size="lg">
            <Play className="mr-2 h-4 w-4" />
            Start Simulation
          </Button>
        )}
      </div>

      {stats.totalOperatingTime > 0 && (
        <Card className="w-full shadow-lg border-2 border-accent animate-fadeIn">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-lg font-headline flex items-center gap-2 text-accent">
              <Trophy className="w-5 h-5" />
              Final Score & Ranking
            </CardTitle>
            <CardDescription>This is the final result for the current algorithm.</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm border-t">
            <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Total Operating Time</span>
              </div>
              <span className="font-bold text-2xl text-primary mt-1">{stats.totalOperatingTime} steps</span>
              <span className="text-xs text-muted-foreground">(1st Priority)</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Footprints className="w-4 h-4" />
                <span>Avg. Journey (Wait+Travel)</span>
              </div>
              <span className="font-bold text-2xl mt-1">{stats.averageJourneyTime.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">(2nd Priority)</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Route className="w-4 h-4" />
                <span>Total Distance</span>
              </div>
              <span className="font-bold text-2xl mt-1">{stats.totalDistanceTraveled}</span>
              <span className="text-xs text-muted-foreground">(3rd Priority)</span>
            </div>
          </CardContent>
        </Card>
      )}

       <Card className="w-full shadow-lg">
         <CardHeader className="pb-2 pt-3">
           <CardTitle className="text-lg font-headline flex items-center gap-2"><Milestone /> Algorithm Performance</CardTitle>
         </CardHeader>
         <CardContent className="p-3 pt-2 grid grid-cols-2 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm border-t">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="w-4 h-4" />
                <span>Current Step</span>
              </div>
              <span className="font-bold text-base">{simulation.currentTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Passengers Served</span>
              </div>
              <span className="font-bold text-base">{stats.totalPassengersServed} / {passengerManifest.length}</span>
            </div>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-muted-foreground">
                <Footprints className="w-4 h-4" />
                <span>Avg. Wait (Spawn → Pickup)</span>
               </div>
              <span className="font-bold text-base">{stats.averageWaitTime.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-muted-foreground">
                <Route className="w-4 h-4" />
                <span>Avg. Travel (In Elevator)</span>
               </div>
              <span className="font-bold text-base">{stats.averageTravelTime.toFixed(1)}</span>
            </div>
         </CardContent>
       </Card>

      <Card className="w-full shadow-lg">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-lg font-headline flex items-center gap-2"><Settings className="w-5 h-5" /> Simulation Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm border-t">
          <div className="flex items-center justify-between p-2 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="w-4 h-4" />
              <span>Building Floors</span>
            </div>
            <span className="font-bold text-base">{NUM_FLOORS}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Elevator Capacity</span>
            </div>
            <span className="font-bold text-base">{ELEVATOR_CAPACITY}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <UsersRound className="w-4 h-4" />
              <span>Total Passengers</span>
            </div>
            <span className="font-bold text-base">{passengerManifest.length}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full shadow-lg">
         <CardHeader className="pb-2 pt-3 flex flex-row items-center justify-between">
           <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary"/>
            <CardTitle className="text-lg font-headline">Submit Your Algorithm</CardTitle>
           </div>
         </CardHeader>
          <CardContent className="p-3 border-t">
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="scenario-select" className="mb-2 block text-sm font-medium"><UsersRound className="inline-block w-4 h-4 mr-1"/>승객 시나리오 선택</Label>
                <Select
                  value={selectedScenarioName}
                  onValueChange={(value) => {
                    setSelectedScenarioName(value);
                    if (value !== '랜덤') {
                      const selectedScenario = passengerScenarios.find(s => s.name === value);
                      if (selectedScenario) {
                        setPassengerManifest(selectedScenario.manifest);
                      }
                    } else {
                      setPassengerManifest([]);
                    }
                  }}
                >
                  <SelectTrigger id="scenario-select" className="w-full">
                    <SelectValue placeholder="시나리오를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {passengerScenarios.map((scenario) => (
                      <SelectItem key={scenario.name} value={scenario.name}>
                        {scenario.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="algorithm-select" className="mb-2 block text-sm font-medium"><Code className="inline-block w-4 h-4 mr-1"/>알고리즘 예시 선택</Label>
                <Select
                  onValueChange={(value) => {
                    const selectedAlgo = exampleAlgorithms.find(algo => algo.name === value);
                    if (selectedAlgo) {
                      setCode(selectedAlgo.code);
                    }
                  }}
                >
                  <SelectTrigger id="algorithm-select" className="w-full">
                    <SelectValue placeholder="예시를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {exampleAlgorithms.map((algo) => (
                      <SelectItem key={algo.name} value={algo.name}>
                        {algo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="elevator-count-select" className="mb-2 block text-sm font-medium"><Building className="inline-block w-4 h-4 mr-1"/>엘리베이터 수 선택</Label>
                <Select
                  value={String(numElevators)}
                  onValueChange={(value) => {
                    setNumElevators(Number(value));
                  }}
                >
                  <SelectTrigger id="elevator-count-select" className="w-full">
                    <SelectValue placeholder="엘리베이터 수를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2대</SelectItem>
                    <SelectItem value="4">4대</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-3 space-y-4">
              <p>
                  아래 텍스트 영역에 `manageElevators` 함수를 JavaScript로 작성하세요. 
                  이 함수는 시뮬레이션의 매 스텝마다 호출되며, 각 엘리베이터가 다음에 어떤 행동을 할지 결정해야 합니다.
              </p>
              <div>
                  <h4 className="font-medium text-foreground">`input` 객체 속성:</h4>
                  <ul className="list-disc list-inside pl-2 text-xs space-y-1 mt-1">
                      <li><code className="p-0.5 rounded bg-muted">currentTime</code>: 현재 스텝(시간).</li>
                      <li><code className="p-0.5 rounded bg-muted">numFloors</code>: 건물의 총 층 수.</li>
                      <li><code className="p-0.5 rounded bg-muted">elevatorCapacity</code>: 엘리베이터 최대 용량.</li>
                      <li>
                          <code className="p-0.5 rounded bg-muted">elevators</code>: 모든 엘리베이터의 상태가 담긴 배열입니다. 각 엘리베이터 객체는 다음 속성을 가집니다:
                          <ul className="list-['-_'] list-inside pl-4 mt-1">
                              <li><code className="p-0.5 rounded bg-muted">id</code>: 엘리베이터 고유 번호 (1, 2, ...)</li>
                              <li><code className="p-0.5 rounded bg-muted">floor</code>: 현재 층 (0부터 시작)</li>
                              <li><code className="p-0.5 rounded bg-muted">direction</code>: 현재 이동 방향 ('up', 'down', 'idle')</li>
                              <li><code className="p-0.5 rounded bg-muted">passengers</code>: 탑승 중인 승객 배열. (각 승객은 `destinationFloor` 속성을 가집니다)</li>
                              <li><code className="p-0.5 rounded bg-muted">distanceTraveled</code>: 총 이동 거리</li>
                          </ul>
                      </li>
                      <li><code className="p-0.5 rounded bg-muted">waitingPassengers</code>: 각 층에서 대기 중인 승객의 2차원 배열. <code className="p-0.5 rounded bg-muted">waitingPassengers[i]</code>는 i층의 대기 승객 목록입니다.</li>
                  </ul>
              </div>
               <div>
                  <h4 className="font-medium text-foreground">반환값:</h4>
                  <p className="text-xs mt-1">
                      엘리베이터 {numElevators}대에 대한 명령이 담긴 배열을 반환해야 합니다. 각 명령은 <code className="p-0.5 rounded bg-muted">'up'</code>, <code className="p-0.5 rounded bg-muted">'down'</code>, 또는 <code className="p-0.5 rounded bg-muted">'idle'</code> 중 하나여야 합니다. (예: <code className="p-0.5 rounded bg-muted">['up', 'down', 'idle', 'up']</code>)
                  </p>
              </div>
              <div>
                  <h4 className="font-medium text-foreground">승객 탑승 방법:</h4>
                  <p className="text-xs mt-1">
                      승객 탑승은 시뮬레이션에 의해 자동으로 처리됩니다. 알고리즘은 다음 조건을 만족시켜야 합니다:
                  </p>
                  <ul className="list-['-_'] list-inside pl-4 mt-1 space-y-1 text-xs">
                      <li>엘리베이터가 승객이 기다리는 층에 있어야 합니다.</li>
                      <li>엘리베이터에 빈 자리가 있어야 합니다.</li>
                      <li>
                          반환하는 명령(<code className="p-0.5 rounded bg-muted">'up'</code>, <code className="p-0.5 rounded bg-muted">'down'</code>, <code className="p-0.5 rounded bg-muted">'idle'</code>)이 중요합니다.
                          <ul className="list-['•_'] list-inside pl-4 mt-1">
                              <li><code className="p-0.5 rounded bg-muted">'up'</code>: 위로 가려는 승객만 태웁니다.</li>
                              <li><code className="p-0.5 rounded bg-muted">'down'</code>: 아래로 가려는 승객만 태웁니다.</li>
                              <li><code className="p-0.5 rounded bg-muted">'idle'</code>: 방향에 상관없이 대기 중인 승객을 태웁니다.</li>
                          </ul>
                      </li>
                  </ul>
              </div>
              <div>
                  <h5 className="font-semibold text-foreground">💡 팁: 시간 효율 마스터하기</h5>
                   <p className="text-xs mt-1">
                      명령어에 따라 승객을 태우고 다음 층으로 이동하는 데 걸리는 시간(스텝)이 다릅니다. 이를 활용하는 것이 고득점의 핵심입니다.
                   </p>
                   <ul className="list-['-_'] list-inside pl-4 mt-1 space-y-1 text-xs">
                      <li><strong className="text-foreground">1-스텝 픽업 (방향 유지):</strong> 엘리베이터의 이동 방향(<code className="p-0.5 rounded bg-muted">'up'</code>, <code className="p-0.5 rounded bg-muted">'down'</code>)과 같은 방향으로 가려는 승객을 만나면, 멈춤 없이 즉시 태우고 **같은 스텝에 바로 다음 층으로 이동**합니다. 가장 빠른 방법입니다.</li>
                      <li><strong className="text-foreground">2-스텝 픽업 ('idle' 정차):</strong> <code className="p-0.5 rounded bg-muted">'idle'</code> 명령은 '완전한 정지'를 의미합니다. **한 스텝을 소모해 멈춰서** 승객을 태우고, 그 다음 스텝에 새로운 목적지를 향해 이동을 시작합니다. 방향과 상관없이 태울 수 있는 안전한 방법이지만 시간 비용이 더 듭니다.</li>
                  </ul>
              </div>
            </div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="function manageElevators(input) { ... }"
              className="font-mono bg-background/50 h-56 text-xs"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleApplyCode(false)} className="w-full">
              <Code className="mr-2 h-4 w-4" />
              Apply Algorithm
            </Button>
          </CardFooter>
       </Card>
      
       <Card className="w-full">
         <CardHeader className="pb-2 pt-3">
           <CardTitle className="text-lg font-headline">Simulation Log</CardTitle>
         </CardHeader>
         <CardContent className="p-0">
          <ScrollArea className="h-48 sm:h-56 p-3 border-t">
            <pre className="text-xs whitespace-pre-wrap break-all">
              {`Time: ${simulation.currentTime}`}
              {simulation.elevators.map(elevator => (
                <ElevatorStatus elevator={elevator} key={elevator.id} />
              ))}
              {`\nWaiting Passengers:\n`}
              {simulation.waitingPassengers.map((floor, i) => 
                floor.length > 0 ? `  Floor ${i}: ${floor.map(p => `P${p.id}(D:${p.destinationFloor})`).join(', ')}` : null
              ).filter(Boolean).join('\n') || '  None'}
            </pre>
          </ScrollArea>
         </CardContent>
       </Card>
    </div>
  );
}
