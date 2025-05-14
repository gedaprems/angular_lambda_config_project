import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LambdaConfigComponent } from './lambda-config.component';

describe('LambdaConfigComponent', () => {
  let component: LambdaConfigComponent;
  let fixture: ComponentFixture<LambdaConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LambdaConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LambdaConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
