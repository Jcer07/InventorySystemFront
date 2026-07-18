import { Routes } from '@angular/router';
import { ProductListComponent } from './products/product-list/product-list';
import { ProductFormComponent } from './products/product-form/product-form';
import { ProductDetailComponent } from './products/product-detail/product-detail';
import { StockComponent } from './stock/stock';

export const routes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'products/edit/:id', component: ProductFormComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'stock', component: StockComponent },
  { path: '', redirectTo: 'products', pathMatch: 'full' },
];
export default routes;
