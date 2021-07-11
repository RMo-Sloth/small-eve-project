import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EveHttpService } from './eve-http.service';
import { FactionManager } from './FactionManager.class';
import { RawEmpireData } from './RawEmpireData.interface';
import { FactionDataPeriod, FactionDataType, FactionNames } from './types/types';

@Injectable({
  providedIn: 'root'
})
export class FactionManagerService {
  private faction_manager!: FactionManager;

  constructor(
    private eve_http: EveHttpService,
  ) {}


  public manager(): Observable<FactionManager> {
    return this.fetch_data()
    .pipe( map( raw_data => {
      this.faction_manager = new FactionManager( raw_data );
      return this.faction_manager;
    })
  )}

  public set type( type: FactionDataType ) {
    this.faction_manager.type = type;
  }

  public get type() {
    return this.faction_manager.type;
  }

  public get period() {
    return this.faction_manager.period;
  }

  public set period( period: FactionDataPeriod ) {
    this.faction_manager.period = period;
  }

  public toggle( name: FactionNames ): void {
    this.faction_manager.toggle( name );
  }


  private fetch_data(): Observable<RawEmpireData[]> {
    return this.eve_http.get('https://esi.evetech.net/latest/fw/stats') as Observable<RawEmpireData[]>;
  }
}
