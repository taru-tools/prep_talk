'use server'

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

interface FeedbackStructure {
  relevance: string;
  clarity: string;
  positiveAspects: string;
  areasForImprovement: string;
  suggestions: string;
}

export async function processSpeech(question: string, speech: string): Promise<string> {
  console.log("Processing speech. Question:", question, "Answer:", speech)
  
  if (!speech || speech.trim() === '') {
    return "I'm sorry, but I didn't receive any speech input. Could you please try speaking again?"
  }

  try {
    const prompt = `
      You are an expert recruiter and interview coach. Analyze the following answer to a recruiter screening question and provide constructive feedback:
      
      Question: ${question}
      Answer: ${speech}
      
      Please provide feedback in the following JSON structure:
      {
        "relevance": "Feedback on the relevance to the question",
        "clarity": "Feedback on clarity and conciseness",
        "positiveAspects": "Positive aspects of the answer",
        "areasForImprovement": "Areas for improvement",
        "suggestions": "Suggestions for better responses"
      }
      
      Keep in mind that this is for a recruiter screening call, so the feedback should focus on helping the candidate make a strong first impression and move forward in the hiring process.
      
      Ensure each feedback section is concise and limited to 2-3 sentences. Return ONLY the JSON object, without any additional text or formatting.
    `

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt,
    })

    console.log("Generated feedback:", text)

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[0] : '{}'

    // Parse the JSON response
    const feedbackStructure: FeedbackStructure = JSON.parse(jsonString)

    // Format the feedback into an HTML table
    const formattedFeedback = `
      <table class="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th class="px-4 py-2 bg-gray-100 border-b text-left">Aspect</th>
            <th class="px-4 py-2 bg-gray-100 border-b text-left">Feedback</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="px-4 py-2 border-b font-semibold">Relevance</td>
            <td class="px-4 py-2 border-b">${feedbackStructure.relevance}</td>
          </tr>
          <tr>
            <td class="px-4 py-2 border-b font-semibold">Clarity and Conciseness</td>
            <td class="px-4 py-2 border-b">${feedbackStructure.clarity}</td>
          </tr>
          <tr>
            <td class="px-4 py-2 border-b font-semibold">Positive Aspects</td>
            <td class="px-4 py-2 border-b">${feedbackStructure.positiveAspects}</td>
          </tr>
          <tr>
            <td class="px-4 py-2 border-b font-semibold">Areas for Improvement</td>
            <td class="px-4 py-2 border-b">${feedbackStructure.areasForImprovement}</td>
          </tr>
          <tr>
            <td class="px-4 py-2 border-b font-semibold">Suggestions</td>
            <td class="px-4 py-2 border-b">${feedbackStructure.suggestions}</td>
          </tr>
        </tbody>
      </table>
    `

    return formattedFeedback.trim()
  } catch (error) {
    console.error('Error processing speech:', error)
    return 'Sorry, there was an error processing your answer. Please try again.'
  }
}

