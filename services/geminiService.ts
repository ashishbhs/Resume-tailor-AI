import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, Suggestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    atsScore: { type: Type.INTEGER, description: "Overall score from 0 to 100. If JD is provided, this is ATS match score. If not, this is General Resume Strength score. Be strict." },
    summary: { type: Type.STRING, description: "A critical summary of the resume's fit. Highlight weaknesses clearly." },
    quality: {
      type: Type.OBJECT,
      properties: {
        clarity: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Score from 0 to 10." },
            feedback: { type: Type.STRING }
          }
        },
        relevance: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Score from 0 to 10." },
            feedback: { type: Type.STRING }
          }
        },
        keywords: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Score from 0 to 10." },
            feedback: { type: Type.STRING }
          }
        },
        formatting: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Score from 0 to 10." },
            feedback: { type: Type.STRING }
          }
        }
      }
    },
    missingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of critical keywords found in the JD but missing in the resume."
    },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['rewrite', 'addition', 'removal', 'format'] },
          originalText: { type: Type.STRING, description: "The exact text snippet from the resume that needs changing. If adding new content, leave empty." },
          suggestedText: { type: Type.STRING, description: "The improved version. MUST be significantly different and better than originalText." },
          reason: { type: Type.STRING, description: "Why this change is necessary." },
          impact: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
        },
        required: ['id', 'type', 'suggestedText', 'reason', 'impact']
      }
    }
  },
  required: ['atsScore', 'summary', 'quality', 'missingKeywords', 'suggestions']
};

export const extractTextFromResume = async (fileBase64: string, mimeType: string): Promise<string> => {
  try {
    const modelId = "gemini-2.5-flash"; // Fast and good at document understanding
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: fileBase64,
              mimeType: mimeType
            }
          },
          {
            text: "Extract all text content from this resume document verbatim. Do not summarize. Maintain the structure using Markdown headers and bullet points where appropriate."
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Error extracting text:", error);
    throw new Error("Failed to parse resume file.");
  }
};

export const analyzeResume = async (resumeText: string, jdText: string): Promise<AnalysisResult> => {
  try {
    const modelId = "gemini-2.5-flash"; 
    
    const isGeneralReview = !jdText || jdText.trim() === "";

    let prompt = "";

    if (isGeneralReview) {
       prompt = `
      You are a strict, critical, and no-nonsense Resume Auditor. 
      Your goal is to provide brutal, honest feedback to elevate a candidate's resume to the top 1%.
      Do not use "friendly" filler words. Be direct and objective.

      RESUME CONTENT:
      ${resumeText}

      TASK:
      1. Conduct a ruthless audit of this resume. Look for vague statements, lack of metrics, passive voice, and poor formatting.
      2. Calculate a "Resume Strength Score" (0-100). Be strict. A generic resume without numbers should score below 50.
      3. Rate specific qualities (Clarity, Relevance, Keywords, Formatting) on a scale of 0 to 10. Be harsh.
      4. Identify missing essential elements. If skills are generic (e.g., "Communication"), flag them as weak/missing specificity.
      5. Provide specific, actionable suggestions. 
         - CRITICAL: Only suggest a rewrite if the new version is significantly better (adds a metric, changes passive to active). 
         - Do not suggest trivial wording changes (e.g., changing "Managed" to "Led" without adding context).
      6. Ensure 'originalText' in suggestions matches the resume text EXACTLY so it can be located.
      7. Ensure 'suggestedText' is the exact replacement text and is drastically improved.
      
      Return the result in JSON format matching the schema provided.
      For 'atsScore', use the Resume Strength Score.
      For 'summary', provide a critical assessment. State clearly if the resume is weak.
    `;
    } else {
       prompt = `
      You are a strict Applicant Tracking System (ATS) Auditor and Recruiter.
      Your job is to filter out candidates who do not match the Job Description (JD).
      Do not be polite. Point out exactly why the candidate would be rejected.
      
      JOB DESCRIPTION:
      ${jdText}

      RESUME CONTENT:
      ${resumeText}

      TASK:
      1. Analyze the resume against the job description.
      2. Calculate a strict ATS match score (0-100). If key hard skills from the JD are missing, the score MUST be low (<60).
      3. Rate specific qualities (Clarity, Relevance, Keywords, Formatting) on a scale of 0 to 10.
      4. Identify missing keywords from the JD. Be specific about exact phrases used in the JD.
      5. Provide specific suggestions to bridge the gap. 
         - If a bullet point is generic, rewrite it to specifically include JD keywords and potential metrics.
         - Do not suggest changes that merely swap synonyms unless it matches the JD keyword exactly.
      6. Ensure 'originalText' in suggestions matches the resume text EXACTLY.
      7. Ensure 'suggestedText' is significantly different and optimized for the JD.
      
      Return the result in JSON format matching the schema provided.
    `;
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Lower temperature for more deterministic and strict output
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to analyze resume.");
  }
};

export const autoOptimizeResume = async (currentResume: string, jdText: string, suggestions: Suggestion[]): Promise<string> => {
  try {
     const modelId = "gemini-2.5-flash";
     
     const prompt = `
     You are a precise Resume Editor.
     
     I will provide the CURRENT RESUME TEXT and a set of STRICT INSTRUCTIONS (Suggestions).
     
     YOUR TASK:
     1. Apply the suggestions to the resume text. 
     2. If a suggestion provides "Suggested Text", you MUST replace the "Original Text" with the "Suggested Text" verbatim. Do not alter the meaning of the suggestion.
     3. If the suggestion is to add keywords, find the most logical section (Skills, Core Competencies, or Summary) and add them explicitly.
     4. Do NOT re-word parts of the resume that are not targeted by suggestions unless necessary for grammar flow.
     5. IMPORTANT: When the suggestion requires a metric (e.g., "improve efficiency by X%"), you MUST replace placeholders like 'X%', '[Number]', or 'Y' with REALISTIC, PLAUSIBLE NUMBERS based on industry standards for the role (e.g., "improved efficiency by 23%", "managed budget of $50,000"). Do NOT leave abstract placeholders in the final text.
     6. Output the final result in clean, professional Markdown.
     
     CURRENT RESUME:
     ${currentResume}
     
     STRICT CHANGES TO APPLY:
     ${JSON.stringify(suggestions.map(s => `TYPE: ${s.type}. REASON: ${s.reason}. REPLACE: "${s.originalText?.substring(0, 100)}..." WITH: "${s.suggestedText}"`).join('\n'))}
     
     TARGET JD CONTEXT (for context only):
     ${jdText ? jdText.substring(0, 1000) + "..." : "N/A"}
     
     Output ONLY the full, rewritten resume text in Markdown format.
     `;

     const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || currentResume;

  } catch (error) {
    console.error("Error optimizing resume:", error);
    throw new Error("Failed to auto-optimize resume.");
  }
}
