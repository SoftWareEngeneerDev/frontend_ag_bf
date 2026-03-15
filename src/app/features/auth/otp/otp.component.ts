import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent implements OnInit, OnDestroy {
  @Input()  phone   = '';
  @Output() verified = new EventEmitter<string>();
  @Output() back     = new EventEmitter<void>();

  digits = ['', '', '', '', '', ''];
  countdown = 120;
  canResend = false;
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void { this.startTimer(); }
  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }

  startTimer(): void {
    this.countdown = 120; this.canResend = false;
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) { clearInterval(this.timer); this.canResend = true; }
    }, 1000);
  }

  onInput(event: Event, idx: number): void {
    const input = event.target as HTMLInputElement;
    const val   = input.value.replace(/\D/g, '').slice(-1);
    this.digits[idx] = val;
    if (val && idx < 5) {
      const next = document.querySelectorAll<HTMLInputElement>('.otp-box')[idx + 1];
      next?.focus();
    }
    if (this.digits.every(d => d !== '')) this.submit();
  }

  onKeydown(event: KeyboardEvent, idx: number): void {
    if (event.key === 'Backspace' && !this.digits[idx] && idx > 0) {
      const prev = document.querySelectorAll<HTMLInputElement>('.otp-box')[idx - 1];
      prev?.focus();
    }
  }

  submit(): void {
    const code = this.digits.join('');
    if (code.length === 6) this.verified.emit(code);
  }

  resend(): void {
    if (!this.canResend) return;
    this.digits = ['', '', '', '', '', ''];
    this.startTimer();
  }

  get timerLabel(): string {
    const m = Math.floor(this.countdown / 60);
    const s = this.countdown % 60;
    return `${m}:${String(s).padStart(2,'0')}`;
  }
}
