import { Directive,inject,input,output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCopyClipBoard]',
  host: {
    '(click)': 'onClick()',
    // 1. Agregamos el cursor pointer automáticamente a cualquier elemento que use la directiva
    '[style.cursor]': '"pointer"',
    // Extra: Agregamos un tooltip nativo para que diga "Copiar" al pasar el ratón
    '[title]': '"Clic para copiar"' 
  }
})
export class CopyClipBoard {
  textToCopy = input.required<string>({ alias: 'appCopyClipBoard' });
  
  // Usamos Signal Outputs (Más limpios y no requieren instanciar EventEmitter)
  copied = output<boolean>();

  private renderer = inject(Renderer2);

  async onClick() {
    const text = this.textToCopy();
    
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      this.copied.emit(true);
      
      // 2. Llamamos a nuestra función para mostrar el pequeño modal/toast
      this.mostrarNotificacionTemporal(); 
    } catch (err) {
      console.error('No se pudo copiar el texto: ', err);
      this.copied.emit(false);
    }
  }

  private mostrarNotificacionTemporal() {
    // Creamos un div y un texto para nuestro pequeño modal
    const modal = this.renderer.createElement('div');
    const texto = this.renderer.createText('¡Copiado!');
    this.renderer.appendChild(modal, texto);

    // Le damos estilos de un modal pequeño flotante (Toast)
    this.renderer.setStyle(modal, 'position', 'fixed');
    this.renderer.setStyle(modal, 'bottom', '30px');
    this.renderer.setStyle(modal, 'left', '50%');
    this.renderer.setStyle(modal, 'transform', 'translateX(-50%)');
    this.renderer.setStyle(modal, 'background-color', '#333333');
    this.renderer.setStyle(modal, 'color', '#ffffff');
    this.renderer.setStyle(modal, 'padding', '8px 16px');
    this.renderer.setStyle(modal, 'border-radius', '8px');
    this.renderer.setStyle(modal, 'font-size', '14px');
    this.renderer.setStyle(modal, 'font-family', 'sans-serif');
    this.renderer.setStyle(modal, 'z-index', '9999');
    this.renderer.setStyle(modal, 'box-shadow', '0 4px 6px rgba(0,0,0,0.1)');
    this.renderer.setStyle(modal, 'transition', 'opacity 0.3s ease-in-out');

    // Lo agregamos directamente al <body> de la página
    this.renderer.appendChild(document.body, modal);

    // Esperamos 1 segundo (1000 ms) antes de empezar a ocultarlo
    setTimeout(() => {
      this.renderer.setStyle(modal, 'opacity', '0');
      
      // Esperamos 300ms adicionales para que termine la animación de desvanecimiento antes de borrar el elemento del DOM
      setTimeout(() => {
        this.renderer.removeChild(document.body, modal);
      }, 300);
    }, 1000);
  }
}
