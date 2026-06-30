import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-product-list',
  template: 'Product List Placeholder',
})
class ProductListComponent {}

@Component({
  selector: 'app-product-form',
  template: 'Product Form Placeholder',
})
class ProductFormComponent {}

@Component({
  selector: 'app-product-detail',
  template: 'Product Detail Placeholder',
})
class ProductDetailComponent {}

@Component({
  selector: 'app-stock',
  template: 'Stock Placeholder',
})
class StockComponent {}

export const routes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'products/edit/:id', component: ProductFormComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'stock', component: StockComponent },
  { path: '', redirectTo: 'products', pathMatch: 'full' },
];
export default routes;
