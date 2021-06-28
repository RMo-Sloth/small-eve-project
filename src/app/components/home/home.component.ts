import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { FwEmpiresService } from 'src/app/fw-empires.service';
import { ChartData } from 'src/app/interfaces/ChartData.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('graph') graph !: ElementRef<HTMLElement>;
  @ViewChild('chart') chart !: ElementRef<HTMLElement>;
  @ViewChild('legend') legend !: ElementRef<HTMLElement>;

  private chart_data !: ChartData[];

  constructor(
    private empire_service: FwEmpiresService
  ) {}

  ngAfterViewInit(): void {
    this.empire_service.chart_data$.subscribe( chart_data => {
      this.chart_data = chart_data;
      this.update_svg();
    });
  }

  private update_svg() {
    this.update_chart();
    this.update_legend();
  }

  private update_legend() {
    const legend_meta = new LegendaMeta();

    const enter = d3.select( this.legend.nativeElement )
      .selectAll('text')
      .data( [
        { faction: { name: 'Minmatar', color: '#653834' } },
        { faction: { name: 'Amarr', color: '#7f6c50' } },
        { faction: { name: 'Caldari', color: '#4a6c7f' } },
        { faction: { name: 'Gallente', color: '#366565' } },
      ] )
      .enter()

    enter.append('text')
      .text( d => d.faction.name )
      .style('fill', 'white')
      .style( 'cursor', 'pointer' )
      .attr('x', d => legend_meta.x_pos() + 60 )
      .attr('y', d => legend_meta.y_scale( d.faction.name ) as number )
      .attr('font-size', 50 )
      .on('click', (event, d) => this.empire_service.toggle_faction( d.faction.name ) );


    enter.append( 'rect' )
      .attr( 'height', 30 )
      .attr( 'width', 30 )
      .attr('fill', d => d.faction.color )
      .attr('x', d => legend_meta.x_pos() )
      .attr('y', d => legend_meta.y_scale( d.faction.name ) as number - 30 )
  }

  private update_chart() {
    const chart = new BarChartMeta( this.chart_data );

    const enter = d3.select( this.chart.nativeElement )
    .selectAll('rect')
    .data( this.chart_data )
    .enter()

    enter.append( 'rect' )
    .attr('width', () => chart.x_scale.bandwidth() as number )
    .attr( 'x', d => chart.x_scale( d.faction.name ) as number )
    .attr( 'y', d => chart.y_pos( d.value ) )
    .attr('height', d => chart.y_scale( d.value ) )
    .attr( 'fill', d => d.faction.color )

    const exit = d3.select( this.chart.nativeElement )
    .selectAll('rect')
    .data( this.chart_data )
    .exit()

    exit.remove()

    const update = d3.select( this.chart.nativeElement )
    .selectAll('rect')
    .data( this.chart_data )
    .transition()

    update.attr('width', () => chart.x_scale.bandwidth() as number )
    .attr( 'x', d => chart.x_scale( d.faction.name ) as number )
    .attr( 'y', d => chart.y_pos( d.value ) )
    .attr('height', d => chart.y_scale( d.value ) )
    .attr( 'fill', d => d.faction.color )
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
    return d3.scaleBand(  )
      .paddingInner( 0.1 )
      .domain( [
        'Minmatar',
        'Amarr',
        'Caldari',
        'Gallente'
      ] )
      .range([this.area.top + 25, this.area.bottom + 25])
  }

  public x_pos(): number {
    return this.area.left;
  }

}

class SvgArea {
  private padding: number = 20;

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
