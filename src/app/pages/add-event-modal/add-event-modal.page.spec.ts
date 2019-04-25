import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEventModalPage } from './add-event-modal.page';

describe('AddEventModalPage', () => {
  let component: AddEventModalPage;
  let fixture: ComponentFixture<AddEventModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEventModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEventModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
