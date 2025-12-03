# Andrew Virtual Agent - Call Center Demo

A high-quality web interface to demo the "Andrew" Intelligent Virtual Agent. This is a "Web Call" application where users can speak to the agent via their browser microphone.

## Features

- **Voice Conversation**: Real-time WebRTC voice calls with the AI agent
- **Visual Feedback**: Animated Orb visualization that responds to agent speaking state
- **Live Transcription**: Real-time display of conversation transcript
- **Clean UI**: Modern, responsive interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Voice Logic**: @elevenlabs/react (Official React SDK)
- **Animations**: Framer Motion
- **Deployment**: Optimized for Vercel

## Getting Started

### Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

### Deployment

This project is optimized for Vercel deployment. Simply connect your Git repository to Vercel for automatic deployments.

## Usage

1. Click "Start Call" to begin a voice conversation
2. Allow microphone permissions when prompted
3. Speak naturally - your voice will be transcribed in real-time
4. Watch the Orb animation respond when Andrew is speaking
5. Click "End Call" to terminate the conversation

## Agent Configuration

The agent ID is configured in `src/components/CallCenter.tsx`. Update the `agentId` in the `startSession` call to connect to different ElevenLabs agents.

## Project Structure

```
src/
├── app/
│   └── page.tsx          # Main page with dynamic import
├── components/
│   └── CallCenter.tsx    # Core call center component
└── ...
```
