import { Observable } from "rxjs/Observable";
import * as io from "socket.io-client";

import { environment } from "../../environments/environment";

export class DeviceService {
  private socket;

  public sendDeviceOptions(deviceOptions): void {
    this.socket.emit("send-device-options", deviceOptions);
  }

  public sendInterfaceOptions(interfaceOptions): void {
    this.socket.emit("send-interface-options", interfaceOptions);
  }

  public sendInterfaceIndex(interfaceIndex): void {
    this.socket.emit("send-interface-index", interfaceIndex);
  }

  public sendRealtimeOptions(interfaceIndex): void {
    this.socket.emit("send-realtime-options", interfaceIndex);
  }

  public getDeviceInfo(): any {
    let observable = new Observable(observer => {
      this.socket = io.connect(environment.apiUrl);
      this.socket.on("get-device-summary", data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  public getInterfaces(): any {
    let observable = new Observable(observer => {
      this.socket = io.connect(environment.apiUrl);
      this.socket.on("get-interfaces", data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  public getInterfaceSummary(): any {
    let observable = new Observable(observer => {
      this.socket = io.connect(environment.apiUrl);
      this.socket.on("get-interface-summary", data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  public getInterfaceUsageRate(): any {
    let observable = new Observable(observer => {
      this.socket = io.connect(environment.apiUrl);
      this.socket.on("get-interface-usage-rate", data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }

  public getRealtimeOptions(): any {
    let observable = new Observable(observer => {
      this.socket = io.connect(environment.apiUrl);
      this.socket.on("get-realtime-options", data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
    return observable;
  }
}
