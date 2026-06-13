import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';

interface Deliverer {
  id         : string;
  name       : string;
  phone      : string;
  photoUrl   : string | null;
  zone       : string;
  description: string | null;
  tarif      : number | null;
  status     : string;
  createdAt  : string;
}

@Component({
  selector   : 'app-admin-deliverers',
  templateUrl: './admin-deliverers.component.html',
  styleUrls  : ['./admin-deliverers.component.scss'],
})
export class AdminDeliverersComponent implements OnInit, OnDestroy {
  deliverers : Deliverer[] = [];
  loading     = true;
  activeTab   = 'Tous';
  processing  = false;
  successMsg  = '';
  errorMsg    = '';

  readonly tabs = ['Tous', 'Actifs', 'Suspendus'];

  // ── Modal ajout/édition ───────────────────────────────────────
  showModal   = false;
  editMode    = false;
  editId      = '';
  form = { name: '', phone: '', zone: '', tarif: '', description: '' };
  formErrors: Record<string, string> = {};

  private destroy$ = new Subject<void>();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.load(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.adminService.getDeliverers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next : (data) => { this.deliverers = data; this.loading = false; },
        error: ()     => { this.loading = false; },
      });
  }

  get filtered(): Deliverer[] {
    if (this.activeTab === 'Actifs')    return this.deliverers.filter(d => d.status === 'ACTIVE');
    if (this.activeTab === 'Suspendus') return this.deliverers.filter(d => d.status === 'SUSPENDED');
    return this.deliverers;
  }

  tabCount(t: string): number {
    if (t === 'Tous')      return this.deliverers.length;
    if (t === 'Actifs')    return this.deliverers.filter(d => d.status === 'ACTIVE').length;
    if (t === 'Suspendus') return this.deliverers.filter(d => d.status === 'SUSPENDED').length;
    return 0;
  }

  // ── Modal ─────────────────────────────────────────────────────
  openAddModal(): void {
    this.editMode  = false;
    this.editId    = '';
    this.form      = { name: '', phone: '', zone: '', tarif: '', description: '' };
    this.formErrors = {};
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  validateForm(): boolean {
    this.formErrors = {};
    if (!this.form.name.trim())  this.formErrors['name']  = 'Nom obligatoire';
    if (!this.form.phone.trim()) this.formErrors['phone'] = 'Téléphone obligatoire';
    if (!this.form.zone.trim())  this.formErrors['zone']  = 'Zone obligatoire';
    return Object.keys(this.formErrors).length === 0;
  }

  submitForm(): void {
    if (!this.validateForm() || this.processing) return;
    this.processing = true;

    const payload: any = {
      name       : this.form.name.trim(),
      phone      : this.form.phone.trim(),
      zone       : this.form.zone.trim(),
      description: this.form.description.trim() || undefined,
      tarif      : this.form.tarif ? parseFloat(this.form.tarif) : undefined,
    };

    const call$ = this.editMode
      ? this.adminService.updateDeliverer(this.editId, payload)
      : this.adminService.createDeliverer(payload);

    call$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (saved) => {
        if (this.editMode) {
          const idx = this.deliverers.findIndex(d => d.id === this.editId);
          if (idx > -1) this.deliverers[idx] = saved;
        } else {
          this.deliverers = [saved, ...this.deliverers];
        }
        this.processing = false;
        this.showModal  = false;
        this.showSuccess(this.editMode ? 'Livreur mis à jour' : 'Livreur ajouté');
      },
      error: (err: any) => {
        this.processing = false;
        this.showError(err?.error?.error?.message ?? 'Erreur lors de la sauvegarde');
      },
    });
  }

  // ── Toggle statut ─────────────────────────────────────────────
  toggle(d: Deliverer): void {
    if (this.processing) return;
    this.processing = true;
    this.adminService.toggleDelivererStatus(d.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          d.status        = updated.status;
          this.processing = false;
          this.showSuccess(d.status === 'ACTIVE' ? `${d.name} réactivé` : `${d.name} suspendu`);
        },
        error: (err: any) => {
          this.processing = false;
          this.showError(err?.error?.error?.message ?? 'Erreur');
        },
      });
  }

  // ── Helpers ───────────────────────────────────────────────────
  initials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  trackById(_: number, d: Deliverer): string { return d.id; }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 5000);
  }
}
