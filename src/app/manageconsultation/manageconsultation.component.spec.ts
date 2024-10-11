import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageconsultationComponent } from './manageconsultation.component';

describe('ManageconsultationComponent', () => {
  let component: ManageconsultationComponent;
  let fixture: ComponentFixture<ManageconsultationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageconsultationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageconsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
