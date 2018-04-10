import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

export class DeviceService {
  private url = 'http://localhost:8080';
  private socket;

  public sendDeviceOptions(deviceOptions): void {
    this.socket.emit('send-device-options', deviceOptions);
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
}