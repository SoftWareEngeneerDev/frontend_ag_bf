import { Component, inject, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent  {

  showLoginModal = false;
  showRegisterModal = false;

  auth     = inject(AuthService);
  notifs   = inject(NotificationService);
  menuOpen = false;
  scrolled = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 40;
  }
 
  constructor(private router: Router, 
    private ActivatedRoute: ActivatedRoute, 
    private Auth: AuthService
  ) {}

  openLogin() {
    this.showLoginModal = true;
    this.showRegisterModal = false;
  }

  openRegister() {
    this.showRegisterModal = true;
    this.showLoginModal = false;
  }

  closeModal() {
    this.showLoginModal = false;
    this.showRegisterModal = false;
  }
}
// function private(target: NavbarComponent, propertyKey: 'router'): void {
//   throw new Error('Function not implemented.');
// }

