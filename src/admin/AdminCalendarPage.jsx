import { useEffect, useMemo, useState } from "react";
import {
  getExcursionTypes,
  createExcursionType,
  getAdminExcursionSlots,
  createAdminExcursionSlot,
  updateAdminExcursionSlot,
  deleteAdminExcursionSlot,
} from "../api/adminBookingApi";

const getCurrentMonthKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const emptyForm = {
  excursion_type_id: "",
  slot_date: "",
  start_time: "",
  capacity: 10,
  booked_count: 0,
  status: "available",
};

const emptyTypeForm = {
  title: "",
  description: "",
};

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

const AdminCalendarPage = () => {
  const [excursionTypes, setExcursionTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [typeForm, setTypeForm] = useState(emptyTypeForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingType, setIsSavingType] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async (typeId, month) => {
    try {
      setIsLoading(true);
      setError("");

      const [types, slotList] = await Promise.all([
        getExcursionTypes(),
        getAdminExcursionSlots({
          excursion_type_id: typeId || "",
          month,
        }),
      ]);

      const safeTypes = Array.isArray(types) ? types : [];
      setExcursionTypes(safeTypes);
      setSlots(Array.isArray(slotList) ? slotList : []);

      if (!typeId && safeTypes.length > 0) {
        setSelectedTypeId(String(safeTypes[0].id));
      }
    } catch (err) {
      setError(err.message || "Не удалось загрузить календарь");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedTypeId, selectedMonth);
  }, [selectedTypeId, selectedMonth]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      excursion_type_id: selectedTypeId || "",
    }));
  }, [selectedTypeId]);

  const visibleSlots = useMemo(() => {
    return [...slots].sort((a, b) => {
      const aValue = `${String(a.slot_date).slice(0, 10)} ${String(a.start_time)}`;
      const bValue = `${String(b.slot_date).slice(0, 10)} ${String(b.start_time)}`;
      return aValue.localeCompare(bValue);
    });
  }, [slots]);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      excursion_type_id: selectedTypeId || "",
    });
  };

  const resetTypeForm = () => {
    setTypeForm(emptyTypeForm);
  };

  const handleCreateType = async (e) => {
    e.preventDefault();

    if (!typeForm.title.trim()) {
      setError("Введите название нового типа мероприятия");
      return;
    }

    try {
      setIsSavingType(true);
      setError("");
      setSuccessMessage("");

      const createdType = await createExcursionType({
        title: typeForm.title.trim(),
        description: typeForm.description.trim(),
      });

      const nextTypeId = String(createdType.id);

      await loadData(nextTypeId, selectedMonth);
      setSelectedTypeId(nextTypeId);
      setForm((prev) => ({
        ...prev,
        excursion_type_id: nextTypeId,
      }));

      resetTypeForm();
      setSuccessMessage("Новый тип мероприятия успешно добавлен.");
    } catch (err) {
      setError(err.message || "Не удалось создать тип мероприятия");
    } finally {
      setIsSavingType(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");
      setSuccessMessage("");

      await createAdminExcursionSlot({
        ...form,
        excursion_type_id: Number(form.excursion_type_id),
        capacity: Number(form.capacity),
        booked_count: Number(form.booked_count),
      });

      await loadData(selectedTypeId, selectedMonth);
      resetForm();
      setSuccessMessage("Новый слот успешно добавлен.");
    } catch (err) {
      setError(err.message || "Не удалось создать слот");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickUpdate = async (slotId, field, value) => {
    try {
      setError("");
      setSuccessMessage("");

      await updateAdminExcursionSlot(slotId, {
        [field]:
          field === "capacity" || field === "booked_count"
            ? Number(value)
            : value,
      });

      await loadData(selectedTypeId, selectedMonth);
      setSuccessMessage("Слот обновлён.");
    } catch (err) {
      setError(err.message || "Не удалось обновить слот");
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm("Удалить этот слот?")) return;

    try {
      setError("");
      setSuccessMessage("");
      await deleteAdminExcursionSlot(slotId);
      await loadData(selectedTypeId, selectedMonth);
      setSuccessMessage("Слот удалён.");
    } catch (err) {
      setError(err.message || "Не удалось удалить слот");
    }
  };

  return (
    <div className="admin-screen">
      <div className="admin-screen-inner">
        <div className="admin-screen-header">
          <div className="admin-screen-header-main">
            <h1 className="admin-screen-title">Календарь мероприятий</h1>
            <p className="admin-screen-subtitle">
              Управление типами, слотами, вместимостью и доступностью дат.
            </p>
          </div>
        </div>

        {error ? (
          <p className="admin-notice admin-notice-error">{error}</p>
        ) : null}

        {successMessage ? (
          <p className="admin-notice">{successMessage}</p>
        ) : null}

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Фильтры</h2>
              <p className="admin-card-subtitle">
                Выбери тип мероприятия и месяц для просмотра слотов.
              </p>
            </div>
          </div>

          <div className="admin-card-body">
            <div className="admin-toolbar">
              <div className="admin-field">
                <label className="admin-label">Тип мероприятия</label>
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

              <div className="admin-field">
                <label className="admin-label">Месяц</label>
                <input
                  className="admin-input"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Новый тип мероприятия</h2>
              <p className="admin-card-subtitle">
                Добавь новый тип, например: экскурсия, лекция, мастер-класс или
                посещение.
              </p>
            </div>
          </div>

          <div className="admin-card-body">
            <form onSubmit={handleCreateType} className="admin-grid-form">
              <div className="admin-field">
                <label className="admin-label">Название</label>
                <input
                  className="admin-input"
                  type="text"
                  value={typeForm.title}
                  onChange={(e) =>
                    setTypeForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Например: Мастер-класс"
                  required
                />
              </div>

              <div className="admin-field admin-field-full">
                <label className="admin-label">Описание</label>
                <textarea
                  className="admin-textarea"
                  value={typeForm.description}
                  onChange={(e) =>
                    setTypeForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Короткое описание нового типа мероприятия"
                  rows={4}
                />
              </div>

              <div className="admin-field admin-field-full">
                <div className="admin-inline-actions">
                  <button
                    type="submit"
                    className="admin-button admin-button-secondary"
                    disabled={isSavingType}
                  >
                    {isSavingType ? "Сохраняем..." : "Добавить тип"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Новый слот</h2>
              <p className="admin-card-subtitle">
                Добавь новую дату и время для выбранного типа мероприятия.
              </p>
            </div>
          </div>

          <div className="admin-card-body">
            <form onSubmit={handleCreate} className="admin-grid-form">
              <div className="admin-field">
                <label className="admin-label">Тип мероприятия</label>
                <select
                  className="admin-select"
                  value={form.excursion_type_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      excursion_type_id: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Выбери тип</option>
                  {excursionTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-field">
                <label className="admin-label">Дата</label>
                <input
                  className="admin-input"
                  type="date"
                  value={form.slot_date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slot_date: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">Время</label>
                <input
                  className="admin-input"
                  type="time"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, start_time: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">Вместимость</label>
                <input
                  className="admin-input"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, capacity: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">Занято</label>
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={form.booked_count}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      booked_count: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">Статус</label>
                <select
                  className="admin-select"
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="available">available</option>
                  <option value="closed">closed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>

              <div className="admin-field admin-field-full">
                <div className="admin-inline-actions">
                  <button
                    type="submit"
                    className="admin-button admin-button-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? "Сохраняем..." : "Добавить слот"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Слоты</h2>
              <p className="admin-card-subtitle">
                Редактируй вместимость, занятость и статус прямо в таблице.
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
                      <th>Тип мероприятия</th>
                      <th>Вместимость</th>
                      <th>Занято</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSlots.length ? (
                      visibleSlots.map((slot) => (
                        <tr key={slot.id}>
                          <td>{formatAdminDate(slot.slot_date)}</td>
                          <td>{formatAdminTime(slot.start_time)}</td>
                          <td>{slot.excursion_title}</td>
                          <td>
                            <input
                              className="admin-input"
                              type="number"
                              min="1"
                              defaultValue={slot.capacity}
                              onBlur={(e) =>
                                handleQuickUpdate(
                                  slot.id,
                                  "capacity",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              className="admin-input"
                              type="number"
                              min="0"
                              defaultValue={slot.booked_count}
                              onBlur={(e) =>
                                handleQuickUpdate(
                                  slot.id,
                                  "booked_count",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td>
                            <select
                              className="admin-select"
                              defaultValue={slot.status}
                              onChange={(e) =>
                                handleQuickUpdate(
                                  slot.id,
                                  "status",
                                  e.target.value,
                                )
                              }
                            >
                              <option value="available">available</option>
                              <option value="closed">closed</option>
                              <option value="cancelled">cancelled</option>
                            </select>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="admin-button admin-button-danger-outline"
                              onClick={() => handleDelete(slot.id)}
                            >
                              Удалить
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7">На выбранный месяц слотов пока нет.</td>
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

export default AdminCalendarPage;
