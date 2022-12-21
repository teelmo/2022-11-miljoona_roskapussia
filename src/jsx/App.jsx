import React, { useEffect, useState, useRef } from 'react';
import '../styles/styles.less';

// https://www.npmjs.com/package/react-is-visible
import 'intersection-observer';
import IsVisible from 'react-is-visible';

// https://www.npmjs.com/package/react-countup
import CountUp from 'react-countup';

import Map from './components/Map.jsx';
import BubbleMap from './components/BubbleMap.jsx';

// Load helpers.
import { getMetaData } from './helpers/GetMetaData.js';
import { getData } from './helpers/GetData.js';
import easingFn from './helpers/EasingFn.js';

function App() {
  const [municipalities, setMunicipalities] = useState([]);
  const [error, setError] = useState(false);
  const [currentArea, setCurrentArea] = useState(false);
  const [data, setData] = useState(false);
  const [metaData, setMetaData] = useState(false);
  const [currentSum, setCurrentSum] = useState(0);

  const videoRef = useRef();
  const mp4Ref = useRef();
  const webmRef = useRef();

  useEffect(() => {
    if (currentArea !== false) {
      videoRef.current.src = `${window.location.href.includes('yle.fi') ? 'https://lusi-dataviz.ylestatic.fi/2022-11-miljoona_roskapussia/' : './'}assets/vid/2022-11-miljoona_roskapussia_logo.mp4`;
      mp4Ref.current.src = `${window.location.href.includes('yle.fi') ? 'https://lusi-dataviz.ylestatic.fi/2022-11-miljoona_roskapussia/' : './'}assets/vid/2022-11-miljoona_roskapussia_logo.mp4`;
      webmRef.current.src = `${window.location.href.includes('yle.fi') ? 'https://lusi-dataviz.ylestatic.fi/2022-11-miljoona_roskapussia/' : './'}assets/vid/2022-11-miljoona_roskapussia_logo.webm`;
      videoRef.current.poster = `${window.location.href.includes('yle.fi') ? 'https://lusi-dataviz.ylestatic.fi/2022-11-miljoona_roskapussia/' : './'}assets/img/2022-11-miljoona_roskapussia_logo_poster.png`;
      if (!videoRef.current.playing) {
        videoRef.current.play();
      }
      if (!videoRef.current.playing) {
        videoRef.current.play();
      }
      let counter = 0;
      videoRef.current.addEventListener('ended', () => {
        counter++;
        if (counter < 3) {
          videoRef.current.play();
        }
      });
    }
  }, [currentArea]);

  useEffect(() => {
    getMetaData().then(metadata => {
      setMetaData(metadata);
      setMunicipalities(metadata.map(el => el.name_fi));
      getData().then(current => {
        setCurrentSum(current.reduce((acc, cur) => acc + parseInt(cur['SUM of Määrä'], 10), 0));
        setData(current.reduce((acc, cur) => Object.assign(acc, { [cur.Kunta]: parseInt(cur['SUM of Määrä'], 10) }), {}));
      });
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
      document.querySelector('#app_form').submit();
    }
  };

  return (
    <div className="app">
      <div className="content_container">
        <div className="logo_container">
          <img src={`${window.location.href.includes('yle.fi') ? 'https://lusi-dataviz.ylestatic.fi/2022-11-miljoona_roskapussia/' : './'}assets/img/2022-11-miljoona_roskapussia_logo.png`} alt="Logo" className="logo" />
          <h2 className="logo">Miljoona Roskapussia</h2>
          <h3 className="logo">Poimi roskat reitiltäsi</h3>
        </div>
      </div>
      <div className="content_container">
        <h2>Kaikki kerätyt roskat Suomessa</h2>
        <h4>
          <IsVisible once>
            {(isVisible) => (
              <div className="total_container">
                <div className="total_value_container">
                  {
                    (currentSum > 0 && isVisible) ? (<CountUp easingFn={easingFn} start={0} delay={0.7} end={currentSum} decimals={0} duration={4} separator="," useEasing prefix="" suffix="" />) : 0
                  }
                  {' '}
                  pussia
                </div>
                <div className="bar_container">
                  <span className="bar_total" />
                  {
                    (currentSum > 0) && <span className="bar_current" style={isVisible ? { width: `${currentSum / 1000000}%` } : {}} />
                  }
                  <span className="bar_target">1&nbsp;milj.</span>
                </div>
              </div>
            )}
          </IsVisible>
        </h4>
      </div>
      <div className="content_container">
        <h2>Ilmoita roskasi</h2>
        <div className="input_container">
          <form id="app_form" action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSe8_KXWyAipScRM_4RwiLNmmCA65XWh2WPOANyrtPQOoYiO-A/formResponse" target="app_form_result">
            <label htmlFor="app_enter_municipality">
              <input list="app_municipalities" id="app_enter_municipality" name="entry.1563106520" placeholder="Valitse kunta" />
              <datalist id="app_municipalities">
                {municipalities && municipalities.map(municipality => (
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label
                  <option key={municipality} value={municipality} />
                ))}
              </datalist>
            </label>
            <label htmlFor="app_enter_amount">
              <input id="app_enter_amount" type="number" name="entry.865756664" min="1" max="30" placeholder="Montako pussia keräsit" />
            </label>
            <iframe id="app_form_result" name="app_form_result" className="hidden" title="Tulos" />
          </form>
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
                <video autoPlay muted playsInline ref={videoRef} poster="">
                  <source src="" type="video/mp4" ref={mp4Ref} />
                  <source src="" type="video/webm" ref={webmRef} />
                  <track default kind="captions" srcLang="en" src="" />
                  Your browser does not support the video tag.
                </video>
                <h2>{currentArea}</h2>
                <h4>
                  <div>Kerättyjä pusseja</div>
                  <div>
                    {((data[currentArea]) ? data[currentArea] : 0) + parseInt(document.querySelector('#app_enter_amount').value, 10)}
                    {' '}
                    kappaletta
                  </div>
                </h4>
              </div>
            )
          }
        </div>
      </div>
      <div className="content_container">
        <p>Kartta päivittyy viiveellä</p>
        {data && <Map data={Object.entries(data)} />}
      </div>
      <div className="content_container">
        {(data && metaData) && <BubbleMap data={Object.entries(data)} metadata={metaData} />}
      </div>
      <noscript>Your browser does not support JavaScript!</noscript>
    </div>
  );
}

export default App;
