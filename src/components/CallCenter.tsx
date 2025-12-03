'use client';

import { useConversation } from '@elevenlabs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneIcon, PhoneXMarkIcon, MicrophoneIcon, DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import Orb3D from './Orb3D';
import AudioVisualizer from './AudioVisualizer';
import OutboundFollowUp from './OutboundFollowUp';

export default function CallCenter() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Array<{speaker: string, text: string, timestamp: string}>>([]);
  const [lastCallTranscript, setLastCallTranscript] = useState<Array<{speaker: string, text: string, timestamp: string}>>([]);

  const conversation = useConversation({
    onMessage: (message: any) => {
      // Handle incoming messages and update transcript
      console.log('Message received:', message);
      if (message.message || message.text) {
        const text = message.message || message.text;
        const speaker = message.source === 'user' || message.from === 'user' ? 'You' : 'Andrew';
        const timestamp = new Date().toLocaleTimeString();
        setMessages(prev => [...prev, { speaker, text, timestamp }]);
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
      // Save current transcript before clearing
      if (messages.length > 0) {
        setLastCallTranscript([...messages]);
      }
      
      await conversation.endSession();
      setIsConnected(false);
      setMessages([]);
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const downloadTranscript = () => {
    const transcriptToDownload = messages.length > 0 ? messages : lastCallTranscript;
    
    if (transcriptToDownload.length === 0) {
      alert('No transcript available to download.');
      return;
    }

    // Create transcript content
    const transcriptContent = transcriptToDownload
      .map(msg => `[${msg.timestamp}] ${msg.speaker}: ${msg.text}`)
      .join('\n');

    // Add header
    const fullContent = `Andrew Virtual Agent - Call Transcript
Generated on: ${new Date().toLocaleString()}
Call Duration: ${transcriptToDownload.length} messages
================================================

${transcriptContent}

================================================
End of Transcript`;

    // Create and download file
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `andrew-call-transcript-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getConnectionStatus = () => {
    if (conversation.status === 'connecting') return 'Connecting...';
    if (isConnected && conversation.isSpeaking) return 'Andrew is speaking';
    if (isConnected) return 'Connected - Listening';
    return 'Ready to connect';
  };

  const getStatusColor = () => {
    if (conversation.status === 'connecting') return 'text-yellow-500';
    if (isConnected && conversation.isSpeaking) return 'text-green-500';
    if (isConnected) return 'text-blue-500';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-lg w-full border border-white/20"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Andrew</h1>
          <p className="text-white/70 text-lg">Pharmacovigilance Virtual Agent</p>
          <p className="text-white/50 text-sm">by Lydra AI</p>
          <div className={`mt-3 text-sm font-medium ${getStatusColor()}`}>
            {getConnectionStatus()}
          </div>
        </motion.div>

        {/* 3D Orb Visualizer */}
        <motion.div 
          className="mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Orb3D isSpeaking={conversation.isSpeaking} isConnected={isConnected} />
        </motion.div>

        {/* Audio Visualizer */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <AudioVisualizer isSpeaking={conversation.isSpeaking} isActive={isConnected} />
        </motion.div>

        {/* Transcript Area */}
        <motion.div 
          className="bg-white/5 backdrop-blur rounded-2xl p-6 h-64 overflow-y-auto mb-6 border border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-sm text-white/60 mb-4 font-medium">Live Transcript</div>
          {messages.length === 0 && lastCallTranscript.length === 0 ? (
            <div className="text-white/40 italic text-center py-8">Start a conversation to see live transcript...</div>
          ) : messages.length === 0 && lastCallTranscript.length > 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-blue-400 mb-2">✓ Previous conversation saved</div>
              <div className="text-white/40 italic">Ready for new conversation...</div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div 
                  key={index} 
                  className={`p-3 rounded-lg ${
                    message.speaker === 'You' 
                      ? 'bg-blue-500/20 ml-4 border-l-2 border-blue-400' 
                      : 'bg-green-500/20 mr-4 border-l-2 border-green-400'
                  }`}
                  initial={{ opacity: 0, x: message.speaker === 'You' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={`font-semibold text-xs ${
                      message.speaker === 'You' ? 'text-blue-300' : 'text-green-300'
                    }`}>
                      {message.speaker}
                    </span>
                    <span className="text-xs text-white/40">{message.timestamp}</span>
                  </div>
                  <span className="text-white/90 leading-relaxed">{message.text}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Control Buttons */}
        <motion.div 
          className="flex gap-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {!isConnected ? (
            <motion.button
              onClick={startCall}
              disabled={conversation.status === 'connecting'}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PhoneIcon className="w-5 h-5" />
              {conversation.status === 'connecting' ? 'Connecting...' : 'Start Call'}
            </motion.button>
          ) : (
            <>
              <motion.button
                onClick={endCall}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PhoneXMarkIcon className="w-5 h-5" />
                End Call
              </motion.button>
              <motion.button
                onClick={() => {/* TODO: Implement mute functionality */}}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all duration-300 border border-white/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </motion.div>

        {/* Download Section */}
        {(messages.length > 0 || lastCallTranscript.length > 0) && (
          <motion.div 
            className="border-t border-white/10 pt-6 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              onClick={downloadTranscript}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 border border-white/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Download Transcript
            </motion.button>
          </motion.div>
        )}

        {/* Outbound Follow-Up Section */}
        {!isConnected && (messages.length > 0 || lastCallTranscript.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6"
          >
            <OutboundFollowUp 
              messages={messages.length > 0 ? messages : lastCallTranscript}
              onCallInitiated={(caseRef) => {
                console.log('Follow-up call initiated:', caseRef);
                // You can add additional handling here if needed
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}