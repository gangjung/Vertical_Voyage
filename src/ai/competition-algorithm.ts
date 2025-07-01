/**
 * @file 엘리베이터 대결(Competition) 모드용 알고리즘 파일
 * 
 * 이 파일의 `manageElevator` 함수를 수정하여 자신만의 엘리베이터 제어 로직을 구현하세요.
 * 이 함수는 "내" 엘리베이터 하나에 대해서만 호출됩니다.
 */

// 주의: 이 파일은 챌린지 2 (대결 모드) 전용입니다.
// 챌린지 1의 타입과는 다릅니다.
import type { ElevatorState } from '@/hooks/useElevatorCompetition';

/**
 * `manageElevator` 함수에 전달되는 입력 데이터의 타입입니다.
 * "내" 엘리베이터의 상태와 호출 정보만 포함됩니다.
 */
export interface CompetitionAlgorithmInput {
  currentTime: number;
  myElevator: ElevatorState; // 제어해야 할 내 엘리베이터의 상태
  waitingCalls: boolean[];    // 각 층의 호출 여부 (true/false). 실제 승객 정보는 알 수 없습니다.
  numFloors: number;
  elevatorCapacity: number;
}

export type ElevatorCommand = 'up' | 'down' | 'idle';

/**
 * @main_function
 * 엘리베이터 하나를 제어하는 함수입니다.
 * 
 * @param input 현재 시뮬레이션 상태 데이터 (`CompetitionAlgorithmInput` 타입)
 * @returns 이 엘리베이터에 대한 명령어 ('up', 'down', 'idle')
 */
export function manageElevator(input: CompetitionAlgorithmInput): ElevatorCommand {
  // =================================================================
  // ===== 여기에 자신만의 엘리베이터 알고리즘을 구현하세요! =====
  // =================================================================

  const { myElevator, waitingCalls } = input;

  // 1. 탑승객이 있으면 목적지로 이동
  if (myElevator.passengers.length > 0) {
    // 가장 가까운 목적지를 가진 승객을 찾습니다.
    const closestDest = myElevator.passengers.reduce((prev, curr) => 
        Math.abs(curr.destinationFloor - myElevator.floor) < Math.abs(prev.destinationFloor - myElevator.floor) ? curr : prev
    ).destinationFloor;
    
    if (closestDest > myElevator.floor) return 'up';
    if (closestDest < myElevator.floor) return 'down';
    return 'idle'; // 목적지 도착
  }

  // 2. 탑승객이 없으면 가장 가까운 호출 층으로 이동
  let closestCall = -1;
  let minDistance = Infinity;

  waitingCalls.forEach((isWaiting, floorIndex) => {
    if (isWaiting) {
      const distance = Math.abs(myElevator.floor - floorIndex);
      if (distance < minDistance) {
        minDistance = distance;
        closestCall = floorIndex;
      }
    }
  });

  if (closestCall !== -1) {
    if (closestCall > myElevator.floor) return 'up';
    if (closestCall < myElevator.floor) return 'down';
    return 'idle'; // 호출 층 도착
  }
  
  // 3. 아무 일도 없으면 대기
  return 'idle';
}
