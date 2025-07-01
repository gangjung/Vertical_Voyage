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

  const { elevators, waitingPassengers } = input;

  const commands = elevators.map(elevator => {
    // 1. 엘리베이터에 승객이 있을 때: 가장 가까운 목적지로 이동
    if (elevator.passengers.length > 0) {
      const closestDest = elevator.passengers.reduce((prev, curr) =>
        Math.abs(curr.destinationFloor - elevator.floor) < Math.abs(prev.destinationFloor - elevator.floor) ? curr : prev
      ).destinationFloor;

      if (closestDest > elevator.floor) return 'up';
      if (closestDest < elevator.floor) return 'down';
      return 'idle';
    }

    // 2. 엘리베이터가 비어있을 때: 가장 가까운 호출에 응답
    // 주의: 이 로직은 여러 엘리베이터가 같은 호출에 몰려가는 비효율을 낳습니다!
    let closestCall = -1;
    let minDistance = Infinity;

    waitingPassengers.forEach((floor, floorIndex) => {
      if (floor.length > 0) {
        const distance = Math.abs(elevator.floor - floorIndex);
        if (distance < minDistance) {
          minDistance = distance;
          closestCall = floorIndex;
        }
      }
    });

    if (closestCall !== -1) {
      if (closestCall > elevator.floor) return 'up';
      if (closestCall < elevator.floor) return 'down';
      return 'idle';
    }

    // 3. 호출이 없을 때: 대기
    return 'idle';
  });

  return commands as ElevatorCommand[];
  
  // =================================================================
}
