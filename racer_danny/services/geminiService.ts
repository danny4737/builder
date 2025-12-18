// API 키 없이 작동하는 가짜 AI 서비스 (Mock)

// 1. 레이스 해설 생성 함수
export const getRaceCommentary = async (
  score: number,
  distance: number,
  reason: string
): Promise<string> => {
  // 생각하는 척 딜레이
  await new Promise(resolve => setTimeout(resolve, 800));

  if (reason === 'crash') {
    const crashComments = [
      `💥 쾅! ${distance}m 지점에서 아쉽게 충돌했네요. 다음엔 더 멀리 갈 수 있을 거예요!`,
      `아이고, 장애물을 못 보셨나요? 😭 그래도 점수는 ${score}점입니다!`,
      `🚨 긴급 상황! 레이서가 충돌했습니다. 재정비 후 다시 도전하세요!`,
      `속도가 너무 빨랐나요? 안전 운전이 최고입니다!`
    ];
    return crashComments[Math.floor(Math.random() * crashComments.length)];
  } else if (reason === 'fuel') {
    return `⛽️ 연료가 바닥났어요! 초록색 연료 아이템을 꼭 챙기세요.`;
  }

  return `🏁 훌륭한 레이스였습니다! 최종 점수: ${score}`;
};

// 2. 미션 스토리 생성 함수 (이게 없어서 에러가 났었습니다!)
export const getMissionLore = async (): Promise<string> => {
  const missions = [
    "목표: 네온 시티의 끝까지 도달하여 전설의 레이서가 되십시오.",
    "임무: 연료를 확보하며 최대한 멀리 생존하십시오.",
    "경고: 도로 위에 장애물이 많습니다. 충돌을 피하세요.",
    "팁: 노란색 아이템은 점수, 초록색은 연료입니다."
  ];
  return missions[Math.floor(Math.random() * missions.length)];
};