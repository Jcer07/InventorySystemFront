import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  stock: number;
  minStock: number;
  categoryId: number;
  categoryName: string;
  unitId: number;
  unitName: string;
  unitAbbreviation: string;
  supplierId?: string | null;
  supplierName?: string | null;
  isLowStock: boolean;
}

export interface CreateProduct {
  name: string;
  sku: string;
  description?: string | null;
  minStock: number;
  categoryId: number;
  unitId: number;
  supplierId?: string | null;
}

@Service()
export class ProductService {
  private readonly http = inject(HttpClient);

  public getAll(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products');
  }

  public getById(id: string): Observable<Product> {
    return this.http.get<Product>(`/api/products/${id}`);
  }

  public create(product: CreateProduct): Observable<string> {
    return this.http.post<string>('/api/products', product);
  }
}
