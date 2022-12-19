import React, {
  useEffect, useCallback, useState, useRef, memo
} from 'react';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import IsVisible from 'react-is-visible';

// https://d3js.org/
import * as d3 from 'd3';

// https://github.com/d3/d3-geo-projection/
import { geoLarrivee } from 'd3-geo-projection';

// https://www.npmjs.com/package/topojson
import * as topojson from 'topojson-client';

// Load helpers.
import { getData } from '../helpers/GetMapData.js';

function Map() {
  const appRef = useRef();
  const mapRef = useRef();

  const [currentArea, setCurrentArea] = useState('');

  // Show area info
  const showData = useCallback((event, d) => {
    setCurrentArea(d.properties.Name);
    appRef.current.querySelector('.map_info').style.visibility = 'visible';
    appRef.current.querySelector('.map_info').style.opacity = 1;
  }, []);

  // Hide area info
  const hideData = () => {
    appRef.current.querySelector('.map_info').style.visibility = 'hidden';
    appRef.current.querySelector('.map_info').style.opacity = 0;
  };

  const showTooltip = (event, d) => {
    d3.select(appRef.current).select('.map_tooltip')
      .style('left', `${event.offsetX + 10}px`)
      .style('top', `${event.offsetY + 10}px`)
      .style('display', 'inline')
      .style('opacity', 1)
      .html(d.properties.Name);
  };

  const hideTooltip = () => {
    d3.select(appRef.current).select('.map_tooltip')
      .style('opacity', 0)
      .style('display', 'none');
  };

  const drawMap = useCallback((data) => {
    const svg = d3.select('.map_container')
      .append('svg')
      .attr('height', 650)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .classed('svg-content', true)
      .attr('width', appRef.current.offsetWidth);

    const map_data = topojson.feature(data, data.objects.features);
    // https://observablehq.com/@d3/robinson
    const projection = geoLarrivee().fitExtent([[0, 0], [appRef.current.offsetWidth, 650]], map_data);
    const path = d3.geoPath().projection(projection);

    svg.append('g')
      .attr('class', 'countries')
      .selectAll('path')
      .data(map_data.features)
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
  }, [showData]);

  useEffect(() => {
    getData().then(data => {
      drawMap(data);
    });
  }, [drawMap]);

  return (
    <div className="map_wrapper" ref={appRef}>
      <IsVisible once>
        {(isVisible) => (
          <div className="map_container" ref={mapRef} style={isVisible ? { opacity: 1 } : {}} />
        )}
      </IsVisible>
      <div className="map_info">
        <div className="map_info_content">
          <h3>{currentArea}</h3>
          <div className="close_container"><button className="close" type="button" onClick={() => hideData()}>Sulje</button></div>
        </div>
      </div>
      <div className="map_tooltip" />
    </div>
  );
}

export default memo(Map);
