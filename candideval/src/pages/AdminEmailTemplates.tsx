import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminEmailTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<any>({});
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [edit, setEdit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/email-templates');
      setTemplates(res.data);
    } catch (err: any) {
      setError('Failed to load templates');
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleEdit = (key: string) => {
    setSelectedKey(key);
    setEdit({ ...templates[key] });
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/email-templates/${selectedKey}`, edit);
      setTemplates({ ...templates, [selectedKey]: edit });
      setEdit(null);
      setSelectedKey('');
    } catch (err: any) {
      setError('Failed to save template');
    }
    setLoading(false);
  };

  const handleDelete = async (key: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/email-templates/${key}`);
      const newTemplates = { ...templates };
      delete newTemplates[key];
      setTemplates(newTemplates);
      if (selectedKey === key) setEdit(null);
    } catch (err: any) {
      setError('Failed to delete template');
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setSelectedKey('');
    setEdit({ subject: '', body: '' });
    setError('');
  };

  const handleCreate = async () => {
    if (!selectedKey) return setError('Template key required');
    setLoading(true);
    try {
      await axios.post(`/api/email-templates/${selectedKey}`, edit);
      setTemplates({ ...templates, [selectedKey]: edit });
      setEdit(null);
      setSelectedKey('');
    } catch (err: any) {
      setError('Failed to create template');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Email Templates</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div className="mb-4">Loading...</div>}
      <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd}>Add New Template</button>
      <ul className="mb-6">
        {Object.keys(templates).map(key => (
          <li key={key} className="mb-2 flex items-center justify-between">
            <span className="font-semibold">{key}</span>
            <div>
              <button className="bg-green-600 text-white px-2 py-1 rounded mr-2" onClick={() => handleEdit(key)}>Edit</button>
              <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => handleDelete(key)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {edit && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <label className="block mb-2 font-semibold">Template Key</label>
          {selectedKey ? (
            <input type="text" value={selectedKey} disabled className="mb-4 p-2 border rounded w-full" />
          ) : (
            <input type="text" value={selectedKey} onChange={e => setSelectedKey(e.target.value)} className="mb-4 p-2 border rounded w-full" />
          )}
          <label className="block mb-2 font-semibold">Subject</label>
          <input type="text" value={edit.subject} onChange={e => setEdit({ ...edit, subject: e.target.value })} className="mb-4 p-2 border rounded w-full" />
          <label className="block mb-2 font-semibold">Body</label>
          <textarea value={edit.body} onChange={e => setEdit({ ...edit, body: e.target.value })} className="mb-4 p-2 border rounded w-full" rows={6} />
          <div className="flex gap-2">
            {selectedKey && templates[selectedKey] ? (
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
            ) : (
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleCreate}>Create</button>
            )}
            <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => { setEdit(null); setSelectedKey(''); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailTemplates;
