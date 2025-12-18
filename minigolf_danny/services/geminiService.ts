// API 키 없이 작동하는 가짜 AI 캐디
export const getGolfAdvice = async (
  distance: number,
  strokes: number,
  par: number
): Promise<string> => {
  // 조언 생성 중... (0.5초 딜레이)
  await new Promise(resolve => setTimeout(resolve, 500));

  if (strokes === 0) {
    if (distance > 400) return "거리가 꽤 멉니다. 풀 파워로 날려보세요!";
    if (distance < 150) return "가까운 거리입니다. 부드럽게 퍼팅하세요.";
    return "바람을 읽고 신중하게 샷을 날리세요.";
  }

  if (strokes > par) {
    return "괜찮아요! 침착하게 마무리하면 됩니다. 포기하지 마세요!";
  } else if (distance < 50) {
    return "홀컵이 코앞입니다! 살살 톡 치면 들어갈 거예요.";
  } else {
    return "좋은 샷이었습니다! 다음 샷도 그 느낌 그대로!";
  }
};