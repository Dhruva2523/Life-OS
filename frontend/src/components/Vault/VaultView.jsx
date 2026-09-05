import React, { useState, useEffect } from 'react';
import { Plus, ShieldCheck, Pin, FileText, Image as ImageIcon, Trash2, Edit3, Eye, FileCode } from 'lucide-react';
import { marked } from 'marked';
import api from '../../api/client';
import Modal from '../Common/Modal';
import ImageModal from '../Common/ImageModal';

const VaultView = () => {
  const [vaultItems, setVaultItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('emergency');
  const [content, setContent] = useState('');
  const [fileUrls, setFileUrls] = useState([]);
  const [pinned, setPinned] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);

  const fetchVaultItems = async () => {
    try {
      setLoading(true);
      const res = await api.getVaultItems(selectedCategory);
      setVaultItems(res.data);
    } catch (err) {
      console.error('Error fetching vault items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultItems();
  }, [selectedCategory]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('emergency');
    setContent('');
    setFileUrls([]);
    setPinned(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category || 'emergency');
    setContent(item.content || '');
    setFileUrls(item.fileUrls || []);
    setPinned(item.pinned !== undefined ? item.pinned : true);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingFile(true);
      const res = await api.uploadPhoto(formData);
      if (res.data && res.data.url) {
        setFileUrls(prev => [...prev, res.data.url]);
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = (urlToRemove) => {
    setFileUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSaveVaultItem = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingItem) {
        await api.updateVaultItem(editingItem._id, {
          title: title.trim(),
          category,
          content,
          fileUrls,
          pinned,
        });
      } else {
        await api.createVaultItem({
          title: title.trim(),
          category,
          content,
          fileUrls,
          pinned,
        });
      }
      setIsModalOpen(false);
      fetchVaultItems();
    } catch (err) {
      console.error('Error saving vault item:', err);
    }
  };

  const handleDeleteVaultItem = async (id) => {
    try {
      await api.deleteVaultItem(id);
      fetchVaultItems();
    } catch (err) {
      console.error('Error deleting vault item:', err);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2 border-b border-[#27272a] pb-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-widest text-[#71717a]">
            Fast-Access Vault
          </span>
          <h1 className="text-xl font-bold text-[#f4f4f5] tracking-tight">Pinned Emergency Vault</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 bg-[#e4e4e7] text-[#09090b] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Card</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Vault' },
          { id: 'emergency', label: 'Emergency Protocol Cards' },
          { id: 'identity', label: 'Identity & Non-Negotiables' },
          { id: 'routine', label: 'Daily Routines & Checklists' },
          { id: 'document', label: 'Reference Documents' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === tab.id
                ? 'bg-[#e4e4e7] text-[#09090b]'
                : 'bg-[#18181b] text-[#71717a] border border-[#27272a] hover:text-[#f4f4f5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Vault Items Feed */}
      <div className="space-y-3">
        {vaultItems.length === 0 ? (
          <div className="p-8 bg-[#18181b] border border-[#27272a] rounded-xl text-center text-xs text-[#71717a]">
            No pinned cards found. Tap "New Card" to add emergency protocols, non-negotiables, or daily routines.
          </div>
        ) : (
          vaultItems.map((item) => (
            <div
              key={item._id}
              className={`bg-[#18181b] border rounded-xl p-4 space-y-3 transition-colors ${
                item.category === 'emergency' ? 'border-amber-500/30' : 'border-[#27272a]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      item.category === 'emergency'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-[#27272a] text-[#a1a1aa]'
                    }`}>
                      {item.category}
                    </span>
                    {item.pinned && (
                      <span className="flex items-center space-x-1 text-[10px] font-mono text-[#e4e4e7]">
                        <Pin className="w-3 h-3 text-[#e4e4e7]" />
                        <span>Pinned</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-[#f4f4f5]">{item.title}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 text-[#71717a] hover:text-[#a1a1aa]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteVaultItem(item._id)}
                    className="p-1 text-[#71717a] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Render Content Markdown */}
              {item.content && (
                <div
                  className="text-xs text-[#a1a1aa] leading-relaxed prose prose-invert max-w-none border-t border-[#27272a]/60 pt-2"
                  dangerouslySetInnerHTML={{ __html: marked.parse(item.content) }}
                />
              )}

              {/* Attachments Display */}
              {item.fileUrls && item.fileUrls.length > 0 && (
                <div className="flex items-center space-x-2 overflow-x-auto pt-1 no-scrollbar">
                  {item.fileUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Vault Attachment"
                      onClick={() => setSelectedImage(url)}
                      className="w-20 h-20 object-cover rounded-lg border border-[#27272a] cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Vault Item Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Vault Card' : 'Create Pinned Vault Card'}
      >
        <form onSubmit={handleSaveVaultItem} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Card Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Emergency Urge Countermeasure Protocol"
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none"
            >
              <option value="emergency">Emergency Protocol Card</option>
              <option value="identity">Identity Rules & Non-Negotiables</option>
              <option value="routine">Daily Routine & Checklist</option>
              <option value="document">Reference Document</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Card Content (Markdown supported)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your non-negotiables, emergency rules, or routines..."
              rows={5}
              className="w-full bg-[#09090b] border border-[#27272a] rounded-lg p-2.5 text-xs text-[#f4f4f5] outline-none focus:border-[#e4e4e7]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Attachment Files / Images
            </label>
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer flex items-center space-x-1.5 bg-[#27272a] text-[#f4f4f5] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#3f3f46]">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{uploadingFile ? 'Uploading...' : 'Attach Image/Doc'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </label>
            </div>

            {fileUrls.length > 0 && (
              <div className="flex items-center space-x-2 mt-2 overflow-x-auto">
                {fileUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt="Attachment Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-[#27272a]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(url)}
                      className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full text-[8px]"
                    >
                      &times;
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
              className="px-3 py-1.5 text-xs text-[#a1a1aa]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#e4e4e7] text-[#09090b] rounded-lg text-xs font-semibold hover:bg-white"
            >
              Save Card
            </button>
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
};

export default VaultView;
