import React, {
  useEffect, useCallback, useState, useRef, useMemo, memo
} from 'react';
import PropTypes from 'prop-types';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import IsVisible from 'react-is-visible';

// https://d3js.org/
import * as d3 from 'd3';

// https://github.com/d3/d3-geo-projection/
import { geoLarrivee } from 'd3-geo-projection';

// https://www.npmjs.com/package/topojson
import * as topojson from 'topojson-client';

// https://vis4.net/chromajs/
import chroma from 'chroma-js';

// Load helpers.
import { getMapData } from '../helpers/GetMapData.js';

function Map({ data, metadata }) {
  const appRef = useRef();
  const mapRef = useRef();

  const [currentArea, setCurrentArea] = useState('');
  const [currentAreaID, setCurrentAreaID] = useState('');
  const [mapData, setMapdata] = useState(false);

  const values = useMemo(() => data.reduce((acc, cur) => Object.assign(acc, { [cur[0]]: cur[1] }), {}), [data]);
  const metadata_values = useMemo(() => metadata.reduce((acc, cur) => Object.assign(acc, { [cur.id]: cur }), {}), [metadata]);
  const max_value = Math.max(...data.map(el => el[1]));
  const f = useMemo(() => chroma.scale(['#fff', '#00764c']).domain([0, max_value]), [max_value]);

  const scales = [];
  let value = 0;
  while (value < max_value) {
    value += (max_value / 100);
    scales.push(value);
  }

  // Hide area info
  const hideData = () => {
    appRef.current.querySelector('.map_info').style.visibility = 'hidden';
    appRef.current.querySelector('.map_info').style.opacity = 0;
  };

  const updateMap = useCallback(() => {
    d3.select(appRef.current).select('.map_container').selectAll('path').attr('fill', (d) => (f(values[d.properties.Name] ? values[d.properties.Name] : 0)));
  }, [f, values]);

  const drawMap = useCallback((map_data) => {
    // Show area info
    const showData = (event, d) => {
      setCurrentArea(d.properties.Name);
      metadata.map(el => {
        if (el.name_fi === d.properties.Name) {
          setCurrentAreaID(el.id);
        }
        return false;
      });
      appRef.current.querySelector('.map_info').style.visibility = 'visible';
      appRef.current.querySelector('.map_info').style.opacity = 1;
    };
    const showTooltip = (event, d) => {
      d3.select(appRef.current).select('.map_tooltip')
        .style('left', `${event.offsetX + 10}px`)
        .style('top', `${event.offsetY + 10}px`)
        .style('display', 'inline')
        .style('opacity', 1)
        .html(`<strong>${d.properties.Name}</strong>${(values[d.properties.Name]) ? `<br /> ${values[d.properties.Name]} pussia` : ''}`);
    };
    const hideTooltip = () => {
      d3.select(appRef.current).select('.map_tooltip')
        .style('opacity', 0)
        .style('display', 'none');
    };
    const svg = d3.select('.map_container')
      .append('svg')
      .attr('height', 650)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .classed('svg-content', true)
      .attr('width', appRef.current.offsetWidth);

    const map = topojson.feature(map_data, map_data.objects.features);
    // https://observablehq.com/@d3/robinson
    const projection = geoLarrivee().fitExtent([[0, 0], [appRef.current.offsetWidth, 650]], map);
    const path = d3.geoPath().projection(projection);

    svg.append('g')
      .attr('class', 'areas')
      .selectAll('path')
      .data(map.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('id', (d, i) => i)
      .attr('class', 'path')
      // https://stackoverflow.com/questions/63693132/unable-to-get-node-datum-on-mouseover-in-d3-v6
      .on('mouseover', (event, d) => {
        showTooltip(event, d);
      })
      .on('mouseout', () => {
        hideTooltip();
      })
      .on('click', (event, d) => {
        showData(event, d);
      });
    updateMap();
  }, [metadata, updateMap, values]);

  useEffect(() => {
    getMapData().then(mapdata => {
      setMapdata(mapdata);
    });
  }, []);

  useEffect(() => {
    if (mapData !== false && d3.select(appRef.current).select('.map_container svg').empty() === true) drawMap(mapData);
  }, [drawMap, mapData]);

  return (
    <div className="map_wrapper map_municipality" ref={appRef}>
      <h2>Miltä tilanne näyttää kunnittain</h2>
      <h4>Valitse kunta täppäämällä tai klikkaamalla kuntaa</h4>
      <IsVisible once>
        {(isVisible) => (
          <>
            <div className="map_container map" ref={mapRef} style={isVisible ? { opacity: 1 } : {}} />
            <div className="legend_container">
              <h5>Enemmän kerättyjä pusseja →</h5>
              {
              scales.map((scale) => <div key={scale} className="legend" style={{ backgroundColor: f(scale) }} />)
            }
            </div>
          </>
        )}
      </IsVisible>
      <div className="map_info">
        <div className="map_info_content">
          <h3>{currentArea}</h3>
          {
            (currentArea && values[currentArea]) && (
              <div className="current_municipality_status">
                <h4>
                  <div>Kerättyjä pusseja</div>
                  <div>
                    {values[currentArea]}
                    {' '}
                    kappaletta
                  </div>
                </h4>
              </div>
            )
          }
          {
            currentAreaID && metadata_values[currentAreaID] && (
              <div className="neighbours_container">
                <h5>Miten naapureilla menee</h5>
                {
                metadata_values[currentAreaID].neighbours.map(neighbour => (
                  <div className="neighbour_container" key={neighbour}>
                    <span className="label">{metadata_values[neighbour].name_fi}</span>
                    {': '}
                    <span className="value">{(values[metadata_values[neighbour].name_fi]) ? `${values[metadata_values[neighbour].name_fi]} pussia` : 'ei vielä 😔'}</span>
                  </div>
                ))
              }
              </div>
            )
          }
          <div className="close_container"><button className="close" type="button" onClick={() => hideData()}>Sulje</button></div>
        </div>
      </div>
      <div className="map_tooltip" />
    </div>
  );
}

Map.propTypes = {
  metadata: PropTypes.instanceOf(Array).isRequired,
  data: PropTypes.instanceOf(Array).isRequired
};

Map.defaultProps = {
};

export default memo(Map);
