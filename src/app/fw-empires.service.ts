import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EveHttpService } from './eve-http.service';

@Injectable({
  providedIn: 'root'
})
export class FwEmpiresService {
  public data$: BehaviorSubject<any> = new BehaviorSubject( null );

  constructor(
    private eve_http: EveHttpService
  ) {
    this.eve_http.get('https://esi.evetech.net/latest/fw/stats/?datasource=tranquility').subscribe( response => {
      this.data$.next( response )
    })
    console.log( 'ran FwEmpireService' );
  }



}
