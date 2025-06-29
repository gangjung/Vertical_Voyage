/**
 * @file 엘리베이터 알고리즘 대회용 파일
 * 
 * 이 파일의 `manageElevators` 함수를 수정하여 자신만의 엘리베이터 제어 로직을 구현하세요.
 * 시뮬레이션은 매 시간(tick)마다 이 함수를 호출하여 엘리베이터가 다음에 어떤 방향으로 움직여야 할지 결정합니다.
 */
import type { ElevatorState, Person } from '@/hooks/useElevatorSimulation';

/**
 * `manageElevators` 함수에 전달되는 입력 데이터의 타입입니다.
 * 시뮬레이션의 현재 상태 정보를 담고 있습니다.
 */
export interface AlgorithmInput {
  currentTime: number;
  elevators: ElevatorState[]; // 현재 모든 엘리베이터의 상태 배열
  waitingPassengers: Person[][]; // 각 층에서 대기 중인 승객 목록
  numFloors: number; // 건물의 총 층 수
  elevatorCapacity: number; // 엘리베이터의 최대 용량
}

/**
 * 각 엘리베이터에 내릴 수 있는 명령의 타입입니다.
 * 'up', 'down', 'idle' 중 하나를 반환해야 합니다.
 */
export type ElevatorCommand = 'up' | 'down' | 'idle';

/**
 * @main_function
 * 엘리베이터 시스템을 제어하는 메인 함수입니다.
 * 이 함수를 수정하여 엘리베이터 운영 알고리즘을 구현하세요.
 * 
 * @param input 시뮬레이션의 현재 상태 데이터 (`AlgorithmInput` 타입)
 * @returns 각 엘리베이터에 대한 명령어 배열 (`ElevatorCommand[]` 타입). 배열의 길이는 엘리베이터 수와 같아야 합니다.
 *          예: 엘리베이터가 2대일 경우 ['up', 'down']
 */
export function manageElevators(input: AlgorithmInput): ElevatorCommand[] {
  // =================================================================
  // ===== 여기에 자신만의 엘리베이터 알고리즘을 구현하세요! =====
  // =================================================================

  const { elevators, waitingPassengers, numFloors } = input;
  
  const commands = elevators.map(elevator => {
    // 1. 탑승객이 있을 경우, 목적지를 우선으로 처리합니다.
    if (elevator.passengers.length > 0) {
      const wantsToGoUp = elevator.passengers.some(p => p.destinationFloor > elevator.floor);
      const wantsToGoDown = elevator.passengers.some(p => p.destinationFloor < elevator.floor);

      // 엘리베이터가 '위'로 이동 중일 때, 더 위로 갈 승객이 있다면 계속 올라갑니다.
      if (elevator.direction === 'up') {
        if (wantsToGoUp) return 'up';
        if (wantsToGoDown) return 'down'; // 위로 갈 승객이 없으면, 아래로 갈 승객을 위해 방향 전환
      }

      // 엘리베이터가 '아래'로 이동 중일 때, 더 아래로 갈 승객이 있다면 계속 내려갑니다.
      if (elevator.direction === 'down') {
        if (wantsToGoDown) return 'down';
        if (wantsToGoUp) return 'up'; // 아래로 갈 승객이 없으면, 위로 갈 승객을 위해 방향 전환
      }
      
      // 엘리베이터가 '유휴' 상태였다면 (방금 승객을 태웠다면), 승객 목적지에 따라 새 방향을 결정합니다.
      if (elevator.direction === 'idle') {
        if (wantsToGoUp) return 'up';
        if (wantsToGoDown) return 'down';
      }

      // 최상층/최하층 경계 처리
      if (elevator.floor === numFloors - 1 && wantsToGoDown) return 'down';
      if (elevator.floor === 0 && wantsToGoUp) return 'up';
      
      // 현재 층에 모든 승객이 내리는 경우 등, 다음 행동이 정해지지 않으면 '유휴' 상태가 됩니다.
      return 'idle';
    }

    // 2. 탑승객이 없고, 대기 승객이 있는 경우 가장 가까운 호출에 응답합니다.
    const isAnyoneWaiting = waitingPassengers.some(floor => floor.length > 0);
    if (isAnyoneWaiting) {
        let closestFloor = -1;
        let minDistance = Infinity;

        waitingPassengers.forEach((floor, floorIndex) => {
            if (floor.length > 0) {
                const distance = Math.abs(elevator.floor - floorIndex);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestFloor = floorIndex;
                }
            }
        });
        
        if (closestFloor !== -1) {
            if (closestFloor > elevator.floor) {
                return 'up';
            } else if (closestFloor < elevator.floor) {
                return 'down';
            } else {
                // 호출이 현재 층에 있으면, 승객을 태우기 위해 '유휴' 상태를 유지합니다.
                return 'idle';
            }
        }
    }
    
    // 3. 아무도 없으면 유휴 상태로 대기합니다.
    return 'idle';
  });

  return commands as ElevatorCommand[];
  
  // =================================================================
}
