import React, { useEffect, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import { createTask, deleteTask, getTasks, updateTask } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const COLUMNS = [
  { key: "TODO", title: "Сделать" },
  { key: "IN_PROGRESS", title: "В работе" },
  { key: "DONE", title: "Готово" }
];

function groupByStatus(tasks) {
  const map = { TODO: [], IN_PROGRESS: [], DONE: [] };
  for (const t of tasks) map[t.status]?.push(t);
  return map;
}

function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="cardTitleRow">
        <div className="cardTitle">{task.title}</div>
        <div className="pill">{task.status}</div>
      </div>
      <div className="cardDesc">{task.description}</div>
      <div className="cardMeta">
        <span className="muted">Автор #{task.author_id}</span>
        {typeof task.priority === "number" ? (
          <span className="muted">Приоритет {task.priority}</span>
        ) : null}
      </div>
      <div className="cardActions">
        <button className="button" onClick={() => onEdit(task)}>
          Изменить
        </button>
        <button className="button danger" onClick={() => onDelete(task)}>
          Удалить
        </button>
      </div>
    </div>
  );
}

function TaskModal({ open, initial, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title || "");
    setDescription(initial?.description || "");
    setPriority(
      typeof initial?.priority === "number" ? String(initial.priority) : "",
    );
  }, [open, initial]);

  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    const p = priority.trim() === "" ? null : Number(priority);
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority: Number.isFinite(p) ? p : null,
    });
  }

  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="h2">{initial ? "Редактировать задачу" : "Новая задача"}</div>
          <button className="iconButton" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form className="form" onSubmit={submit}>
          <label className="label">
            Название
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="label">
            Описание
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
            />
          </label>

          <label className="label">
            Приоритет (необязательно)
            <input
              className="input"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              inputMode="numeric"
              placeholder="например, 1"
            />
          </label>

          <div className="row">
            <button type="button" className="button" onClick={onClose}>
              Отмена
            </button>
            <button className="button primary" disabled={!title.trim() || !description.trim()}>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BoardPage() {
  const nav = useNavigate();
  const { token, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const grouped = useMemo(() => groupByStatus(tasks), [tasks]);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const list = await getTasks(token);
      setTasks(list);
    } catch (e) {
      if (e?.status === 401) {
        logout();
        nav("/login");
        return;
      }
      setError(e?.message || "Не удалось загрузить задачи");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  async function onSave(payload) {
    try {
      if (editing) {
        const updated = await updateTask(token, editing.id, payload);
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await createTask(token, { ...payload, status: "TODO" });
        setTasks((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setEditing(null);
    } catch (e) {
      setError(e?.message || "Не удалось сохранить");
    }
  }

  async function onDelete(task) {
    if (!window.confirm("Удалить эту задачу?")) return;
    try {
      await deleteTask(token, task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (e) {
      setError(e?.message || "Не удалось удалить");
    }
  }

  async function onDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = Number(draggableId);
    const newStatus = destination.droppableId;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    try {
      const updated = await updateTask(token, taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      setError(e?.message || "Не удалось переместить");
      refresh();
    }
  }

  return (
    <div className="appShell">
      <header className="topbar">
        <div className="brand">Task Tracker</div>
        <div className="topbarRight">
          <button className="button primary" onClick={onCreate}>
            Новая задача
          </button>
          <button className="button" onClick={() => { logout(); nav("/login"); }}>
            Выйти
          </button>
        </div>
      </header>

      <main className="content">
        {error ? <div className="error">{error}</div> : null}
        {loading ? (
          <div className="muted">Загрузка…</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="board">
              {COLUMNS.map((col) => (
                <div key={col.key} className="column">
                  <div className="columnHeader">
                    <div className="h2">{col.title}</div>
                    <div className="muted">{grouped[col.key]?.length || 0}</div>
                  </div>
                  <Droppable droppableId={col.key}>
                    {(provided, snapshot) => (
                      <div
                        className={`columnBody ${snapshot.isDraggingOver ? "dragOver" : ""}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {(grouped[col.key] || []).map((task, idx) => (
                          <Draggable key={task.id} draggableId={String(task.id)} index={idx}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={`draggableWrap ${dragSnapshot.isDragging ? "dragging" : ""}`}
                              >
                                <TaskCard
                                  task={task}
                                  onEdit={(t) => { setEditing(t); setModalOpen(true); }}
                                  onDelete={onDelete}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </main>

      <TaskModal
        open={modalOpen}
        initial={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={onSave}
      />
    </div>
  );
}

