import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentToExtendChatComponent } from './payment-to-extend-chat.component';

describe('PaymentToExtendChatComponent', () => {
  let component: PaymentToExtendChatComponent;
  let fixture: ComponentFixture<PaymentToExtendChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaymentToExtendChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentToExtendChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
