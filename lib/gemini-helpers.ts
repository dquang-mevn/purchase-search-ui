import { GoogleGenAI } from "@google/genai";

const outputSchema = {
  type: "object",
  properties: {
    brand_jp: { type: "string" },
    brand_en: { type: "string" },
    productName_jp: { type: "string" },
    productName_en: { type: "string" },
    model_jp: { type: "string" },
    model_en: { type: "string" },
  },
  required: ["productName_jp", "productName_en"],
};

export const generateWithGemini = async (
  title: string,
  prompt: string,
  geminiApiKey: string,
): Promise<Record<string, string>> => {
  const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
  });
  const config = {
    temperature: 0,
    thinkingConfig: {
      thinkingBudget: 0,
    },
    responseMimeType: "application/json",
    responseSchema: outputSchema,
  };
  const model = "gemini-flash-lite-latest";
  const finalPrompt = prompt.replace("%s", title);
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: finalPrompt,
        },
      ],
    },
  ];
  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  let parsedResponse = {};
  try {
    parsedResponse = JSON.parse(response.text || "{}");
  } catch (error) {
    console.error(error);
  }
  return parsedResponse;
};
