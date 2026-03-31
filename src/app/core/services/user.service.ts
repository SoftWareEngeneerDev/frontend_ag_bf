import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../models';

const API = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(private http: HttpClient) {}

  // ── GET /users/me ─────────────────────────────────────────────
  getProfile(): Observable<User> {
    return this.http.get<any>(`${API}/users/me`).pipe(
      map(res => this.mapUser(res.data))
    );
  }

  // ── PUT /users/me ─────────────────────────────────────────────
  updateProfile(data: {
    name?: string;
    email?: string;
    city?: string;
    notifEmail?: boolean;
    notifSMS?: boolean;
    notifPush?: boolean;
  }): Observable<User> {
    return this.http.put<any>(`${API}/users/me`, data).pipe(
      map(res => this.mapUser(res.data))
    );
  }

  // ── GET /users/me/notifications ───────────────────────────────
  getNotifications(page = 1, limit = 20): Observable<any> {
    return this.http.get<any>(`${API}/users/me/notifications`, {
      params: { page, limit }
    }).pipe(map(res => res));
  }

  // ── PATCH /users/me/notifications/read-all ────────────────────
  markAllNotificationsRead(): Observable<void> {
    return this.http.patch<any>(
      `${API}/users/me/notifications/read-all`, {}
    ).pipe(map(() => void 0));
  }

  // ── PATCH /users/me/notifications/:id/read ────────────────────
  markNotificationRead(id: string): Observable<void> {
    return this.http.patch<any>(
      `${API}/users/me/notifications/${id}/read`, {}
    ).pipe(map(() => void 0));
  }

  // ── GET /users/me/groups ──────────────────────────────────────
  getMyGroups(): Observable<any> {
    return this.http.get<any>(`${API}/users/me/groups`).pipe(
      map(res => res.data)
    );
  }

  // ── GET /users/me/history ─────────────────────────────────────
  getHistory(page = 1, limit = 20): Observable<any> {
    return this.http.get<any>(`${API}/users/me/history`, {
      params: { page, limit }
    }).pipe(map(res => res));
  }

  // ── Helper : mapper backend → modèle User front ───────────────
  private mapUser(data: any): User {
    return {
      id:           data.id,
      fullName:     data.name,
      phone:        data.phone,
      email:        data.email,
      role:         data.role,
      status:       data.status,
      trustScore:   data.trustScore ?? 100,
      city:         data.city ?? 'Ouagadougou',
      referralCode: data.referralCode ?? '',
      totalSaved:   0,
      createdAt:    new Date(data.createdAt ?? Date.now()),
      avatarUrl:    data.avatarUrl,
    };
  }
}