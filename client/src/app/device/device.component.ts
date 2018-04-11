import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { DeviceService } from './device.service';

@Component({
  selector: 'app-device-info',
  templateUrl: './device.component.html',
  providers: [DeviceService],
  styleUrls: ['./device.component.css'],
})
export class DeviceComponent implements OnInit, OnDestroy {

  public form: FormGroup;
  public deviceInfos: string = '';
  public interfaces: any = [];
  public interfaceSummary: string = '';
  public isLoadingInterface: boolean;
  public isLoadingDevice: boolean;

  private connection: any;

  constructor(private deviceService: DeviceService) { }

  sendDeviceOptions() {
    if (this.form.valid) {
      this.deviceInfos = '';
      this.interfaces = [];
      this.isLoadingDevice = true;
      var formDeviceInfoValues = this.form.value.deviceInfo;

      this.deviceService.sendDeviceOptions({
        ipAddress: formDeviceInfoValues.ipAddress,
        community: formDeviceInfoValues.community,
        port: formDeviceInfoValues.port,
        retries: formDeviceInfoValues.retransmissions,
        timeout: formDeviceInfoValues.timeout,
        version: formDeviceInfoValues.version
      });
    }
  }

  sendInterfaceOptions() {
    if (this.deviceInfos || this.deviceInfos === 'Dispositivo não encontrado') {
      this.interfaceSummary = '';
      this.isLoadingInterface = true;
      var formDeviceInfoValues = this.form.value.deviceInfo;

      var interfaceOptions = {
        ipAddress: formDeviceInfoValues.ipAddress,
        community: formDeviceInfoValues.community,
        interfaceNumber: this.form.value.interface.split('.')[this.form.value.interface.split('.').length - 1]
      };

      this.deviceService.sendInterfaceOptions(interfaceOptions);
    }
  }

  ngOnInit() {
    this.form = new FormGroup({
      deviceInfo: new FormGroup({
        ipAddress: new FormControl('172.31.3.102', [Validators.required]),
        port: new FormControl(''),
        community: new FormControl('MorettoCommunity', [Validators.required]),
        version: new FormControl(''),
        timeout: new FormControl(''),
        retransmissions: new FormControl(''),
      }),
      interface: new FormControl(''),
      interval: new FormControl(''),
    });

    this.connection = this.deviceService.getDeviceInfo().subscribe(deviceInfos => { 
      this.deviceInfos = deviceInfos.toString().replace(/,/g, '\n');
      this.isLoadingDevice = false;
    });
    this.connection = this.deviceService.getInterfaces().subscribe(interfaces => {
      this.interfaces = interfaces;
      this.form.controls.interface.setValue(this.interfaces.length ? this.interfaces[0].oid : null);
    });
    this.connection = this.deviceService.getInterfaceSummary().subscribe(interfaceSummary => { 
      this.interfaceSummary = interfaceSummary.toString().replace(/,/g, '\n');
      this.isLoadingInterface = false;
    });
    
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
