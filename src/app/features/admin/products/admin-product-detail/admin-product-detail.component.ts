import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { Product } from '../../../../core/models';

@Component({
  selector: 'app-admin-product-detail',
  templateUrl: './admin-product-detail.component.html',
  styleUrls: ['./admin-product-detail.component.scss']
})
export class AdminProductDetailComponent implements OnInit {
  product: Product | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public mock: MockDataService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.product = this.mock.products.find(p => p.id === id) ?? null;
  }

  goBack(): void {
    this.router.navigate(['/admin/products']);
  }

  get statusClass(): string {
    if (!this.product) return '';
    if (this.product.status === 'ACTIVE')   return 'badge-ok';
    if (this.product.status === 'PENDING')  return 'badge-warn';
    if (this.product.status === 'REJECTED') return 'badge-err';
    return 'badge-grey';
  }

  get statusLabel(): string {
    if (!this.product) return '';
    if (this.product.status === 'ACTIVE')   return 'Actif';
    if (this.product.status === 'PENDING')  return 'En attente';
    if (this.product.status === 'REJECTED') return 'Rejeté';
    return 'Inactif';
  }

  get stockColor(): string {
    if (!this.product) return 'inherit';
    return this.product.stock > 50 ? '#10D98B' : this.product.stock > 10 ? '#F5A623' : '#FF4D6A';
  }

  get discountPercent(): number {
    if (!this.product || !this.product.minGroupPrice) return 0;
    return Math.round((1 - this.product.minGroupPrice / this.product.soloPrice) * 100);
  }

  formatXOF(val: number): string {
    return val.toLocaleString('fr-FR') + ' XOF';
  }
}
