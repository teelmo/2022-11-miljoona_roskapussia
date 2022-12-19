import CSVtoJSON from './CSVtoJSON.js';

const cleanData = (data) => data.map(el => ({
  group: parseInt(el.Group, 10),
  name: el.Name,
  population: parseInt(el.Population, 10),
  x: parseFloat(el.x),
  y: parseFloat(el.y)
}));

const getDataPath = () => {
  if (window.location.href.includes('github')) return './assets/data/data.csv';
  if (process.env.NODE_ENV === 'production') return 'https://lusi-dataviz.ylestatic.fi/2022-11-miljoona_roskapussia/assets/data/data.csv';
  return 'assets/data/2022-11-miljoona_roskapussia_data.csv';
};

export const getData = () => fetch(getDataPath())
  .then((response) => response.text())
  .then((body) => (cleanData(CSVtoJSON(body))));

export default getData;
