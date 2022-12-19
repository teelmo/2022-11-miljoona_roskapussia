const getDataPath = () => {
  if (window.location.href.includes('github')) return './assets/data/data.csv';
  if (process.env.NODE_ENV === 'production') return 'https://lusi-dataviz.ylestatic.fi/2022-11-miljoona_roskapussia/assets/data/data.csv';
  return 'assets/data/2022-11-miljoona_roskapussia_map.tjson';
};

export const getData = () => fetch(getDataPath())
  .then((response) => response.text())
  .then((body) => JSON.parse(body));

export default getData;
