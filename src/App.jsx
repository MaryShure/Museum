import { useState } from 'react'
import './styles/global.css'
import './styles/main_page.css'
import Card from './components/cards/Card'
import Header from './components/header/Header'
import Cardsbar from './components/cards/CardsBar'
import Footer from './components/footer/Footer'
import SecondaryButton from './components/buttons/SecondaryButton'
import Map from './components/map/Map'
import CardMini from './components/cards/CardMini'
import CardWithText from './components/cards/CardWithText'
import CardNoHover from './components/cards/CardNoHover'
import BigCard from './components/cards/BigCard'
import TextBlock from './components/cards/TextBlock'
import StartText from './components/cards/StartText'

function App() {
  return (
    <>
      <Header/>
      <div className='first-block'>
        <h1>Стары Менск</h1>
        <p>Место с историей</p>
      </div>
      <div className='main-content'>
        <Cardsbar/>
        <div className="block-two">
          <div className="block-two-item block-two-text">
            <CardWithText 
              title="О нас"
              description="Аграусадьба «Стары Менск» работает с 2020 года. Мы находимся всего в 7 км от МКАД (за Малиновкой), в деревне Городище Минского района."
            />
          </div>

          <img
            className="block-two-item block-two-img block-two-img-1"
            src="https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg"
            alt="Банкетный зал Стары Менск"
            loading="lazy"
          />

          <img
            className="block-two-item block-two-img block-two-img-2"
            src="https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg"
            alt="Банкетный зал Стары Менск"
            loading="lazy"
          />

          <img
            className="block-two-item block-two-img block-two-img-3"
            src="https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg"
            alt="Банкетный зал Стары Менск"
            loading="lazy"
          />
        </div>
        <div>
          <StartText 
            title='Историческое сердце усадьбы'
            description='Мы бережно храним историю нашего края, создавая живой архив для будущих поколений.'
          />
          <div className='inner-block'>
          <CardWithText 
              title="О Менске Х века"
              description="Уникальная площадка в 40 гектар, где оживает история. Погрузитесь в атмосферу древнего города через археологические находки и живое ремесло."
            />
            <CardWithText 
              title="О деревне Городище XVI–XIX вв."
              description="Более 200 оригинальных экспонатов, собранных с любовью и вниманием к деталям быта наших предков."
            />
          </div>
        </div>

      </div>
      
      <Map/>
      <Footer/>
    </>
  )
}

export default App
