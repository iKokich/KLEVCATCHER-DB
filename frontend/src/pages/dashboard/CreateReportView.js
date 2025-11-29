// src/pages/dashboard/CreateReportView.js

import { useEffect, useState } from 'react';
import apiUrl from '../../apiClient';

function CreateReportView() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [summary, setSummary] = useState('');
  const [fullText, setFullText] = useState('');
  const [malwareOptions, setMalwareOptions] = useState([]);
  const [malwareSelected, setMalwareSelected] = useState([]); // массив имен

  // Check user role
  const currentUser = JSON.parse(localStorage.getItem('kc_user') || '{}');
  const userRole = currentUser?.role?.toLowerCase();
  const canCreate = userRole === 'admin' || userRole === 'analyst';

  useEffect(() => {
    let abort = false;
    fetch(apiUrl('/api/malware'))
      .then(r=>r.json())
      .then(list => { if (!abort) setMalwareOptions(list || []); })
      .catch(()=>{});
    return () => { abort = true; };
  }, []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(apiUrl('/api/reports'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author: author || undefined,
          source_url: sourceUrl || undefined,
          publication_date: publicationDate || undefined,
          summary: summary || undefined,
          full_text: fullText || undefined,
          malware_names: malwareSelected,
        })
      });
      if (!res.ok) throw new Error('failed');
      setTitle('');
      setAuthor('');
      setSourceUrl('');
      setPublicationDate('');
      setSummary('');
      setFullText('');
      setMalwareSelected([]);
      setMessage('Отчет создан');
    } catch (e) {
      setMessage('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="panel-card">
        <h2>Доступ ограничен</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          У вас нет прав для создания отчетов. Только пользователи с ролью Admin или Analyst могут создавать отчеты.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card">
      <h2>Создать отчет</h2>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Название отчета
          <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="Введите название" required />
        </label>
        <label>
          Теги Malware
          <div className="multiselect">
            <input
              list="malware-list"
              placeholder="Начните вводить название..."
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const v = e.currentTarget.value.trim();
                  if (v && !malwareSelected.includes(v)) setMalwareSelected([...malwareSelected, v]);
                  e.currentTarget.value = '';
                }
              }}
            />
            <datalist id="malware-list">
              {malwareOptions.map(m => <option key={m.id} value={m.name} />)}
            </datalist>
            <div className="chips">
              {malwareSelected.map(name => (
                <button type="button" key={name} className="chip" onClick={() => setMalwareSelected(malwareSelected.filter(x => x !== name))}>{name} ×</button>
              ))}
            </div>
          </div>
        </label>
        <label>
          Автор
          <input value={author} onChange={e => setAuthor(e.target.value)} type="text" placeholder="Имя автора" />
        </label>
        <label>
          Ссылка на источник
          <input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} type="url" placeholder="https://..." />
        </label>
        <label>
          Дата публикации
          <input value={publicationDate} onChange={e => setPublicationDate(e.target.value)} type="date" />
        </label>
        <label>
          Описание
          <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Краткое описание" rows={4} />
        </label>
        <label>
          Полный текст
          <textarea value={fullText} onChange={e => setFullText(e.target.value)} placeholder="Текст отчета" rows={6} />
        </label>
        <div className="form-actions">
          <button type="submit" className="button-28" disabled={saving}>{saving ? 'Сохранение...' : 'Создать'}</button>
        </div>
        {message && <div>{message}</div>}
      </form>
    </div>
  );
}

export default CreateReportView;

