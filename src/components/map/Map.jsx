import React from 'react';
import './map.css';

const Map = () => {
  return (
    <section className="map">
      <div className="map-content">
        <h1>Ждем вас в гости!</h1>
          <div className='map-text-block'>
            <h2>Адрес</h2>
            <p>д. Городище, Минский район, ул. Замковая, 1</p>
          </div>
          <div className='map-text-block'>
            <h2>Для навигаторов</h2>
            <p>Введите «Стары Менск» или координаты: 53.8247, 27.3411</p>
          </div>
      </div>

      <div className="map-style">
        <iframe
          title="Карта Стары Менск"
          src="https://www.openstreetmap.org/export/embed.html?bbox=27.3211%2C53.8147%2C27.3611%2C53.8347&layer=mapnik&marker=53.8247%2C27.3411"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>

        <a
          className="map-link"
          href="https://www.openstreetmap.org/?mlat=53.8247&mlon=27.3411#map=15/53.8247/27.3411"
          target="_blank"
          rel="noopener noreferrer"
        >
          Открыть карту
        </a>
      </div>
    </section>
  );
};

export default Map;