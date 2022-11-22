import React, { useState, useEffect, useRef } from 'react';
import '../styles/styles.less';

// https://d3js.org/
import * as d3 from 'd3';

// Load helpers.
import CSVtoJSON from './helpers/CSVtoJSON.js';

// Load helpers.
// import CSVtoJSON from './helpers/CSVtoJSON.js';
// import formatNr from './helpers/FormatNr.js';
// import roundNr from './helpers/RoundNr.js';

// const appID = '#app-root-2022-10-miljoona_roskapussia';

function App() {
  const chartRef = useRef(null);
  const [municipalities, setMunicipalities] = useState(false);

  const cleanData = (data) => data.map(el => ({
    group: parseInt(el.Group, 10),
    name: el.Name,
    population: parseInt(el.Population, 10),
    x: parseFloat(el.x),
    y: parseFloat(el.y)
  }));

  const createChart = (data) => {
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

    //    TODO: Update for v4
    //    .call(force.drag);

    circle.transition()
      .duration(1000)
      .delay((d, i) => i * 4)
      .attrTween('r', (d) => {
        const i = d3.interpolate(0, d.radius);
        return (t) => i(t);
      });

    function forceCluster(alpha) {
      for (let i = 0, n = nodes.length, node, cluster, k = alpha * 0.01; i < n; ++i) {
        node = nodes[i];
        cluster = clusters[node.cluster];
        node.vx -= (node.x - cluster.x) * k;
        node.vy -= (node.y - cluster.y) * k;
      }
    }

    function tick() {
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
  };

  useEffect(() => {
    const getDataPath = () => {
      if (window.location.href.includes('github')) return './assets/data/data.csv';
      if (process.env.NODE_ENV === 'production') return 'https://lusi-dataviz.ylestatic.fi/2022-10-miljoona_roskapussia/assets/data/data.csv';
      return 'assets/data/data.csv';
    };

    try {
      fetch(getDataPath())
        .then((response) => response.text())
        .then((body) => createChart(cleanData(CSVtoJSON(body))));
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className="app">
      <div className="container">
        <h3>Ilmoita roskasi</h3>
        <div className="input_container">
          <div className="input_wrapper">
            <label htmlFor="app_enter_amount">
              <input id="app_enter_amount" type="number" name="" min="1" max="30" placeholder="Syötä pussien määrä" />
            </label>
          </div>
          <div className="input_wrapper">
            <label htmlFor="app_enter_municipality">
              <input list="app_municipalities" id="app_enter_municipality" name="" placeholder="Valitse kunta" />
              <datalist id="app_municipalities">
                {municipalities && municipalities.map(municipality => (
                // eslint-disable-next-line jsx-a11y/control-has-associated-label
                  <option key={municipality} value={municipality} />
                ))}
              </datalist>
            </label>
          </div>
          <div className="input_wrapper">
            <input type="button" value="Lähetä kartalle" />
          </div>
        </div>
      </div>
      <div className="container">
        <h3>Nykytilanne kartalla</h3>
        <div className="input_container">
          <div className="input_wrapper">
            <label htmlFor="app_search_municipality">
              <input list="app_municipalities" id="app_search_municipality" name="" placeholder="Etsi kuntaa…" />
            </label>
          </div>
        </div>
        <div className="map_wrapper">
          <div className="map_container" ref={chartRef} />
          <div className="tooltip" />
        </div>
        <noscript>Your browser does not support JavaScript!</noscript>
      </div>
    </div>
  );
}

export default App;
