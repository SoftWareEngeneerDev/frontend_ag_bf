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
  emitted       = false;

  private timer?: ReturnType<typeof setInterval>;

  constructor(private auth: AuthService) {}

  ngOnInit(): void  { this.startTimer(); }
  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }

  startTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.countdown = 120;
    this.canResend  = false;
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) { clearInterval(this.timer); this.canResend = true; }
    }, 1000);
  }

  onInput(event: Event, idx: number): void {
    const input = event.target as HTMLInputElement;
    // Garder seulement le dernier chiffre saisi
    const val = input.value.replace(/\D/g, '').slice(-1);

    // Forcer la valeur de l'input
    input.value = val;

    // Mettre à jour le tableau
    const newDigits = [...this.digits];
    newDigits[idx]  = val;
    this.digits     = newDigits;

    // Focus suivant
    if (val && idx < 5) {
      setTimeout(() => {
        const boxes = document.querySelectorAll<HTMLInputElement>('.otp-box');
        boxes[idx + 1]?.focus();
      }, 10);
    }

    this.checkComplete();
  }

  onKeydown(event: KeyboardEvent, idx: number): void {
    if (event.key === 'Backspace') {
      if (!this.digits[idx] && idx > 0) {
        const newDigits    = [...this.digits];
        newDigits[idx - 1] = '';
        this.digits        = newDigits;
        // Forcer le vidage de l'input précédent
        setTimeout(() => {
          const boxes = document.querySelectorAll<HTMLInputElement>('.otp-box');
          if (boxes[idx - 1]) boxes[idx - 1].value = '';
          boxes[idx - 1]?.focus();
        }, 10);
      } else {
        const newDigits = [...this.digits];
        newDigits[idx]  = '';
        this.digits     = newDigits;
        const input     = event.target as HTMLInputElement;
        input.value     = '';
      }
      event.preventDefault();
    }

    if (event.key === 'ArrowRight' && idx < 5) {
      const boxes = document.querySelectorAll<HTMLInputElement>('.otp-box');
      boxes[idx + 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && idx > 0) {
      const boxes = document.querySelectorAll<HTMLInputElement>('.otp-box');
      boxes[idx - 1]?.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text   = event.clipboardData?.getData('text') ?? '';
    const nums   = text.replace(/\D/g, '').slice(0, 6).split('');
    if (nums.length !== 6) return;

    this.digits = nums;

    // Mettre à jour les inputs DOM
    setTimeout(() => {
      const boxes = document.querySelectorAll<HTMLInputElement>('.otp-box');
      nums.forEach((n, i) => { if (boxes[i]) boxes[i].value = n; });
      boxes[5]?.focus();
      this.checkComplete();
    }, 50);
  }

  private checkComplete(): void {
    const code = this.digits.join('');
    if (code.length === 6 && this.digits.every(d => d !== '') && !this.emitted) {
      this.emitted = true;
      setTimeout(() => {
        this.verified.emit(code);
        setTimeout(() => { this.emitted = false; }, 3000);
      }, 150);
    }
  }

  resend(): void {
    if (!this.canResend || this.resendLoading) return;
    this.resendLoading = true;
    this.emitted       = false;

    // Vider les inputs DOM
    const boxes = document.querySelectorAll<HTMLInputElement>('.otp-box');
    boxes.forEach(b => b.value = '');
    this.digits = ['', '', '', '', '', ''];

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