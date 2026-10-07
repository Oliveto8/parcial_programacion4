import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBar } from './search-bar';

describe('SearchBar', () => {
  let component: SearchBar;
  let fixture: ComponentFixture<SearchBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBar],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener el término vacío inicialmente', () => {
    expect(component.termino()).toBe('');
  });

  it('debería actualizar el término cuando se setea un valor', () => {
    component.termino.set('Angular');
    expect(component.termino()).toBe('Angular');
  });

  it('debería limpiar el término al llamar limpiar()', () => {
    component.termino.set('algo');
    component.limpiar();
    expect(component.termino()).toBe('');
  });

  // ---- Tests del template ----

  it('debería tener un input de búsqueda', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
  });

  it('NO debería mostrar el botón de limpiar si el término está vacío', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const clearBtn = compiled.querySelector('.clear-btn');
    expect(clearBtn).toBeNull();
  });

  it('debería mostrar el botón de limpiar cuando hay un término', () => {
    component.termino.set('test');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const clearBtn = compiled.querySelector('.clear-btn');
    expect(clearBtn).toBeTruthy();
  });

  it('debería limpiar el término al hacer click en el botón ✕', () => {
    component.termino.set('test');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const clearBtn = compiled.querySelector('.clear-btn') as HTMLButtonElement;
    clearBtn.click();
    fixture.detectChanges();

    expect(component.termino()).toBe('');
  });
});
