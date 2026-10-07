/*import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { BookCard } from './book-card';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritosService } from '../../../core/services/favoritos.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Pelicula } from '../../../core/models/pelicula.interface';

// Mock del SupabaseService
class MockSupabaseService {
  client = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => ({
        select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
      }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
  };
}

// Libro de prueba para usar en los tests
const libroMock: Pelicula = {
  id: 'libro-1',
  titulo: 'El Principito',
  autor: 'Antoine de Saint-Exupéry',
  portada_url: 'https://example.com/portada.jpg',
  disponible: true,
  ejemplares_restantes: 3,
  genero: 'Ficción',
  aniopublicacion: 1943,
};

const libroAgotadoMock: Pelicula = {
  ...libroMock,
  id: 'libro-2',
  disponible: false,
  ejemplares_restantes: 0,
};

describe('BookCard', () => {
  let component: BookCard;
  let fixture: ComponentFixture<BookCard>;
  let componentRef: ComponentRef<BookCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCard],
      providers: [
        { provide: SupabaseService, useClass: MockSupabaseService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookCard);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Seteamos el input requerido 'book'
    componentRef.setInput('book', libroMock);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // ---- Tests del FormControl (nombreControl) ----

  it('debería tener el nombreControl como inválido inicialmente (vacío)', () => {
    expect(component.nombreControl.invalid).toBe(true);
  });

  it('debería ser inválido con un solo carácter (minLength=2)', () => {
    component.nombreControl.setValue('A');
    expect(component.nombreControl.invalid).toBe(true);
    expect(component.nombreControl.hasError('minlength')).toBe(true);
  });

  it('debería ser válido con 2 o más caracteres', () => {
    component.nombreControl.setValue('Ana');
    expect(component.nombreControl.valid).toBe(true);
  });

  // ---- Tests de prestarLibro() ----

  it('NO debería emitir reservado si el formulario es inválido', () => {
    const spy = vi.fn();
    component.reservado.subscribe(spy);

    // Dejamos el control vacío (inválido)
    component.prestarLibro();

    expect(spy).not.toHaveBeenCalled();
    expect(component.nombreControl.touched).toBe(true);
  });

  it('debería emitir reservado con el id del libro si el formulario es válido', () => {
    const spy = vi.fn();
    component.reservado.subscribe(spy);

    // Mockeamos alert para que no interrumpa el test
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.nombreControl.setValue('Manuel');
    component.prestarLibro();

    expect(spy).toHaveBeenCalledWith('libro-1');
  });

  it('debería resetear el nombreControl después de reservar', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.nombreControl.setValue('Manuel');
    component.prestarLibro();

    expect(component.nombreControl.value).toBeNull();
  });

  it('NO debería emitir si el libro no tiene ejemplares (aunque formulario válido)', () => {
    // Cambiamos al libro agotado
    componentRef.setInput('book', libroAgotadoMock);
    fixture.detectChanges();

    const spy = vi.fn();
    component.reservado.subscribe(spy);

    component.nombreControl.setValue('Manuel');
    component.prestarLibro();

    expect(spy).not.toHaveBeenCalled();
  });

  // ---- Tests de agregarAFavoritos() ----

  it('debería llamar a favoritosService.agregarFavorito con los datos correctos', () => {
    const favoritosService = TestBed.inject(FavoritosService);
    const spy = vi.spyOn(favoritosService, 'agregarFavorito').mockResolvedValue();

    component.agregarAFavoritos();

    expect(spy).toHaveBeenCalledWith({
      book_id: 'libro-1',
      nota: '',
    });
  });

  // ---- Tests del template (DOM) ----

  it('debería mostrar el título del libro en un h2', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toBe('El Principito');
  });

  it('debería mostrar el autor del libro', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const autorElement = compiled.querySelector('.author');
    expect(autorElement?.textContent).toContain('Antoine de Saint-Exupéry');
  });

  it('debería mostrar la cantidad de ejemplares', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const stockElement = compiled.querySelector('.stock');
    expect(stockElement?.textContent).toContain('3');
  });

  it('debería mostrar el formulario de reserva cuando hay ejemplares', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.reservation-form')).toBeTruthy();
  });

  it('debería mostrar "Sin ejemplares disponibles" cuando está agotado', () => {
    componentRef.setInput('book', libroAgotadoMock);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const noStock = compiled.querySelector('.no-stock');
    expect(noStock?.textContent).toContain('Sin ejemplares disponibles');
  });
});
*/