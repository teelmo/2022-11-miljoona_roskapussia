import React, { useEffect, useState } from 'react';
import '../styles/styles.less';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import IsVisible from 'react-is-visible';

// https://www.npmjs.com/package/react-countup
import CountUp from 'react-countup';

import Map from './components/Map.jsx';

// Load helpers.
import { getData } from './helpers/GetData.js';
import easingFn from './helpers/EasingFn.js';

function App() {
  const [municipalities, setMunicipalities] = useState([]);
  const [error, setError] = useState(false);
  const [currentArea, setCurrentArea] = useState(false);

  useEffect(() => {
    getData().then(data => {
      setMunicipalities(data.map(el => el.name));
    });
  }, []);

  const testInputs = () => {
    const amount = parseInt(document.querySelector('#app_enter_amount').value, 10);
    const municipality = document.querySelector('#app_enter_municipality').value;

    return ((!Number.isNaN(amount) && amount > 0 && amount <= 100) && municipalities.includes(municipality)) ? { amount, municipality } : false;
  };

  const submitForm = () => {
    const values = testInputs();
    if (!values) {
      setError('Hups, jotain meni pieleen. Tarkista pussien määrä ja valittu kunta!');
      setCurrentArea(false);
    } else {
      setError(false);
      setCurrentArea(values.municipality);
    }
  };

  return (
    <div className="app">
      <div className="content_container">
        <div className="logo_container">
          <img src={`${process.env.NODE_ENV === 'production' ? 'https://lusi-dataviz.ylestatic.fi/2022-11-miljoona_roskapussia/' : './'}assets/img/2022-11-miljoona_roskapussia_logo.png`} alt="Logo" className="logo" />
          <h2 className="logo">Miljoona Roskapussia</h2>
          <h3 className="logo">Poimi roskat reitiltäsi</h3>
        </div>
      </div>
      <div className="content_container">
        <h3>Kaikki kerätyt roskat Suomessa</h3>
        <h4>
          <IsVisible once>
            {(isVisible) => (
              <div className="total_container">
                <div className="total_value_container">
                  {isVisible ? (<CountUp easingFn={easingFn} start={0} delay={0.7} end={55} decimals={0} duration={4} separator="," useEasing prefix="" suffix="" />) : 0}
                  {' '}
                  pussia
                </div>
                <div className="bar_container">
                  <span className="bar_total" />
                  <span className="bar_current" style={isVisible ? { width: '50%' } : {}} />
                  <span className="bar_target">1&nbsp;milj.</span>
                </div>
              </div>
            )}
          </IsVisible>
        </h4>
      </div>
      <div className="content_container">
        <h3>Ilmoita roskasi</h3>
        <div className="input_container">
          <label htmlFor="app_enter_amount">
            <input id="app_enter_amount" type="number" name="" min="1" max="30" placeholder="Montako pussia keräsit" />
          </label>
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
        <div className="button_container">
          <button type="button" value="" onClick={() => submitForm()}>Lähetä!</button>
        </div>
        <div className="result_container">
          {
            error && <div className="error_msg_container">{error}</div>
          }
          {
            currentArea && (
              <div>
                <div className="logo">
                  <img src={`${process.env.NODE_ENV === 'production' ? 'https://lusi-dataviz.ylestatic.fi/2022-11-miljoona_roskapussia/' : './'}assets/img/2022-11-miljoona_roskapussia_logo.gif`} alt="Logo" />
                </div>
                <h3>{currentArea}</h3>
              </div>
            )
          }
        </div>
      </div>
      <div className="content_container">
        <Map />
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;
