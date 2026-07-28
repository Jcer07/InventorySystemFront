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

export interface PagedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

@Service()
export class ProductService {
  private readonly http = inject(HttpClient);

  public getAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    searchQuery?: string,
    categoryId?: number | null,
    isLowStock?: boolean
  ): Observable<PagedList<Product>> {
    let params: any = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    };
    if (searchQuery) {
      params.searchQuery = searchQuery;
    }
    if (categoryId !== undefined && categoryId !== null) {
      params.categoryId = categoryId.toString();
    }
    if (isLowStock !== undefined && isLowStock !== null) {
      params.isLowStock = isLowStock.toString();
    }

    return this.http.get<PagedList<Product>>('/api/products', { params });
  }

  public getById(id: string): Observable<Product> {
    return this.http.get<Product>(`/api/products/${id}`);
  }

  public create(product: CreateProduct): Observable<string> {
    return this.http.post<string>('/api/products', product);
  }

  public update(id: string, product: CreateProduct): Observable<void> {
    return this.http.put<void>(`/api/products/${id}`, { id, ...product });
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/products/${id}`);
  }
}
