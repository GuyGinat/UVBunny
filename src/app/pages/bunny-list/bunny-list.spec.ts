import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BunnyList } from './bunny-list';

describe('BunnyList', () => {
  let component: BunnyList;
  let fixture: ComponentFixture<BunnyList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BunnyList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BunnyList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
