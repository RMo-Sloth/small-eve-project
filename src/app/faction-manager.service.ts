import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { EveHttpService } from './eve-http.service';
import { Faction } from './Faction.class';
import { FactionManager } from './FactionManager.class';
import { ChartData } from './interfaces/ChartData.interface';
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


  public manager(): Observable<any> { //
    return this.fetch_data()
    .pipe(
      tap( raw_data => this.faction_manager = new FactionManager( raw_data ) ),
      map( () => this.faction_manager ),
      mergeMap( manager => manager.update$ ),
      map( () => ({
        title: this.faction_manager.title,
        factions: this.faction_manager.factions,
        chart_data: this.chart_data( this.faction_manager.factions ),
        selected_type: this.faction_manager.type,
        period: this.faction_manager.period
      }) )
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

  private chart_data( factions: Faction[] ): ChartData[] {
    return factions
    .filter( faction => faction.enabled )
    .map( faction => ({
        faction: {
          name: faction.name,
          color: faction.color
        },
        value: faction.statistics.get( this.faction_manager.type, this.faction_manager.period )
    }) )
    ;
  }
}
