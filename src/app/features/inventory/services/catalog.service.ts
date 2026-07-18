import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
}

@Service()
export class CatalogService {
  private readonly http = inject(HttpClient);

  public getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/catalogs/categories');
  }

  public getUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>('/api/catalogs/units');
  }

  public getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>('/api/catalogs/suppliers');
  }
}
