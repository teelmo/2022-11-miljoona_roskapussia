// https://stackoverflow.com/questions/59016562/parse-csv-records-in-to-an-array-of-objects-in-javascript
const CSVtoJSON = (csv) => {
  const lines = csv.split(/\r\n|\r|\n/g);
  const result = [];
  const headers = lines[0].split(',');

  for (let i = 1; i < lines.length; i++) {
    const obj = {};

    if (lines[i].trim() !== '') {
      const words = lines[i].split(',');
      for (let j = 0; j < words.length; j++) {
        obj[headers[j].trim()] = words[j];
      }

      result.push(obj);
    }
  }
  return result;
};

export default CSVtoJSON;
