/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  updateProfile,
  addCard,
  removeCard,
  addLike,
  removeLike,
  updateAvatar,
} from "./components/api.js";
import {
  createCardElement,
  removeCardElement,
  checkIsLiked,
  updateLikes,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";

// DOM узлы
const listItemTemplate = document.querySelector(
  "#popup-info-user-preview-template",
).content;
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description",
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");

const headerLogo = document.querySelector(".header__logo");
const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalInfoList =
  usersStatsModalWindow.querySelector(".popup__info");
const infoDefinitionTemplate = document.querySelector(
  "#popup-info-definition-template",
).content;

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

let cardToDeleteElement = null;
let cardToDeleteId = null;

const renderLoading = (
  isLoading,
  button,
  initialText = "Сохранить",
  loadingText = "Сохранение...",
) => {
  if (isLoading) {
    button.textContent = loadingText;
  } else {
    button.textContent = initialText;
  }
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (title, description) => {
  const infoElement = infoDefinitionTemplate
    .querySelector(".popup__info-item")
    .cloneNode(true);
  infoElement.querySelector(".popup__info-term").textContent = title;
  infoElement.querySelector(".popup__info-description").textContent =
    description;
  return infoElement;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  renderLoading(true, submitButton, initialText, "Сохранение...");

  const newName = profileTitleInput.value;
  const newAbout = profileDescriptionInput.value;

  updateProfile(newName, newAbout)
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  renderLoading(true, submitButton, initialText, "Сохранение...");

  updateAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url('${userData.avatar}')`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
};

const handleDeleteCard = (cardElement, cardId) => {
  cardToDeleteElement = cardElement;
  cardToDeleteId = cardId;
  openModalWindow(removeCardModalWindow);
};

const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  renderLoading(true, submitButton, initialText, "Удаление...");

  removeCard(cardToDeleteId)
      .then(() => {
        removeCardElement(cardToDeleteElement);
        closeModalWindow(removeCardModalWindow);
        cardToDeleteElement = null;
        cardToDeleteId = null;
      })
      .catch((err) => {
        console.log(`Ошибка при удалении карточки: ${err}`);
      })
      // Добавляем блок finally для возврата текста кнопки
      .finally(() => {
        renderLoading(false, submitButton, initialText); 
      });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const initialText = submitButton.textContent;

  renderLoading(true, submitButton, initialText, "Создание...");

  addCard(cardNameInput.value, cardLinkInput.value)
    .then((cardData) => {
      const cardElement = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
        },
        currentUserId,
      );

      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(false, submitButton, initialText);
    });
};

const handleLikeCard = (likeButton, cardId, likeCounter) => {
  const isLiked = checkIsLiked(likeButton);

  if (isLiked) {
    removeLike(cardId)
      .then((updatedCard) => {
        updateLikes(likeButton, likeCounter, updatedCard.likes, currentUserId);
      })
      .catch((err) => console.log(err));
  } else {
    addLike(cardId)
      .then((updatedCard) => {
        updateLikes(likeButton, likeCounter, updatedCard.likes, currentUserId);
      })
      .catch((err) => console.log(err));
  }
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      usersStatsModalInfoList.innerHTML = "";

      const uniqueUsers = new Set(cards.map((card) => card.owner._id));

      const totalLikes = cards.reduce(
        (sum, card) => sum + card.likes.length,
        0,
      );

      const likesCountByUser = {};

      cards.forEach((card) => {
        card.likes.forEach((user) => {
          if (!likesCountByUser[user._id]) {
            likesCountByUser[user._id] = {
              name: user.name,
              count: 0,
            };
          }
          likesCountByUser[user._id].count += 1;
        });
      });

      let maxLikesGiven = 0;
      let championName = "Пока нет лайков";

      for (const userId in likesCountByUser) {
        if (likesCountByUser[userId].count > maxLikesGiven) {
          maxLikesGiven = likesCountByUser[userId].count;
          championName = likesCountByUser[userId].name;
        }
      }

      usersStatsModalInfoList.append(
        createInfoString("Всего пользователей:", uniqueUsers.size),
      );
      usersStatsModalInfoList.append(
        createInfoString("Всего лайков:", totalLikes),
      );
      usersStatsModalInfoList.append(
        createInfoString("Максимально лайков от одного:", maxLikesGiven),
      );
      usersStatsModalInfoList.append(
        createInfoString("Чемпион лайков:", championName),
      );

      // Работаем с заголовком и списком популярных (внизу окна)
      const popupTitle = usersStatsModalWindow.querySelector(".popup__title");
      popupTitle.textContent = "Статистика карточек";

      const popupText = usersStatsModalWindow.querySelector(".popup__text");
      popupText.textContent = "Популярные карточки:";

      // Очищаем и заполняем список имен популярных карточек (например, первые 3)
      const popularList = usersStatsModalWindow.querySelector(".popup__list");
      popularList.innerHTML = "";

      const topCards = [...cards]
        .sort((a, b) => b.likes.length - a.likes.length)
        .slice(0, 3);

      topCards.forEach((card) => {
        const liElement = listItemTemplate
          .querySelector(".popup__list-item")
          .cloneNode(true);
        liElement.textContent = card.name;
        popularList.append(liElement);
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleRemoveCardSubmit);
headerLogo.addEventListener("click", handleLogoClick);

openProfileFormButton.addEventListener("click", () => {
  clearValidation(profileForm, validationSettings); // Очистка
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings); // Очистка
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Временная заглушка, чтобы карточки отрисовались
const openImageModal = (cardData) => {
  console.log("Клик по картинке!", cardData);
};

let currentUserId;

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url('${userData.avatar}')`;

    // ... внутри Promise.all ...
    cards.forEach((cardData) => {
      const cardElement = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
        },
        currentUserId,
      );
      placesWrap.append(cardElement);
    });
  })
  .catch((err) => {
    console.log(err);
  });

enableValidation(validationSettings);
