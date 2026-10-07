import {
  trigger,
  transition,
  style,
  query,
  animate,
  group,
} from '@angular/animations';

/**
 * Animación de transición entre rutas.
 * Efecto: fade + deslizamiento lateral suave.
 *
 * - El componente saliente se desliza hacia la izquierda y desaparece (fade-out).
 * - El componente entrante se desliza desde la derecha y aparece (fade-in).
 */
export const routeAnimations = trigger('routeAnimations', [
  // Transición genérica: cualquier cambio de ruta
  transition('* <=> *', [
    // Estilos iniciales para ambos componentes
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        opacity: 0,
      }),
    ], { optional: true }),

    // El componente que sale comienza visible
    query(':leave', [
      style({ opacity: 1, transform: 'translateX(0)' }),
    ], { optional: true }),

    // El componente que entra comienza desplazado a la derecha
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(30px)' }),
    ], { optional: true }),

    // Animación simultánea de salida y entrada
    group([
      query(':leave', [
        animate('300ms ease-out', style({
          opacity: 0,
          transform: 'translateX(-30px)',
        })),
      ], { optional: true }),

      query(':enter', [
        animate('300ms ease-out', style({
          opacity: 1,
          transform: 'translateX(0)',
        })),
      ], { optional: true }),
    ]),
  ]),
]);
