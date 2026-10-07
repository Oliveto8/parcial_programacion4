import { Directive, effect, inject, Input, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

// Directiva ESTRUCTURAL — agrega o remueve elementos del DOM según una condición
// Uso: <div *appRole="'admin'">Solo visible para admins</div>
// Funciona similar a *ngIf, pero verifica el rol del usuario logueado
@Directive({
  selector: '[appRole]'
})
export class RoleDirective {
  // TemplateRef — referencia al <ng-template> que envuelve el contenido
  // Angular convierte *appRole en un <ng-template [appRole]="...">
  private templateRef = inject(TemplateRef<unknown>);

  // ViewContainerRef — contenedor donde se inserta/remueve el template
  private viewContainer = inject(ViewContainerRef);

  // AuthService — para obtener los datos del usuario logueado
  private authService = inject(AuthService);

  // Signal interno para almacenar el rol requerido
  private rolRequerido = signal<string>('');

  // @Input con setter — se ejecuta cuando Angular pasa el valor del *appRole
  // El nombre debe coincidir con el selector de la directiva
  @Input() set appRole(rol: string) {
    this.rolRequerido.set(rol);
  }

  constructor() {
    // effect() — se re-ejecuta automáticamente cuando cambian los signals que lee
    // Esto hace la directiva REACTIVA: si el usuario hace login/logout, se actualiza
    effect(() => {
      const userData = this.authService.currentUserData();
      const role = this.rolRequerido();

      // Siempre limpiamos primero para evitar duplicados
      this.viewContainer.clear();

      // Si el rol del usuario coincide con el requerido, mostramos el contenido
      if (userData && userData.rol === role) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}