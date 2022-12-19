import CSVtoJSON from './CSVtoJSON.js';

const getDataPath = () => 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTzWNrOvN2fBEnBsx1h8D7d7GQLsOV-9ZheYr-PpF0nKf4fJCrW5GoKonLXjd-gcTxwHpD_0ylMqND6/pub?gid=336124972&single=true&output=csv';

export const getData = () => fetch(getDataPath())
  .then((response) => response.text())
  .then((body) => CSVtoJSON(body));

export default getData;
