export const mainPageData = {
  id: "main-page",
  title: "Главная страница",
  slug: "main",
  blocks: [
    {
      id: "hero-1",
      type: "hero",
      props: {
        title: "Стары Менск",
        subtitle: "Историко-культурный комплекс",
      },
    },
    {
      id: "cardsbar-1",
      type: "cardsBar",
      props: {
        cardNumbers: [1, 3, 4, 5],
      },
    },
    {
      id: "gallery-1",
      type: "imageTextGallery",
      props: {
        title: "О комплексе",
        description:
          "Описание блока, которое потом будет редактироваться из админки.",
        images: [
          "https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg",
          "https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg",
          "https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg",
        ],
      },
    },
    {
      id: "split-1",
      type: "splitInfo",
      props: {
        title: "Раздел",
        description: "Описание раздела",
        leftCardTitle: "Левая карточка",
        leftCardDescription: "Описание левой карточки",
        rightCardTitle: "Правая карточка",
        rightCardDescription: "Описание правой карточки",
      },
    },
    {
      id: "grid-1",
      type: "featureGrid",
      props: {
        title: "Новый раздел",
        card1Title: "Карточка 1",
        card1Description: "Описание карточки 1",
        card1ButtonText: "Подробнее",
        card2Title: "Карточка 2",
        card2Description: "Описание карточки 2",
        image1:
          "https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg",
        image2:
          "https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg",
        card3Title: "Карточка 3",
        card3Description: "Описание карточки 3",
      },
    },
    {
      id: "cardsbar-2",
      type: "cardsBar",
      props: {
        cardNumbers: [1, 3, 4, 5],
      },
    },
    {
      id: "promo-1",
      type: "promoCards",
      props: {
        title: "Заголовок блока",
        description: "Описание блока",
        buttonText: "Подробнее",
        card1Image:
          "https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg",
        card1Title: "Карточка 1",
        card1Description: "Описание карточки 1",
        card2Image:
          "https://starymensk.by/wp-content/uploads/2020/09/IMG_5223_%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%80%D0%B0%D0%B7%D0%BC%D0%B5%D1%80.jpg",
        card2Title: "Карточка 2",
        card2Description: "Описание карточки 2",
      },
    },
    {
      id: "textblock-1",
      type: "textBlock",
      props: {
        items: [
          { title: "2021", description: "Описание первого события." },
          { title: "2023", description: "Описание второго события." },
          { title: "2024", description: "Описание третьего события." },
        ],
        minHeight: "300px",
        width: "",
        maxWidth: "",
        height: "",
      },
    },
    {
      id: "map-1",
      type: "map",
      props: {},
    },
  ],
};
