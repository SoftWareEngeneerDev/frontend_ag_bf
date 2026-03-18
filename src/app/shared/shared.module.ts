import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ── Components ────────────────────────────────────────────────────
import { LogoComponent }             from './components/logo/logo.component';
import { AvatarComponent }           from './components/avatar/avatar.component';
import { BadgeComponent }            from './components/badge/badge.component';
import { ProgressBarComponent }      from './components/progress-bar/progress-bar.component';
import { CountdownComponent }        from './components/countdown/countdown.component';
import { CircleProgressComponent }   from './components/circle-progress/circle-progress.component';
import { StatsCardComponent }        from './components/stats-card/stats-card.component';
import { NotificationItemComponent } from './components/notification-item/notification-item.component';
import { GroupCardComponent }        from './components/group-card/group-card.component';
import { LoadingSpinnerComponent }   from './components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent }       from './components/empty-state/empty-state.component';
import { ToastContainerComponent }  from './components/toast/toast-container.component';

// ── Pipes ─────────────────────────────────────────────────────────
import { CurrencyXofPipe }       from './pipes/currency-xof.pipe';
import { TimeAgoPipe }           from './pipes/time-ago.pipe';
import { TruncatePipe }          from './pipes/truncate.pipe';
import { GroupStatusLabelPipe }  from './pipes/group-status-label.pipe';
import { OrderStatusLabelPipe }  from './pipes/order-status.pipe';

const COMPONENTS = [
  LogoComponent, AvatarComponent, BadgeComponent,
  ProgressBarComponent, CountdownComponent, CircleProgressComponent,
  StatsCardComponent, NotificationItemComponent,
  GroupCardComponent, LoadingSpinnerComponent, EmptyStateComponent,
  ToastContainerComponent,
];

const PIPES = [
  CurrencyXofPipe, TimeAgoPipe, TruncatePipe,
  GroupStatusLabelPipe, OrderStatusLabelPipe,
];

@NgModule({
  declarations: [...COMPONENTS, ...PIPES],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  exports: [
    // Re-export Angular modules so feature modules only need SharedModule
    CommonModule, RouterModule, FormsModule, ReactiveFormsModule,
    // Our components & pipes
    ...COMPONENTS, ...PIPES,
  ]
})
export class SharedModule {}
