import { useState } from 'react'
import './styles/global.css'
import './styles/main_page.css'
import Card from './components/cards/Card'
import Header from './components/header/Header'
import MenuCard from './components/cards/MenuCard'
import Cardsbar from './components/cards/CardsBar'
import Footer from './components/footer/Footer'
import SecondaryButton from './components/buttons/SecondaryButton'
import Map from './components/map/Map'
import CardMini from './components/cards/CardMini'

function App() {
  return (
    <>
      <Header/>
      <div className='first-block'>
        <h1>Стары Менск</h1>
        <p>Место с историей</p>
      </div>
      <Cardsbar/>
      <Card 
        image="https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg"
        title="Банкетные залы"
        description="Это краткое описание товара. Здесь может быть несколько предложений о характеристиках и преимуществах."
        linkUrl="/product/1"
      />
      <CardMini 
        image="https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg"
        title="Банкетные залы"
        description="Это краткое описание товара. Здесь может быть несколько предложений о характеристиках и преимуществах."
        linkUrl="/product/1"
      />


      <SecondaryButton text="Button"/>
      <Map/>
      <Footer/>
    </>
  )
}

export default App
