import { defineComponent, h, onMounted, ref, watch } from 'vue';
import '../web/index.js'; // Ensure web components are registered

export const Copilot = defineComponent({
  name: 'Copilot',
  props: {
    agentId: { type: [String, Number], required: true },
    userId: { type: String, default: 'anonymous' },
    userDisplayName: { type: String, default: 'User' },
    mode: { type: String, default: 'popup' },
    position: { type: String, default: 'right' },
    themePrimary: { type: String, default: '#0ea5e9' },
    themeSecondary: { type: String, default: '#6366f1' },
    themeMode: { type: String, default: 'light' },
    avatarSrc: { type: String, default: '' },
    apiKey: { type: String, required: true },
    baseUrl: { type: String, default: 'http://localhost:8000' },
    placeholder: { type: String, default: '' },
    statusText: { type: String, default: 'Ask anything about your agents, platforms or tools.' },
    inputPlaceholder: { type: String, default: 'Ask the copilot...' },
    emptyHeading: { type: String, default: 'What are we building today?' },
    emptySubheading: { type: String, default: 'Ask me anything, or pick a starting point below.' },
    quickActions: { type: Array, default: () => [] },
    fullscreenUrl: { type: String, default: '' },
    sidebarTarget: { type: String, default: 'body' }
  },
  setup(props: any) {
    const copilotRef = ref<any>(null);

    const updateProps = () => {
      if (copilotRef.value) {
        copilotRef.value.agentId = props.agentId.toString();
        copilotRef.value.userId = props.userId;
        copilotRef.value.userDisplayName = props.userDisplayName;
        copilotRef.value.mode = props.mode;
        copilotRef.value.position = props.position;
        copilotRef.value.themePrimary = props.themePrimary;
        copilotRef.value.themeSecondary = props.themeSecondary;
        copilotRef.value.themeMode = props.themeMode;
        copilotRef.value.avatarSrc = props.avatarSrc;
        copilotRef.value.apiKey = props.apiKey;
        copilotRef.value.baseUrl = props.baseUrl;
        copilotRef.value.placeholder = props.placeholder;
        copilotRef.value.statusText = props.statusText;
        copilotRef.value.inputPlaceholder = props.inputPlaceholder;
        copilotRef.value.emptyHeading = props.emptyHeading;
        copilotRef.value.emptySubheading = props.emptySubheading;
        copilotRef.value.quickActions = props.quickActions;
        copilotRef.value.fullscreenUrl = props.fullscreenUrl;
        copilotRef.value.sidebarTarget = props.sidebarTarget;
      }
    };

    onMounted(updateProps);
    watch(props, updateProps, { deep: true });

    return () => h('chatatp-copilot-button', { ref: copilotRef });
  }
});
