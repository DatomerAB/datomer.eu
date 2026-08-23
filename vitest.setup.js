import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Turnstile is tested separately; disable it in component tests so forms/buttons work normally.
vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '')
