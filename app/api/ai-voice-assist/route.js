import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { transcript } = await req.json();

    if (!transcript || transcript.trim().length < 10) {
      return NextResponse.json({ 
        suggestions: [],
        alerts: [],
        labelsItems: []
      });
    }

    console.log('AI Assistant analyzing with Swisscom...');

    const lowerTranscript = transcript.toLowerCase();

    const prompt = `You are a Swiss banking assistant. Read the transcript and assign multi-label tasks strictly from ["plan_contact","schedule_meeting","update_contact_info_non_postal","update_contact_info_postal_address","update_kyc_activity","update_kyc_origin_of_assets","update_kyc_purpose_of_businessrelation","update_kyc_total_assets"].

Conversation: "${transcript}"

Guidelines:
- Use a label only when the transcript contains actionable evidence to log in the bank system.
- Evidence threshold: the client explicitly provides new/changed info OR the advisor explicitly states that such info has been updated/recorded in the bank system (e.g., confirms it is set/updated/corrected/recorded). 
- Mere identity/security verification does not qualify. Avoid speculative positives.
- If evidence is not explicit, return [].
- Optimize for precision first, recall second.

Quick criteria:
- plan_contact: explicit mutual agreement to future outbound contact (e.g., callback/email) without a concrete date/time. Must include a clear client request/consent and acknowledgment of the channel. Offers or generic promises (e.g., "we will update you") without acceptance do not qualify.
- schedule_meeting: a specific calendar date and time are fixed for a meeting either by explicit agreement OR the advisor states it is (being) scheduled/booked at that date/time (a clear booking, not a tentative question). Exclude proposals/questions awaiting confirmation.
- update_contact_info_non_postal: explicit change/set of phone, email, or digital contact details OR communication preferences provided by the client or confirmed by the advisor as updated in the system. Exclude cases where a channel is used only to send materials without stating a profile update; exclude mere verification.
- update_contact_info_postal_address: explicit new/corrected postal address provided OR advisor confirmation that the postal address was updated/corrected in the system. Exclude mere verification.
- update_kyc_activity: explicit new/changed employment status or income source details provided/confirmed, or advisor confirmation it was recorded.
- update_kyc_origin_of_assets: explicit non-recurring origin of funds (inheritance, gift, asset sale, etc.) stated by the client or advisor confirmation it was captured/recorded.
- update_kyc_purpose_of_businessrelation: explicit statement of the purpose for using banking services (payments, savings, investments, pension, trading, etc.) provided by the client OR advisor confirmation that this purpose was set/updated/recorded.
- update_kyc_total_assets: explicit total assets amount or breakdown provided by either party and confirmed as correct OR advisor confirmation that these total assets were set/updated/recorded in KYC.

Output strictly valid JSON of the form {"labelsItems": [...]} with only allowed labels and no additional text.`;

    // Primary: Try Swisscom API (optimized for speed)
    try {
      const response = await fetch("https://api.swisscom.com/layer/swiss-ai-weeks/apertus-70b/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SWISS_AI_PLATFORM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'swiss-ai/Apertus-70B',
          max_tokens: 600, // Optimized length
          temperature: 0.6, // Balanced creativity/speed
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      console.log('Swisscom API Status:', response.status);

      if (response.ok) {
        const data = await response.json();
        let aiResponse = data.choices?.[0]?.message?.content;

        if (aiResponse?.startsWith("```")) {
          aiResponse = aiResponse.replace(/```json|```/g, "").trim();
        }

        if (aiResponse) {
          try {
            const analysis = JSON.parse(aiResponse);
            console.log('Swisscom Analysis Success');
            
            return NextResponse.json({
              ...analysis,
              apiSource: 'swisscom'
            });
          } catch (parseError) {
            console.log('Swisscom JSON parse error, using intelligent fallback');
          }
        }
      } else {
        console.log('Swisscom API failed with status:', response.status);
      }
    } catch (apiError) {
      console.log('Swisscom API error:', apiError.message);
    }

    // Fallback: Intelligent local analysis (only if API fails)
    console.log('Using intelligent fallback analysis...');
    const fallbackAnalysis = createIntelligentFallback(transcript);
    
    return NextResponse.json({
      ...fallbackAnalysis,
      apiSource: 'fallback'
    });

  } catch (error) {
    console.error('Assistant error:', error);
    return NextResponse.json({ 
      suggestions: ["Continue providing professional support to the client"],
      alerts: [],
      labelsItems: []
    });
  }
}


function createIntelligentFallback(transcript) {
  const lowerTranscript = transcript.toLowerCase();
  
  // More nuanced analysis than simple keywords
  let suggestions = [];
  let alerts = [];
  let labelsItems = [];

  // Complex emotional analysis
  if (lowerTranscript.includes('nervous') || lowerTranscript.includes('worried')) {
     {
      alerts.push("Client expressing general anxiety - provide supportive guidance");
      suggestions.push("Show empathy: 'I can hear that you're feeling uncertain about some things'");
      suggestions.push("Explore specifics: 'What particular aspects are causing you the most concern?'");
    }
  }

  if (lowerTranscript.includes('sell') && (lowerTranscript.includes('everything') || lowerTranscript.includes('all'))) {
    alerts.push("URGENT: Client considering major portfolio liquidation - immediate intervention required");
    suggestions.push("Pause the conversation: 'Before we discuss any major changes, help me understand what's driving this decision'");
    suggestions.push("Assess urgency: 'Is this about immediate financial needs or concerns about market performance?'");
    suggestions.push("Provide alternatives: 'Let's explore all your options before making irreversible decisions'");
    labelsItems.push("Emergency consultation within 24 hours to review alternatives");
  }

  // Conversation quality improvements
  if (lowerTranscript.includes('understand') || lowerTranscript.includes('explain')) {
    suggestions.push("Use clear, jargon-free language to explain concepts");
    suggestions.push("Provide concrete examples relevant to their situation");
    suggestions.push("Check understanding: 'Does this explanation make sense, or would a different approach be helpful?'");
  }

  // Default professional guidance
  if (suggestions.length === 0) {
    suggestions = [
      "Practice active listening to fully understand their perspective and concerns",
      "Ask open-ended questions that encourage them to share more about their situation",
      "Provide specific, actionable guidance tailored to their individual circumstances"
    ];
  }

  return { suggestions, alerts, labelsItems };
}