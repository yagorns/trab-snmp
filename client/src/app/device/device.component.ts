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
  public deviceInfos: string = '';
  public interfaces: any = [];

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
    this.form = new FormGroup({
      deviceInfo: new FormGroup({
        ipAddress: new FormControl('192.168.15.14', [Validators.required]),
        port: new FormControl(0),
        community: new FormControl('YagoCommunity', [Validators.required]),
        version: new FormControl(''),
        timeout: new FormControl(0),
        retransmissions: new FormControl(0),
      }),
      interface: new FormControl('', [Validators.required]),
      interval: new FormControl(0, [Validators.required]),
    });

    this.connection = this.deviceService.getDeviceInfo().subscribe(deviceInfos => this.deviceInfos = deviceInfos.toString().replace(/,/g, '\n'));
    this.connection = this.deviceService.getInterfaces().subscribe(interfaces => {
      this.interfaces = interfaces;
      this.form.controls.interface.setValue(this.interfaces.length ? this.interfaces[0].oid : null);
    });
  }

  onChange(deviceValue) {
    console.log(deviceValue);
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
