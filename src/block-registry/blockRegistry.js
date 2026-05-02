import HeroBlock from "../blocks/HeroBlock";
import ImageTextGalleryBlock from "../blocks/ImageTextGalleryBlock";
import CardsBarBlock from "../blocks/CardsBarBlock";
import SplitInfoBlock from "../blocks/SplitInfoBlock";
import FeatureGridBlock from "../blocks/FeatureGridBlock";
import PromoCardsBlock from "../blocks/PromoCardsBlock";
import TextBlockBlock from "../blocks/TextBlockBlock";
import MapBlock from "../blocks/MapBlock";

export const blockRegistry = {
  hero: {
    label: "Hero",
    component: HeroBlock,
    defaultProps: {
      title: "Стары Менск",
      subtitle: "Историко-культурный комплекс",
    },
    fields: [
      { name: "title", label: "Заголовок", type: "text" },
      { name: "subtitle", label: "Подзаголовок", type: "textarea" },
    ],
  },

  imageTextGallery: {
    label: "Текст + галерея",
    component: ImageTextGalleryBlock,
    defaultProps: {
      title: "О комплексе",
      description: "Текст описания блока",
      images: [
        "https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg",
        "https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg",
        "https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg",
      ],
    },
    fields: [
      { name: "title", label: "Заголовок", type: "text" },
      { name: "description", label: "Описание", type: "textarea" },
      { name: "images.0", label: "Изображение 1", type: "text" },
      { name: "images.1", label: "Изображение 2", type: "text" },
      { name: "images.2", label: "Изображение 3", type: "text" },
    ],
  },

  cardsBar: {
    label: "Панель карточек",
    component: CardsBarBlock,
    defaultProps: {
      cardNumbers: [1, 2, 3, 4],
    },
    fields: [
      {
        name: "cardNumbers",
        label: "Показывать карточки",
        type: "checkbox-group",
        options: [
          { label: "Экскурсии", value: 1 },
          { label: "Расписание", value: 2 },
          { label: "Мероприятия", value: 3 },
          { label: "Проживание", value: 4 },
          { label: "Контакты", value: 5 },
        ],
      },
    ],
  },

  splitInfo: {
    label: "Две текстовые карточки",
    component: SplitInfoBlock,
    defaultProps: {
      title: "Раздел",
      description: "Описание раздела",
      leftCardTitle: "Левая карточка",
      leftCardDescription: "Описание левой карточки",
      rightCardTitle: "Правая карточка",
      rightCardDescription: "Описание правой карточки",
    },
    fields: [
      { name: "title", label: "Заголовок секции", type: "text" },
      { name: "description", label: "Описание секции", type: "textarea" },
      {
        name: "leftCardTitle",
        label: "Заголовок левой карточки",
        type: "text",
      },
      {
        name: "leftCardDescription",
        label: "Текст левой карточки",
        type: "textarea",
      },
      {
        name: "rightCardTitle",
        label: "Заголовок правой карточки",
        type: "text",
      },
      {
        name: "rightCardDescription",
        label: "Текст правой карточки",
        type: "textarea",
      },
    ],
  },

  featureGrid: {
    label: "Сетка возможностей",
    component: FeatureGridBlock,
    defaultProps: {
      title: "Новый раздел",
      card1Title: "Карточка 1",
      card1Description: "Описание карточки 1",
      card1ButtonText: "Подробнее",
      card2Title: "Карточка 2",
      card2Description: "Описание карточки 2",
      image1: "",
      image2: "",
      card3Title: "Карточка 3",
      card3Description: "Описание карточки 3",
    },
    fields: [
      { name: "title", label: "Заголовок секции", type: "text" },
      { name: "card1Title", label: "Заголовок карточки 1", type: "text" },
      {
        name: "card1Description",
        label: "Описание карточки 1",
        type: "textarea",
      },
      { name: "card1ButtonText", label: "Текст кнопки 1", type: "text" },
      { name: "card2Title", label: "Заголовок карточки 2", type: "text" },
      {
        name: "card2Description",
        label: "Описание карточки 2",
        type: "textarea",
      },
      { name: "image1", label: "Картинка 1", type: "text" },
      { name: "image2", label: "Картинка 2", type: "text" },
      { name: "card3Title", label: "Заголовок карточки 3", type: "text" },
      {
        name: "card3Description",
        label: "Описание карточки 3",
        type: "textarea",
      },
    ],
  },

  promoCards: {
    label: "Промо-блок с карточками",
    component: PromoCardsBlock,
    defaultProps: {
      title: "Заголовок блока",
      description: "Описание блока",
      buttonText: "Подробнее",
      card1Image: "",
      card1Title: "Карточка 1",
      card1Description: "Описание карточки 1",
      card2Image: "",
      card2Title: "Карточка 2",
      card2Description: "Описание карточки 2",
    },
    fields: [
      { name: "title", label: "Заголовок", type: "text" },
      { name: "description", label: "Описание", type: "textarea" },
      { name: "buttonText", label: "Текст кнопки", type: "text" },
      { name: "card1Image", label: "Картинка карточки 1", type: "text" },
      { name: "card1Title", label: "Заголовок карточки 1", type: "text" },
      {
        name: "card1Description",
        label: "Описание карточки 1",
        type: "textarea",
      },
      { name: "card2Image", label: "Картинка карточки 2", type: "text" },
      { name: "card2Title", label: "Заголовок карточки 2", type: "text" },
      {
        name: "card2Description",
        label: "Описание карточки 2",
        type: "textarea",
      },
    ],
  },

  textBlock: {
    label: "Текстовый блок",
    component: TextBlockBlock,
    defaultProps: {
      items: [
        { title: "2021", description: "Описание первого пункта" },
        { title: "2023", description: "Описание второго пункта" },
      ],
      minHeight: "300px",
      width: "",
      maxWidth: "",
      height: "",
    },
    fields: [
      { name: "items.0.title", label: "Заголовок 1", type: "text" },
      { name: "items.0.description", label: "Описание 1", type: "textarea" },
      { name: "items.1.title", label: "Заголовок 2", type: "text" },
      { name: "items.1.description", label: "Описание 2", type: "textarea" },
      { name: "items.2.title", label: "Заголовок 3", type: "text" },
      { name: "items.2.description", label: "Описание 3", type: "textarea" },
      { name: "minHeight", label: "Минимальная высота", type: "text" },
      { name: "width", label: "Ширина", type: "text" },
      { name: "maxWidth", label: "Максимальная ширина", type: "text" },
      { name: "height", label: "Высота", type: "text" },
    ],
  },

  map: {
    label: "Карта",
    component: MapBlock,
    defaultProps: {},
    fields: [],
  },
};
