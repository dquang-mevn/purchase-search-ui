import { GoogleGenAI } from "@google/genai";

export const defaultOutputSchema = {
  type: "object"
};

export const generateWithGemini = async (
  title: string,
  prompt: string,
  geminiApiKey: string,
  userCustomSchema: object,
  requiredFields: string[]
): Promise<Record<string, unknown>> => {
  const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
  });
  const outputSchema = {
    ...defaultOutputSchema,
    properties: {
      ...userCustomSchema
    },
    required: requiredFields,
  }
  console.log({outputSchema})
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
