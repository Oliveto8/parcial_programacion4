import { Routes } from '@angular/router';
// import { Home } from './features/home/home';
// import { BookDetail } from './features/book-detail/book-detail';
import { About } from './features/about/about';
// import { AddBook } from './features/add-book/add-book';
// import { LoginComponent } from './features/auth/login/login';
// import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './core/guards/auth.guard';
import { authAdminGuard } from './core/guards/auth-admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then(c => c.Home)
  },

  // Ruta para el detalle de la película
  { 
    path: 'pelicula/:slug', 
    loadComponent: () => import('./features/pelicula-detail/pelicula-detail').then(c => c.PeliculaDetail),
  },

  { 
  path: 'mis-compras', 
  loadComponent: () => import('./features/mis-compras/mis-compras').then(c => c.MisComprasComponent),
  },

  // Ruta de Candy
  {
    path: 'candy',
    loadComponent: () => import('./features/candy/candy').then(c => c.CandyComponent),
    canActivate: [authGuard]
  },

  // Ruta para la selección de butacas
  { 
    path: 'pelicula/:slug/butacas/:funcionId', 
    loadComponent: () => import('./features/pelicula-detail/butacas/butacas').then(c => c.ButacasComponent),
    canActivate: [authGuard]
  },

   { 
    path: 'add-pelicula',
    loadComponent: () => import('./features/add-pelicula/add-pelicula').then(c => c.AddPelicula),
    canActivate: [authAdminGuard]
  },

  // Rutas de Auth
  { 
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(c => c.LoginComponent),
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register').then(c => c.RegisterComponent),
  },


  // Ruta simple
  { 
    path: 'about', 
    component: About,
    canActivate: [authAdminGuard],
  },

  // Wildcard: cualquier ruta no definida redirige a /home
  { path: '**', redirectTo: '/home' }
];