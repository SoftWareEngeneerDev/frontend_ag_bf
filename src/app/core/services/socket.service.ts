import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

const KEY_TOKEN = 'agbf_token';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;

  private notification$ = new Subject<any>();
  private groupUpdate$  = new Subject<any>();

  // ── Connexion ─────────────────────────────────────────────────
  connect(): void {
    if (this.socket?.connected) return;

    const token = localStorage.getItem(KEY_TOKEN);
    if (!token) return;

    this.socket = io(environment.socketUrl, {
      auth      : { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      // Rejoindre automatiquement la room personnelle — le backend le fait côté server aussi
    });

    this.socket.on('notification', (data: any) => this.notification$.next(data));
    this.socket.on('group:updated', (data: any) => this.groupUpdate$.next(data));
    this.socket.on('group:failed',  (data: any) => this.groupUpdate$.next({ ...data, status: 'FAILED' }));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  // ── Rooms groupes ──────────────────────────────────────────────
  joinGroup(groupId: string): void {
    this.socket?.emit('join:group', groupId);
  }

  leaveGroup(groupId: string): void {
    this.socket?.emit('leave:group', groupId);
  }

  // ── Observables ────────────────────────────────────────────────
  onNotification(): Observable<any> {
    return this.notification$.asObservable();
  }

  onGroupUpdate(): Observable<any> {
    return this.groupUpdate$.asObservable();
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.notification$.complete();
    this.groupUpdate$.complete();
  }
}
