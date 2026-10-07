import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

// Mock del SupabaseService para evitar conexiones reales a Supabase
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

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  // Snapshots mínimos para satisfacer la firma de CanActivateFn
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
    router = TestBed.inject(Router);
  });

  it('debería permitir el acceso si hay un usuario logueado', () => {
    // Simulamos un usuario logueado seteando el signal
    authService.currentUser.set({ id: 'user-1', email: 'test@test.com' } as any);

    // Ejecutamos el guard dentro del contexto de inyección de TestBed
    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
  });

  it('debería redirigir a /login si no hay usuario logueado', () => {
    // Sin usuario (null por defecto)
    authService.currentUser.set(null);

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    // El guard retorna un UrlTree, verificamos que redirige a /login
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });
});
