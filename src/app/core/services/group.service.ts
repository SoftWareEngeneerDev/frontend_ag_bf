import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Group, PaginatedResponse, PaginationParams } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class GroupService {
  constructor(private mock: MockDataService) {}

  getAll(params?: { status?: string; categoryId?: string; search?: string }): Observable<Group[]> {
    let data = this.mock.groups;
    if (params?.status)     data = data.filter(g => g.status === params.status);
    if (params?.categoryId) data = data.filter(g => g.product.category.id === params.categoryId);
    if (params?.search)     data = data.filter(g => g.product.name.toLowerCase().includes(params.search!.toLowerCase()));
    return of(data).pipe(delay(350));
  }

  getById(id: string): Observable<Group | undefined> {
    return of(this.mock.groups.find(g => g.id === id)).pipe(delay(200));
  }

  getMyGroups(): Observable<Group[]> {
    return of(this.mock.groups.slice(0, 3)).pipe(delay(300));
  }

  getActiveGroups(): Observable<Group[]> {
    return of(this.mock.groups.filter(g => g.status === 'OPEN' || g.status === 'THRESHOLD_REACHED')).pipe(delay(300));
  }

  joinGroup(groupId: string): Observable<{ success: boolean; message: string }> {
    return of({ success: true, message: 'Vous avez rejoint le groupe avec succès !' }).pipe(delay(800));
  }

  createGroup(data: Partial<Group>): Observable<Group> {
    return of(this.mock.groups[0]).pipe(delay(900));
  }
}
