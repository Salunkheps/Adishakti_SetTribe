import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatAppForAstrologerComponent } from './chat-app-for-astrologer.component';

describe('ChatAppForAstrologerComponent', () => {
  let component: ChatAppForAstrologerComponent;
  let fixture: ComponentFixture<ChatAppForAstrologerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatAppForAstrologerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatAppForAstrologerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
