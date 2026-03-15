import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }  from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule),
  },
  {
    path: 'auth',
    canActivate: [GuestGuard],
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: 'member',
    canActivate: [AuthGuard],
    data: { roles: ['MEMBER'] },
    loadChildren: () => import('./features/member/member.module').then(m => m.MemberModule),
  },
  {
    path: 'supplier',
    canActivate: [AuthGuard],
    data: { roles: ['SUPPLIER'] },
    loadChildren: () => import('./features/supplier/supplier.module').then(m => m.SupplierModule),
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
