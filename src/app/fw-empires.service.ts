import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { FactionManagerService } from './faction-manager.service';
import { Faction } from './Faction.class';
import { FactionManager } from './FactionManager.class';
import { ChartData } from './interfaces/ChartData.interface';
import { FactionDataPeriod, FactionDataType, FactionNames } from './types/types';

@Injectable({
  providedIn: 'root'
})
export class FwEmpiresService {
  public data$: BehaviorSubject<any> = new BehaviorSubject<any>( { title: '', factions: [], chart_data: [], selected_type: 'systems_controlled' } );
  public manager!: FactionManager;

  constructor(
    private faction_manager: FactionManagerService
  ) {
    this.faction_manager.manager()
    .pipe(
      tap( manager => this.manager = manager ),
      mergeMap( manager => manager.update$ ),
      map( () => ({
        title: this.manager.title,
        factions: this.manager.factions,
        chart_data: this.chart_data( this.manager.factions ),
        selected_type: this.manager.type,
        period: this.manager.period
      }) )
    )
    .subscribe( data => { this.data$.next( data ); });
  }


  public set current_type( type: FactionDataType ) {
    this.faction_manager.type = type;
  }

  public set period( period: FactionDataPeriod ) {
    this.faction_manager.period = period;
  }

  public toggle_faction( name: FactionNames ): void {
    this.faction_manager.toggle( name );
  }

  // can move this up to faction_manager
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
