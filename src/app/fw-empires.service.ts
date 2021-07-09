import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EveHttpService } from './eve-http.service';
import { FactionManager } from './FactionManager.class';
import { ChartData } from './interfaces/ChartData.interface';
import { RawEmpireData } from './RawEmpireData.interface';

@Injectable({
  providedIn: 'root'
})
export class FwEmpiresService {
  private manager !: FactionManager;
  public data$: BehaviorSubject<any> = new BehaviorSubject<any>( { title: '', factions: [], chart_data: [], selected_type: 'systems_controlled' } );

  constructor(
    private eve_http: EveHttpService
  ) {
    this.fetch_data().subscribe( raw_data => {
      this.manager = new FactionManager( raw_data );
      this.manager.update$.subscribe( () => {
        const data = {
          title: this.manager.title,
          factions: this.manager.factions,
          chart_data: this.chart_data,
          selected_type: this.manager.type,
          period: this.manager.period
        }
        this.data$.next( data );
      });
    });
  }


  public set current_type( type: 'systems_controlled' | 'pilots' ) {
    this.manager.type = type;
  }

  public set period( period: 'last_week') {
    this.manager.period = period;
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
        value: faction.statistics.get( this.manager.type, this.manager.period )
    }) )
    ;
  }

  private fetch_data(): Observable<RawEmpireData[]> {
    return this.eve_http.get('https://esi.evetech.net/latest/fw/stats') as Observable<RawEmpireData[]>;
  }

}
