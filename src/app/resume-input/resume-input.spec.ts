import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeInput } from './resume-input';

describe('ResumeInput', () => {
  let component: ResumeInput;
  let fixture: ComponentFixture<ResumeInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeInput],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumeInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
