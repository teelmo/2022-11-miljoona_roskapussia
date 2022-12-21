import React, {
  useEffect, useCallback, useRef, useState, useMemo, memo
} from 'react';
import PropTypes from 'prop-types';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import IsVisible from 'react-is-visible';

// https://d3js.org/
import * as d3 from 'd3';

function BubbleMap({ data, metadata }) {
  const appRef = useRef(null);
  const mapRef = useRef(null);

  const [currentAreaName, setCurrentAreaName] = useState('');
  const [currentAreaID, setCurrentAreaID] = useState('');

  const values = useMemo(() => data.reduce((acc, cur) => Object.assign(acc, { [cur[0]]: cur[1] }), {}), [data]);
  const metadata_values = useMemo(() => metadata.reduce((acc, cur) => Object.assign(acc, { [cur.id]: cur }), {}), [metadata]);

  // Hide area info
  const hideData = () => {
    appRef.current.querySelector('.map_info').style.visibility = 'hidden';
    appRef.current.querySelector('.map_info').style.opacity = 0;
  };
  const drawMap = useCallback(() => {
    // Show area info
    const showData = (event, d) => {
      setCurrentAreaName(d.name);
      setCurrentAreaID(d.id);
      appRef.current.querySelector('.map_info').style.visibility = 'visible';
      appRef.current.querySelector('.map_info').style.opacity = 1;
    };

    const max_value = Math.max(...data.map(el => el[1]));

    const maxRadius = 40;

    const max_x = Math.max(...metadata.map(el => el.x));
    const max_y = Math.max(...metadata.map(el => el.y));
    const min_x = Math.min(...metadata.map(el => el.x));
    const min_y = Math.min(...metadata.map(el => el.y));
    // const max_population = Math.max(...data.map(el => el.population));
    // const min_population = Math.min(...data.map(el => el.population));

    const margin = {
      bottom: 0, left: 40, right: 40, top: 0
    };
    const height = 600 - margin.top - margin.bottom;
    const width = mapRef.current.offsetWidth - margin.left - margin.right;

    const m = 19; // number of distinct clusters

    const svg = d3.select(appRef.current).select('.map_container').append('svg').attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right)
      .append('g')
      .attr('transform', `translate(${width / 2 - 20} ,${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(d3.range(m));

    // The largest node for each cluster.
    const clusters = new Array(m);

    const nodes = metadata.map((el) => {
      const name = el.name_fi;
      const i = parseInt(el.group, 10);
      // const r = Math.max(4, (Math.sqrt((i + 1) / m) * -Math.log(Math.random())) * maxRadius);
      const r = (maxRadius) * ((((values[name]) ? values[name] : 1) - 0) / (max_value - 0)) + 4;
      const d = {
        // x: Math.cos((i / m) * 2 * Math.PI) * 200 + width / 2 + Math.random(),
        // y: Math.sin((i / m) * 2 * Math.PI) * 200 + height / 2 + Math.random(),
        cluster: el.group,
        id: el.id,
        name,
        population: el.population,
        radius: r,
        x1: el.x,
        y1: el.y
      };
      if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
      return d;
    });

    const circle = svg.selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      // .attr('r', (d) => d.radius)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .style('fill', (d) => color(d.cluster))
      .on('mouseover', (event, d) => {
        d3.select(appRef.current).selectAll('circle')
          .style('opacity', 0.3);
        d3.select(event.target).style('opacity', 1);
        d3.select(appRef.current).select('.map_tooltip')
          .style('left', `${event.offsetX + 10}px`)
          .style('top', `${event.offsetY + 10}px`)
          .style('display', 'inline')
          .style('opacity', 1)
          .html(`<strong>${d.name}</strong>${(values[d.name]) ? `<br /> ${values[d.name]} pussia` : ''}`);
      })
      .on('mouseout', () => {
        d3.select(appRef.current).selectAll('circle')
          .style('opacity', 1);
        d3.select(appRef.current).select('.map_tooltip')
          .style('opacity', 0)
          .style('display', 'none');
      })
      .on('click', (event, d) => {
        showData(event, d);
      });
    circle.transition()
      .duration(1000)
      .delay((d, i) => i * 4)
      .attrTween('r', (d) => {
        const i = d3.interpolate(0, d.radius);
        return (t) => i(t);
      });
    const forceCluster = (alpha) => {
      for (let i = 0, n = nodes.length, node, cluster, k = alpha * 0.01; i < n; ++i) {
        node = nodes[i];
        cluster = clusters[node.cluster];
        node.vx -= (node.x - cluster.x) * k;
        node.vy -= (node.y - cluster.y) * k;
      }
    };
    const tick = () => {
      circle
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
    };
    const forceCollide = d3.forceCollide()
      .radius((d) => d.radius + 1.5)
      .iterations(1);
    d3.forceSimulation()
      .nodes(nodes)
      // .force('center', d3.forceCenter())
      .force('collide', forceCollide)
      .force('cluster', forceCluster)
      .force('gravity', d3.forceManyBody(20))
      .force('x', d3.forceX().x((d) => (width / 3) * ((d.x1 - min_x) / (max_x - min_x))).strength(0.5))
      .force('y', d3.forceY().y((d) => (height / 1.5) * ((min_y - d.y1) / (max_y - min_y)) + 170).strength(0.5))
      .on('tick', tick);
  }, [data, metadata, values]);

  useEffect(() => {
    if (d3.select(appRef.current).select('.map_container svg').empty() === true) drawMap();
  }, [drawMap]);

  return (
    <div className="map_wrapper map_bubble" ref={appRef}>
      <p>Tää on tässä vaan Teemon omaksi huviksi, ei osaksi toteutusta</p>
      <IsVisible once>
        {(isVisible) => (
          <div className="map_container" ref={mapRef} style={isVisible ? { opacity: 1 } : {}} />
        )}
      </IsVisible>
      <div className="map_info">
        <div className="map_info_content">
          <h3>{currentAreaName}</h3>
          {
            (currentAreaName && values[currentAreaName]) && (
              <div className="current_municipality_status">
                <h4>
                  <div>Kerättyjä pusseja</div>
                  <div>
                    {values[currentAreaName]}
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

BubbleMap.propTypes = {
  metadata: PropTypes.instanceOf(Array).isRequired,
  data: PropTypes.instanceOf(Array).isRequired
};

BubbleMap.defaultProps = {
};

export default memo(BubbleMap);
