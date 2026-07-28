import { Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Category {
  id: number;
  name: string;
  isActive: boolean;
}

export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  isActive: boolean;
}

@Service()
export class CatalogService {
  private readonly http = inject(HttpClient);

  private readonly categoriesSignal = signal<Category[]>([]);
  private readonly unitsSignal = signal<Unit[]>([]);
  private readonly suppliersSignal = signal<Supplier[]>([]);

  // ── Read operations with optional caching ──

  public getCategories(onlyActive: boolean = false): Observable<Category[]> {
    return this.http.get<Category[]>('/api/catalogs/categories', {
      params: { onlyActive: onlyActive.toString() }
    });
  }

  public getCategoriesCached(onlyActive: boolean = false): Observable<Category[]> {
    if (!onlyActive && this.categoriesSignal().length > 0) {
      return of(this.categoriesSignal());
    }
    // If onlyActive is requested, we can filter our cache if it exists, or hit endpoint
    if (onlyActive && this.categoriesSignal().length > 0) {
      return of(this.categoriesSignal().filter(c => c.isActive));
    }
    return this.getCategories(onlyActive).pipe(
      tap(data => {
        if (!onlyActive) {
          this.categoriesSignal.set(data);
        }
      })
    );
  }

  public getUnits(onlyActive: boolean = false): Observable<Unit[]> {
    return this.http.get<Unit[]>('/api/catalogs/units', {
      params: { onlyActive: onlyActive.toString() }
    });
  }

  public getUnitsCached(onlyActive: boolean = false): Observable<Unit[]> {
    if (!onlyActive && this.unitsSignal().length > 0) {
      return of(this.unitsSignal());
    }
    if (onlyActive && this.unitsSignal().length > 0) {
      return of(this.unitsSignal().filter(u => u.isActive));
    }
    return this.getUnits(onlyActive).pipe(
      tap(data => {
        if (!onlyActive) {
          this.unitsSignal.set(data);
        }
      })
    );
  }

  public getSuppliers(onlyActive: boolean = false): Observable<Supplier[]> {
    return this.http.get<Supplier[]>('/api/catalogs/suppliers', {
      params: { onlyActive: onlyActive.toString() }
    });
  }

  public getSuppliersCached(onlyActive: boolean = false): Observable<Supplier[]> {
    if (!onlyActive && this.suppliersSignal().length > 0) {
      return of(this.suppliersSignal());
    }
    if (onlyActive && this.suppliersSignal().length > 0) {
      return of(this.suppliersSignal().filter(s => s.isActive));
    }
    return this.getSuppliers(onlyActive).pipe(
      tap(data => {
        if (!onlyActive) {
          this.suppliersSignal.set(data);
        }
      })
    );
  }

  // Clear cache helper
  public clearCache(): void {
    this.categoriesSignal.set([]);
    this.unitsSignal.set([]);
    this.suppliersSignal.set([]);
  }

  // ── Write operations ──

  public createCategory(name: string): Observable<number> {
    return this.http.post<number>('/api/catalogs/categories', { name }).pipe(
      tap(() => this.clearCache())
    );
  }

  public updateCategory(id: number, category: { name: string, isActive: boolean }): Observable<void> {
    return this.http.put<void>(`/api/catalogs/categories/${id}`, { id, ...category }).pipe(
      tap(() => this.clearCache())
    );
  }

  public createUnit(unit: { name: string, abbreviation: string }): Observable<number> {
    return this.http.post<number>('/api/catalogs/units', unit).pipe(
      tap(() => this.clearCache())
    );
  }

  public updateUnit(id: number, unit: { name: string, abbreviation: string, isActive: boolean }): Observable<void> {
    return this.http.put<void>(`/api/catalogs/units/${id}`, { id, ...unit }).pipe(
      tap(() => this.clearCache())
    );
  }

  public createSupplier(supplier: { name: string, contactEmail: string }): Observable<string> {
    return this.http.post<string>('/api/catalogs/suppliers', supplier).pipe(
      tap(() => this.clearCache())
    );
  }

  public updateSupplier(id: string, supplier: { name: string, contactEmail: string, isActive: boolean }): Observable<void> {
    return this.http.put<void>(`/api/catalogs/suppliers/${id}`, { id, ...supplier }).pipe(
      tap(() => this.clearCache())
    );
  }
}
