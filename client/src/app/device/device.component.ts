import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { DeviceService } from './device.service';

@Component({
  selector: 'app-device-info',
  templateUrl: './device.component.html',
  providers: [DeviceService]
})
export class DeviceComponent implements OnInit, OnDestroy {

  public form: FormGroup;
  public interfaces: object[];
  public deviceInfos: string = '';

  private connection: any;
  
  constructor(private deviceService: DeviceService) { }
  
  sendDeviceOptions() {
    var formDeviceInfoValues = this.form.value.deviceInfo;

    var options = {
        port: formDeviceInfoValues.port,
        retries: formDeviceInfoValues.retransmissions,
        timeout: formDeviceInfoValues.timeout,
        version: formDeviceInfoValues.version
    };

    this.deviceService.sendDeviceOptions({
      ipAddress: formDeviceInfoValues.ipAddress,
      community: formDeviceInfoValues.community
    });
  }

  ngOnInit() { 
    this.connection = this.deviceService.getDeviceInfo().subscribe(deviceInfos => this.deviceInfos = deviceInfos.toString().replace(/,/g, '\n'));

    this.form = new FormGroup({
      deviceInfo: new FormGroup({
        ipAddress: new FormControl('172.31.3.102', [Validators.required]),
        port: new FormControl(0),
        community: new FormControl('MorettoCommunity', [Validators.required]),
        version: new FormControl(''),
        timeout: new FormControl(0),
        retransmissions: new FormControl(0),
      }),
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
    ];
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
