import React, {
  useEffect, useCallback, useMemo, useState, useRef, memo
} from 'react';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import IsVisible from 'react-is-visible';

// https://d3js.org/
import * as d3 from 'd3';

// https://github.com/d3/d3-geo-projection/
import { geoRobinson } from 'd3-geo-projection';

// https://www.npmjs.com/package/topojson
import * as topojson from 'topojson-client';

function Map() {
  const appRef = useRef();
  const mapRef = useRef();

  const showData = useCallback((event) => {
    
  }, []);

  const hideData = () => {
    appRef.current.querySelector('.area_information_container').style.display = 'none';
    appRef.current.querySelector('.area_information_container').style.opacity = 0;
  };

  const drawMap = useCallback((data) => {
    setMunicipalities(data.map(el => el.name));
    const maxRadius = 6;

    const max_x = Math.max(...data.map(el => el.x));
    const max_y = Math.max(...data.map(el => el.y));
    const min_x = Math.min(...data.map(el => el.x));
    const min_y = Math.min(...data.map(el => el.y));
    // const max_population = Math.max(...data.map(el => el.population));
    // const min_population = Math.min(...data.map(el => el.population));

    const margin = {
      bottom: 0, left: 40, right: 40, top: 0
    };
    const height = 600 - margin.top - margin.bottom;
    // const width = chartRef.current.offsetWidth - margin.left - margin.right;
    const width = 300;

    const m = 19; // number of distinct clusters

    const svg = d3.select('.map_container').append('svg').attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right)
      .append('g')
      .attr('transform', `translate(${width / 2} ,${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(d3.range(m));

    // The largest node for each cluster.
    const clusters = new Array(m);

    const nodes = data.map((el) => {
      const i = parseInt(el.group, 10);
      const r = Math.max(4, (Math.sqrt((i + 1) / m) * -Math.log(Math.random())) * maxRadius);
      // const r = (maxRadius - 4) * ((el.population - min_population) / (max_population - min_population)) + 4;
      const d = {
        // x: Math.cos((i / m) * 2 * Math.PI) * 200 + width / 2 + Math.random(),
        // y: Math.sin((i / m) * 2 * Math.PI) * 200 + height / 2 + Math.random(),
        cluster: el.group,
        name: el.name,
        population: el.population,
        radius: r,
        x: el.x,
        y: el.y
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
        d3.selectAll('circle')
          .style('opacity', 0.3);
        d3.select(event.target).style('opacity', 1);
        d3.select('.tooltip')
          .style('left', `${event.offsetX + 10}px`)
          .style('top', `${event.offsetY + 10}px`)
          .style('display', 'inline')
          .style('opacity', 1)
          .html(d.name);
      })
      .on('mouseout', () => {
        d3.selectAll('circle')
          .style('opacity', 1);
        d3.select('.tooltip')
          .style('opacity', 0)
          .style('display', 'none');
      });

    circle.transition()
      .duration(1000)
      .delay((d, i) => i * 4)
      .attrTween('r', (d) => {
        const i = d3.interpolate(0, d.radius);
        return (t) => i(t);
      });

    forceCluster = (alpha) => {
      for (let i = 0, n = nodes.length, node, cluster, k = alpha * 0.01; i < n; ++i) {
        node = nodes[i];
        cluster = clusters[node.cluster];
        node.vx -= (node.x - cluster.x) * k;
        node.vy -= (node.y - cluster.y) * k;
      }
    }

    tick = () => {
      circle
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
    }

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
  }, []);

  useEffect(() => {
    drawMap();
  }, []);

  return (
    <div className="map_wrapper" ref={appRef}>
      <IsVisible once>
        {(isVisible) => (
          <div className="map_container" ref={mapRef} style={isVisible ? { opacity: 1 } : {}} />
        )}
      </IsVisible
      <div className="map_info">
        <h3>Area</h3>
        <div className="close_container"><button type="button" onClick={() => hideData()}>Close</button></div>
      </div>
      <div className="map_tooltip" />
    </div>
  );
}

export default memo(Map);