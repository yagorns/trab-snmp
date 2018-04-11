import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

export class DeviceService {
  private url = 'http://localhost:8080';
  private socket;

  public sendDeviceOptions(deviceOptions): void {
    this.socket.emit('send-device-options', deviceOptions);
  }

  public sendInterfaceOptions(interfaceOptions): void {
    this.socket.emit('send-interface-options', interfaceOptions);
  }

  public getDeviceInfo(): any {
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('get-device-summary', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    })
    return observable;
  }

  public getInterfaces(): any {
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('get-interfaces', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    })
    return observable;
  }

  public getInterfaceSummary(): any {
    let observable = new Observable(observer => {
      this.socket = io(this.url);
      this.socket.on('get-interface-summary', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      }
    })
    return observable;
  }
}