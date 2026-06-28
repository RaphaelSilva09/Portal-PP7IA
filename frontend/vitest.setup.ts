import '@testing-library/react/pure';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

function createMemoryStorage(): Storage {
    const store = new Map<string, string>();

    return {
        get length() {
            return store.size;
        },
        clear() {
            store.clear();
        },
        getItem(key: string) {
            return store.get(key) ?? null;
        },
        key(index: number) {
            return Array.from(store.keys())[index] ?? null;
        },
        removeItem(key: string) {
            store.delete(key);
        },
        setItem(key: string, value: string) {
            store.set(key, value);
        },
    };
}

function getTestLocalStorage(): Storage {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
        }
    } catch {
        // Fall back to an in-memory implementation below.
    }

    return createMemoryStorage();
}

Object.defineProperty(globalThis, 'localStorage', {
    value: getTestLocalStorage(),
    configurable: true,
});

afterEach(() => cleanup());
