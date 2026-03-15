import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  step = 1;
  phone = '';

  constructor(private router: Router) {}

  sendCode(): void { if (this.phone) this.step = 2; }
  onVerified(): void { this.step = 3; }
  goLogin(): void { this.router.navigate(['/auth/login']); }
}
