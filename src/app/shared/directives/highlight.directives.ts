import { Directive, ElementRef, HostListener, inject, input, Renderer2 } from '@angular/core';

// Directiva de ATRIBUTO — modifica la apariencia de un elemento existente
// Uso: <div appHighlight> o <div [appHighlight]="'#e0f7fa'">
@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  // input() con alias — el color se configura directamente en el selector
  // Valor por defecto: amarillo suave
  appHighlight = input<string>('#decf2a');

  // ElementRef — referencia directa al elemento del DOM donde se aplica la directiva
  private el = inject(ElementRef);
  private renderer = inject(Renderer2)

  // @HostListener — escucha eventos del elemento host (donde se aplica la directiva)
  // 'mouseenter' se dispara cuando el mouse entra al elemento
  @HostListener('mouseenter') onMouseEnter() {
    this.highlight(this.appHighlight());
  }

  // 'mouseleave' se dispara cuando el mouse sale del elemento
  @HostListener('mouseleave') onMouseLeave() {
    this.highlight('');
  }

  // Modifica el estilo del elemento nativo del DOM
  private highlight(color: string) {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color )
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'background-color 0.3s ease')
  }
}