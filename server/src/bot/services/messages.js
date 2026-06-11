function formatTime(value) {
  return String(value || "").slice(0, 5);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getWelcomeWithoutTokenMessage() {
  return [
    "Здравствуйте!",
    "Сначала выберите дату экскурсии на сайте, затем перейдите в Telegram по кнопке подтверждения бронирования.",
    "",
    "Если вы уже открыли бота с сайта, просто нажмите кнопку ещё раз.",
  ].join("\n");
}

export function getDraftSummaryMessage(draft) {
  return [
    "Я нашёл вашу бронь:",
    `Экскурсия: ${draft.excursion_title}`,
    `Дата: ${formatDate(draft.slot_date)}`,
    `Время: ${formatTime(draft.start_time)}`,
    `Количество человек: ${draft.people_count}`,
    "",
    "Нажмите «Продолжить», чтобы оформить заявку.",
  ].join("\n");
}

export function getAskNameMessage() {
  return "Как вас зовут?";
}

export function getAskPhoneMessage(name) {
  return [
    `Спасибо, ${name}.`,
    "Теперь отправьте номер телефона для связи.",
  ].join("\n");
}

export function getAskCommentMessage() {
  return [
    "Если хотите, добавьте комментарий к бронированию.",
    "Например: удобный мессенджер, пожелания, детали.",
    "",
    "Если комментарий не нужен, отправьте символ: -",
  ].join("\n");
}

export function getFinalConfirmationMessage(session) {
  const draft = session.bookingDraft;

  return [
    "Проверьте данные перед подтверждением:",
    `Экскурсия: ${draft.excursion_title}`,
    `Дата: ${formatDate(draft.slot_date)}`,
    `Время: ${formatTime(draft.start_time)}`,
    `Количество человек: ${draft.people_count}`,
    `Имя: ${session.customerName}`,
    `Телефон: ${session.customerPhone}`,
    `Комментарий: ${session.comment || "—"}`,
    "",
    "Если всё верно, нажмите «Подтвердить бронь».",
  ].join("\n");
}

export function getSuccessMessage(result) {
  return [
    "Спасибо, заявка оформлена.",
    `Дата: ${formatDate(result.slot_date)}`,
    `Время: ${formatTime(result.start_time)}`,
  ].join("\n");
}

export function getCancelledMessage() {
  return "Текущее оформление брони отменено.";
}

export function getUnknownStateMessage() {
  return [
    "Сейчас нет активного шага оформления.",
    "Перейдите в бота с сайта ещё раз, чтобы начать бронирование.",
  ].join("\n");
}
