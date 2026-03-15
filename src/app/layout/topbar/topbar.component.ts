import { Component, Input } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  @Input() title      = 'Dashboard';
  @Input() showSearch = true;
  @Input() userBg     = '#F5A623';

  constructor(public auth: AuthService, public notifs: NotificationService) {}
}
