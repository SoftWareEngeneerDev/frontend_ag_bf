import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      phone:    ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error = '';
    this.auth.login(this.form.value).subscribe({
      next: () => {
        const ret = this.route.snapshot.queryParams['returnUrl'];
        const role = this.auth.currentUser()?.role;
        const dest = ret || (role === 'ADMIN' ? '/admin' : role === 'SUPPLIER' ? '/supplier' : '/member');
        this.router.navigateByUrl(dest);
      },
      error: () => { this.error = 'Identifiants incorrects. Veuillez réessayer.'; }
    });
  }

  // Demo rapide
  demoLogin(role: 'MEMBER' | 'SUPPLIER' | 'ADMIN'): void {
    this.auth.loginDemo(role);
  }

  get loading(): boolean { return this.auth.isLoading(); }
}
