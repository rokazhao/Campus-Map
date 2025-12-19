import React, { ChangeEvent, Component } from 'react';
import campusMap from './img/campus_map.jpg';
import { Hour, indexAtHour, parseHour, Schedule } from './schedule';
import { Building, Edge, getBuildingByShortName, parseEdges } from './buildings';
import { isRecord } from './record';
import { Nearby, parseNearbyList } from './nearby';


// Radius of the circles drawn for each start/end and friends.
const RADIUS: number = 30;


type MapProps = {
  user: string;                 // name of the current user
  buildings: Array<Building>;   // list of all known buildings
  schedule?: Schedule;           // class schedule
};

type MapState = {
  hour?: Hour;
  path?: Array<Edge>;
  nearby?: Array<Nearby>;
};


/** Displays a map and paths the user walks in their schedule. */
export class MapViewer extends Component<MapProps, MapState> {
  constructor(props: MapProps) {
    super(props);

    this.state = {};
  }

  componentDidUpdate = (oldProps: MapProps, _oldState: MapState): void => {
    // If the App changed our props, then we should clear the map
    if (oldProps !== this.props) {
      this.setState({
        hour: undefined, path: undefined, nearby: undefined
      });
    }
  };

  /**
   * Returns the start and end buildings for the path at the given start time.
   * @param hour
   * @requires hour is the start time of an event after the first in schedule
   */
  getEndpointsAt = (hour: Hour): [Building, Building] => {
    if (!this.props.schedule)
      throw new Error('impossible');

    const index = indexAtHour(this.props.schedule, hour);
    if (index < 0)
      throw new Error("impossible: no event at this hour")
    if (index === 0)
      throw new Error("impossible: chose hour of first event")

    return [
      getBuildingByShortName(
        this.props.buildings, this.props.schedule[index - 1].location),
      getBuildingByShortName(
        this.props.buildings, this.props.schedule[index].location)
    ];
  };

  render = (): JSX.Element => {
    if (!this.props.schedule) {
      return <div className="content">
        <p>Loading schedule...</p>
      </div>;

    } else if (this.state.hour === undefined) {
      return <div>
        <svg id="svg" width="866" height="593" viewBox="0 0 4330 2964">
          <image href={campusMap} width="4330" height="2964" />
        </svg>
        <br></br>
        <div className="legend">
          <p>Show path at {this.renderPathTimes()}</p>
        </div>
      </div>;
    } else if (this.state.path === undefined) {
      return <div>
        <svg id="svg" width="866" height="593" viewBox="0 0 4330 2964">
          <image href={campusMap} width="4330" height="2964" />
        </svg>
        <br></br>
        <div className="legend">
          <p>Finding shortest path...</p>
        </div>
      </div>;
    } else {
      return <div>
        <svg id="svg" width="866" height="593" viewBox="0 0 4330 2964">
          <image href={campusMap} width="4330" height="2964" />
          {this.renderPath()}
          {this.renderEndPoints()}
        </svg>
        <br></br>
        <div className="legend">
          <p>Show path at {this.renderPathTimes()}</p>
          {this.renderLegendItems()}
        </div>
      </div>;
    }
  };

  renderPathTimes = (): JSX.Element => {
    if (this.props.schedule === undefined)
      throw new Error('impossible');

    const hours: Array<JSX.Element> = [];
    if (this.state.hour === undefined)
      hours.push(<option value="" key="">Choose</option>);
    for (const event of this.props.schedule.slice(1)) {
      const hour = event.hour;
      hours.push(<option value={hour} key={hour}>{hour}</option>)
    }

    return <select value={this.state.hour || ''}
      onChange={this.doHourChange}>
      {hours}
    </select>
  };

  /** Returns SVG elements for the two end points. */
  renderEndPoints = (): Array<JSX.Element> => {
    if (this.state.hour === undefined)
      throw new Error('impossible: no hour');

    if (this.props.schedule === undefined)
      return [];

    for (const [idx, event] of this.props.schedule.entries()) {
      if (event.hour === this.state.hour) {
        break;
      }
      if (event.hour !== this.state.hour && idx === this.props.schedule.length - 1) {
        return [];
      }
    }

    const [start, end] = this.getEndpointsAt(this.state.hour);
    const elems: Array<JSX.Element> = [
      <circle cx={start.location.x} cy={start.location.y} fill={'red'} r={RADIUS}
        stroke={'white'} strokeWidth={10} key={'start'} />,
      <circle cx={end.location.x} cy={end.location.y} fill={'blue'} r={RADIUS}
        stroke={'white'} strokeWidth={10} key={'end'} />
    ];

    // TODO: add circles for each nearby friend in Task 6
    if (this.state.nearby) {
      for (const [idx, friends] of this.state.nearby.entries()) {
        const color = FRIEND_COLORS[idx % FRIEND_COLORS.length];
        elems.push(
          <circle cx={friends.loc.x} cy={friends.loc.y} fill={color} r={RADIUS}
            stroke={'white'} strokeWidth={10} key={`friend-${idx}`} />
        );
      }
    }
    return elems;
  };

  /** Returns SVG elements for the edges on the path. */
  renderPath = (): Array<JSX.Element> => {
    if (this.state.path === undefined)
      throw new Error('impossible: no path');

    const elems: Array<JSX.Element> = [];
    for (const [idx, e] of this.state.path.entries()) {
      elems.push(<line x1={e.start.x} y1={e.start.y} key={idx}
        x2={e.end.x} y2={e.end.y} stroke={'green'} strokeWidth={10} />)
    }
    return elems;
  };

  renderLegendItems = (): Array<JSX.Element> => {
    if (this.state.hour === undefined)
      throw new Error('impossible: no hour');

    if (this.props.schedule === undefined)
      return [];

    for (const [idx, event] of this.props.schedule.entries()) {
      if (event.hour === this.state.hour) {
        break;
      }
      if (event.hour !== this.state.hour && idx === this.props.schedule.length - 1) {
        return [];
      }
    }

    const [start, end] = this.getEndpointsAt(this.state.hour);

    const items: Array<JSX.Element> = [];
    items.push(makeLegendItem('red', `Start at ${start.shortName}`, 'start'));
    items.push(makeLegendItem('blue', `End at ${end.shortName}`, 'end'));

    // TODO: add a legend item for each nearby friend in Task 6
    if (this.state.nearby) {
      for (const [idx, friends] of this.state.nearby.entries()) {
        const color = FRIEND_COLORS[idx % FRIEND_COLORS.length];
        items.push(makeLegendItem(color, `${friends.friend} is nearby`, `friend-${idx}`));
      }
    }

    return items;
  };

  doHourChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
    const hour = parseHour(evt.target.value);
    this.setState({ hour });

    fetch('/api/shortestPath' +
      '?user=' + encodeURIComponent(this.props.user) +
      '&hour=' + encodeURIComponent(hour))
      .then(this.doShortestPathResp)
      .catch(this.doShortestPathError);
  };

  doShortestPathResp = (res: Response): void => {
    if (res.status !== 200) {
      res.text()
        .then((msg) => this.doShortestPathError(`bad status code ${res.status}: ${msg}`))
        .catch(() => this.doShortestPathError("Failed to parse error response message"));
    } else {
      res.json()
        .then(this.doShortestPathJson)
        .catch(() => this.doShortestPathError("Failed to parse response data as JSON"));
    }
  }

  doShortestPathJson = (data: unknown): void => {
    if (!isRecord(data) || typeof data.found !== "boolean") {
      this.doShortestPathError("response is not in expected form");
      return;
    }

    if (data.found) {
      // TODO: parse & record the nearby points in the state in Task 6
      const nearby = data.nearby ? parseNearbyList(data.nearby) : [];
      this.setState({
        path: parseEdges(data.path),
        nearby: nearby
      });
    } else {
      this.setState({
        path: undefined,
        nearby: undefined
      });
    }
  }

  doShortestPathError = (msg: string): void => {
    console.error("error while fetching '/api/shortestPath', ", msg);
  };

}


/**
 * Returns HTML for an item on the legend with the given color and description.
 * @param color Color of the item on the map
 * @param desc Description of the item on the map.
 * @param key Unique ID for this legend item
 */
const makeLegendItem = (color: string, desc: string, key: string): JSX.Element => {
  return <div key={key} className="legend-item">
    <div className={"legend-color"} style={{ backgroundColor: color }}>&nbsp;</div>
    {' ' + desc}
  </div>;
};


/** List of colors to use for nearby friends. */
// TODO: uncomment this in Task 6
const FRIEND_COLORS: Array<string> = [
  "#F0BC68", "#C4D7D1", "#F5D1C3", "#FFB6A3", "#B8C6D9", "#8596A6",
];