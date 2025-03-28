import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CashRegisterComponent } from './components/cash-register/cash-register.component';
import { StocktakingComponent } from './components/stocktaking/stocktaking.component';
import { SupplierComponent } from './components/supplier/supplier.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UsersComponent } from './components/users/users.component';
import { PurchaseComponent } from './components/purchase/purchase.component';

import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  // { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent,canActivate: [AuthGuard] },
  { path: 'cash', component: CashRegisterComponent,canActivate: [AuthGuard] },
  { path: 'inventory', component: StocktakingComponent,canActivate: [AuthGuard] },
  { path: 'purchase', component: PurchaseComponent,canActivate: [AuthGuard] },
  { path: 'supplier', component: SupplierComponent,canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent,canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent,canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: '**', redirectTo: 'login' } 
  // { path: '**', redirectTo: 'home' } 
  

];

