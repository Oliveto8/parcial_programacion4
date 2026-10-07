import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- 1. Importa esto
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RoleDirective } from '../../shared/directives/role.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RoleDirective], // <-- 2. Añádelo aquí
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  authService = inject(AuthService);
  private router = inject(Router);

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }
}