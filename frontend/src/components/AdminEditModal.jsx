import React, { useState, useRef } from 'react';
import { X, Save, Loader2, Upload, Trash2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api, { API_BASE } from '@/lib/api';
import { AMENITIES_CONFIG } from '@/components/AmenitiesDisplay';

const FIELD_LABELS = {
  business_name: 'Nombre',
  description: 'Descripcion',
  phone: 'Telefono',
  whatsapp: 'WhatsApp',
  address: 'Direccion',
  region: 'Region',
  comuna: 'Comuna',
  youtube_video_url: 'Video YouTube (URL)',
  place_id: 'Google Place ID',
};

const PERSONAL_INFO_LABELS = {
  housing_type: 'Tipo de instalacion',
  daily_availability: 'Horario de atencion',
  bio: 'Descripcion adicional',
};

const SOCIAL_LABELS = {
  instagram: 'Instagram (URL)',
  facebook: 'Facebook (URL)',
  website: 'Sitio Web (URL)',
};

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const getPhotoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url}`;
};

export default function AdminEditModal({ section, provider, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const premiumFileInputRef = useRef(null);
  const [formData, setFormData] = useState(() => {
    switch (section) {
      case 'general':
        return {
          business_name: provider.business_name || '',
          description: provider.description || '',
          comuna: provider.comuna || '',
          region: provider.region || '',
          address: provider.address || '',
        };
      case 'contact':
        return {
          phone: provider.phone || '',
          whatsapp: provider.whatsapp || '',
          address: provider.address || '',
        };
      case 'services':
        return {
          services: provider.services || [],
        };
      case 'social':
        return {
          social_links: {
            instagram: provider.social_links?.instagram || '',
            facebook: provider.social_links?.facebook || '',
            website: provider.social_links?.website || '',
          },
        };
      case 'personal_info':
        return {
          personal_info: {
            housing_type: provider.personal_info?.housing_type || '',
            daily_availability: provider.personal_info?.daily_availability || '',
            bio: provider.personal_info?.bio || '',
          },
        };
      case 'youtube':
        return {
          youtube_video_url: provider.youtube_video_url || '',
        };
      case 'settings':
        return {
          is_featured: provider.is_featured_admin || false,
          is_subscribed: provider.is_subscribed || provider.provider_is_subscribed || false,
          place_id: provider.place_id || '',
        };
      case 'gallery':
      case 'premium_gallery':
        return {};
      case 'amenities':
        return {
          amenities: provider.amenities || [],
        };
      default:
        return {};
    }
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/providers/${provider.provider_id}/profile`, formData);
      toast.success('Cambios guardados');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async (type) => {
    const ref = type === 'gallery' ? fileInputRef : premiumFileInputRef;
    const files = ref.current?.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append('file', files[i]);
        const endpoint = type === 'gallery'
          ? `/admin/providers/${provider.provider_id}/gallery/upload`
          : `/admin/providers/${provider.provider_id}/premium-gallery/upload`;
        await api.post(endpoint, fd);
      }
      toast.success(`${files.length} foto(s) subida(s)`);
      ref.current.value = '';
      onSaved();
    } catch (e) {
      const detail = e.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : 'Error al subir foto');
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteGalleryPhoto = async (photo) => {
    const photoId = typeof photo === 'string' ? photo : (photo.photo_id || photo.url);
    try {
      await api.delete(`/admin/providers/${provider.provider_id}/gallery/${encodeURIComponent(photoId)}`);
      toast.success('Foto eliminada');
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error al eliminar');
    }
  };

  const handleDeletePremiumPhoto = async (photoId) => {
    try {
      await api.delete(`/admin/providers/${provider.provider_id}/premium-gallery/${photoId}`);
      toast.success('Foto eliminada');
      onSaved();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error al eliminar');
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNested = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const updateService = (index, field, value) => {
    setFormData(prev => {
      const services = [...prev.services];
      services[index] = { ...services[index], [field]: value };
      return { ...prev, services };
    });
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { service_type: 'residencias', description: '', price_from: 0, sub_prices: [] }],
    }));
  };

  const removeService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const addSubPrice = (svcIndex) => {
    setFormData(prev => {
      const services = [...prev.services];
      const svc = { ...services[svcIndex] };
      svc.sub_prices = [...(svc.sub_prices || []), { name: '', price: 0 }];
      services[svcIndex] = svc;
      return { ...prev, services };
    });
  };

  const updateSubPrice = (svcIndex, spIndex, field, value) => {
    setFormData(prev => {
      const services = [...prev.services];
      const svc = { ...services[svcIndex] };
      const subs = [...(svc.sub_prices || [])];
      subs[spIndex] = { ...subs[spIndex], [field]: value };
      svc.sub_prices = subs;
      services[svcIndex] = svc;
      return { ...prev, services };
    });
  };

  const removeSubPrice = (svcIndex, spIndex) => {
    setFormData(prev => {
      const services = [...prev.services];
      const svc = { ...services[svcIndex] };
      svc.sub_prices = (svc.sub_prices || []).filter((_, i) => i !== spIndex);
      services[svcIndex] = svc;
      return { ...prev, services };
    });
  };

  const sectionTitles = {
    general: 'Informacion General',
    contact: 'Contacto',
    services: 'Servicios y Precios',
    social: 'Redes Sociales',
    personal_info: 'Informacion Adicional',
    youtube: 'Video YouTube',
    settings: 'Configuracion Admin',
    gallery: 'Galeria de Fotos',
    premium_gallery: 'Slider Premium',
    amenities: 'Servicios y Amenidades',
  };

  const isPhotoSection = section === 'gallery' || section === 'premium_gallery';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
        data-testid="admin-edit-modal"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-[#33404f]">{sectionTitles[section]}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* General */}
          {section === 'general' && (
            <>
              {['business_name', 'comuna', 'region', 'address'].map(field => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-600">{FIELD_LABELS[field]}</label>
                  <input
                    type="text"
                    value={formData[field]}
                    onChange={e => updateField(field, e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none"
                    data-testid={`edit-${field}`}
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-600">Descripcion</label>
                <textarea
                  value={formData.description}
                  onChange={e => updateField('description', e.target.value)}
                  rows={4}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none"
                  data-testid="edit-description"
                />
              </div>
            </>
          )}

          {/* Contact */}
          {section === 'contact' && (
            <>
              {['phone', 'whatsapp', 'address'].map(field => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-600">{FIELD_LABELS[field]}</label>
                  <input
                    type="text"
                    value={formData[field]}
                    onChange={e => updateField(field, e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none"
                    data-testid={`edit-${field}`}
                  />
                </div>
              ))}
            </>
          )}

          {/* Services */}
          {section === 'services' && (
            <>
              {formData.services.map((svc, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Servicio {i + 1}</span>
                    <button onClick={() => removeService(i)} className="text-red-500 text-xs hover:underline">Eliminar</button>
                  </div>
                  <select
                    value={svc.service_type}
                    onChange={e => updateService(i, 'service_type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    data-testid={`edit-service-type-${i}`}
                  >
                    <option value="residencias">Residencias</option>
                    <option value="cuidado-domicilio">Cuidado a Domicilio</option>
                    <option value="salud-mental">Salud Mental</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Descripcion del servicio"
                    value={svc.description || ''}
                    onChange={e => updateService(i, 'description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    data-testid={`edit-service-desc-${i}`}
                  />
                  <input
                    type="number"
                    placeholder="Precio desde"
                    value={svc.price_from || ''}
                    onChange={e => updateService(i, 'price_from', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    data-testid={`edit-service-price-${i}`}
                  />
                  {/* Sub-prices */}
                  <div className="ml-2 mt-2 space-y-1.5 border-l-2 border-[#00e7ff]/30 pl-3">
                    <p className="text-xs font-semibold text-gray-500">Sub-precios (detalles)</p>
                    {(svc.sub_prices || []).map((sp, j) => (
                      <div key={j} className="flex items-center gap-2" data-testid={`edit-sub-price-${i}-${j}`}>
                        <input
                          type="text"
                          placeholder="Nombre (ej: Hab. individual)"
                          value={sp.name || ''}
                          onChange={e => updateSubPrice(i, j, 'name', e.target.value)}
                          className="flex-1 px-2 py-1.5 border rounded text-xs"
                        />
                        <input
                          type="number"
                          placeholder="Precio"
                          value={sp.price || ''}
                          onChange={e => updateSubPrice(i, j, 'price', parseInt(e.target.value) || 0)}
                          className="w-28 px-2 py-1.5 border rounded text-xs"
                        />
                        <button onClick={() => removeSubPrice(i, j)} className="text-red-400 text-xs hover:text-red-600 shrink-0">x</button>
                      </div>
                    ))}
                    <button
                      onClick={() => addSubPrice(i)}
                      className="text-xs text-[#00e7ff] hover:underline font-medium"
                      data-testid={`add-sub-price-btn-${i}`}
                    >
                      + Agregar sub-precio
                    </button>
                  </div>
                </div>
              ))}
              <Button onClick={addService} variant="outline" className="w-full" data-testid="add-service-btn">
                + Agregar Servicio
              </Button>
            </>
          )}

          {/* Social */}
          {section === 'social' && (
            <>
              {Object.keys(SOCIAL_LABELS).map(field => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-600">{SOCIAL_LABELS[field]}</label>
                  <input
                    type="text"
                    value={formData.social_links[field]}
                    onChange={e => updateNested('social_links', field, e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none"
                    data-testid={`edit-social-${field}`}
                  />
                </div>
              ))}
            </>
          )}

          {/* Personal Info */}
          {section === 'personal_info' && (
            <>
              {Object.keys(PERSONAL_INFO_LABELS).map(field => (
                <div key={field}>
                  <label className="text-sm font-medium text-gray-600">{PERSONAL_INFO_LABELS[field]}</label>
                  {field === 'bio' ? (
                    <textarea
                      value={formData.personal_info[field]}
                      onChange={e => updateNested('personal_info', field, e.target.value)}
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none"
                      data-testid={`edit-pi-${field}`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.personal_info[field]}
                      onChange={e => updateNested('personal_info', field, e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none"
                      data-testid={`edit-pi-${field}`}
                    />
                  )}
                </div>
              ))}
            </>
          )}

          {/* YouTube */}
          {section === 'youtube' && (
            <div>
              <label className="text-sm font-medium text-gray-600">URL del Video de YouTube</label>
              <input
                type="text"
                value={formData.youtube_video_url}
                onChange={e => updateField('youtube_video_url', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none"
                data-testid="edit-youtube-url"
              />
            </div>
          )}

          {/* Settings */}
          {section === 'settings' && (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Destacado</span>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={e => updateField('is_featured', e.target.checked)}
                  className="w-5 h-5 accent-[#00e7ff]"
                  data-testid="edit-is-featured"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Suscrito (Premium)</span>
                <input
                  type="checkbox"
                  checked={formData.is_subscribed}
                  onChange={e => updateField('is_subscribed', e.target.checked)}
                  className="w-5 h-5 accent-[#00e7ff]"
                  data-testid="edit-is-subscribed"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Google Place ID</label>
                <input
                  type="text"
                  value={formData.place_id}
                  onChange={e => updateField('place_id', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none"
                  data-testid="edit-place-id"
                />
              </div>
            </>
          )}

          {/* Amenities */}
          {section === 'amenities' && (
            <>
              {Object.entries(AMENITIES_CONFIG).map(([catKey, category]) => (
                <div key={catKey}>
                  <h3 className="text-sm font-bold text-gray-700 mb-2">{category.label}</h3>
                  <div className="space-y-2 mb-4">
                    {category.items.map(item => {
                      const Icon = item.icon;
                      const isActive = formData.amenities.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-[#00e7ff]/10 border border-[#00e7ff]' : 'bg-gray-50 border border-transparent'}`}
                          data-testid={`edit-amenity-${item.id}`}
                        >
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => {
                              setFormData(prev => ({
                                ...prev,
                                amenities: isActive
                                  ? prev.amenities.filter(a => a !== item.id)
                                  : [...prev.amenities, item.id]
                              }));
                            }}
                            className="w-4 h-4 accent-[#00e7ff]"
                          />
                          <Icon className="w-4 h-4 text-[#33404f]" />
                          <span className="text-sm">{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Gallery Photos */}
          {section === 'gallery' && (
            <>
              <p className="text-sm text-gray-500">Galeria estandar (max 3 fotos)</p>
              <div className="grid grid-cols-2 gap-3">
                {(provider.gallery || []).map((photo, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border">
                    <img
                      src={getPhotoUrl(typeof photo === 'string' ? photo : photo.url)}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => handleDeleteGalleryPhoto(photo)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`delete-gallery-${i}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {(provider.gallery || []).length < 3 && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={() => handleUploadPhoto('gallery')}
                    data-testid="gallery-file-input"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                    disabled={uploading}
                    data-testid="upload-gallery-btn"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    Subir Foto ({(provider.gallery || []).length}/3)
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Premium Gallery */}
          {section === 'premium_gallery' && (
            <>
              <p className="text-sm text-gray-500">Slider premium (max 10 fotos)</p>
              <div className="grid grid-cols-2 gap-3">
                {(provider.premium_gallery || []).map((photo, i) => (
                  <div key={photo.photo_id || i} className="relative group rounded-lg overflow-hidden border">
                    <img
                      src={getPhotoUrl(photo.url || photo)}
                      alt={`Premium ${i + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={() => handleDeletePremiumPhoto(photo.photo_id)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`delete-premium-${i}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {(provider.premium_gallery || []).length < 10 && (
                <div>
                  <input
                    ref={premiumFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={() => handleUploadPhoto('premium_gallery')}
                    data-testid="premium-file-input"
                  />
                  <Button
                    onClick={() => premiumFileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                    disabled={uploading}
                    data-testid="upload-premium-btn"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    Subir Foto ({(provider.premium_gallery || []).length}/10)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - only show Save for non-photo sections */}
        {!isPhotoSection && (
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3 rounded-b-2xl">
            <Button onClick={onClose} variant="outline" className="flex-1" data-testid="edit-cancel-btn">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold"
              data-testid="edit-save-btn"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar
            </Button>
          </div>
        )}
        {isPhotoSection && (
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-2xl">
            <Button onClick={onClose} variant="outline" className="w-full" data-testid="edit-close-btn">
              Cerrar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
