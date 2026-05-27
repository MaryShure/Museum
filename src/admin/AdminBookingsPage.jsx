import { useEffect, useMemo, useState } from "react";
import {
  getExcursionTypes,
  getAdminBookings,
  updateAdminBooking,
} from "../api/adminBookingApi";

const formatAdminDate = (value) => {
  if (!value) return "—";

  const normalized = String(value).slice(0, 10);
  const [year, month, day] = normalized.split("-").map(Number);

  if (!year || !month || !day) return String(value);

  return new Date(year, month - 1, day).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatAdminTime = (value) => {
  if (!value) return "—";

  const text = String(value);

  if (text.includes("T")) {
    return new Date(text).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return text.slice(0, 5);
};

const AdminBookingsPage = () => {
  const [excursionTypes, setExcursionTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [types, bookingsData] = await Promise.all([
        getExcursionTypes(),
        getAdminBookings({
          excursion_type_id: selectedTypeId || "",
        }),
      ]);

      setExcursionTypes(Array.isArray(types) ? types : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      setError(err.message || "Не удалось загрузить заявки");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTypeId]);

  const handleStatusChange = async (bookingId, status) => {
    try {
      await updateAdminBooking(bookingId, { status });
      await loadData();
    } catch (err) {
      setError(err.message || "Не удалось обновить заявку");
    }
  };

  const pendingBookings = useMemo(
    () => bookings.filter((item) => item.status === "pending"),
    [bookings],
  );

  const confirmedBookings = useMemo(
    () => bookings.filter((item) => item.status === "confirmed"),
    [bookings],
  );

  return (
    <div className="admin-screen">
      <div className="admin-screen-inner">
        <div className="admin-screen-header">
          <div className="admin-screen-header-main">
            <h1 className="admin-screen-title">Заявки</h1>
            <p className="admin-screen-subtitle">
              Telegram-заявки подтверждаются автоматически, а заявки с сайта
              ждут ручной обработки.
            </p>
          </div>
        </div>

        {error ? (
          <p className="admin-notice admin-notice-error">{error}</p>
        ) : null}

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Фильтр</h2>
              <p className="admin-card-subtitle">
                Можно отфильтровать заявки по типу посещения.
              </p>
            </div>
          </div>

          <div className="admin-card-body">
            <div className="admin-toolbar">
              <div className="admin-field">
                <label className="admin-label">Тип</label>
                <select
                  className="admin-select"
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                >
                  <option value="">Все типы</option>
                  {excursionTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Ожидают обработки</h2>
              <p className="admin-card-subtitle">
                Эти заявки администратор должен подтвердить или отклонить.
              </p>
            </div>
          </div>

          <div className="admin-card-body">
            {isLoading ? (
              <p className="admin-notice admin-notice-muted">Загрузка...</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Время</th>
                      <th>Тип</th>
                      <th>Имя</th>
                      <th>Телефон</th>
                      <th>Telegram</th>
                      <th>Чел.</th>
                      <th>Источник</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBookings.length ? (
                      pendingBookings.map((item) => (
                        <tr key={item.id}>
                          <td>{formatAdminDate(item.slot_date)}</td>
                          <td>{formatAdminTime(item.start_time)}</td>
                          <td>{item.excursion_title}</td>
                          <td>{item.customer_name || "—"}</td>
                          <td>{item.customer_phone || "—"}</td>
                          <td>
                            {item.telegram_username
                              ? `@${item.telegram_username}`
                              : "—"}
                          </td>
                          <td>{item.people_count}</td>
                          <td>
                            {item.source === "telegram" ? "Telegram" : "Сайт"}
                          </td>
                          <td>
                            <div className="admin-row-actions">
                              <button
                                type="button"
                                className="admin-icon-action is-success"
                                onClick={() =>
                                  handleStatusChange(item.id, "confirmed")
                                }
                                title="Подтвердить"
                                aria-label="Подтвердить"
                              >
                                ✓
                              </button>

                              <button
                                type="button"
                                className="admin-icon-action is-danger"
                                onClick={() =>
                                  handleStatusChange(item.id, "cancelled")
                                }
                                title="Отклонить"
                                aria-label="Отклонить"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9">Нет ожидающих заявок.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Подтверждённые</h2>
              <p className="admin-card-subtitle">
                Здесь показаны уже согласованные заявки.
              </p>
            </div>
          </div>

          <div className="admin-card-body">
            {isLoading ? (
              <p className="admin-notice admin-notice-muted">Загрузка...</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Время</th>
                      <th>Тип</th>
                      <th>Имя</th>
                      <th>Телефон</th>
                      <th>Telegram</th>
                      <th>Чел.</th>
                      <th>Источник</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmedBookings.length ? (
                      confirmedBookings.map((item) => (
                        <tr key={item.id}>
                          <td>{formatAdminDate(item.slot_date)}</td>
                          <td>{formatAdminTime(item.start_time)}</td>
                          <td>{item.excursion_title}</td>
                          <td>{item.customer_name || "—"}</td>
                          <td>{item.customer_phone || "—"}</td>
                          <td>
                            {item.telegram_username
                              ? `@${item.telegram_username}`
                              : "—"}
                          </td>
                          <td>{item.people_count}</td>
                          <td>
                            {item.source === "telegram" ? "Telegram" : "Сайт"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8">Нет подтверждённых заявок.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminBookingsPage;
