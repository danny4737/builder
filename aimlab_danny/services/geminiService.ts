// API 키 없이 작동하는 가짜 AI 코치
export const getAimAnalysis = async (
  score: number,
  accuracy: number,
  avgTime: number
): Promise<string> => {
  // 분석하는 척 (1초 딜레이)
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (accuracy > 90) {
    return "대단해요! 신의 손인가요? 정확도가 완벽에 가깝습니다! 🎯";
  } else if (score > 1000) {
    return "점수가 훌륭합니다! 조금만 더 침착하게 조준하면 완벽할 거예요.";
  } else if (avgTime < 500) {
    return "반사신경이 정말 빠르시군요! 정확도만 조금 더 높여볼까요?";
  } else {
    return "천천히 정확하게 맞추는 연습부터 시작해보세요. 화이팅!";
  }
};