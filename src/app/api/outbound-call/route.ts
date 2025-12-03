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

    // Get environment variables with fallbacks for demo
    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY || 'sk_3a94f2c969f86465ac2857b726b1c6ed863cf5775673e905';
    const alexAgentId = process.env.ALEX_AGENT_ID || 'agent_9701kbjd2yq8ftwabbm5atp4pnhc';
    const alexPhoneNumberId = process.env.ALEX_PHONE_NUMBER_ID || 'phnum_6601kbhzqsrbf9satph69pf19cpz';

    // Log environment status for debugging
    console.log('Environment variables status:', {
      hasApiKey: !!elevenlabsApiKey,
      hasAgentId: !!alexAgentId,
      hasPhoneId: !!alexPhoneNumberId,
      apiKeyLength: elevenlabsApiKey?.length || 0
    });

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
    
    console.log('Formatted transcript being sent to Alex:');
    console.log('=====================================');
    console.log(formattedTranscript);
    console.log('=====================================');
    
    console.log('Full payload to ElevenLabs:', {
      agent_id: alexAgentId,
      agent_phone_number_id: alexPhoneNumberId,
      to_number: phoneNumber.replace(/\s+/g, ''),
      conversation_initiation_client_data: outboundCallPayload.conversation_initiation_client_data
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
      debugInfo: {
        transcriptLength: formattedTranscript.length,
        transcriptPreview: formattedTranscript.substring(0, 200) + '...',
        dynamicVariables: outboundCallPayload.conversation_initiation_client_data.dynamic_variables
      }
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