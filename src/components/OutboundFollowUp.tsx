'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneIcon, PhoneArrowUpRightIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface Message {
  speaker: string;
  text: string;
  timestamp: string;
}

interface OutboundFollowUpProps {
  messages: Message[];
  onCallInitiated?: (caseReference: string) => void;
}

interface CallStatus {
  status: 'idle' | 'initiating' | 'success' | 'error';
  message?: string;
  caseReference?: string;
}

export default function OutboundFollowUp({ messages, onCallInitiated }: OutboundFollowUpProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatus>({ status: 'idle' });

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation for US/International numbers
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.trim());
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters except +
    return phone.replace(/[^\d+]/g, '');
  };

  const initiateFollowUpCall = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setCallStatus({
        status: 'error',
        message: 'Please enter a valid phone number'
      });
      return;
    }

    if (messages.length === 0) {
      setCallStatus({
        status: 'error',
        message: 'No transcript available for follow-up'
      });
      return;
    }

    setCallStatus({ status: 'initiating', message: 'Initiating follow-up call...' });

    try {
      const response = await fetch('/api/outbound-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formatPhoneNumber(phoneNumber),
          transcript: messages
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCallStatus({
          status: 'success',
          message: 'Follow-up call initiated successfully!',
          caseReference: result.caseReference
        });
        
        onCallInitiated?.(result.caseReference);
        
        // Reset form after successful call
        setTimeout(() => {
          setPhoneNumber('');
          setCallStatus({ status: 'idle' });
        }, 5000);
      } else {
        setCallStatus({
          status: 'error',
          message: result.error || 'Failed to initiate follow-up call'
        });
      }
    } catch (error) {
      console.error('Error initiating follow-up call:', error);
      setCallStatus({
        status: 'error',
        message: 'Network error. Please try again.'
      });
    }
  };

  const getStatusIcon = () => {
    switch (callStatus.status) {
      case 'initiating':
        return <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      default:
        return <PhoneArrowUpRightIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (callStatus.status) {
      case 'initiating':
        return 'from-yellow-500 to-orange-600';
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'error':
        return 'from-red-500 to-pink-600';
      default:
        return 'from-purple-500 to-indigo-600';
    }
  };

  if (messages.length === 0) {
    return null; // Don't show if no transcript available
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10"
    >
      <div className="flex items-center gap-3 mb-4">
        <PhoneIcon className="w-6 h-6 text-purple-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Follow-Up Call</h3>
          <p className="text-white/60 text-sm">Initiate Alex follow-up call for missing information</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-white/70 mb-2">
            Patient Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1 (555) 123-4567"
            disabled={callStatus.status === 'initiating'}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        <motion.button
          onClick={initiateFollowUpCall}
          disabled={!phoneNumber.trim() || callStatus.status === 'initiating'}
          className={`w-full bg-gradient-to-r ${getStatusColor()} hover:opacity-90 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg`}
          whileHover={{ scale: callStatus.status === 'initiating' ? 1 : 1.02 }}
          whileTap={{ scale: callStatus.status === 'initiating' ? 1 : 0.98 }}
        >
          {getStatusIcon()}
          {callStatus.status === 'initiating' ? 'Initiating Call...' : 'Initiate Follow-Up Call'}
        </motion.button>

        <AnimatePresence>
          {callStatus.message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-3 rounded-lg ${
                callStatus.status === 'success' 
                  ? 'bg-green-500/20 border border-green-400/30 text-green-300'
                  : callStatus.status === 'error'
                  ? 'bg-red-500/20 border border-red-400/30 text-red-300'
                  : 'bg-blue-500/20 border border-blue-400/30 text-blue-300'
              }`}
            >
              <p className="text-sm font-medium">{callStatus.message}</p>
              {callStatus.caseReference && (
                <p className="text-xs mt-1 opacity-80">
                  Case Reference: {callStatus.caseReference}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-sm font-medium text-white/80 mb-2">How it works:</h4>
          <ul className="text-xs text-white/60 space-y-1">
            <li>• Alex will call the provided number</li>
            <li>• He has full context from Andrew's initial call</li>
            <li>• He'll ask only for missing or unclear information</li>
            <li>• Complete pharmacovigilance follow-up process</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}