import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";

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
  public interfaceUsageRate: any;
  public dataset: any = [];
  public datasetData: any = [];
  public options: any = {
    series: {
      lines: { show: true },
      points: {
        radius: 3,
        show: true
      },
    }
  };

  public isLoadingFloat: boolean;
  public isLoadingInterface: boolean;
  public isLoadingDevice: boolean;

  private connection: any;
  private connectionInterface: any;

  constructor(private deviceService: DeviceService) { }

  onChartClick(event) {
    console.log(event);
  }
  
  sendDeviceOptions() {
    this.deviceInfos = '';
    this.interfaces = [];
    this.interfaceSummary = '';
    this.datasetData = [];
    this.isLoadingDevice = true;
    this.isLoadingInterface = true;
    if (this.connectionInterface) {
      this.connectionInterface.unsubscribe();
      this.isLoadingFloat = true;
    }
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

  sendInterfaceOptions() {
    this.isLoadingInterface = true;
    var formDeviceInfoValues = this.form.value.deviceInfo;

    var interfaceOptions = {
      ipAddress: formDeviceInfoValues.ipAddress,
      community: formDeviceInfoValues.community,
      port: formDeviceInfoValues.port,
      retries: formDeviceInfoValues.retransmissions,
      timeout: formDeviceInfoValues.timeout,
      version: formDeviceInfoValues.version,
      interfaceNumber: this.form.value.interface.split('.')[this.form.value.interface.split('.').length - 1]
    };

    this.deviceService.sendInterfaceOptions(interfaceOptions);
    
    if (this.form.value.interval) {
      this.connectionInterface = IntervalObservable.create(this.form.value.interval * 1000).subscribe(() => { this.isLoadingFloat = true; this.sendInterfaceIndex() } );
    } else {
      this.sendInterfaceIndex();
    }
  }

  sendInterfaceIndex() {
    var formDeviceInfoValues = this.form.value.deviceInfo;

    var interfaceOptions = {
      ipAddress: formDeviceInfoValues.ipAddress,
      community: formDeviceInfoValues.community,
      port: formDeviceInfoValues.port,
      retries: formDeviceInfoValues.retransmissions,
      timeout: formDeviceInfoValues.timeout,
      version: formDeviceInfoValues.version,
      interfaceNumber: this.form.value.interface.split('.')[this.form.value.interface.split('.').length - 1],
      date: this.interfaceUsageRate ? this.interfaceUsageRate.date : new Date(),
      inOctets: this.interfaceUsageRate ? this.interfaceUsageRate.inOctets : 0,
      outOctets: this.interfaceUsageRate ? this.interfaceUsageRate.outOctets : 0,
    };

    this.deviceService.sendInterfaceIndex(interfaceOptions);
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
      this.isLoadingInterface = false;
    });
    this.connection = this.deviceService.getInterfaces().subscribe(interfaces => {
      this.interfaces = interfaces;
      this.form.controls.interface.setValue(this.interfaces && this.interfaces.length ? this.interfaces[0].oid : null);
    });
    this.connection = this.deviceService.getInterfaceSummary().subscribe(interfaceSummary => { 
      this.interfaceSummary = interfaceSummary.toString().replace(/,/g, '\n');
      this.isLoadingInterface = false;
    });
    this.connection = this.deviceService.getInterfaceUsageRate().subscribe(interfaceUsageRate => { 
      this.interfaceUsageRate = interfaceUsageRate;
      this.datasetData.push([(this.datasetData.length + 1), (interfaceUsageRate.usageRate ? interfaceUsageRate.usageRate : 0) ]);

      if (!this.dataset.length) {
        this.dataset.push({ label: 'Taxa de utilização', data: this.datasetData });
      } else {
        this.dataset[0].data = this.datasetData;
      }
      this.isLoadingFloat = false;
    });
  }

  objChanged(event) {
    if(this.dataset.length) { this.dataset[0].data = []; }
    this.datasetData = [];
    if (this.connectionInterface) {
      this.connectionInterface.unsubscribe();
      this.isLoadingFloat = true;
    }
    this.interfaceSummary = '';
    this.form.controls.interval.setValue('');
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
