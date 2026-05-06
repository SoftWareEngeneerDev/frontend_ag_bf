import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector   : 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls  : ['./admin-categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit, OnDestroy {
  categories : any[] = [];
  loading     = true;
  processing  = false;
  successMsg  = '';
  errorMsg    = '';

  // ── Formulaire création/édition ───────────────────────────────
  showForm      = false;
  editMode      = false;
  editingId     = '';
  formName      = '';
  formParentId  = '';

  // ── Modal suppression ─────────────────────────────────────────
  showDeleteModal   = false;
  selectedCategory  : any = null;

  private destroy$ = new Subject<void>();

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadCategories(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.loading = true;
    this.adminService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.categories = Array.isArray(data) ? data : [];
          this.loading    = false;
        },
        error: () => { this.loading = false; }
      });
  }

  // ── Ouvrir formulaire création ────────────────────────────────
  openCreate(): void {
    this.editMode    = false;
    this.editingId   = '';
    this.formName    = '';
    this.formParentId = '';
    this.showForm    = true;
  }

  // ── Ouvrir formulaire édition ─────────────────────────────────
  openEdit(cat: any): void {
    this.editMode    = true;
    this.editingId   = cat.id;
    this.formName    = cat.name;
    this.formParentId = cat.parentId ?? '';
    this.showForm    = true;
  }

  // ── Sauvegarder ───────────────────────────────────────────────
  save(): void {
    if (!this.formName.trim() || this.processing) return;
    this.processing = true;

    const obs = this.editMode
      ? this.adminService.updateCategory(this.editingId, this.formName.trim(), this.formParentId || undefined)
      : this.adminService.createCategory(this.formName.trim(), this.formParentId || undefined);

    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.showForm   = false;
        this.processing = false;
        this.showSuccess(this.editMode ? 'Catégorie modifiée !' : 'Catégorie créée !');
        this.loadCategories();
      },
      error: (err: any) => {
        this.processing = false;
        this.showError(err?.error?.error?.message ?? 'Erreur');
      }
    });
  }

  // ── Ouvrir modal suppression ──────────────────────────────────
  openDelete(cat: any): void {
    this.selectedCategory = cat;
    this.showDeleteModal  = true;
  }

  // ── Confirmer suppression ─────────────────────────────────────
  confirmDelete(): void {
    if (!this.selectedCategory || this.processing) return;
    this.processing = true;
    this.adminService.deleteCategory(this.selectedCategory.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showDeleteModal  = false;
          this.processing       = false;
          this.showSuccess(`"${this.selectedCategory.name}" supprimée`);
          this.selectedCategory = null;
          this.loadCategories();
        },
        error: (err: any) => {
          this.processing = false;
          this.showError(err?.error?.error?.message ?? 'Erreur');
        }
      });
  }

  // ── Catégories parentes pour le select ────────────────────────
  get parentOptions(): any[] {
    return this.categories.filter(c => !c.parentId && c.id !== this.editingId);
  }

  get totalProducts(): number {
    return this.categories.reduce((s, c) => s + (c._count?.products ?? 0) + (c.children?.reduce((s2: number, ch: any) => s2 + (ch._count?.products ?? 0), 0) ?? 0), 0);
  }

  trackById(_: number, c: any): string { return c.id; }

  private showSuccess(msg: string): void {
    this.successMsg = msg; this.errorMsg = '';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  private showError(msg: string): void {
    this.errorMsg = msg; this.successMsg = '';
    setTimeout(() => { this.errorMsg = ''; }, 4000);
  }
}