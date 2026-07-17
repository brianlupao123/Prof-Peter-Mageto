import { createContext, createElement, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch } from './api.js';
import { fallbackHeroSlides } from '../data/profileData.js';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      const payload = await apiFetch('/api/profile');
      setData(payload);
      setStatus('ready');
    } catch (_error) {
      setStatus('error');
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return createElement(ProfileContext.Provider, { value: { data, status, reload } }, children);
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>');
  return ctx;
}

export function useHeroSlides(pageKey) {
  const { data } = useProfile();
  const apiSlides = data?.heroSlides?.filter((slide) => slide.page_key === pageKey).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || [];
  // If the API returned slides for this page, use them; otherwise fall back to hardcoded data
  if (apiSlides.length > 0) return apiSlides;
  return fallbackHeroSlides.filter((slide) => slide.page_key === pageKey);
}

