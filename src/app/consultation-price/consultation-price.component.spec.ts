import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationPriceComponent } from './consultation-price.component';

describe('ConsultationPriceComponent', () => {
  let component: ConsultationPriceComponent;
  let fixture: ComponentFixture<ConsultationPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultationPriceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultationPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
