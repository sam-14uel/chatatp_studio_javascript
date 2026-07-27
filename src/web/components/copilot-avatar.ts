import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('chatatp-copilot-avatar')
export class CopilotAvatar extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      position: relative;
    }
    
    .interactive {
      cursor: pointer;
    }

    /* Animations */
    @keyframes idle-float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-3px) rotate(-1deg); }
    }
    @keyframes spin {
      0%   { transform: rotate(0deg) scale(1); }
      35%  { transform: rotate(190deg) scale(0.86); }
      65%  { transform: rotate(360deg) scale(1.08); }
      100% { transform: rotate(360deg) scale(1); }
    }
    @keyframes chuckle {
      0%, 100% { transform: translateY(0) scaleY(1); }
      25%      { transform: translateY(1px) scaleY(0.94); }
      50%      { transform: translateY(-2px) scaleY(1.03); }
      75%      { transform: translateY(1px) scaleY(0.96); }
    }
    @keyframes antenna-pulse {
      0%, 100% { opacity: 0.55; r: 2.6; }
      50%      { opacity: 1;    r: 3.4; }
    }
    @keyframes sparkle-pop {
      0%   { opacity: 1; transform: translate(0,0) scale(0.4); }
      100% { opacity: 0; transform: translate(var(--sx), var(--sy)) scale(1); }
    }
    @keyframes wave-tilt {
      0%, 100% { transform: rotate(0deg); }
      20%      { transform: rotate(-8deg); }
      40%      { transform: rotate(6deg); }
      60%      { transform: rotate(-4deg); }
      80%      { transform: rotate(2deg); }
    }
    @keyframes fire-flicker {
      0%, 100% { opacity: 0.5;  transform: scale(0.95) translateY(0); }
      25%      { opacity: 0.85; transform: scale(1.06) translateY(-1px); }
      50%      { opacity: 0.6;  transform: scale(0.97) translateY(1px); }
      75%      { opacity: 0.9;  transform: scale(1.1)  translateY(-1px); }
    }
    @keyframes fire-in  { from { opacity: 0; } to { opacity: 1; } }
    @keyframes bubble-rise {
      0%   { transform: translateY(0) scale(0.4); opacity: 0; }
      18%  { opacity: 0.75; }
      100% { transform: translateY(-30px) scale(1); opacity: 0; }
    }

    .idle-float { animation: idle-float 3.4s ease-in-out infinite; }
    .spin-active { animation: spin 0.62s cubic-bezier(.34,1.56,.64,1) 1; }
    .chuckle-active { animation: chuckle 0.5s ease-in-out 1; }
    .antenna-orb { animation: antenna-pulse 2.2s ease-in-out infinite; }
    .antenna-alert { animation-duration: 0.9s; }
    .wave-tilt {
      animation: wave-tilt 0.7s ease-in-out;
      transform-origin: 50% 85%;
    }
    .mouth-shape { transition: opacity 0.18s ease; }

    .fire-aura {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(255,150,60,0.55) 0%,
        rgba(255,90,30,0.28) 45%,
        rgba(255,60,0,0) 75%);
      animation: fire-flicker 0.9s ease-in-out infinite, fire-in 0.5s ease-out;
    }

    .bubble {
      position: absolute;
      bottom: 0;
      border-radius: 50%;
      background: rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.4);
      border: 1px solid rgba(var(--chatatp-secondary-rgb, 99, 102, 241), 0.5);
      pointer-events: none;
      animation: bubble-rise 2.1s ease-in forwards;
    }

    .sparkle {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--chatatp-secondary, #6366f1);
      animation: sparkle-pop 0.55s ease-out forwards;
    }

    .w-full { width: 100%; height: 100%; }
    
    /* Ensure the host respects size property */
    .avatar-container {
      position: relative;
    }
  `;

  @property({ type: Number }) size = 40;
  @property({ type: Boolean }) interactive = true;
  @property({ type: Boolean }) idle = false;
  @property({ type: Number }) waveSignal = 0;
  @property({ type: Object }) ambient : { fire?: boolean; bubbles?: boolean; restMs?: number } | false = false;

  @state() isBlinking = false;
  @state() isWinking = false;
  @state() mood : 'neutral' | 'smile' | 'laugh' = 'neutral';
  @state() isNear = false;
  @state() isSpinning = false;
  @state() isChuckling = false;
  @state() isWaving = false;
  @state() ambientPhase : 'none' | 'fire' | 'bubbles' = 'none';
  @state() sparkles : { id: number; angle: number; distance: number }[] = [];
  @state() leftPupilTransform = 'translate(0, 0)';
  @state() rightPupilTransform = 'translate(0, 0)';

  private rafRef?: number;
  private sparkleId = 0;
  private lastWaveSignal = 0;
  private timeouts: number[] = [];

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearTimeouts();
    if (this.rafRef) cancelAnimationFrame(this.rafRef);
    window.removeEventListener('mousemove', this.handleMouseMove);
  }

  connectedCallback() {
    super.connectedCallback();
    
    // Personality loop
    this.startPersonalityLoop();
    this.startAmbientLoop();
    
    if (this.interactive) {
      window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    }
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('waveSignal') && this.waveSignal !== this.lastWaveSignal) {
      this.lastWaveSignal = this.waveSignal;
      if (this.waveSignal > 0) {
        this.isWaving = true;
        this.addTimeout(() => { this.isWaving = false; }, 700);
      }
    }
    
    if (changedProperties.has('ambient') && changedProperties.get('ambient') !== this.ambient) {
      this.startAmbientLoop();
    }
  }

  private clearTimeouts() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }

  private addTimeout(fn: () => void, delay: number) {
    const id = window.setTimeout(fn, delay);
    this.timeouts.push(id);
    return id;
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.interactive || this.rafRef) return;
    
    this.rafRef = requestAnimationFrame(() => {
      const el = this.shadowRoot?.querySelector('.avatar-container');
      if (!el) {
        this.rafRef = undefined;
        return;
      }
      
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      
      const maxOffset = 2.6;
      const proximityRadius = 90;
      
      const pull = Math.min(dist / 320, 1);
      const nx = (dx / dist) * maxOffset * pull;
      const ny = (dy / dist) * maxOffset * pull;
      
      this.leftPupilTransform = `translate(${nx}px, ${ny}px)`;
      this.rightPupilTransform = `translate(${nx}px, ${ny}px)`;
      
      const near = dist < proximityRadius;
      if (near !== this.isNear) {
        this.isNear = near;
        if (!this.isSpinning && !this.isChuckling) {
          this.mood = near ? 'smile' : 'neutral';
        }
      }
      
      this.rafRef = undefined;
    });
  }

  private startPersonalityLoop() {
    const loop = () => {
      const delay = 2200 + Math.random() * 3000;
      this.addTimeout(() => {
        if (Math.random() < 0.18) {
          this.isWinking = true;
          this.addTimeout(() => { this.isWinking = false; }, 180);
        } else {
          this.isBlinking = true;
          this.addTimeout(() => { this.isBlinking = false; }, 140);
        }
        loop();
      }, delay);
    };
    loop();
  }

  private startAmbientLoop() {
    if (!this.ambient || (!this.ambient.fire && !this.ambient.bubbles)) {
      this.ambientPhase = 'none';
      return;
    }
    
    const restMs = this.ambient.restMs ?? 6000;
    const sequence: { phase: 'fire' | 'bubbles' | 'none'; duration: number }[] = [];
    if (this.ambient.fire) sequence.push({ phase: 'fire', duration: 2200 });
    sequence.push({ phase: 'none', duration: restMs });
    if (this.ambient.bubbles) sequence.push({ phase: 'bubbles', duration: 2400 });
    sequence.push({ phase: 'none', duration: restMs });

    let i = 0;
    const step = () => {
      const current = sequence[i % sequence.length];
      this.ambientPhase = current.phase;
      this.addTimeout(() => {
        i++;
        step();
      }, current.duration);
    };
    step();
  }

  private handleClick() {
    if (!this.interactive) return;
    
    // Spawn sparkles
    const burst = Array.from({ length: 6 }, () => ({
      id: this.sparkleId++,
      angle: Math.random() * 360,
      distance: 16 + Math.random() * 10,
    }));
    this.sparkles = burst;
    this.addTimeout(() => { this.sparkles = []; }, 550);

    if (Math.random() < 0.5) {
      this.isSpinning = true;
      this.addTimeout(() => { this.isSpinning = false; }, 620);
    } else {
      this.mood = 'laugh';
      this.isChuckling = true;
      this.addTimeout(() => {
        this.isChuckling = false;
        this.mood = this.isNear ? 'smile' : 'neutral';
      }, 500);
    }
    
    this.dispatchEvent(new CustomEvent('avatar-click'));
  }

  render() {
    const eyeClosed = this.isBlinking;
    const rightEyeClosed = eyeClosed || this.isWinking;
    
    const containerClasses = {
      'avatar-container': true,
      'interactive': this.interactive,
      'idle-float': this.idle
    };

    const innerClasses = {
      'w-full': true,
      'spin-active': this.isSpinning,
      'wave-tilt': this.isWaving
    };

    const bubblePositions = [
      { left: "18%", delay: "0ms", width: 4 },
      { left: "38%", delay: "260ms", width: 6 },
      { left: "58%", delay: "120ms", width: 4 },
      { left: "76%", delay: "380ms", width: 6 },
    ];

    return html`
      <div 
        class=${classMap(containerClasses)}
        style="width: ${this.size}px; height: ${this.size}px;"
        @click=${this.handleClick}
      >
        ${this.ambientPhase === 'fire' ? html`
          <div class="fire-aura" style="inset: -${this.size * 0.35}px"></div>
        ` : ''}

        ${this.ambientPhase === 'bubbles' ? bubblePositions.map(b => html`
          <span 
            class="bubble" 
            style="left: ${b.left}; width: ${b.width}px; height: ${b.width}px; animation-delay: ${b.delay};"
          ></span>
        `) : ''}

        <div class=${classMap(innerClasses)}>
          <svg viewBox="0 0 64 64" width=${this.size} height=${this.size}>
            <defs>
              <linearGradient id="cp-head" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--chatatp-primary, #0ea5e9)" stop-opacity="0.95" />
                <stop offset="100%" stop-color="var(--chatatp-secondary, #6366f1)" stop-opacity="0.85" />
              </linearGradient>
              <radialGradient id="cp-orb" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fff" stop-opacity="0.95" />
                <stop offset="100%" stop-color="var(--chatatp-secondary, #6366f1)" stop-opacity="0.45" />
              </radialGradient>
            </defs>

            <!-- antenna -->
            <line x1="32" y1="6" x2="32" y2="14" stroke="var(--chatatp-secondary, #6366f1)" stroke-width="2" stroke-linecap="round" opacity="0.8" />
            <circle
              cx="32" cy="5" r="2.8" fill="url(#cp-orb)"
              class="antenna-orb ${this.isNear ? 'antenna-alert' : ''}"
            />

            <!-- ear knobs -->
            <circle cx="8" cy="34" r="4.2" fill="var(--chatatp-secondary, #6366f1)" opacity="0.65" />
            <circle cx="56" cy="34" r="4.2" fill="var(--chatatp-secondary, #6366f1)" opacity="0.65" />

            <!-- head -->
            <rect x="10" y="14" width="44" height="38" rx="16" fill="url(#cp-head)" />
            <rect x="10" y="14" width="44" height="38" rx="16" fill="none" stroke="white" stroke-opacity="0.25" stroke-width="1" />

            <!-- visor -->
            <rect x="16" y="24" width="32" height="18" rx="9" fill="var(--chatatp-secondary, #6366f1)" opacity="0.92" />

            <!-- eyes -->
            <circle cx="24" cy="33" r="4.4" fill="white" style=${eyeClosed ? 'transform: scaleY(0.12); transform-origin: 24px 33px' : ''} />
            <circle cx="40" cy="33" r="4.4" fill="white" style=${rightEyeClosed ? 'transform: scaleY(0.12); transform-origin: 40px 33px' : ''} />
            
            ${!eyeClosed ? html`<circle cx="24" cy="33" r="2.1" fill="var(--chatatp-primary, #0ea5e9)" style="transform: ${this.leftPupilTransform}" />` : ''}
            ${!rightEyeClosed ? html`<circle cx="40" cy="33" r="2.1" fill="var(--chatatp-primary, #0ea5e9)" style="transform: ${this.rightPupilTransform}" />` : ''}

            <!-- mouth -->
            <g class=${this.isChuckling ? 'chuckle-active' : ''}>
              <path d="M 27 39 Q 32 40.5 37 39" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none" class="mouth-shape" opacity=${this.mood === 'neutral' ? 1 : 0} />
              <path d="M 26 38.5 Q 32 42.5 38 38.5" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none" class="mouth-shape" opacity=${this.mood === 'smile' ? 1 : 0} />
              <path d="M 25 38 Q 32 45 39 38 Q 32 42.5 25 38 Z" fill="white" class="mouth-shape" opacity=${this.mood === 'laugh' ? 1 : 0} />
            </g>
          </svg>
        </div>

        ${this.sparkles.map(s => {
          const rad = (s.angle * Math.PI) / 180;
          const sx = Math.cos(rad) * s.distance;
          const sy = Math.sin(rad) * s.distance;
          return html`
            <span class="sparkle" style="--sx: ${sx}px; --sy: ${sy}px;"></span>
          `;
        })}
      </div>
    `;
  }
}
