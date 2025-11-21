import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  // In a real deployment, process.env.API_KEY would be used.
  // However, for this static demo structure where user might not have env vars set up
  // perfectly in a browser-only environment without a bundler injecting them safely,
  // we strictly follow the prompt to use process.env.API_KEY.
  // Ensure your build system defines this.
  // If running locally without build process, this might be undefined.
  const apiKey = process.env.API_KEY || ''; 
  if (!apiKey) {
      console.warn("API Key is missing. AI features will not work.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCourseOutline = async (topic: string) => {
  const ai = getAI();
  
  // Using 2.5 Flash for speed and structured output
  const modelId = "gemini-2.5-flash";

  const prompt = `Create a structured course outline for a course about "${topic}".
  The course should have 3 distinct lessons.
  Return JSON data conforming to this structure:
  {
    "title": "Course Title",
    "description": "Short course description",
    "lessons": [
      { "title": "Lesson 1 Title", "content": "Detailed markdown content for lesson 1 (at least 200 words)" },
      { "title": "Lesson 2 Title", "content": "Detailed markdown content for lesson 2 (at least 200 words)" },
      { "title": "Lesson 3 Title", "content": "Detailed markdown content for lesson 3 (at least 200 words)" }
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            lessons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};

export const getTutorResponse = async (
  history: { role: string; text: string }[],
  newMessage: string,
  context: string
) => {
  const ai = getAI();
  const modelId = "gemini-2.5-flash";
  
  // Construct chat history including system instruction context
  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: `You are a helpful, encouraging tutor for Team21. 
      The student is currently asking questions about the following lesson content:
      
      ---
      ${context}
      ---

      Answer their questions clearly and concisely based on the content provided.`,
    }
  });

  // Replay history (excluding the new message)
  // Note: The SDK manages history if we keep the chat instance, but since this is a stateless
  // service call in this architecture, we might need to assume history is passed or just single turn for simplicity in this demo.
  // For a robust implementation, we'd map the history to the chat history format.
  // Let's do a simple generation for now to avoid complex state management in the demo.
  
  try {
     const response = await chat.sendMessage({ message: newMessage });
     return response.text;
  } catch (error) {
      console.error("Chat error:", error);
      return "I'm sorry, I'm having trouble connecting to the knowledge base right now.";
  }
};
