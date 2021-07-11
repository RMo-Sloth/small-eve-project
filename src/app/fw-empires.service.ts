import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FactionManagerService } from './faction-manager.service';
import { Faction } from './Faction.class';
import { ChartData } from './interfaces/ChartData.interface';
import { FactionDataPeriod, FactionDataType, FactionNames } from './types/types';

@Injectable({
  providedIn: 'root'
})
export class FwEmpiresService {
  public data$: BehaviorSubject<any> = new BehaviorSubject<any>( { title: '', factions: [], chart_data: [], selected_type: 'systems_controlled' } );

  constructor(
    private faction_manager: FactionManagerService
  ) {
    this.faction_manager.manager()
    .subscribe( manager => {
      manager.update$.subscribe( () => {
        // data is function of manager, so I can return data instead
        const data = {
          title: manager.title,
          factions: manager.factions,
          chart_data: this.chart_data( manager.factions ),
          selected_type: manager.type,
          period: manager.period
        }
        this.data$.next( data );
      });
    });
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
