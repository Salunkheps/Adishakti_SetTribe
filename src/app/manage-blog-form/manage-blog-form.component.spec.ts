import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBlogFormComponent } from './manage-blog-form.component';

describe('ManageBlogFormComponent', () => {
  let component: ManageBlogFormComponent;
  let fixture: ComponentFixture<ManageBlogFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageBlogFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBlogFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
