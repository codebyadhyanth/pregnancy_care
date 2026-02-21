import axios from 'axios';
import "dotenv/config";
import User from "../models/user.model.js";
import Tracking from "../models/tracking.model.js";
import Nutrition from "../models/nutrition.model.js";
import Exercise from "../models/exercise.model.js";
import Transaction from "../models/transaction.model.js";

const OLLAMA_API_BASE = process.env.OLLAMA_API_BASE || 'https://ollama.com/api';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

/**
 * Build the Janani AI system prompt based on mother context and response mode.
 */
const buildSystemPrompt = (context, responseMode, language, includeSlang) => {

  const languageNames = {
    en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', kn: 'Kannada',
    ml: 'Malayalam', bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati',
    pa: 'Punjabi', or: 'Odia', as: 'Assamese',
  };
  const langName = languageNames[language] || 'English';

  const baseContext = `You are Janani AI, a maternal welfare assistant helping Indian mothers.

Mother Details:
- Name: ${context.name || 'Not provided'}
- Age: ${context.age || 'Not provided'}
- State: ${context.state || 'Not provided'}
- Income Category: ${context.incomeCategory || 'Not provided'}
- Pregnancy Stage: Week ${context.pregnancyWeek || 'N/A'}
- Applied Schemes: ${context.appliedSchemes || 'None'}
- Bank Verification: ${context.bankVerified ? 'Verified' : 'Not verified'}

Health Data:
- Latest Weight: ${context.latestWeight}
- Water Intake: ${context.waterIntake}
- Recent Symptoms: ${context.recentSymptoms}
- Recent Nutrition: ${context.recentNutrition}
- Recent Exercise: ${context.recentExercise}

Instructions:
- Provide structured, clear, empathetic guidance.
- Avoid jargon.
- Keep answers crisp.
- If medical advice is asked, give general safe info only.
- Prioritize actionable steps.
- Do NOT log or expose sensitive personal information.`;

  let formatInstructions = '';

  if (responseMode === 'curated') {
    formatInstructions = `
RESPONSE FORMAT RULES:
1. Respond ONLY in valid JSON. Do NOT use markdown code blocks.
2. Structure:
{
  "title": "Brief title of the response",
  "summary": "2-3 sentence summary",
  "eligibility": ["criterion 1", "criterion 2"],
  "benefits": ["benefit 1", "benefit 2"],
  "steps_to_apply": ["step 1", "step 2"],
  "documents_required": ["document 1"],
  "important_notes": ["note 1"],
  "state_specific_info": ["info 1"],
  "warnings": ["warning if any"]
}
3. Omit empty arrays.
4. Keep it concise and helpful.`;
  } else {
    formatInstructions = `
RESPONSE FORMAT RULES:
1. Respond ONLY in valid JSON. Do NOT use markdown code blocks.
2. Structure:
{
  "analysis": "Brief analysis of the situation based on week/symptoms",
  "possibleReasons": ["Reason 1", "Reason 2"],
  "missedFactors": ["Did you drink enough water?", "Did you eat...?"],
  "recommendations": ["Action 1", "Action 2"],
  "whenToSeeDoctor": "Specific warning signs to watch for"
}
3. Keep it concise, empathetic, and medically sound.`;
  }

  let languageInstructions = '';
  if (language !== 'en') {
    languageInstructions = `\n\nIMPORTANT LANGUAGE INSTRUCTION: Respond in ${langName}. All text values in the JSON must be in ${langName} script. Keep JSON keys in English.`;
    if (includeSlang) {
      languageInstructions += ` Use respectful, warm, regional ${langName} tone and commonly understood local phrases where appropriate. Never use offensive slang.`;
    }
  }

  return baseContext + formatInstructions + languageInstructions;
};

export const generateOllamaResponse = async (req, res) => {
  try {
    const { model = "gpt-oss:120b", query, responseMode = 'full', language = 'en', includeSlang = false } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "query is required (string)" });
    }

    // 1. Fetch Context (enriched for Janani AI)
    const user = await User.findById(req.user._id);
    const recentTracking = await Tracking.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const recentNutrition = await Nutrition.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(3);
    const recentExercise = await Exercise.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(1);

    // Fetch applied schemes (new)
    let appliedSchemes = 'None';
    try {
      const transactions = await Transaction.find({ mother: req.user._id });
      if (transactions.length > 0) {
        appliedSchemes = transactions.map(t => t.schemeName).join(', ');
      }
    } catch {
      // If Transaction model not ready yet, skip
    }

    // 2. Build enriched context
    const context = {
      name: user.name,
      age: user.profile?.age,
      state: user.currentDistrict || user.profile?.state,
      incomeCategory: user.profile?.incomeCategory,
      pregnancyWeek: user.pregnancyWeek,
      appliedSchemes,
      bankVerified: false, // can be extended later
      profile: user.profile,
      latestWeight: recentTracking?.motherWeight || "Not logged",
      waterIntake: recentTracking?.waterIntakeLiters || "Not logged",
      recentSymptoms: recentTracking?.symptoms?.join(", ") || "None",
      recentNutrition: recentNutrition.map(n => n.foodEntry).join("; "),
      recentExercise: recentExercise[0]?.activity || "None"
    };

    // 3. Construct System Prompt
    const systemInstruction = buildSystemPrompt(context, responseMode, language, includeSlang);
    const prompt = `USER QUESTION: ${query}`;

    // 4. Call Ollama
    const response = await axios.post(
      `${OLLAMA_API_BASE}/generate`,
      {
        model,
        system: systemInstruction,
        prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.3
        }
      },
      {
        headers: {
          Authorization: `Bearer ${OLLAMA_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    const result = response.data;
    let parsedResponse = {};

    try {
      const jsonMatch = result.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(result.response);
      }
    } catch {
      // Fallback: wrap raw text in appropriate format
      if (responseMode === 'curated') {
        parsedResponse = {
          title: "Response",
          summary: result.response || "I couldn't format the response correctly.",
          eligibility: [],
          benefits: [],
          steps_to_apply: [],
          documents_required: [],
          important_notes: [],
          state_specific_info: [],
          warnings: []
        };
      } else {
        parsedResponse = {
          analysis: "I couldn't format the response correctly, but here is my thought process.",
          recommendations: [result.response],
          possibleReasons: [],
          missedFactors: [],
          whenToSeeDoctor: "Please consult your doctor."
        };
      }
    }

    res.json(parsedResponse);

  } catch (error) {
    res.status(500).json({
      error: "AI Service Error",
      details: error.response?.data || error.message
    });
  }
};

export default { generateOllamaResponse };
