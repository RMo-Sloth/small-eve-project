import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EveHttpService } from './eve-http.service';
import { FactionManager } from './FactionManager.class';
import { RawEmpireData } from './RawEmpireData.interface';

@Injectable({
  providedIn: 'root'
})
export class FactionManagerService {


  constructor(
    private eve_http: EveHttpService,
  ) {}


  public manager(): Observable<FactionManager> {
    return this.fetch_data()
    .pipe( map(
      raw_data => new FactionManager( raw_data ) )
    )
  }


  private fetch_data(): Observable<RawEmpireData[]> {
    return this.eve_http.get('https://esi.evetech.net/latest/fw/stats') as Observable<RawEmpireData[]>;
  }
}
