// src/pages/dashboard/ThreatsView.js
import { useState } from 'react';
import apiUrl from '../../apiClient';

function ThreatsView() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '', type: '', family: '', description: '', first_seen: '', last_seen: '', hashes: '', capabilities: '', sources: ''
  });

  // Check user role
  const currentUser = JSON.parse(localStorage.getItem('kc_user') || '{}');
  const userRole = currentUser?.role?.toLowerCase();
  const canCreate = userRole === 'admin' || userRole === 'analyst';

  const toArray = (str) => (str || '').split(',').map(s => s.trim()).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(apiUrl('/api/malware'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          type: form.type || undefined,
          family: form.family || undefined,
          description: form.description || undefined,
          first_seen: form.first_seen || undefined,
          last_seen: form.last_seen || undefined,
          hashes: toArray(form.hashes),
          capabilities: toArray(form.capabilities),
          sources: toArray(form.sources),
        })
      });
      if (!res.ok) {
        const msg = await res.json().catch(()=>({}));
        throw new Error(msg.error || msg.message || 'failed');
      }
      setForm({ name: '', type: '', family: '', description: '', first_seen: '', last_seen: '', hashes: '', capabilities: '', sources: '' });
      setMessage('Угроза успешно добавлена! Просмотрите список угроз на главной странице Dashboard во вкладке Threats.');
    } catch (e) {
      setMessage(`Ошибка сохранения: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="panel-card">
        <h2>Доступ ограничен</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          У вас нет прав для добавления угроз. Только пользователи с ролью Admin или Analyst могут добавлять угрозы.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card">
      <h2>Добавить новую угрозу</h2>
      <form className="form-grid" onSubmit={submit}>
        <label>Название<input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required placeholder="Имя" /></label>
        <label>Тип<input value={form.type} onChange={e=>setForm({...form, type:e.target.value})} placeholder="Ransomware, Trojan..." /></label>
        <label>Семейство<input value={form.family} onChange={e=>setForm({...form, family:e.target.value})} placeholder="Семейство" /></label>
        <label>Описание<textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} rows={3} placeholder="Описание" /></label>
        <label>Первая фиксация<input type="date" value={form.first_seen} onChange={e=>setForm({...form, first_seen:e.target.value})} /></label>
        <label>Последняя фиксация<input type="date" value={form.last_seen} onChange={e=>setForm({...form, last_seen:e.target.value})} /></label>
        <label>Хэши (через запятую)<input value={form.hashes} onChange={e=>setForm({...form, hashes:e.target.value})} placeholder="hash1, hash2" /></label>
        <label>Возможности (через запятую)<input value={form.capabilities} onChange={e=>setForm({...form, capabilities:e.target.value})} placeholder="C2, keylogger" /></label>
        <label>Источники (через запятую)<input value={form.sources} onChange={e=>setForm({...form, sources:e.target.value})} placeholder="url1, url2" /></label>
        <div className="form-actions">
          <button className="button-28" type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Добавить'}</button>
          {message && <div>{message}</div>}
        </div>
      </form>
    </div>
  );
}

export default ThreatsView;

