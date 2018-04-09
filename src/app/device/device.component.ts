import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-device-info',
  templateUrl: './device.component.html',
})
export class DeviceComponent implements OnInit {

  public form: FormGroup;
  public interfaces: object[];

  constructor() { }

  ngOnInit() { 
    this.form = new FormGroup ({
      ipAddress: new FormControl('', [Validators.required]),
      port: new FormControl(0, [Validators.required, Validators.maxLength(4)]),
      communit: new FormControl('', [Validators.required]),
      version: new FormControl('', [Validators.required]),
      timeout: new FormControl(0, [Validators.required]),
      retransmissions: new FormControl(0, [Validators.required]),
      interface: new FormControl('', [Validators.required]),
      interval: new FormControl(0, [Validators.required]),
    });

    this.interfaces = [
      {
        name: 'Item 1',
        value: '1',
      },
      {
        name: 'Item 2',
        value: '2',
      },
      {
        name: 'Item 3',
        value: '3',
      },
      {
        name: 'Item 4',
        value: '4',
      },
    ]
  }
}
