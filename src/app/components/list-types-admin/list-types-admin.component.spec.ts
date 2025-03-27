import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTypesAdminComponent } from './list-types-admin.component';

describe('ListTypesAdminComponent', () => {
  let component: ListTypesAdminComponent;
  let fixture: ComponentFixture<ListTypesAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTypesAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTypesAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
