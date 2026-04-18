import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-returns',
  templateUrl: './returns.component.html',
  styleUrls: ['./returns.component.scss']
})
export class ReturnsComponent {
  constructor(private router: Router) {}
  goContact(): void { this.router.navigate(['/contact']); }
  goDisputes(): void { this.router.navigate(['/litiges']); }
}
