import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AstrologerManageAvailabilityComponent } from './astrologer-manage-availability.component';

describe('AstrologerManageAvailabilityComponent', () => {
  let component: AstrologerManageAvailabilityComponent;
  let fixture: ComponentFixture<AstrologerManageAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AstrologerManageAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AstrologerManageAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
