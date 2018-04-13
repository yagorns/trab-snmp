import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IntervalObservable } from "rxjs/observable/IntervalObservable";

import { DeviceService } from './device.service';
import { BaseChartDirective } from 'ng2-charts/charts/charts';

@Component({
  selector: 'app-device-info',
  templateUrl: './device.component.html',
  providers: [DeviceService],
  styleUrls: ['./device.component.scss'],
})
export class DeviceComponent implements OnInit, OnDestroy {

  public form: FormGroup;
  public deviceInfos: string = '';
  public interfaces: any = [];
  public interfaceSummary: string = '';
  public interfaceUsageRate: any;
  public datasets: any = [];
  public datasetData: any = [];
  public labels: any = [];
  public options: any = {
    scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
    legend: { display: false },
    animation: { duration: 0 }
  };
  public connectionInterface: any;

  public isLoadingFloat: boolean;
  public isLoadingInterface: boolean;
  public isLoadingDevice: boolean;

  private connection: any;

  @ViewChild("baseChart") chart: BaseChartDirective;

  constructor(private deviceService: DeviceService) { }

  onChartClick(event) {
    console.log(event);
  }
  
  sendDeviceOptions() {
    this.deviceInfos = '';
    this.interfaces = [];
    this.interfaceSummary = '';
    this.datasetData = [];
    this.interfaceUsageRate = undefined;
    this.isLoadingDevice = true;
    this.isLoadingInterface = true;
    if (this.connectionInterface) {
      this.connectionInterface.unsubscribe();
      this.refreshChart();
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
    if (!this.connectionInterface) {
        this.connectionInterface = IntervalObservable.create((this.form.value.interval ? this.form.value.interval : 5) * 1000).subscribe(() => { this.sendInterfaceIndex() } );
    } else {
      this.connectionInterface.unsubscribe();
      this.connectionInterface = undefined;
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
      if (this.labels.length == 15) {
        this.labels.shift();
        this.datasets[0].data.shift();
      }

      this.interfaceUsageRate = interfaceUsageRate;

      const date = new Date(interfaceUsageRate.date)
      const label: string = ("0" + date.getHours()).slice(-2) + ":" + 
                            ("0" + date.getMinutes()).slice(-2) + ":" + 
                            ("0" + date.getSeconds()).slice(-2);
      
      this.labels.push(label);


      this.datasetData.push(interfaceUsageRate.usageRate ? interfaceUsageRate.usageRate : 0);

      if (!this.datasets.length) {
        this.datasets.push({ label: 'Taxa de utilização', data: this.datasetData });
      } else {
        this.datasets[0].data = this.datasetData;
        this.refreshChart();
      }
    });
  }

  objChanged(event) {
    this.interfaceUsageRate = undefined;
    this.labels = [];
    if(this.datasets.length) { this.datasets[0].data = []; }
    this.datasetData = [];
    if (this.connectionInterface) {
      this.connectionInterface.unsubscribe();
      this.connectionInterface = undefined;
      this.refreshChart();
    }
    this.interfaceSummary = '';
    this.form.controls.interval.setValue('');
    
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
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  refreshChart() {
    if (this.chart) {
      this.chart.ngOnDestroy();
      this.chart.chart = this.chart.getChartBuilder(this.chart.ctx);
    }
  }

  onResize() {
    console.log('i\'m changing');
  }
}
