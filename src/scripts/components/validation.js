// Отображение ошибки
const showInputError = (formElement, inputElement, errorMessage, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  inputElement.classList.add(settings.inputErrorClass);
  
  if (errorElement) {
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
  }
};

const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  
  inputElement.classList.remove(settings.inputErrorClass);
  
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove(settings.errorClass);
  }
};

// Проверка валидности поля
const checkInputValidity = (formElement, inputElement, settings) => {
  if (inputElement.validity.patternMismatch) {
    showInputError(formElement, inputElement, inputElement.dataset.errorMessage, settings);
  } else if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, inputElement.validationMessage, settings);
  } else {
    hideInputError(formElement, inputElement, settings);
  }
};

// Проверка наличия невалидных полей 
const hasInvalidInput = (inputList) => {
  return inputList.some((inputElement) => !inputElement.validity.valid);
};

const disableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
};

const enableSubmitButton = (buttonElement, settings) => {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
};

// Переключение состояния кнопки
const toggleButtonState = (inputList, buttonElement, settings) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
};

// Установка слушателей событий 
const setEventListeners = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });

  toggleButtonState(inputList, buttonElement, settings);
};

// Очистка валидации формы 
export const clearValidation = (formElement, settings) => {
  const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  const buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
  });

  if (buttonElement) {
    toggleButtonState(inputList, buttonElement, settings);
  }
};

export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector));

  formList.forEach((formElement) => {
    setEventListeners(formElement, settings);
  });
};