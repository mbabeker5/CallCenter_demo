Act as a Senior Frontend Engineer and Next.js Expert.

I need you to build a high-quality web interface to demo my "Andrew" Intelligent Virtual Agent. This will be a "Web Call" application where the user speaks to the agent via their browser microphone.

### **Project Architecture & Stack**
* **Framework:** Next.js 14+ (App Router)
* **Deployment Target:** Vercel (Ensure code is optimized for Vercel Edge/Serverless)
* **Styling:** Tailwind CSS
* **Voice Logic:** `@elevenlabs/react` (Official React SDK)
* **Visuals:** ElevenLabs UI (via `framer-motion` and `shadcn` patterns)

### **Documentation & Truth Source**
You must strictly follow the patterns in these documentation sources to avoid hallucinating invalid methods:
1.  **React SDK Docs:** `https://elevenlabs.io/docs/agents-platform/libraries/react`
    * *Key Focus:* Use the `useConversation` hook.
2.  **UI Components Docs:** `https://ui.elevenlabs.io/`
    * *Key Focus:* Implementation of the `<Orb />` or visualizers.

### **Core Features Required**
1.  **Connection Manager:** A clean "Start Call" / "End Call" button interface.
2.  **Visual Feedback:** When the agent is speaking, display the dynamic "Orb" animation to show the agent is alive.
3.  **Real-Time Transcription:**
    * You must utilize the `message` or `transcript` state from the `useConversation` hook.
    * Display a scrolling chat window below the visualizer that updates in real-time as the user and agent speak.
    * Label the speakers as "You" and "Andrew".

### **Implementation Steps**
**Step 1: Setup**
Initialize a Next.js App Router project. Install `@elevenlabs/react` and `framer-motion`.

**Step 2: The Agent Hook**
Create a custom hook or component that implements `useConversation`.
* Configure it to connect to my Public Agent ID (I will provide this shortly).
* Ensure it handles microphone permissions gracefully.

**Step 3: The UI Layout**
Build a centered card layout:
* **Top:** The Agent Visualization (Orb).
* **Middle:** The Transcript/Chat Log (Scrollable area).
* **Bottom:** Control Buttons (Start/Stop, Mute).

**Step 4: Vercel Prep**
Ensure the `next.config.js` and `package.json` are ready for a zero-config deployment to Vercel.

### **Strict Constraints (DO NOT DO)**
* **DO NOT** use `react-native` (This is a web app).
* **DO NOT** use the Vercel AI SDK (Use the specific ElevenLabs SDK).
* **DO NOT** attempt to build a Python backend. Use the client-side SDK directly.
* **DO NOT** use Twilio. This is a browser-based audio call.

I am ready to provide my Agent ID. Please ask me for it, then generate the code.