import React, { useEffect, useMemo, useRef } from 'react';
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
  statusText?: string;
  inputPlaceholder?: string;
  emptyHeading?: string;
  emptySubheading?: string;
  quickActions?: Array<{ icon?: React.ReactNode; iconHtml?: string; title: string; subtitle: string; prompt: string }>;
  fullscreenUrl?: string;
  sidebarTarget?: string;
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'chatatp-copilot-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { ref?: React.Ref<any> };
    }
  }
}

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
  placeholder = '',
  statusText = 'Ask anything about your agents, platforms or tools.',
  inputPlaceholder = 'Ask the copilot...',
  emptyHeading = 'What are we building today?',
  emptySubheading = 'Ask me anything, or pick a starting point below.',
  quickActions = [],
  fullscreenUrl = '',
  sidebarTarget = 'body'
}) => {
  const ref = useRef<any>(null);

  const normalizedQuickActions = useMemo(() => quickActions.map((action, index) => ({
    ...action,
    icon: undefined,
    iconSlot: action.icon ? `quick-action-icon-${index}` : undefined
  })), [quickActions]);

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
      ref.current.statusText = statusText;
      ref.current.inputPlaceholder = inputPlaceholder;
      ref.current.emptyHeading = emptyHeading;
      ref.current.emptySubheading = emptySubheading;
      ref.current.quickActions = normalizedQuickActions;
      ref.current.fullscreenUrl = fullscreenUrl;
      ref.current.sidebarTarget = sidebarTarget;
    }
  }, [agentId, userId, userDisplayName, mode, position, themePrimary, themeSecondary, avatarSrc, apiKey, baseUrl, placeholder, statusText, inputPlaceholder, emptyHeading, emptySubheading, normalizedQuickActions, fullscreenUrl, sidebarTarget]);

  return (
    <chatatp-copilot-button ref={ref}>
      {quickActions.map((action, index) => action.icon ? (
        <span key={index} slot={`quick-action-icon-${index}`}>
          {action.icon}
        </span>
      ) : null)}
    </chatatp-copilot-button>
  );
};
