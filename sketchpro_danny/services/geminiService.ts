import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    // API 키 가져오기
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    if (!apiKey) {
      console.warn("Gemini API Key is missing! Check .env.local");
    }

    // 표준 라이브러리 초기화 방식
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async analyzeDrawing(imageData: string, prompt: string): Promise<string> {
    try {
      // base64 데이터 분리
      const base64Data = imageData.split(',')[1];

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/png",
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error analyzing drawing:", error);
      return "죄송해요, 그림을 분석하는 중에 오류가 발생했어요. 다시 시도해 주세요.";
    }
  }
}

export const geminiService = new GeminiService();