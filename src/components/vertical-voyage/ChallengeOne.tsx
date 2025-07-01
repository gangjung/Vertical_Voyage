
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  const [code, setCode] = useState(exampleAlgorithms[0].code);
  const [customAlgorithm, setCustomAlgorithm] = useState<((input: AlgorithmInput) => ElevatorCommand[]) | null>(null);
  
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
  }, [passengerManifest, shouldStartAfterRandom]);
  
  const handleStartClick = () => {
    if (isRunning) {
       reset();
       setTimeout(() => {
         if (selectedScenarioName === '랜덤') {
            const randomManifest = generateRandomManifest(NUM_FLOORS, 50, 170);
            setPassengerManifest(randomManifest);
            setShouldStartAfterRandom(true);
          } else {
            start();
          }
       }, 50);
    } else {
      if (selectedScenarioName === '랜덤' && passengerManifest.length === 0) {
        const randomManifest = generateRandomManifest(NUM_FLOORS, 50, 170);
        setPassengerManifest(randomManifest);
        setShouldStartAfterRandom(true);
      } else {
        start();
      }
    }
  };

  const handleApplyCode = (isInitialLoad = false) => {
    if (!code.trim()) {
      toast({ variant: "destructive", title: "코드가 비어있습니다", description: "알고리즘 코드를 입력해주세요." });
      return;
    }

    try {
      const manageElevatorsFunc = new Function('input', code);

      const testElevators = Array.from({ length: numElevators }, (_, i) => ({
        id: i + 1,
        floor: 0,
        direction: 'idle',
        passengers: [],
        distanceTraveled: 0
      }));
      const testResult = manageElevatorsFunc({ currentTime: 0, elevators: testElevators, waitingPassengers: Array.from({ length: NUM_FLOORS }, () => []), numFloors: NUM_FLOORS, elevatorCapacity: ELEVATOR_CAPACITY});
      if (!Array.isArray(testResult) || testResult.length !== numElevators) {
         throw new Error(`함수는 ${numElevators}대의 엘리베이터에 대한 명령어 배열을 반환해야 합니다.`);
      }
      
      setCustomAlgorithm(() => manageElevatorsFunc as any);
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
                    const selectedScenario = passengerScenarios.find(s => s.name === value);
                    if (selectedScenario) {
                      setPassengerManifest(selectedScenario.manifest); // This will include the empty array for '랜덤'
                      reset();
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
                  defaultValue={exampleAlgorithms[0].name}
                  onValueChange={(value) => {
                    const selectedAlgo = exampleAlgorithms.find(algo => algo.name === value);
                    if (selectedAlgo) {
                      setCode(selectedAlgo.code);
                    }
                  }}
                >
                  <SelectTrigger id="algorithm-select" className="w-full">
                    <SelectValue />
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

            <Accordion type="single" collapsible className="w-full mb-3">
              <AccordionItem value="item-1">
                <AccordionTrigger>기본 가이드</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                  <p>
                    아래 텍스트 영역에 `manageElevators` 함수의 내부 로직을 JavaScript로 작성하세요.
                    이 함수는 시뮬레이션의 매 스텝마다 호출되며, 각 엘리베이터가 다음에 어떤 행동을 할지 결정해야 합니다.
                  </p>
                  <p>
                    함수는 <strong className="text-foreground">엘리베이터 {numElevators}대에 대한 명령이 담긴 배열</strong>을 반환해야 합니다. 각 명령은 <code className="p-0.5 rounded bg-muted">'up'</code>, <code className="p-0.5 rounded bg-muted">'down'</code>, 또는 <code className="p-0.5 rounded bg-muted">'idle'</code> 중 하나여야 합니다. (예: <code className="p-0.5 rounded bg-muted">['up', 'down', 'idle', 'up']</code>)
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>`input` 객체 상세 설명</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2 pt-2">
                  <p className="mb-2">함수는 다음 속성을 가진 `input` 객체 하나를 인자로 받습니다:</p>
                  <ul className="list-disc list-inside pl-2 space-y-2">
                    <li><code className="p-0.5 rounded bg-muted">currentTime</code>: 현재 스텝(시간).</li>
                    <li>
                      <code className="p-0.5 rounded bg-muted">elevators</code>: 모든 엘리베이터의 상태 배열.
                      <div className="pl-6 mt-1 text-xs border-l ml-2 py-1">
                        <strong className="text-foreground">각 엘리베이터 객체의 속성:</strong>
                        <ul className="list-['-_'] list-inside pl-2 mt-1 space-y-1">
                          <li><code className="p-0.5 rounded bg-muted">id</code>: 고유 번호 (1, 2, ...)</li>
                          <li><code className="p-0.5 rounded bg-muted">floor</code>: 현재 층 (0부터 시작)</li>
                          <li><code className="p-0.5 rounded bg-muted">direction</code>: 현재 방향 ('up', 'down', 'idle')</li>
                          <li><code className="p-0.5 rounded bg-muted">passengers</code>: 탑승객 배열. (각 승객은 <code className="p-0.5 rounded bg-muted">destinationFloor</code>를 가짐)</li>
                          <li><code className="p-0.5 rounded bg-muted">distanceTraveled</code>: 총 이동 거리</li>
                        </ul>
                      </div>
                    </li>
                    <li><code className="p-0.5 rounded bg-muted">waitingPassengers</code>: 각 층에서 대기 중인 승객의 2차원 배열. (<code className="p-0.5 rounded bg-muted">waitingPassengers[i]</code>는 i층의 승객 목록)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>핵심 규칙: 승객 탑승과 시간 효율</AccordionTrigger>
                 <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
                  <div>
                    <strong className="text-foreground">1. 승객 자동 탑승 규칙</strong>
                    <p className="text-xs mt-1">엘리베이터가 특정 층에 있고, 빈자리가 있을 때 <strong className="text-foreground">당신의 명령에 따라</strong> 승객이 자동으로 탑승합니다.</p>
                    <ul className="list-['•_'] list-inside pl-6 mt-1 text-xs space-y-1">
                      <li><code className="p-0.5 rounded bg-muted">'up'</code> 명령 시: <strong className="text-foreground">위로 가려는</strong> 승객만 탑승.</li>
                      <li><code className="p-0.5 rounded bg-muted">'down'</code> 명령 시: <strong className="text-foreground">아래로 가려는</strong> 승객만 탑승.</li>
                      <li><code className="p-0.5 rounded bg-muted">'idle'</code> 명령 시: <strong className="text-foreground">방향에 상관없이</strong> 모든 대기 승객 탑승 (가장 확실한 방법).</li>
                    </ul>
                  </div>

                  <div className="mt-2">
                    <strong className="text-foreground">2. 💡 시간 효율 마스터하기 (고득점 팁)</strong>
                    <p className="text-xs mt-1">명령어에 따라 승객을 태우고 이동하는 데 걸리는 시간(스텝)이 다릅니다. 이걸 잘 써야 이깁니다.</p>
                    <ul className="list-['-_'] list-inside pl-4 mt-1 space-y-2 text-xs">
                      <li>
                        <strong className="text-green-600">⚡ 1-스텝 픽업 (가장 빠름):</strong> 
                        <br/>
                        엘리베이터의 이동 방향(<code className="p-0.5 rounded bg-muted">'up'</code>/<code className="p-0.5 rounded bg-muted">'down'</code>)과 같은 방향으로 가는 승객을 만나면, 멈춤 없이 즉시 태우고 <strong className="text-foreground">같은 스텝에 바로 다음 층으로 이동</strong>합니다.
                      </li>
                      <li>
                        <strong className="text-amber-600">🐢 2-스텝 픽업 (안전함):</strong>
                        <br/>
                        <code className="p-0.5 rounded bg-muted">'idle'</code> 명령은 '완전한 정지'를 의미합니다. <strong className="text-foreground">한 스텝을 소모해 멈춰서</strong> 승객을 태우고, <strong className="text-foreground">그 다음 스텝</strong>에 새로운 목적지를 향해 이동을 시작합니다.
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// 알고리즘 코드를 여기에 입력하세요..."
              className="font-mono bg-background/50 h-[300px] text-xs"
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
