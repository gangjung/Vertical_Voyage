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
 *          예: 엘리베이터가 4대일 경우 ['up', 'down', 'idle', 'up']
 */
export function manageElevators(input: AlgorithmInput): ElevatorCommand[] {
  // =================================================================
  // ===== 여기에 자신만의 엘리베이터 알고리즘을 구현하세요! =====
  // =================================================================

  const { elevators } = input;

  // 각 엘리베이터에 대해 아주 간단한 명령을 내립니다.
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

  return commands as ElevatorCommand[];
  
  // =================================================================
}
