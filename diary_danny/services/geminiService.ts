// API 키 없이 작동하는 가짜 AI 서비스
class GeminiService {
  
  // 미리 준비된 답변 리스트
  private responses = [
    { mood: "🥰", summary: "사랑스러운 하루", advice: "오늘 느낀 행복한 감정을 꼭 기억해두세요!" },
    { mood: "😢", summary: "조금 지친 하루", advice: "오늘은 따뜻한 차를 마시며 푹 쉬는 게 좋겠어요." },
    { mood: "🔥", summary: "열정적인 하루", advice: "그 열정 그대로 내일도 화이팅하세요!" },
    { mood: "☘️", summary: "평온한 하루", advice: "소소한 행복이 가장 큰 행복일 수 있어요." },
    { mood: "🤯", summary: "생각이 많은 하루", advice: "잠시 머리를 비우고 산책을 해보는 건 어떨까요?" },
    { mood: "🌈", summary: "희망찬 하루", advice: "좋은 일들이 당신을 기다리고 있을 거예요." },
    { mood: "💪", summary: "뿌듯한 하루", advice: "오늘 정말 고생 많았어요. 스스로를 칭찬해주세요." }
  ];

  async analyzeEmotion(text: string): Promise<{ mood: string; summary: string; advice: string }> {
    // AI가 생각하는 척 1.5초 기다림 (UX 효과)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 글자 수에 따라 약간의 로직 추가 (너무 짧으면 성의 있게 쓰라고 하기)
    if (text.length < 5) {
      return {
        mood: "🤔",
        summary: "너무 짧아요!",
        advice: "조금 더 자세히 이야기해주시면 제가 더 잘 이해할 수 있어요."
      };
    }

    // 랜덤으로 답변 하나 선택
    const randomIndex = Math.floor(Math.random() * this.responses.length);
    return this.responses[randomIndex];
  }
}

export const geminiService = new GeminiService();