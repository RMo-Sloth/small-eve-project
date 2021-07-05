import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EveHttpService } from './eve-http.service';
import { Faction } from './Faction.class';
import { FactionManager } from './FactionManager.class';
import { ChartData } from './interfaces/ChartData.interface';
import { RawEmpireData } from './RawEmpireData.interface';

@Injectable({
  providedIn: 'root'
})
export class FwEmpiresService {
  private manager !: FactionManager;
  public chart_data$: BehaviorSubject<ChartData[]> = new BehaviorSubject<ChartData[]>( [] );
  public title_data$: BehaviorSubject<string> = new BehaviorSubject<string>( '' );
  public legend_data$: BehaviorSubject<Faction[]> = new BehaviorSubject<Faction[]>( [] );

  constructor(
    private eve_http: EveHttpService
  ) {
    this.fetch_data().subscribe( raw_data => {
      this.manager = new FactionManager( raw_data );
      this.manager.update$.subscribe( () => {
        this.chart_data$.next(this.chart_data);
        this.legend_data$.next(this.manager.factions);
        this.title_data$.next(this.manager.title);
      });
    });
  }

  public set current_type( type: 'systems_controlled' | 'pilots' ) {
    this.manager.type = type;
  }

  public toggle_faction( name: "Minmatar" | "Amarr" | "Caldari" | "Gallente"): void {
    this.manager.toggle( name );
  }

  private get chart_data(): ChartData[] {
    return this.manager.factions
    .filter( faction => faction.enabled )
    .map( faction => ({
        faction: {
          name: faction.name,
          color: faction.color
        },
        value: faction.statistics.get( this.manager.type )
    }) )
    ;
  }

  private fetch_data(): Observable<RawEmpireData[]> {
    return this.eve_http.get('https://esi.evetech.net/latest/fw/stats') as Observable<RawEmpireData[]>;
  }

}
