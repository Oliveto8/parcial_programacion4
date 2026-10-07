import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authAdminGuard } from './auth-admin-guard';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

// Mock del SupabaseService
class MockSupabaseService {
  client = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
  };
}

describe('authAdminGuard', () => {
  let authService: AuthService;

  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useClass: MockSupabaseService },
      ],
    });

    authService = TestBed.inject(AuthService);
  });

  it('debería permitir el acceso si el usuario tiene rol "admin"', () => {
    authService.currentUserData.set({
      id: 'user-1',
      nombre: 'Admin',
      apellido: 'Test',
      rol: 'admin',
    });

    const result = TestBed.runInInjectionContext(() => authAdminGuard(mockRoute, mockState));

    expect(result).toBe(true);
  });

  it('debería redirigir a /home si el usuario tiene rol "user"', () => {
    authService.currentUserData.set({
      id: 'user-2',
      nombre: 'Normal',
      apellido: 'User',
      rol: 'user',
    });

    const result = TestBed.runInInjectionContext(() => authAdminGuard(mockRoute, mockState));

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/home');
  });

  it('debería redirigir a /home si no hay datos de usuario (null)', () => {
    authService.currentUserData.set(null);

    const result = TestBed.runInInjectionContext(() => authAdminGuard(mockRoute, mockState));

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/home');
  });
});
