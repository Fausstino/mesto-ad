export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const removeCardElement = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  currentUserId,
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete",
  );
  const cardImage = cardElement.querySelector(".card__image");
  const likeCounter = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (likeCounter) {
    likeCounter.textContent = data.likes.length;
  }
  const isLiked = data.likes.some((user) => user._id === currentUserId);

  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }
  if (data.owner._id !== currentUserId) {
    deleteButton.remove();
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () =>
      onLikeIcon(likeButton, data._id, likeCounter),
    );
  }

  if (onDeleteCard) {
    deleteButton.addEventListener("click", () =>
      onDeleteCard(cardElement, data._id),
    );
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link }),
    );
  }

  return cardElement;
};

export const checkIsLiked = (likeButton) => {
  return likeButton.classList.contains("card__like-button_is-active");
};

export const updateLikes = (
  likeButton,
  likeCounter,
  likesArray,
  currentUserId,
) => {
  likeCounter.textContent = likesArray.length;
  const isLikedByMe = likesArray.some((user) => user._id === currentUserId);

  if (isLikedByMe) {
    likeButton.classList.add("card__like-button_is-active");
  } else {
    likeButton.classList.remove("card__like-button_is-active");
  }
};
