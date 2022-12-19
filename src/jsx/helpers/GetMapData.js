const getDataPath = () => {
  if (window.location.href.includes('github')) return './assets/data/2022-11-miljoona_roskapussia_map.tjson';
  if (process.env.NODE_ENV === 'production') return 'https://lusi-dataviz.ylestatic.fi/2022-11-miljoona_roskapussia/assets/data/2022-11-miljoona_roskapussia_map.tjson';
  return 'assets/data/2022-11-miljoona_roskapussia_map.tjson';
};

export const getMapData = () => fetch(getDataPath())
  .then((response) => response.text())
  .then((body) => JSON.parse(body));

export default getMapData;
