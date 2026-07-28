import { Routes } from '@angular/router';
import { ProductListComponent } from './products/product-list/product-list';
import { ProductFormComponent } from './products/product-form/product-form';
import { ProductDetailComponent } from './products/product-detail/product-detail';
import { StockComponent } from './stock/stock';
import { SettingsComponent } from './settings/settings';
import { roleGuard } from '../../core/guards/role.guard';

export const routes: Routes = [
  { path: 'products', component: ProductListComponent },
  { path: 'products/new', component: ProductFormComponent, canActivate: [roleGuard] },
  { path: 'products/edit/:id', component: ProductFormComponent, canActivate: [roleGuard] },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'stock', component: StockComponent, canActivate: [roleGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [roleGuard] },
  { path: '', redirectTo: 'products', pathMatch: 'full' },
];
export default routes;
