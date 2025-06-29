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
  
  // 아래는 매우 기본적인 예시 알고리즘입니다.
  // 각 엘리베이터는 현재 방향을 유지하다가, 끝에 도달하면 방향을 바꿉니다.
  // 유휴 상태일 때 대기 승객이 있으면, 가장 가까운 승객에게 이동합니다.
  
  const commands = elevators.map(elevator => {
    let newDirection: ElevatorCommand = elevator.direction;

    // 1. 탑승객이 있을 경우, 해당 승객의 목적지 방향으로 계속 이동
    if (elevator.passengers.length > 0) {
      // 위로 가는 승객이 있으면 위로, 아니면 아래로
      const goingUp = elevator.passengers.some(p => p.destinationFloor > elevator.floor);
      const goingDown = elevator.passengers.some(p => p.destinationFloor < elevator.floor);
      
      if (newDirection === 'up' && !goingUp && goingDown) newDirection = 'down';
      if (newDirection === 'down' && !goingDown && goingUp) newDirection = 'up';

      // 경계 처리
      if (elevator.floor === numFloors - 1) newDirection = 'down';
      if (elevator.floor === 0) newDirection = 'up';

      return newDirection;
    }

    // 2. 탑승객이 없고, 대기 승객이 있는 경우
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
            }
        }
    }
    
    // 3. 아무도 없으면 유휴 상태
    return 'idle';
  });

  // 최종적으로 계산된 각 엘리베이터의 명령을 반환합니다.
  // 엘리베이터 수만큼의 명령이 배열에 포함되어야 합니다.
  return commands as ElevatorCommand[];
  
  // =================================================================
}
