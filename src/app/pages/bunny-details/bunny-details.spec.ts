import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BunnyDetails } from './bunny-details';

describe('BunnyDetails', () => {
  let component: BunnyDetails;
  let fixture: ComponentFixture<BunnyDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BunnyDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BunnyDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
