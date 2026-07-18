import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdjustStock {
  productId: string;
  quantity: number;
  movementTypeId: number;
  notes?: string | null;
  userId: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  movementTypeId: number;
  movementTypeName: string;
  isEntry: boolean;
  notes?: string | null;
  createdAt: string;
  createdBy: string;
}

@Service()
export class StockService {
  private readonly http = inject(HttpClient);

  public adjustStock(adjustment: AdjustStock): Observable<void> {
    return this.http.post<void>('/api/stock/adjust', adjustment);
  }

  public getMovements(productId?: string): Observable<StockMovement[]> {
    const url = productId ? `/api/stock/movements?productId=${productId}` : '/api/stock/movements';
    return this.http.get<StockMovement[]>(url);
  }
}
