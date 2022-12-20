import CSVtoJSON from './CSVtoJSON.js';

const cleanData = (data) => data.map(el => ({
  group: parseInt(el.group, 10),
  id: el.id,
  name_fi: el.name_fi,
  name_se: el.name_se,
  population: parseInt(el.population, 10),
  x: parseFloat(el.x),
  y: parseFloat(el.y)
}));

const getDataPath = () => {
  if (window.location.href.includes('github')) return './assets/data/2022-11-miljoona_roskapussia_data.csv';
  if (process.env.NODE_ENV === 'production') return 'https://lusi-dataviz.ylestatic.fi/2022-11-miljoona_roskapussia/assets/data/data.csv';
  return 'assets/data/2022-11-miljoona_roskapussia_data.csv';
};

export const getMetaData = () => fetch(getDataPath())
  .then((response) => response.text())
  .then((body) => cleanData(CSVtoJSON(body)));

export default getMetaData;
