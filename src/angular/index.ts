import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import '../web/index.js';

@Directive({
  selector: 'chatatp-copilot',
  standalone: true
})
export class CopilotDirective implements OnChanges {
  @Input() agentId!: string | number;
  @Input() userId = 'anonymous';
  @Input() userDisplayName = 'User';
  @Input() mode = 'popup';
  @Input() position = 'right';
  @Input() themePrimary = '#0ea5e9';
  @Input() themeSecondary = '#6366f1';
  @Input() avatarSrc = '';
  @Input() apiKey!: string;
  @Input() baseUrl = 'http://localhost:8000';
  @Input() placeholder = '';

  constructor(private el: ElementRef) {
    // Replace the directive host with the custom element
    const copilotEl = document.createElement('chatatp-copilot-button');
    this.el.nativeElement.appendChild(copilotEl);
    this.el.nativeElement = copilotEl;
  }

  ngOnChanges(changes: SimpleChanges) {
    const el = this.el.nativeElement as any;
    if (changes['agentId']) el.agentId = this.agentId?.toString();
    if (changes['userId']) el.userId = this.userId;
    if (changes['userDisplayName']) el.userDisplayName = this.userDisplayName;
    if (changes['mode']) el.mode = this.mode;
    if (changes['position']) el.position = this.position;
    if (changes['themePrimary']) el.themePrimary = this.themePrimary;
    if (changes['themeSecondary']) el.themeSecondary = this.themeSecondary;
    if (changes['avatarSrc']) el.avatarSrc = this.avatarSrc;
    if (changes['apiKey']) el.apiKey = this.apiKey;
    if (changes['baseUrl']) el.baseUrl = this.baseUrl;
    if (changes['placeholder']) el.placeholder = this.placeholder;
  }
}
