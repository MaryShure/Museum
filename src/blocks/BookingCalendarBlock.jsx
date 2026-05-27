import { useEffect, useMemo, useState } from "react";
import {
  getExcursionTypes,
  getExcursionSlots,
  createBookingDraft,
  createManualBooking,
} from "../api/bookingApi";
import PrimaryButton from "../components/buttons/PrimaryButton";
import SecondaryButton from "../components/buttons/SecondaryButton";
import ArrowRight from "../assets/icons/ArrowRight";
import ArrowLeft from "../assets/icons/ArrowLeft";
import "../styles/booking-calendar.css";

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const weekdayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const toLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const formatHumanDate = (value) => {
  if (!value) return "";

  const normalized = String(value).slice(0, 10);
  const [year, month, day] = normalized.split("-").map(Number);

  if (!year || !month || !day) return normalized;

  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const isSlotBookable = (slot) => {
  const capacity = Number(slot.capacity) || 0;
  const bookedCount = Number(slot.booked_count) || 0;
  return slot.status === "available" && bookedCount < capacity;
};

const buildCalendarDays = (currentMonth, slotsByDate) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (firstDay.getDay() + 6) % 7;

  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ type: "empty", key: `empty-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const isoDate = toLocalDateKey(date);
    const daySlots = slotsByDate[isoDate] || [];
    const hasAvailable = daySlots.some(isSlotBookable);

    cells.push({
      type: "day",
      key: isoDate,
      isoDate,
      day,
      hasAvailable,
    });
  }

  return cells;
};

const BookingCalendarBlock = ({ props = {} }) => {
  const {
    title = "Выберите дату посещения",
    description = "Основной способ подтверждения — через Telegram. Если это неудобно, можно оставить заявку прямо на сайте.",
    defaultExcursionTypeId = "",
    excursionTypeId = "",
    minPeople = 1,
    maxPeople = 10,
  } = props;

  const initialExcursionTypeId =
    defaultExcursionTypeId || excursionTypeId || "";

  const [excursionTypes, setExcursionTypes] = useState([]);
  const [selectedExcursionTypeId, setSelectedExcursionTypeId] = useState(
    initialExcursionTypeId ? String(initialExcursionTypeId) : "",
  );
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [peopleCount, setPeopleCount] = useState(Number(minPeople) || 1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const monthKey = useMemo(() => getMonthKey(currentMonth), [currentMonth]);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        setIsLoadingTypes(true);
        setError("");

        const data = await getExcursionTypes();
        const safeData = Array.isArray(data) ? data : [];
        setExcursionTypes(safeData);

        if (!initialExcursionTypeId && safeData.length > 0) {
          setSelectedExcursionTypeId(String(safeData[0].id));
        }
      } catch (err) {
        setError(err.message || "Не удалось загрузить типы");
      } finally {
        setIsLoadingTypes(false);
      }
    };

    loadTypes();
  }, [initialExcursionTypeId]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedExcursionTypeId) {
        setSlots([]);
        return;
      }

      try {
        setIsLoadingSlots(true);
        setError("");

        const data = await getExcursionSlots({
          excursion_type_id: selectedExcursionTypeId,
          month: monthKey,
        });

        const safeData = Array.isArray(data) ? data : [];
        setSlots(safeData);
      } catch (err) {
        setError(err.message || "Не удалось загрузить даты");
      } finally {
        setIsLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedExcursionTypeId, monthKey]);

  useEffect(() => {
    setSelectedDate("");
    setSelectedSlotId(null);
    setShowManualForm(false);
    setSuccessMessage("");
    setError("");
  }, [selectedExcursionTypeId, currentMonth]);

  const slotsByDate = useMemo(() => {
    return slots.reduce((acc, slot) => {
      const key = String(slot.slot_date).slice(0, 10);

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(slot);
      return acc;
    }, {});
  }, [slots]);

  const calendarDays = useMemo(
    () => buildCalendarDays(currentMonth, slotsByDate),
    [currentMonth, slotsByDate],
  );

  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return (slotsByDate[selectedDate] || []).filter(isSlotBookable);
  }, [selectedDate, slotsByDate]);

  const selectedExcursionType = useMemo(() => {
    return excursionTypes.find(
      (item) => String(item.id) === String(selectedExcursionTypeId),
    );
  }, [excursionTypes, selectedExcursionTypeId]);

  const handleContinueTelegram = async () => {
    if (!selectedSlotId || !selectedExcursionTypeId) return;

    try {
      setIsRedirecting(true);
      setError("");
      setSuccessMessage("");

      const result = await createBookingDraft({
        excursion_type_id: Number(selectedExcursionTypeId),
        excursion_slot_id: Number(selectedSlotId),
        people_count: Number(peopleCount),
      });

      if (!result?.telegram_url) {
        throw new Error("Сервер не вернул ссылку для Telegram");
      }

      window.location.href = result.telegram_url;
    } catch (err) {
      setError(err.message || "Не удалось перейти в Telegram");
    } finally {
      setIsRedirecting(false);
    }
  };

  const handleCreateManual = async () => {
    if (!selectedSlotId || !selectedExcursionTypeId) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Введите имя и номер телефона");
      return;
    }

    try {
      setIsSubmittingManual(true);
      setError("");
      setSuccessMessage("");

      await createManualBooking({
        excursion_type_id: Number(selectedExcursionTypeId),
        excursion_slot_id: Number(selectedSlotId),
        people_count: Number(peopleCount),
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
      });

      setCustomerName("");
      setCustomerPhone("");
      setShowManualForm(false);
      setSuccessMessage(
        "Заявка отправлена. Мы свяжемся с вами после ручного подтверждения.",
      );
    } catch (err) {
      setError(err.message || "Не удалось отправить заявку");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <section className="booking-calendar-block">
      <div className="booking-calendar-block__intro">
        <p className="booking-calendar-block__eyebrow">Бронирование</p>
        <h2 className="booking-calendar-block__title">{title}</h2>
        {description ? (
          <p className="booking-calendar-block__description">{description}</p>
        ) : null}
      </div>

      <div className="booking-calendar-block__panel">
        <div className="booking-calendar-block__type-selector">
          <label className="booking-calendar-block__label">
            Тип посещения
            <select
              className="booking-calendar-block__select"
              value={selectedExcursionTypeId}
              onChange={(e) => setSelectedExcursionTypeId(e.target.value)}
              disabled={isLoadingTypes}
            >
              <option value="">
                {isLoadingTypes ? "Загрузка..." : "Выберите тип"}
              </option>

              {excursionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.title}
                </option>
              ))}
            </select>
          </label>

          {selectedExcursionType?.description ? (
            <p className="booking-calendar-block__type-description">
              {selectedExcursionType.description}
            </p>
          ) : null}
        </div>

        <div className="booking-calendar-block__header">
          <SecondaryButton
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                  1,
                ),
              )
            }
            icon={<ArrowLeft />}
          >
            Назад
          </SecondaryButton>

          <div className="booking-calendar-block__month-title">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>

          <SecondaryButton
            type="button"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1,
                ),
              )
            }
            icon={<ArrowRight />}
          >
            Вперёд
          </SecondaryButton>
        </div>

        <div className="booking-calendar-block__weekdays">
          {weekdayNames.map((day) => (
            <div key={day} className="booking-calendar-block__weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="booking-calendar-block__grid">
          {calendarDays.map((cell) => {
            if (cell.type === "empty") {
              return (
                <div
                  key={cell.key}
                  className="booking-calendar-block__day booking-calendar-block__day--empty"
                />
              );
            }

            return (
              <button
                key={cell.key}
                type="button"
                className={[
                  "booking-calendar-block__day",
                  cell.hasAvailable ? "is-available" : "is-disabled",
                  selectedDate === cell.isoDate ? "is-selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={!cell.hasAvailable}
                onClick={() => {
                  setSelectedDate(cell.isoDate);
                  setSelectedSlotId(null);
                  setShowManualForm(false);
                  setError("");
                  setSuccessMessage("");
                }}
              >
                {cell.day}
              </button>
            );
          })}
        </div>

        {isLoadingSlots ? (
          <p className="booking-calendar-block__status">
            Загружаем доступные даты...
          </p>
        ) : null}

        {error ? (
          <p className="booking-calendar-block__error">{error}</p>
        ) : null}

        {successMessage ? (
          <p className="booking-calendar-block__success">{successMessage}</p>
        ) : null}

        {!isLoadingSlots && selectedExcursionTypeId && slots.length === 0 ? (
          <p className="booking-calendar-block__status">
            На выбранный месяц нет доступных слотов.
          </p>
        ) : null}

        {selectedDate ? (
          <div className="booking-calendar-block__details">
            <h3 className="booking-calendar-block__details-title">
              {selectedExcursionType?.title || "Посещение"} —{" "}
              {formatHumanDate(selectedDate)}
            </h3>

            <div className="booking-calendar-block__slots">
              {selectedDateSlots.length > 0 ? (
                selectedDateSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={[
                      "booking-calendar-block__slot",
                      selectedSlotId === slot.id ? "is-selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setSelectedSlotId(slot.id)}
                  >
                    {String(slot.start_time).slice(0, 5)}
                  </button>
                ))
              ) : (
                <p className="booking-calendar-block__status">
                  На эту дату нет свободного времени.
                </p>
              )}
            </div>

            <div className="booking-calendar-block__controls">
              <label className="booking-calendar-block__label">
                Количество человек
                <input
                  className="booking-calendar-block__input"
                  type="number"
                  min={minPeople}
                  max={maxPeople}
                  value={peopleCount}
                  onChange={(e) =>
                    setPeopleCount(
                      Math.max(
                        Number(minPeople) || 1,
                        Math.min(
                          Number(maxPeople) || 99,
                          Number(e.target.value) || Number(minPeople) || 1,
                        ),
                      ),
                    )
                  }
                />
              </label>

              <div className="booking-calendar-block__actions">
                <div className="booking-calendar-block__action-group booking-calendar-block__action-group--primary">
                  <span className="booking-calendar-block__action-label">
                    Быстрое подтверждение через Telegram
                  </span>

                  <PrimaryButton
                    type="button"
                    disabled={
                      !selectedExcursionTypeId ||
                      !selectedSlotId ||
                      isRedirecting
                    }
                    onClick={handleContinueTelegram}
                    text={"Продолжить в телеграм"}
                  >
                    {isRedirecting
                      ? "Переходим в Telegram..."
                      : "Продолжить в Telegram"}
                  </PrimaryButton>
                </div>

                <div className="booking-calendar-block__action-group booking-calendar-block__action-group--secondary">
                  <span className="booking-calendar-block__action-label">
                    Заявка обрабатывается вручную дольше
                  </span>

                  <SecondaryButton
                    type="button"
                    className="booking-calendar-block__manual-trigger"
                    disabled={!selectedExcursionTypeId || !selectedSlotId}
                    onClick={() => {
                      setShowManualForm((prev) => !prev);
                      setError("");
                      setSuccessMessage("");
                    }}
                    text={"Оставить заявку с сайта"}
                  ></SecondaryButton>
                </div>
              </div>
            </div>

            {showManualForm ? (
              <div className="booking-calendar-block__manual-form">
                <label className="booking-calendar-block__label">
                  Ваше имя
                  <input
                    className="booking-calendar-block__input"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Введите имя"
                  />
                </label>

                <label className="booking-calendar-block__label">
                  Номер телефона
                  <input
                    className="booking-calendar-block__input"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+375 ..."
                  />
                </label>

                <div className="booking-calendar-block__manual-actions">
                  <SecondaryButton
                    type="button"
                    onClick={handleCreateManual}
                    disabled={isSubmittingManual}
                    text={"Отправить заявку"}
                  >
                    {isSubmittingManual ? "Отправляем..." : "Отправить заявку"}
                  </SecondaryButton>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default BookingCalendarBlock;
