// Mock data for UI testing without Supabase

export const MOCK_MODE = !import.meta.env.VITE_SUPABASE_URL;

export const mockUser = {
  id: 'mock-user-123',
  email: 'test@ekthau.com',
  aud: 'authenticated',
  role: 'authenticated',
}

export const mockSession = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser
}

export const mockEvents = [
  {
    id: 'evt_1',
    name: 'Sita & Ramesh Wedding',
    event_date: '2026-10-15',
    location: 'Yak & Yeti, Kathmandu',
    status: 'active',
    public_slug: 'sita-ramesh-2026',
    guest_limit: 500,
    allow_anonymous: true,
    cover_image_path: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'evt_2',
    name: 'Aarav 1st Birthday',
    event_date: '2026-11-02',
    location: 'Boudha, Kathmandu',
    status: 'draft',
    public_slug: 'aarav-bday',
    guest_limit: 100,
    allow_anonymous: true,
    cover_image_path: null
  }
]

export const mockMedia = [
  {
    id: 'med_1',
    storage_path: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop',
    mime_type: 'image/jpeg',
    status: 'approved',
    created_at: new Date().toISOString(),
    width: 1920,
    height: 1080,
    uploaded_at: new Date().toISOString()
  },
  {
    id: 'med_2',
    storage_path: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=2070&auto=format&fit=crop',
    mime_type: 'image/jpeg',
    status: 'pending',
    created_at: new Date().toISOString(),
    width: 1920,
    height: 1080,
    uploaded_at: new Date().toISOString()
  },
  {
    id: 'med_3',
    storage_path: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=2070&auto=format&fit=crop',
    mime_type: 'image/jpeg',
    status: 'approved',
    created_at: new Date().toISOString(),
    width: 1920,
    height: 1080,
    uploaded_at: new Date().toISOString()
  }
]
