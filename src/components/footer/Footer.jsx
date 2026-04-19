import React from "react";
import './footer.css'
import InstagramIcon from "../../assets/icons/InstagramIcon";
import FacebookIcon from "../../assets/icons/FacebookIcon";

const Footer = () => {
    return(
        <div className="footer">
            <div className="home-icon">
                <img src="https://starymensk.by/wp-content/uploads/2023/10/2.png" alt="Home"/>
            </div>
            <div>
                <h2>Место с историей</h2>
                <div>
                    <a>Услуги</a>
                    <a>Что посмотреть</a>
                    <a>Новости</a>
                    <a>График работы/Цены</a>
                </div>
            </div>
            <div>                
                <h2>Услуги</h2>
                <div>
                    <a>Пра нас</a>
                    <a>Усадьба “Стары Менск”</a>
                    <a>Прэса</a>
                    <a>Кошты</a>
                    <a>Как добраться</a>
                </div>
            </div>
            <div>
                <h2>Связаться с нами</h2>
                <div>
                    <a>Пра нас</a>
                    <a>Усадьба “Стары Менск”</a>
                    <a>Прэса</a>
                </div>
            </div>
            <div className="icon-bar"> 
                <InstagramIcon/>
                <FacebookIcon/>
            </div>
        </div>
    );
}

export default Footer