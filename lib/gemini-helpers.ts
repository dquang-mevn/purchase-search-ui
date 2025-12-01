import { GoogleGenAI } from "@google/genai";

const outputSchema = {
  type: "object",
  properties: {
    shortTitle: { type: "string" },
    productName: { type: "string" },
    brand: { type: "string" },
    model: { type: "string" },
  },
  required: ["shortTitle", "productName"],
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
