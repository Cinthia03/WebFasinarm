import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VistaMantenimiento } from './vista-mantenimiento';

describe('VistaMantenimiento', () => {
  let component: VistaMantenimiento;
  let fixture: ComponentFixture<VistaMantenimiento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VistaMantenimiento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VistaMantenimiento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
