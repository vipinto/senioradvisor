import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (providerId) => {
    try {
      await api.delete(`/favorites/${providerId}`);
      setFavorites(favorites.filter(p => p.provider_id !== providerId));
      toast.success('Eliminado de favoritos');
    } catch (error) {
      toast.error('Error al eliminar favorito');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#E6202E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-montserrat text-4xl font-bold text-gray-900 mb-8">
          Mis Favoritos
        </h1>

        {favorites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">No tienes favoritos aún</p>
            <Link to="/search">
              <Button className="bg-[#E6202E] hover:bg-[#D31522]">
                Buscar Cuidadores
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((provider) => (
              <div
                key={provider.provider_id}
                className="bg-white rounded-2xl shadow-sm border hover:shadow-xl transition-all overflow-hidden"
              >
                <Link to={`/provider/${provider.provider_id}`}>
                  <div className="aspect-video bg-gray-200">
                    {provider.photos?.[0] && (
                      <img
                        src={provider.photos[0]}
                        alt={provider.business_name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </Link>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <Link to={`/provider/${provider.provider_id}`}>
                      <h3 className="font-bold text-xl hover:text-[#E6202E]">
                        {provider.business_name}
                      </h3>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFavorite(provider.provider_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Heart className="w-5 h-5 fill-red-500" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{provider.comuna}</span>
                    {provider.verified && <Shield className="w-4 h-4 text-[#E6202E]" />}
                  </div>
                  {provider.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{provider.rating}</span>
                      <span className="text-gray-500 text-sm">
                        ({provider.total_reviews})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
