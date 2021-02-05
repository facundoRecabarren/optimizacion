import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private messageSource = new BehaviorSubject("default message");
  currentMessage = this.messageSource.asObservable();

  putMessage(message)
  {
    this.messageSource.next(message);
  }
  constructor() { }
}
