import { Component, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../../../components/ui/navbar/navbar';
import { Auth } from '../../../../services/auth';
import { Router } from '@angular/router';
import {  FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CampoInput } from '../../../../components/ui/campo-input/campo-input';
import { ErrorRequerido } from '../../../../components/ui/error-requerido/error-requerido';
import { ErrorMinlenght } from '../../../../components/ui/error-minlenght/error-minlenght';
import { ErrorMaxlenght } from '../../../../components/ui/error-maxlenght/error-maxlenght';
import { ErrorPattern } from '../../../../components/ui/error-pattern/error-pattern';
import CandyProducto, { CandyPorCrear, CandyPorModificar } from '../../../../interfaces/cady_productos';
import { CandyServise } from '../../../../services/candy/candy';
import { ComboServise } from '../../../../services/combo/combos';
import ComboProducto, { ComboPorCrear } from '../../../../interfaces/combos';

@Component({
  imports: [NavbarComponent, CampoInput, ErrorRequerido, ErrorMinlenght, ErrorMaxlenght, ErrorPattern , ReactiveFormsModule],
  selector: 'app-candy-admin',
  styleUrl: './candy-admin.css',
  templateUrl: './candy-admin.html',
})
export class CandyAdmin {
  logo_menus = "/assets/imagenes/Gemini2.png"
  candy = inject(CandyServise)
  auth = inject(Auth);

  error = signal('');
  router = inject(Router);
  Guardando = signal(false);

  vistaActiva = signal<string>('crear');
  productos = signal<CandyProducto[]>([]);

  
  cambiarVista(vista: string) {
    this.vistaActiva.set(vista);
    this.traer_producto();
    this.cargarCombosAdmin();
  }


  async  traer_producto(){
    this.productos.set(await this.candy.mostrar_productos());
    }

  //crear producto
    form_crear = new FormGroup({
      nombre: new FormControl('', [Validators.required , Validators.minLength(1), Validators.maxLength(100) , Validators.pattern(/^[a-zA-Z0-9\s]+$/)]),
      precio: new FormControl<number | null>(null , [Validators.min(0), Validators.max(100000)]),
      categorias: new FormControl('', [Validators.required , Validators.minLength(1), Validators.maxLength(100) , Validators.pattern(/^[a-zA-Z0-9\s,]+$/)]),
      foto: new FormControl<File | null>(null, [Validators.required])
    });

    async crear_producto() {
      if (this.form_crear.invalid) {
        return;
      }

      const foto = this.form_crear.value.foto;
      if (!foto) {
        return;
      }

      try {
        const urlFoto = await this.candy.subirArchivo(foto);

        if (!urlFoto) {
          this.error.set('No se pudo subir la imagen del producto.');
          return;
        }

        
        const categorias = (this.form_crear.value.categorias ?? '').split(',').map(cat => cat.trim()).filter(cat => cat.length > 0);

        const producto: CandyPorCrear = {
          nombre:this.form_crear.value.nombre?.trim() ?? '',
          precio:this.form_crear.value.precio ?? 0,
          categorias,
          foto: urlFoto,
        };

        console.log('Producto listo para guardar', producto);

        await this.candy.crear_Producto(producto);
        this.form_crear.reset();
      } catch (error) {
        console.error('Error al crear producto', error);
        this.error.set('No se pudo guardar el producto.');
      }
    }

    cargarImagenCrear(evento: Event) {
    const elemento = evento.target as HTMLInputElement;
    if (elemento.files && elemento.files.length > 0) {
      this.form_crear.controls.foto.setValue(elemento.files[0]);
    }
  }

  //modificar producto
  producto_seleccionado = signal<boolean>(false);
  
      form_edicion = new FormGroup({
          id: new FormControl('', [Validators.required]),
          nombre: new FormControl('', [Validators.required , Validators.minLength(1), Validators.maxLength(100) , Validators.pattern(/^[a-zA-Z0-9\s]+$/)]),
          precio: new FormControl<number | null>(null , [Validators.min(0), Validators.max(100000)]),
          categorias: new FormControl('', [Validators.required , Validators.minLength(1), Validators.maxLength(100) , Validators.pattern(/^[a-zA-Z0-9\s,]+$/)]),
          foto: new FormControl<File |string | null>(null)
      });
  
      seleccionar_producto_para_editar(producto: any) {
      this.producto_seleccionado.set(true);
      this.error.set('');
  
      
  
      this.form_edicion.setValue({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        categorias: producto.categorias.join(', ') || null,
        foto: producto.foto || null,
      });
  
      }  
      
      cargarImagenEditar(evento: Event) {
      const elemento = evento.target as HTMLInputElement;
      if (elemento.files && elemento.files.length > 0) {
        this.form_edicion.controls.foto.setValue(elemento.files[0]);
      }
    }
  
      async modificar_producto(): Promise<void> {
        

        try {
          if (this.form_edicion.invalid) {
            return;
          }

          let urlImagen = this.form_edicion.value.foto

          if (urlImagen instanceof File) {
            const subida = await this.candy.subirArchivo(urlImagen);

            if (!subida) {
              this.error.set('Error al subir la imagen');
              this.Guardando.set(false);
              return;
            }

            urlImagen = subida;
          }

          const v = this.form_edicion.value.categorias ?? '';
          const cat: string[] = [];

          for (const g of v.toString().split(',')) {
            const limpio = g.trim();
            if (limpio) cat.push(limpio);
          }

          

          const producto: CandyPorModificar = {
            id: this.form_edicion.value.id!,
            nombre: this.form_edicion.value.nombre!,
            precio: this.form_edicion.value.precio!,
            categorias: cat,
            foto: urlImagen as string
          };

          
          await this.candy.modificar_producto(producto);
          
          this.form_edicion.reset();
        } catch (error) {
          console.error('Error al crear producto', error);
          this.error.set('No se pudo guardar el producto.');
        } finally {
          console.log("6. Finalizando, liberando botón.");
          this.Guardando.set(false);
        }
      }
  //eliminar producto
       //eliminar pelicula
    form_eliminar = new FormGroup({
      nombre: new FormControl<string | null>(null, [Validators.required])
    })

    async eliminar_pelicula(){
      this.error.set('');
      if(this.form_eliminar.invalid){
        return;
      }
      this.Guardando.set(true);
      try{
        if (this.form_eliminar.value.nombre) {
        await this.candy.eliminar_producto(this.form_eliminar.value.nombre);
      }
        this.form_eliminar.reset();
        await this.traer_producto();
      } catch  {
        this.error.set('Error al eliminar la película');
      }finally{
        this.Guardando.set(false);
      }
    }
  //parte de combos
    private combo = inject(ComboServise);

    combosListados = signal<ComboProducto[]>([]);

    async cargarCombosAdmin() {
      try {
        
        const data = await this.combo.obtenerCombos(); 
        this.combosListados.set(data);
      } catch (error) {
        console.error('Error al cargar combos para administración:', error);
      }
    }

    //crear combo 
    formCombo = new FormGroup({
      nombre: new FormControl('', [Validators.required , Validators.minLength(1), Validators.maxLength(100) , Validators.pattern(/^[a-zA-Z0-9\s]+$/)]),
      descripcion: new FormControl('', [Validators.minLength(1), Validators.maxLength(100) , Validators.pattern(/^[a-zA-Z0-9\s]+$/)]),
      precio: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100000)]),
      productos_ids: new FormControl<string[]>([], [Validators.required, Validators.minLength(1)]), 
      foto: new FormControl<File | null>(null),
      destacado: new FormControl<boolean>(false)
  });
  cargarImagenCombo(evento: Event) {
    const elemento = evento.target as HTMLInputElement;
    if (elemento.files && elemento.files.length > 0) {
      this.formCombo.controls.foto.setValue(elemento.files[0]);
    }
  }
  ProductoSeleccionado(idProducto: string) {
    const actual = this.formCombo.value.productos_ids || [];
    if (actual.includes(idProducto)) {
      const nuevoArray = actual.filter(id => id !== idProducto);
      this.formCombo.controls.productos_ids.setValue(nuevoArray);
  } else {
    
      const nuevoArray = actual.concat([idProducto]);
      this.formCombo.controls.productos_ids.setValue(nuevoArray);
    }
  }

  async crearCombo() {
    if (this.formCombo.invalid) {
      return;
    }

    this.Guardando.set(true);
    this.error.set('');

    try {
      const formValues = this.formCombo.value;
      let urlFoto = '';

      
      if (formValues.foto instanceof File) {
        const subida = await this.candy.subirArchivo(formValues.foto);
        if (!subida) {
          this.error.set('No se pudo subir la imagen del combo.');
          this.Guardando.set(false);
          return;
        }
        urlFoto = subida;
      }

      
      const nuevoCombo: ComboPorCrear = {
        nombre: this.formCombo.value.nombre!,
        descripcion: this.formCombo.value.descripcion!,
        precio: this.formCombo.value.precio!,
        productos_ids: this.formCombo.value.productos_ids!,
        foto: urlFoto as string,
        destacado: this.formCombo.value.destacado ?? false
      };

      
      await this.combo.crearCombo(nuevoCombo);
      
      console.log('¡Combo creado con éxito!');
      this.formCombo.reset();
      this.Guardando.set(false);

    } catch (err) {
      console.error('Error al crear el combo:', err);
      this.error.set('Ocurrió un error al guardar el combo.');
      this.Guardando.set(false);
    }
  }

  async cambiarEstado(idCombo: string, activo: boolean) {
  try {
    this.Guardando.set(true);
    if (activo) {
      await this.combo.desactivarCombo(idCombo);
    } else {
      await this.combo.ActivarCombo(idCombo);
    }
    this.cargarCombosAdmin(); 
  } catch (error) {
    this.error.set('No se pudo cambiar el estado del combo.');
  } finally {
    this.Guardando.set(false);
  }
}
}
  
