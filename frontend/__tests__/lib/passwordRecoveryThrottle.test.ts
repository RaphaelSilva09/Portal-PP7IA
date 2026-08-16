import { describe, expect, it } from 'vitest';
import { createInMemoryRecoveryAttemptStore } from '@/lib/passwordRecoveryThrottle';

describe('createInMemoryRecoveryAttemptStore', () => {
    it('allows guesses under the streak while no challenge has ever been exhausted', async () => {
        const store = createInMemoryRecoveryAttemptStore();
        for (let i = 0; i < 10; i++) {
            const result = await store.recordGuess('user@example.com');
            expect(result.allowed).toBe(true);
        }
    });

    it('onChallengeIssued resets the streak when the previous one was under budget (legitimate early resend)', async () => {
        const store = createInMemoryRecoveryAttemptStore();
        await store.recordGuess('user@example.com');
        await store.recordGuess('user@example.com');
        await store.recordGuess('user@example.com'); // streak = 3, well under 10

        await store.onChallengeIssued('user@example.com');

        // A subsequent guess should not be blocked — the streak was reset, not carried over.
        const result = await store.recordGuess('user@example.com');
        expect(result.allowed).toBe(true);
    });

    it('onChallengeIssued starts a cooldown instead of resetting when the streak already reached the cap', async () => {
        const store = createInMemoryRecoveryAttemptStore();
        for (let i = 0; i < 10; i++) {
            await store.recordGuess('user@example.com');
        }

        // Resend still succeeds conceptually (onChallengeIssued doesn't itself reject) —
        // it just starts a cooldown instead of granting a clean slate.
        await store.onChallengeIssued('user@example.com');

        const result = await store.recordGuess('user@example.com');
        expect(result.allowed).toBe(false);
        expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('does not confuse two different emails — each has an independent streak', async () => {
        const store = createInMemoryRecoveryAttemptStore();
        for (let i = 0; i < 10; i++) {
            await store.recordGuess('victim@example.com');
        }
        await store.onChallengeIssued('victim@example.com');
        const victimResult = await store.recordGuess('victim@example.com');
        expect(victimResult.allowed).toBe(false);

        const otherResult = await store.recordGuess('someone-else@example.com');
        expect(otherResult.allowed).toBe(true);
    });

    it('claimInFlight is a single-slot mutex: a second concurrent claim fails until released', async () => {
        const store = createInMemoryRecoveryAttemptStore();
        const first = await store.claimInFlight('user@example.com');
        const second = await store.claimInFlight('user@example.com');
        expect(first).toBe(true);
        expect(second).toBe(false);

        await store.releaseInFlight('user@example.com');
        const third = await store.claimInFlight('user@example.com');
        expect(third).toBe(true);
    });

    it('resetOnSuccess clears the streak, any cooldown, and the in-flight claim', async () => {
        const store = createInMemoryRecoveryAttemptStore();
        for (let i = 0; i < 10; i++) {
            await store.recordGuess('user@example.com');
        }
        await store.onChallengeIssued('user@example.com');
        await store.claimInFlight('user@example.com');

        await store.resetOnSuccess('user@example.com');

        const result = await store.recordGuess('user@example.com');
        expect(result.allowed).toBe(true);
        const claimed = await store.claimInFlight('user@example.com');
        expect(claimed).toBe(true); // was released by resetOnSuccess, not still held
    });

    it('email matching is case/whitespace-insensitive (same identity either way)', async () => {
        const store = createInMemoryRecoveryAttemptStore();
        for (let i = 0; i < 10; i++) {
            await store.recordGuess('  User@Example.com  ');
        }
        await store.onChallengeIssued('user@example.com');
        const result = await store.recordGuess('USER@EXAMPLE.COM');
        expect(result.allowed).toBe(false);
    });
});
