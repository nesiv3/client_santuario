import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCustomersAdminComponent } from './list-customers-admin.component';

describe('ListCustomersAdminComponent', () => {
  let component: ListCustomersAdminComponent;
  let fixture: ComponentFixture<ListCustomersAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCustomersAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCustomersAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
