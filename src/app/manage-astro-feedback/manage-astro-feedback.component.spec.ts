import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAstroFeedbackComponent } from './manage-astro-feedback.component';

describe('ManageAstroFeedbackComponent', () => {
  let component: ManageAstroFeedbackComponent;
  let fixture: ComponentFixture<ManageAstroFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageAstroFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageAstroFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
