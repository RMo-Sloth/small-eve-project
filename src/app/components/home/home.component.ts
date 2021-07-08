import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { FwEmpiresService } from 'src/app/fw-empires.service';
import { ChartData } from 'src/app/interfaces/ChartData.interface';

import { faBirthdayCake, faSkullCrossbones, faFighterJet, faGlobe } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('graph') graph !: ElementRef<HTMLElement>;
  @ViewChild('title') title !: ElementRef<HTMLElement>;
  @ViewChild('chart') chart !: ElementRef<HTMLElement>;
  @ViewChild('legend') legend !: ElementRef<HTMLElement>;
  @ViewChild('datasets') datasets !: ElementRef<HTMLElement>;

  faSkullCrossbones = faSkullCrossbones;
  faFighterJet = faFighterJet;
  faGlobe = faGlobe;
  faBirthdayCake = faBirthdayCake;

  constructor(
    private empire_service: FwEmpiresService
  ) {}

  ngAfterViewInit(): void {
    this.empire_service.data$.subscribe( data => {
      this.update_title( data.title );
      this.update_legend( data.factions );
      this.update_chart( data.chart_data );
    });

    this.update_dataset_selection();
    window.setTimeout( () => {
      this.update_type( 'pilots' )
    });
  }

  private update_dataset_selection() {
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
        this.update_type( d.value )
      })
      ;

      svg.append('path')
      .attr('d', d => d.icon[4] as string)
      .attr('fill', 'grey')
      .style('pointer-events', 'none')
      ;
    }

  private update_type( selection: string ) {
    this.empire_service.current_type = selection as 'systems_controlled';
    d3.select( this.datasets.nativeElement )
    .selectAll('svg>path')
    .attr( 'fill', 'grey' )
    .filter( (d: any) => d.value === selection )
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

  private update_legend( legend_data: any[] ) {
    const area = new SvgArea( 600, 350, 1000, 650 );
    const legend_meta = new LegendaMeta();
    const legend = d3.select( this.legend.nativeElement )
    .selectAll('text')
    .data( legend_data )
    ;

    legend.enter()
    .append('text')
    .text( d => d.name )
    .style('fill', 'white')
    .style( 'cursor', 'pointer' )
    .attr('x', d => area.left + 60 )
    .attr('y', d => legend_meta.y_scale( d.name ) as number )
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
    .attr('y', d => legend_meta.y_scale( d.name ) as number - 30 )
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
  private area = new SvgArea( 0, 250, 500, 750 );
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
//
class LegendaMeta {
  private area = new SvgArea( 600, 350, 1000, 650 );

  constructor() {}

  public get y_scale() {
    return d3.scaleBand()
      .paddingInner( 0.1 )
      .domain( [
        'Minmatar',
        'Amarr',
        'Caldari',
        'Gallente'
      ] )
      .range([this.area.top + 25, this.area.bottom + 25])
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
