import React, { useState } from 'react';
import { Location } from '../../types';
import * as api from '../../services/api';
import { useWeather } from '../../context/WeatherContext';
import { Search, MapPin, Check, Trash2, X, Globe, Plus } from 'lucide-react';

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CitySearchModal: React.FC<CitySearchModalProps> = ({ isOpen, onClose }) => {
  const { locations, activeLocation, selectCity, deleteCity } = useWeather();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await api.searchLocations(query.trim(), 6);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No matching locations found.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Geocoding search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectExisting = async (locId: number) => {
    await selectCity({ location_id: locId });
    onClose();
  };

  const handleAddNew = async (loc: Location) => {
    await selectCity({ location: loc });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      data-testid="city-search-modal"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2 text-[#48dbfb] font-semibold">
            <Globe className="w-5 h-5" />
            <h2 className="text-base text-slate-100 font-bold">Weather Station & City Profiles</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          {/* 1. Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city by name (e.g. Austin, London, Tokyo)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0abde3] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[#0abde3] to-[#48dbfb] hover:opacity-90 text-slate-950 font-bold rounded-xl text-sm transition-all disabled:opacity-50 shadow-sm"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Search Error */}
          {searchError && (
            <div className="text-xs text-[#ff6b6b] bg-[#ff6b6b]/10 border border-[#ff6b6b]/20 rounded-lg p-2.5">
              {searchError}
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-[#48dbfb] uppercase tracking-wider">
                Geocoded Matches
              </span>
              <div className="grid grid-cols-1 gap-2">
                {searchResults.map((r, idx) => (
                  <div
                    key={`${r.name}-${r.latitude}-${idx}`}
                    className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 hover:border-[#0abde3]/50 rounded-xl transition-all"
                  >
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold text-slate-200">
                        {r.name}
                        {r.admin1 ? `, ${r.admin1}` : ''} ({r.country})
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Lat: {r.latitude.toFixed(2)}°, Lon: {r.longitude.toFixed(2)}° | TZ: {r.timezone}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddNew(r)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#0abde3]/10 hover:bg-[#0abde3]/20 text-[#48dbfb] border border-[#0abde3]/30 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Select & Backfill</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Saved Station Profiles */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Saved Weather Stations ({locations.length})
            </span>

            {locations.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-center">
                No stations saved yet. Search for a city above to configure your observation station.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {locations.map((loc) => {
                  const isActive = activeLocation?.id === loc.id;
                  return (
                    <div
                      key={loc.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-[#0abde3]/10 border-[#0abde3]/40 shadow-inner'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isActive
                              ? 'bg-[#0abde3]/20 text-[#48dbfb]'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                            <span>{loc.name}</span>
                            {loc.admin1 && <span className="text-slate-400 text-xs font-normal">({loc.admin1})</span>}
                            {isActive && (
                              <span className="px-2 py-0.5 bg-[#0abde3]/20 border border-[#0abde3]/40 text-[#48dbfb] text-[10px] rounded-full font-mono font-medium">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {loc.country} | {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive && loc.id && (
                          <button
                            onClick={() => handleSelectExisting(loc.id!)}
                            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Switch</span>
                          </button>
                        )}
                        {loc.id && (
                          <button
                            onClick={() => deleteCity(loc.id!)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete Station"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitySearchModal;
