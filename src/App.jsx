import { useState } from 'react'
import './styles/global.css'
import Card from './components/cards/Card'
import MenuButton from './components/buttons/MenuButton'
import DotIcon from './assets/icons/DotIcon'

function App() {
  return (
    <>
      <h1>Мое SaaS приложение</h1>
      <p>Мое SaaS приложение</p>
      <Card 
        image="https://starymensk.by/wp-content/uploads/2022/09/0287-2048x1366.jpg"
        title="Банкетные залы"
        description="Это краткое описание товара. Здесь может быть несколько предложений о характеристиках и преимуществах."
        linkUrl="/product/1"
      />
      <MenuButton 
        icon={<DotIcon color="var(--primary-300)" />}
        text="Услуги"
        linkUrl="/"
      />
    </>
  )
}

export default App
