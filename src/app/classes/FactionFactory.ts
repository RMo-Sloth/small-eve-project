import { RawEmpireData } from "../RawEmpireData.interface";
import { AmarrFaction, CaldariFaction, Faction, GallenteFaction, MinmatarFaction } from "./Faction.class";

export class FactionFactory {
  private static factions: Map<number, { new( raw_data: RawEmpireData ): Faction }> = new Map()
  .set( 500001, CaldariFaction )
  .set( 500002, MinmatarFaction )
  .set( 500003, AmarrFaction )
  .set( 500004, GallenteFaction )
  ;


  public static create( raw_data: RawEmpireData ): Faction | undefined {
    let faction = this.factions.get( raw_data.faction_id );
    return faction ? new faction( raw_data ) : undefined;
  }
}
