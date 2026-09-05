import React, { useState, useEffect } from 'react';
import { Plus, Search, Tag, Image as ImageIcon, Trash2, Edit3, X, Eye } from 'lucide-react';
import { marked } from 'marked';
import api from '../../api/client';
import Modal from '../Common/Modal';
import ImageModal from '../Common/ImageModal';

const NotesView = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTypeTab, setActiveTypeTab] = useState('all'); // all | note | journal | todo
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Note Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('note');
  const [tagsInput, setTagsInput] = useState('');
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Journal Structured Prompts
  const [journalAccomplishments, setJournalAccomplishments] = useState('');
  const [journalImprovements, setJournalImprovements] = useState('');
  const [journalThoughts, setJournalThoughts] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTypeTab !== 'all') params.type = activeTypeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getNotes(params);
      setNotes(res.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [activeTypeTab, searchQuery]);

  const handleOpenCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setType('note');
    setTagsInput('');
    setPhotoUrls([]);
    setJournalAccomplishments('');
    setJournalImprovements('');
    setJournalThoughts('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setType(note.type || 'note');
    setTagsInput(note.tags ? note.tags.join(', ') : '');
    setPhotoUrls(note.photoUrls || []);
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingPhoto(true);
      const res = await api.uploadPhoto(formData);
      if (res.data && res.data.url) {
        setPhotoUrls(prev => [...prev, res.data.url]);
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (urlToRemove) => {
    setPhotoUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleApplyJournalTemplate = () => {
    const formatted = `### Accomplishments\n${journalAccomplishments || '- None logged'}\n\n### Improvements\n${journalImprovements || '- None logged'}\n\n### General Thoughts\n${journalThoughts || '- None logged'}`;
    setContent(formatted);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    let finalContent = content;
    if (type === 'journal' && (journalAccomplishments || journalImprovements || journalThoughts)) {
      finalContent = `### Accomplishments\n${journalAccomplishments}\n\n### Improvements\n${journalImprovements}\n\n### Thoughts\n${journalThoughts}`;
    }

    try {
      if (editingNote) {
        await api.updateNote(editingNote._id, {
          title: title.trim(),
          content: finalContent,
          type,
          tags: tagsArray,
          photoUrls,
          date: editingNote.date || todayStr,
        });
      } else {
        await api.createNote({
          title: title.trim(),
          content: finalContent,
          type,
          tags: tagsArray,
          photoUrls,
          date: todayStr,
        });
      }

      setIsModalOpen(false);
      fetchNotes();
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await api.deleteNote(id);
      fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2 border-b border-[#27272a] pb-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-widest text-[#71717a]">
            Knowledge & Journal
          </span>
          <h1 className="text-xl font-bold text-[#f4f4f5] tracking-tight">Notes & Feed</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 bg-[#e4e4e7] text-[#09090b] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Search & Mode Filters */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, tags, or reflections..."
            className="w-full bg-[#18181b] border border-[#27272a] focus:border-[#e4e4e7] rounded-lg pl-9 pr-3.5 py-2 text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none transition-colors"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Feed' },
            { id: 'note', label: 'Quick Notes' },
            { id: 'journal', label: 'Journal / Reflections' },
            { id: 'todo', label: 'Todos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeTab(tab.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeTypeTab === tab.id
                  ? 'bg-[#e4e4e7] text-[#09090b]'
                  : 'bg-[#18181b] text-[#71717a] border border-[#27272a] hover:text-[#f4f4f5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List Feed */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="p-8 bg-[#18181b] border border-[#27272a] rounded-xl text-center text-xs text-[#71717a]">
            No entries found. Tap "New Entry" to create a note or journal reflection.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa]">
                      {note.type}
                    </span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      {note.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#f4f4f5] mt-1.5">{note.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(note)}
                    className="p-1 text-[#71717a] hover:text-[#a1a1aa]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="p-1 text-[#71717a] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Content / Markdown Preview */}
              {note.content && (
                <div
                  className="text-xs text-[#a1a1aa] leading-relaxed prose prose-invert max-w-none border-t border-[#27272a]/60 pt-2"
                  dangerouslySetInnerHTML={{ __html: marked.parse(note.content) }}
                />
              )}

              {/* Photo Attachments Preview */}
              {note.photoUrls && note.photoUrls.length > 0 && (
                <div className="flex items-center space-x-2 overflow-x-auto pt-1 no-scrollbar">
                  {note.photoUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Attachment"
                      onClick={() => setSelectedImage(url)}
                      className="w-16 h-16 object-cover rounded-lg border border-[#27272a] cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}

              {/* Tags Footer */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono text-[#71717a] flex items-center space-x-1"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Note / Journal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? 'Edit Entry' : 'Create New Entry'}
      >
        <form onSubmit={handleSaveNote} className="space-y-4">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#09090b] rounded-lg border border-[#27272a]">
            {['note', 'journal', 'todo'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`py-1 text-[11px] font-medium uppercase tracking-wider rounded transition-colors ${
                  type === t ? 'bg-[#e4e4e7] text-[#09090b]' : 'text-[#71717a] hover:text-[#f4f4f5]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry Title..."
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
              required
            />
          </div>

          {/* Structured Prompts for Journal */}
          {type === 'journal' ? (
            <div className="space-y-3 border-t border-b border-[#27272a] py-3">
              <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider">
                Structured Reflection Prompts
              </span>
              <div>
                <label className="block text-[10px] text-[#a1a1aa] mb-1">Accomplishments</label>
                <textarea
                  value={journalAccomplishments}
                  onChange={(e) => setJournalAccomplishments(e.target.value)}
                  placeholder="What went well today?"
                  rows={2}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2 text-xs text-[#f4f4f5] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#a1a1aa] mb-1">Improvements</label>
                <textarea
                  value={journalImprovements}
                  onChange={(e) => setJournalImprovements(e.target.value)}
                  placeholder="What could be improved tomorrow?"
                  rows={2}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2 text-xs text-[#f4f4f5] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#a1a1aa] mb-1">Thoughts & Reflections</label>
                <textarea
                  value={journalThoughts}
                  onChange={(e) => setJournalThoughts(e.target.value)}
                  placeholder="General notes and insights..."
                  rows={2}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2 text-xs text-[#f4f4f5] outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
                Content (Markdown supported)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write in Markdown..."
                rows={4}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ideas, reflection, strategy"
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
            />
          </div>

          {/* Photo Attachments & Cloudinary Upload */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Photo Attachments (Cloudinary Storage)
            </label>
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer flex items-center space-x-1.5 bg-[#27272a] text-[#f4f4f5] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#3f3f46]">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{uploadingPhoto ? 'Uploading...' : 'Attach Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>
            </div>

            {photoUrls.length > 0 && (
              <div className="flex items-center space-x-2 mt-2 overflow-x-auto">
                {photoUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt="Attachment Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-[#27272a]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(url)}
                      className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full text-[8px]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#e4e4e7] text-[#09090b] rounded-lg text-xs font-semibold hover:bg-white transition-colors"
            >
              Save Entry
            </button>
          </div>
        </form>
      </Modal>

      {/* Image Modal Preview */}
      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default NotesView;
