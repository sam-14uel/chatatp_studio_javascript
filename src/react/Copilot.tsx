import React, { useEffect, useRef } from 'react';
import '../web/index.js'; // Ensure web components are registered

export interface CopilotProps {
  agentId: string | number;
  userId?: string;
  userDisplayName?: string;
  mode?: 'popup' | 'sidebar' | 'fullscreen';
  position?: 'left' | 'right';
  themePrimary?: string;
  themeSecondary?: string;
  avatarSrc?: string;
  apiKey: string;
  baseUrl?: string;
  placeholder?: string;
}

// Custom elements in React 19+ might not need this namespace augmentation,
// or they are handled differently.
// Using @ts-ignore on the JSX tag is the simplest fallback.

export const Copilot: React.FC<CopilotProps> = ({
  agentId,
  userId = 'anonymous',
  userDisplayName = 'User',
  mode = 'popup',
  position = 'right',
  themePrimary = '#0ea5e9',
  themeSecondary = '#6366f1',
  avatarSrc = '',
  apiKey,
  baseUrl = 'http://localhost:8000',
  placeholder = ''
}) => {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.agentId = agentId.toString();
      ref.current.userId = userId;
      ref.current.userDisplayName = userDisplayName;
      ref.current.mode = mode;
      ref.current.position = position;
      ref.current.themePrimary = themePrimary;
      ref.current.themeSecondary = themeSecondary;
      ref.current.avatarSrc = avatarSrc;
      ref.current.apiKey = apiKey;
      ref.current.baseUrl = baseUrl;
      ref.current.placeholder = placeholder;
    }
  }, [agentId, userId, userDisplayName, mode, position, themePrimary, themeSecondary, avatarSrc, apiKey, baseUrl, placeholder]);

  return (
    // @ts-ignore
    <chatatp-copilot-button ref={ref}></chatatp-copilot-button>
  );
};
