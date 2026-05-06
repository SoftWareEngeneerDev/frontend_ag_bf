import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector   : 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls  : ['./topbar.component.scss']
})
export class TopbarComponent {
  @Input() title       = 'Dashboard';
  @Input() showSearch  = true;
  @Input() userBg      = '#F5A623';
  @Output() menuToggle = new EventEmitter<void>();

  showDropdown = false;

  constructor(
    public  auth  : AuthService,
    public  notifs: NotificationService,
    private router: Router,
    private elRef : ElementRef,
  ) {}

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  // Fermer si clic en dehors du composant
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.showDropdown = false; }

  goToProfile(): void {
    this.showDropdown = false;
    this.router.navigate([this.profileRoute]);
  }

  logout(): void {
    this.showDropdown = false;
    this.auth.logout();
  }

  get roleLabel(): string {
    const role = this.auth.currentUser()?.role;
    const map: Record<string, string> = {
      ADMIN   : '🛡️ Super Admin',
      SUPPLIER: '🏪 Fournisseur',
      MEMBER  : '👤 Membre',
    };
    return map[role ?? ''] ?? role ?? '';
  }

  get profileRoute(): string {
    const role = this.auth.currentUser()?.role;
    if (role === 'ADMIN')    return '/admin/profile';
    if (role === 'SUPPLIER') return '/supplier/profile';
    return '/member/profile';
  }

  get notifRoute(): string {
    const role = this.auth.currentUser()?.role;
    if (role === 'ADMIN')    return '/admin/notifications';
    if (role === 'SUPPLIER') return '/supplier/notifications';
    return '/member/notifications';
  }
}