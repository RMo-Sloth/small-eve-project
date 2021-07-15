import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { FwEmpiresService } from 'src/app/fw-empires.service';
import { faBirthdayCake, faSkullCrossbones, faFighterJet, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Faction } from 'src/app/classes/Faction.class';
import { ChartData, FactionDataType } from 'src/app/types/types';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('title') title !: ElementRef<HTMLElement>;
  @ViewChild('chart') chart !: ElementRef<HTMLElement>;
  @ViewChild('legend') legend !: ElementRef<HTMLElement>;
  @ViewChild('datasets') datasets !: ElementRef<HTMLElement>;
  @ViewChild('periods') periods !: ElementRef<HTMLElement>;
  @ViewChild('y_axis') y_axis !: ElementRef<HTMLElement>;

  private faSkullCrossbones = faSkullCrossbones;
  private faFighterJet = faFighterJet;
  private faGlobe = faGlobe;
  private faBirthdayCake = faBirthdayCake;

  constructor(
    private empire_service: FwEmpiresService
  ) {}

  ngAfterViewInit(): void {
    this.empire_service.data$.subscribe( data => {
      this.update_title( data.title );
      this.update_legend( data.factions );
      this.update_chart( data.chart_data );
      this.update_dataset_selection( data );
      this.update_period( data );
      this.update_y_axis( data.chart_data );
    });
  }

  private update_y_axis( chart_data: ChartData[] ) {
    const area = new SvgArea( 0, 250, 150, 750 );
    // create axis
    const max = d3.max( chart_data, d => d.value ) as number;
    const y_scale = d3.scaleLinear().domain( [0, max] ).range([area.bottom, area.top]);
    const y_axis = d3.axisLeft( y_scale )
    .tickSizeInner( 5 )
    .tickSizeOuter( 2 )
    .tickPadding( 5 )
    .ticks(5)
    ;


    d3.select( this.y_axis.nativeElement ).select("g").remove();

    // render axis to gui
    d3.select( this.y_axis.nativeElement )
    .append( 'g' )
    .call( y_axis )
    .attr("transform", `translate(${area.right}, 0)`)

    d3.select( this.y_axis.nativeElement )
    .selectAll('.tick line')
    .attr('stroke', 'white')

    d3.select( this.y_axis.nativeElement )
    .selectAll('.tick text')
    .attr('fill', 'white')
    .style('font-size', '20')

    d3.select( this.y_axis.nativeElement )
    .selectAll('.domain')
    .attr('fill', 'white')
  }

  private update_period( data: any ) {
    const area = new SvgArea( 600, 650, 1000, 1000 );
    let periods: any[];
    if( data.selected_type === 'pilots' || data.selected_type === 'systems_controlled' )
      periods = [];
    else periods = [
      { description: 'yesterday', text: '1' },
      { description: 'last_week', text: '7' },
      { description: 'total', text: '&#x221e;' }
    ];
    const x_scale = d3.scaleBand()
    .paddingInner( 0.5 )
    .paddingOuter( 0.5 )
    .domain( periods )
    .range([area.left, area.right ])

    d3.select( this.periods.nativeElement )
    .selectAll('circle')
    .data( periods )
    .enter()
    .append('circle')
    .attr('stroke-width', 5 )
    .attr('r', 30 )
    .attr('fill', 'transparent' )
    .attr( 'cy', area.vertical_center )
    .attr( 'cx', d => x_scale( d ) as number + x_scale.bandwidth()*0.5 )
    .style( 'cursor', 'pointer' )
    .on( 'click', (event, d) => this.empire_service.period = d.description )
    ;

    d3.select( this.periods.nativeElement )
    .selectAll('text')
    .data( periods )
    .enter()
    .append('text')
    .html( d => d.text )
    .attr( 'y', area.vertical_center + 15 )
    .attr( 'x', d => x_scale( d ) as number + x_scale.bandwidth()*0.5 )
    .attr( 'text-anchor', 'middle' )
    .style('font-size', 40)
    .style('pointer-events', 'none' )

    d3.select( this.periods.nativeElement )
    .selectAll('text')
    .data( periods )
    .exit()
    .remove()
    ;

    d3.select( this.periods.nativeElement )
    .selectAll('circle')
    .data( periods )
    .exit()
    .remove()
    ;

    d3.select( this.periods.nativeElement )
    .selectAll('text')
    .attr('fill', 'grey' )
    .attr('stroke', 'grey' )
    .filter( (d: any) => d.description === data.period )
    .attr('fill', 'white' )
    .attr('stroke', 'white' )

    d3.select( this.periods.nativeElement )
    .selectAll('circle')
    .attr('stroke', 'grey' )
    .filter( (d: any) => d.description === data.period )
    .attr('stroke', 'white' )

  }


  private update_dataset_selection( data_2: any ) {
    const area = new SvgArea( 0, 650, 600, 1000 );
    const data: { value: string, icon: any }[] = [
      { value: 'systems_controlled', icon: this.faGlobe.icon },
      { value: 'pilots', icon: this.faFighterJet.icon },
      { value: 'kills', icon: this.faSkullCrossbones.icon },
      { value: 'victory_points', icon: this.faBirthdayCake.icon }
    ];
    const x_scale = d3.scaleBand()
    .paddingInner( 0.5 )
    .paddingOuter( 0.5 )
    .domain( data.map( data => data.value ))
    .range([area.left, area.right ])
    ;
    const svg = d3.select(this.datasets.nativeElement)
      .selectAll('svg')
      .data( data )
      .enter()
      .append('svg')
      .attr('viewBox', d => `0 0 ${d.icon[0]} ${d.icon[1]}`)
      .attr('width', x_scale.bandwidth)
      .attr('height', x_scale.bandwidth)
      .attr('y', () => ((area.top + area.bottom) / 2))
      .attr('x', (d, i) => { return x_scale(d.value) as number; })
      ;

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        this.empire_service.current_type = d.value as FactionDataType;
      })
      ;

      svg.append('path')
      .attr('d', d => d.icon[4] as string)
      .attr('fill', 'grey')
      .style('pointer-events', 'none')
      ;

      d3.select( this.datasets.nativeElement )
      .selectAll('svg>path')
      .attr( 'fill', 'grey' )
      .filter( (d: any) => d.value === data_2.selected_type )
      .attr( 'fill', 'white' )
      ;
  }


  private update_title( title: string ) {
    d3.select(this.title.nativeElement)
      .selectAll('text')
      .data([title])
      .enter()
      .append('text')
      .text(d => d)
      .style('fill', 'white')
      .attr('font-size', 75)
      .attr('x', '50%')
      .attr('y', 175)
      .attr('text-anchor', 'middle');

    d3.select(this.title.nativeElement)
      .selectAll('text')
      .data([title])
      .transition()
      .text(d => d);
  }


  private update_legend( factions: Faction[] ) {
    const area = new SvgArea( 600, 350, 1000, 650 );
    const y_scale = d3.scaleBand()
      .paddingInner( 0.1 )
      .domain( factions.map( faction => faction.name ) )
      .range([area.top + 25, area.bottom + 25]);
    const legend = d3.select( this.legend.nativeElement )
      .selectAll('text')
      .data( factions );

    legend.enter()
    .append('text')
    .text( d => d.name )
    .style('fill', 'white')
    .style( 'cursor', 'pointer' )
    .attr('x', d => area.left + 60 )
    .attr('y', d => y_scale( d.name ) as number )
    .attr('font-size', 50 )
    .attr('opacity', d => d.enabled ? 1 : 0.3 )
    .on('click', (event, d) => this.empire_service.toggle_faction( d.name ) )
    ;

    legend.enter()
    .append( 'rect' )
    .attr( 'height', 30 )
    .attr( 'width', 30 )
    .attr('fill', d => d.color )
    .attr('x', d => area.left )
    .attr('y', d => y_scale( d.name ) as number - 30 )
    ;

    legend.transition()
    .attr('opacity', d => d.enabled ? 1 : 0.3 )
    ;
  }


  private update_chart( chart_data: ChartData[] ) {
    const chart = new BarChartMeta( chart_data );
    const bars = d3.select(this.chart.nativeElement)
      .selectAll('rect')
      .data( chart_data )
      ;

    bars
    .enter()
    .append( 'rect' )
    .attr('width', () => chart.x_scale.bandwidth() as number )
    .attr( 'x', d => chart.x_scale( d.faction.name ) as number )
    .attr( 'y', d => chart.y_pos( d.value ) )
    .attr('height', d => chart.y_scale( d.value ) )
    .attr( 'fill', d => d.faction.color )
    ;

    bars
    .exit()
    .remove()
    ;

    bars
    .transition()
    .attr('width', () => chart.x_scale.bandwidth() as number )
    .attr( 'x', d => chart.x_scale( d.faction.name ) as number )
    .attr( 'y', d => chart.y_pos( d.value ) )
    .attr('height', d => chart.y_scale( d.value ) )
    .attr( 'fill', d => d.faction.color )
    ;
  }

}

// classes
class BarChartMeta {
  private area = new SvgArea( 50, 250, 600, 750 );
  private data: ChartDataHelper;
  constructor(
    chart_data: ChartData[]
  ) {
    this.data = new ChartDataHelper( chart_data )
  }

  public get y_scale(): d3.ScaleLinear<number, number, never> {
    return d3.scaleLinear().domain([0, this.data.max]).range([ 0, this.area.height ]);
  }

  public y_pos( d: any ): any {
    return this.area.bottom - this.y_scale( d );
  }

  public get x_scale(): d3.ScaleBand<string> {
    return d3.scaleBand()
      .paddingInner( 0.1 )
      .domain( this.data.factions)
      .range([this.area.left, this.area.right])
  }

}

class SvgArea {
  private padding: number = 50;

  constructor(
    private x1: number,
    private y1: number,
    private x2: number,
    private y2: number
  ) {}

    public get width(): number {
      return this.x2 - this.x1 - 2 * this.padding;
    }
    public get height(): number {
      return this.y2 - this.y1 - 2 * this.padding;
    }
    public get bottom(): number {
      return this.y2 - this.padding;
    }
    public get top(): number {
      return this.y1 + this.padding;
    }
    public get left() {
      return this.x1 + this.padding;
    }
    public get right() {
      return this.x2 - this.padding;
    }
    public get vertical_center() {
      return (this.y1 + this.y2) / 2;
    }

}

// CHARTDATA
class ChartDataHelper {
  constructor(
    private data: ChartData[]
  ){}

  public get max(): number {
    return d3.max( this.data, d => d.value ) as number;
  }

  public get min() {
    return d3.min( this.data, d => d.value ) as number;
  }

  public get factions() {
    return this.data.map( empire => empire.faction.name );
  }

}

//
