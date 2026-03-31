import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit, OnDestroy {
  @Input()  phone    = '';
  @Input()  type: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER';
  @Output() verified = new EventEmitter<string>();
  @Output() back     = new EventEmitter<void>();

  digits        = ['', '', '', '', '', ''];
  countdown     = 120;
  canResend     = false;
  resendLoading = false;

  private timer?: ReturnType<typeof setInterval>;

  constructor(private auth: AuthService) {}

  ngOnInit(): void  { this.startTimer(); }
  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }

  startTimer(): void {
    this.countdown = 120;
    this.canResend  = false;
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) { clearInterval(this.timer); this.canResend = true; }
    }, 1000);
  }

  onInput(event: Event, idx: number): void {
    const input = event.target as HTMLInputElement;
    const val   = input.value.replace(/\D/g, '').slice(-1);

    // ── CORRECTION : créer un nouveau tableau pour déclencher la détection ──
    const newDigits  = [...this.digits];
    newDigits[idx]   = val;
    this.digits      = newDigits;

    // Focus sur le champ suivant
    if (val && idx < 5) {
      const boxes = document.querySelectorAll<HTMLInputElement>('.otp-box');
      boxes[idx + 1]?.focus();
    }

    // ── CORRECTION : vérifier après le changement du tableau ──
    const code = this.digits.join('');
    if (code.length === 6 && this.digits.every(d => d !== '')) {
      // Petit délai pour laisser Angular mettre à jour la vue
      setTimeout(() => this.verified.emit(code), 100);
    }
  }

  onKeydown(event: KeyboardEvent, idx: number): void {
    if (event.key === 'Backspace' && !this.digits[idx] && idx > 0) {
      const boxes = document.querySelectorAll<HTMLInputElement>('.otp-box');
      boxes[idx - 1]?.focus();
    }
  }

  // ── Renvoyer OTP → POST /auth/resend-otp ─────────────────────
  resend(): void {
    if (!this.canResend || this.resendLoading) return;

    this.resendLoading = true;
    this.digits        = ['', '', '', '', '', ''];

    this.auth.resendOtp(this.phone, this.type).subscribe({
      next:  () => { this.resendLoading = false; this.startTimer(); },
      error: () => { this.resendLoading = false; this.startTimer(); }
    });
  }

  get timerLabel(): string {
    const m = Math.floor(this.countdown / 60);
    const s = this.countdown % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}