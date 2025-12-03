import { NextRequest, NextResponse } from 'next/server';

interface Message {
  speaker: string;
  text: string;
  timestamp: string;
}

interface OutboundCallRequest {
  phoneNumber: string;
  transcript: Message[];
}

function formatTranscript(messages: Message[]): string {
  const header = `=== INITIAL PHARMACOVIGILANCE CALL TRANSCRIPT ===
Date: ${new Date().toLocaleString()}
Inbound Agent: Andrew (Lydra AI)
Caller: Patient/Reporter

TRANSCRIPT:
`;
  
  const transcript = messages.map(msg => 
    `[${msg.timestamp}] ${msg.speaker}: ${msg.text}`
  ).join('\n');
  
  return header + transcript + '\n\n=== END TRANSCRIPT ===';
}

function generateCaseReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PV-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: OutboundCallRequest = await request.json();
    const { phoneNumber, transcript } = body;

    // Validate required fields
    if (!phoneNumber || !transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: 'Missing required fields: phoneNumber and transcript' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Format the transcript for Alex
    const formattedTranscript = formatTranscript(transcript);
    const caseReference = generateCaseReference();

    // Get environment variables
    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
    const alexAgentId = process.env.ALEX_AGENT_ID;
    const alexPhoneNumberId = process.env.ALEX_PHONE_NUMBER_ID;

    // Validate environment variables
    if (!elevenlabsApiKey || !alexAgentId || !alexPhoneNumberId) {
      console.error('Missing required environment variables:', {
        hasApiKey: !!elevenlabsApiKey,
        hasAgentId: !!alexAgentId,
        hasPhoneId: !!alexPhoneNumberId
      });
      
      return NextResponse.json(
        { error: 'Server configuration error. Missing required credentials.' },
        { status: 500 }
      );
    }

    // Prepare the payload for ElevenLabs API
    const outboundCallPayload = {
      agent_id: alexAgentId,
      agent_phone_number_id: alexPhoneNumberId,
      to_number: phoneNumber.replace(/\s+/g, ''), // Remove spaces
      conversation_initiation_client_data: {
        dynamic_variables: {
          initial_call_transcript: formattedTranscript,
          call_date: new Date().toISOString(),
          case_reference: caseReference
        }
      }
    };

    console.log('Initiating outbound call:', {
      phoneNumber: phoneNumber,
      caseReference: caseReference,
      transcriptLength: formattedTranscript.length,
      agentId: alexAgentId
    });

    // Make the API call to ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound-call', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(outboundCallPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ElevenLabs API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to initiate outbound call',
          details: `API returned ${response.status}: ${response.statusText}`
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    console.log('Outbound call initiated successfully:', {
      caseReference: caseReference,
      callId: result.conversation_id || 'unknown'
    });

    return NextResponse.json({
      success: true,
      caseReference: caseReference,
      callId: result.conversation_id,
      message: 'Follow-up call initiated successfully',
      transcript: formattedTranscript // For debugging, remove in production
    });

  } catch (error) {
    console.error('Outbound call API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}