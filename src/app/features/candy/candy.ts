import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CandyService } from '../../core/services/candy.service';
import { AuthService } from '../../core/services/auth.service';
import { CardCandyComponent } from '../../shared/components/candy-card/candy-card'; // 👈 Importamos la tarjeta reutilizable

interface ItemCarrito {
  producto: any;
  cantidad: number;
}

@Component({
  selector: 'app-candy',
  standalone: true,
  imports: [CommonModule, CardCandyComponent], // 👈 Agregado en los imports del componente
  templateUrl: './candy.html',
  styleUrl: './candy.css',
})
export class CandyComponent implements OnInit {
  private candyService = inject(CandyService);
  private authService = inject(AuthService);
  private router = inject(Router);

  productos = signal<any[]>([]);
  cargando = signal<boolean>(true);
  procesandoCompra = signal<boolean>(false);
  carrito = signal<ItemCarrito[]>([]);

  totalItems = computed(() => this.carrito().reduce((acc, item) => acc + item.cantidad, 0));
  precioTotal = computed(() => this.carrito().reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0));

  async ngOnInit(): Promise<void> {
    await this.cargarProductos();
  }

  async cargarProductos(): Promise<void> {
    this.cargando.set(true);
    try {
      const data = await this.candyService.obtenerProductosCandy();
      this.productos.set(data);
    } catch (error) {
      console.error('Error al cargar los productos del candy:', error);
    } finally {
      this.cargando.set(false);
    }
  }

  agregarAlCarrito(producto: any): void {
    this.carrito.update(items => {
      const index = items.findIndex(i => i.producto.id === producto.id);
      if (index >= 0) {
        const nuevosItems = [...items];
        nuevosItems[index] = { ...nuevosItems[index], cantidad: nuevosItems[index].cantidad + 1 };
        return nuevosItems;
      } else {
        return [...items, { producto, cantidad: 1 }];
      }
    });
  }

  async finalizarCompra(): Promise<void> {
    if (this.carrito().length === 0) return;

    const user = this.authService.currentUser();
    if (!user) {
      alert('Debes iniciar sesión para finalizar tu compra.');
      return;
    }

    this.procesandoCompra.set(true);
    try {
      // Procesamos la compra en el servicio backend/Supabase
      await this.candyService.procesarCompraCandy(this.carrito(), this.precioTotal());
      
      this.carrito.set([]); // Limpiar carrito

      // Alerta de éxito y redirección inmediata al Home
      window.alert('¡Compra realizada con éxito! Tus productos del Candy Bar han sido registrados correctamente.');
      this.router.navigate(['/home']);

    } catch (error: any) {
      console.error('Error al procesar la compra:', error);
      alert('Hubo un error al registrar tu compra: ' + (error.message || JSON.stringify(error)));
    } finally {
      this.procesandoCompra.set(false);
    }
  }
}