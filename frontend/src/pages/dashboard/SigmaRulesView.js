// src/pages/dashboard/SigmaRulesView.js

import { useEffect, useState } from 'react';
import apiUrl from '../../apiClient';

// Helper: max 2 files, up to 5 MB each, YAML only
const MAX_FILES = 2;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function SigmaRulesView() {
  // Страница теперь отвечает только за создание одного правила
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]); // File[]
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');


  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    const next = [];
    let error = '';

    for (const f of incoming) {
      if (next.length >= MAX_FILES) break;
      if (f.size > MAX_SIZE_BYTES) {
        error = `Файл ${f.name} слишком большой (макс. 5MB).`;
        continue;
      }
      const lower = f.name.toLowerCase();
      if (!lower.endsWith('.yml') && !lower.endsWith('.yaml')) {
        error = `Файл ${f.name} не похож на YAML (.yml/.yaml).`;
        continue;
      }
      next.push(f);
    }

    setFiles(next);
    setUploadError(error);
  };

  const onInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeFile = (file) => {
    setFiles(files.filter(f => f !== file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setUploadError('');

    if (!name.trim()) {
      setUploadError('Введите название правила');
      return;
    }
    if (files.length === 0) {
      setUploadError('Добавьте хотя бы один YAML-файл');
      return;
    }

    const file = files[0]; // сейчас берём первый файл как основной

    try {
      setSaving(true);
      const content = await file.text();
      const res = await fetch(apiUrl('/api/sigma-rules'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description || undefined,
          filename: file.name,
          content,
        }),
      });

      if (!res.ok) {
        const info = await res.json().catch(() => ({}));
        throw new Error(info.message || info.error || 'Ошибка сохранения');
      }

      await res.json();
      setMessage('Sigma rule сохранено');
      setName('');
      setDescription('');
      setFiles([]);
    } catch (err) {
      setUploadError(err.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel-card">
      <h2 style={{ marginBottom: '1rem' }}>Создать Sigma rule</h2>

      <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Название правила
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например, Suspicious LSASS Access"
              required
            />
          </label>

          <label>
            Описание
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Кратко опишите, что делает правило"
            />
          </label>

          {/* Upload area */}
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>YAML файл Sigma</p>
            <div
              className="sigma-upload-dropzone"
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              <div className="sigma-upload-inner">
                <div className="sigma-upload-icon" aria-hidden="true">⇪</div>
                <p className="sigma-upload-title">Перетащите файлы сюда</p>
                <p className="sigma-upload-subtitle">
                  или выберите вручную (макс. {MAX_FILES} файла, до 5MB каждый)
                </p>
                <label className="sigma-upload-button">
                  Выбрать файлы
                  <input
                    type="file"
                    accept=".yml,.yaml,text/yaml,text/plain"
                    multiple
                    onChange={onInputChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <ul className="sigma-upload-list">
                {files.map((file) => (
                  <li key={file.name} className="sigma-upload-item">
                    <span className="sigma-upload-filename">{file.name}</span>
                    <button
                      type="button"
                      className="sigma-upload-remove"
                      onClick={() => removeFile(file)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {uploadError && (
              <div style={{ color: '#ef4444', marginTop: '0.5rem' }}>{uploadError}</div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="button-28" disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить правило'}
            </button>
            {message && <div>{message}</div>}
          </div>
        </form>
    </div>
  );
}

export default SigmaRulesView;
