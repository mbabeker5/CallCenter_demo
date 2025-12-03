'use client';

import { useConversation } from '@elevenlabs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CallCenter() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Array<{speaker: string, text: string}>>([]);

  const conversation = useConversation({
    onMessage: (message: any) => {
      // Handle incoming messages and update transcript
      console.log('Message received:', message);
      if (message.message || message.text) {
        const text = message.message || message.text;
        const speaker = message.source === 'user' || message.from === 'user' ? 'You' : 'Andrew';
        setMessages(prev => [...prev, { speaker, text }]);
      }
    }
  });

  const startCall = async () => {
    try {
      await conversation.startSession({
        agentId: 'agent_5501kbgpkf24fperjt286m6zx4xz',
        connectionType: 'webrtc',
      });
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const endCall = async () => {
    try {
      await conversation.endSession();
      setIsConnected(false);
      setMessages([]);
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const OrbVisualizer = () => (
    <motion.div
      className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 shadow-lg relative overflow-hidden"
      animate={conversation.isSpeaking ? {
        scale: [1, 1.1, 1],
        opacity: [0.8, 1, 0.8],
      } : {
        scale: 1,
        opacity: isConnected ? 0.8 : 0.4,
      }}
      transition={{
        duration: 1,
        repeat: conversation.isSpeaking ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-white/30 to-transparent" />
      {conversation.isSpeaking && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/60"
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.6, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Andrew Virtual Agent</h1>
          <p className="text-gray-600">Voice Call Demo</p>
        </div>

        {/* Orb Visualizer */}
        <div className="flex justify-center mb-8">
          <OrbVisualizer />
        </div>

        {/* Transcript Area */}
        <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-6">
          <div className="text-sm text-gray-500 mb-2">Conversation Transcript:</div>
          {messages.length === 0 ? (
            <div className="text-gray-400 italic">Start a call to see the conversation...</div>
          ) : (
            <div className="space-y-2">
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col">
                  <span className="font-medium text-xs text-gray-600">{message.speaker}:</span>
                  <span className="text-gray-800">{message.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          {!isConnected ? (
            <button
              onClick={startCall}
              disabled={conversation.status === 'connecting'}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {conversation.status === 'connecting' ? 'Connecting...' : 'Start Call'}
            </button>
          ) : (
            <>
              <button
                onClick={endCall}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                End Call
              </button>
              <button
                onClick={() => {/* TODO: Implement mute functionality */}}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Mute
              </button>
            </>
          )}
        </div>

        {/* Status */}
        <div className="text-center mt-4">
          <span className="text-sm text-gray-500">
            Status: {conversation.status || 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}