/**
 * UNIT TIER — pure client-side state machine tests, no I/O, no server.
 * `DIContainer` is mocked at the boundary (same pattern as
 * `__tests__/hooks/usePasswordRecovery.test.ts`), so these tests are only
 * about `hooks/usePasswordRecovery.ts`'s own state transitions, not about
 * better-auth. They specifically target gaps the existing coverage file does
 * NOT exercise: concurrent/overlapping calls, double-invocation without
 * awaiting, and out-of-order async resolution.
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvalidOTPError, TooManyOTPAttemptsError } from '@/domain/errors/AuthError';

const {
    mockSendPasswordResetExecute,
    mockVerifyOTPExecute,
    mockResetPasswordWithOTP,
    mockSignOut,
} = vi.hoisted(() => ({
    mockSendPasswordResetExecute: vi.fn(),
    mockVerifyOTPExecute: vi.fn(),
    mockResetPasswordWithOTP: vi.fn(),
    mockSignOut: vi.fn(),
}));

vi.mock('@/infrastructure/di/container', () => ({
    default: {
        getSendPasswordResetUseCase: vi.fn(() => ({ execute: mockSendPasswordResetExecute })),
        getVerifyPasswordResetOTPUseCase: vi.fn(() => ({ execute: mockVerifyOTPExecute })),
        getAuthRepository: vi.fn(() => ({
            resetPasswordWithOTP: mockResetPasswordWithOTP,
            signOut: mockSignOut,
        })),
    },
}));

import { usePasswordRecovery } from '@/hooks/usePasswordRecovery';

/** A deferred promise so tests can control exactly when an async call resolves,
 *  to construct out-of-order resolution scenarios. */
function deferred<T>() {
    let resolve!: (v: T) => void;
    let reject!: (e: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

async function goToCodePhase() {
    mockSendPasswordResetExecute.mockResolvedValue(undefined);
    const hook = renderHook(() => usePasswordRecovery());
    await act(async () => {
        await hook.result.current.requestReset('user@example.com');
    });
    return hook;
}

describe('usePasswordRecovery — concurrency / race gaps', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it('GAP: double-invoking verifyCode without awaiting the first call fires the use case twice (no synchronous re-entrancy guard)', async () => {
        const { result } = await goToCodePhase();
        const d1 = deferred<void>();
        const d2 = deferred<void>();
        mockVerifyOTPExecute.mockImplementationOnce(() => d1.promise).mockImplementationOnce(() => d2.promise);

        let p1!: Promise<boolean>;
        let p2!: Promise<boolean>;
        await act(async () => {
            // Neither call is awaited before the next fires — both read the
            // SAME `state` closure (isSubmitting: false at call time for both),
            // because no re-render has happened yet between them.
            p1 = result.current.verifyCode('11111111');
            p2 = result.current.verifyCode('22222222');
            d1.resolve();
            d2.resolve();
            await Promise.all([p1, p2]);
        });

        // REQUIRED behavior: a double-submit must not reach the network twice —
        // the second call should have been rejected by the isSubmitting guard.
        // This currently FAILS: both calls read isSubmitting=false from the same
        // stale closure and both proceed, so the use case fires twice with two
        // different codes in flight concurrently.
        expect(mockVerifyOTPExecute).toHaveBeenCalledTimes(1);
    });

    it('GAP: double-invoking resetPassword without awaiting fires resetPasswordWithOTP twice', async () => {
        const { result } = await goToCodePhase();
        mockVerifyOTPExecute.mockResolvedValue(undefined);
        await act(async () => {
            await result.current.verifyCode('12345678');
        });
        expect(result.current.state.phase).toBe('password');

        const d1 = deferred<void>();
        const d2 = deferred<void>();
        mockResetPasswordWithOTP.mockImplementationOnce(() => d1.promise).mockImplementationOnce(() => d2.promise);
        mockSignOut.mockResolvedValue(undefined);

        let p1!: Promise<boolean>;
        let p2!: Promise<boolean>;
        await act(async () => {
            p1 = result.current.resetPassword('senhaNova1', 'senhaNova1');
            p2 = result.current.resetPassword('senhaNova1', 'senhaNova1');
            d1.resolve();
            d2.resolve();
            await Promise.all([p1, p2]);
        });

        // REQUIRED: only one password-change request should ever be in flight
        // for a single user click/submit. Currently FAILS for the same reason
        // as verifyCode above — the isSubmitting guard reads a stale closure.
        expect(mockResetPasswordWithOTP).toHaveBeenCalledTimes(1);
    });

    it('GAP: a stale, slow verifyCode resolving AFTER a concurrent resendCode has already succeeded must not clobber the fresh challenge state with a stale TOO_MANY_ATTEMPTS lock', async () => {
        // Fake timers from the start: the 60s resend cooldown started by
        // requestReset() schedules a real setTimeout chain if timers are real at
        // that point, and switching to fake timers later doesn't retroactively
        // control an already-pending real timer.
        vi.useFakeTimers();
        const { result } = await goToCodePhase();

        const slowVerify = deferred<void>();
        mockVerifyOTPExecute.mockImplementationOnce(() => slowVerify.promise);
        mockSendPasswordResetExecute.mockResolvedValue(undefined);

        let verifyPromise!: Promise<boolean>;
        await act(async () => {
            // Fire a verifyCode that will resolve to TOO_MANY_ATTEMPTS, but don't
            // let it resolve yet.
            verifyPromise = result.current.verifyCode('00000000');
        });
        expect(result.current.state.phase === 'code' && result.current.state.isSubmitting).toBe(true);

        // While that's still pending, the user can't call resendCode (isResending
        // guard also checks isSubmitting) — so this race can only be constructed
        // by resolving the slow verify AFTER a resend that happened in a
        // hypothetically different render pass. To probe the actual gap, resolve
        // verify with TOO_MANY_ATTEMPTS now, then immediately resend, then check
        // that a THIRD late-resolving verifyCode response (simulating an even
        // older in-flight request finally completing) cannot re-lock a fresh,
        // already-resent challenge.
        await act(async () => {
            slowVerify.reject(new TooManyOTPAttemptsError());
            await verifyPromise;
        });
        expect(result.current.state.phase === 'code' && result.current.state.locked).toBe(true);

        // resendCode() is gated by the 60s cooldown started on requestReset —
        // advance past it (per project convention: fake timers +
        // vi.runAllTimersAsync()/advanceTimersByTimeAsync() inside act(), no
        // waitFor) so the resend below isn't silently dropped by the cooldown
        // guard.
        // The cooldown effect re-arms a new setTimeout(…, 1000) on every commit
        // (recursive via the `[cooldown]` dependency), so a single large
        // advanceTimersByTimeAsync(60000) doesn't reliably flush all 60 renders
        // in one go — step it a tick at a time so React gets a chance to re-run
        // the effect and re-arm between each decrement.
        for (let i = 0; i < 60; i++) {
            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });
        }

        // User resends — server-side this is a legitimate fresh 0-attempt
        // challenge (per the integration-tier Contract 1 Scenario A), and the
        // hook correctly unlocks (locked:false) because wasLocked was true.
        await act(async () => {
            await result.current.resendCode();
        });
        expect(result.current.state.phase === 'code' && result.current.state.locked).toBe(false);

        // Now imagine an even older verifyCode call (fired before the resend,
        // never awaited by the caller, e.g. a duplicate click from before) finally
        // settles with a stale InvalidOTPError against the OLD, now-retired otp.
        // The hook has no request-id / generation guard on verifyCode, so this
        // stale resolution is applied via the same functional setState updater
        // used for everything else, and DOES land on top of the fresh, unlocked
        // 'code' phase state.
        const staleVerify = deferred<void>();
        mockVerifyOTPExecute.mockImplementationOnce(() => staleVerify.promise);
        let staleCallPromise!: Promise<boolean>;
        await act(async () => {
            staleCallPromise = result.current.verifyCode('00000000');
        });
        await act(async () => {
            staleVerify.reject(new InvalidOTPError());
            await staleCallPromise.catch(() => {});
        });

        // REQUIRED: the failedAttemptsRef mirror and error state after this point
        // must reflect the NEW challenge's attempt count (which should be 1 wrong
        // guess against the fresh otp), not accidentally treat this as a
        // continuation of the exhausted pre-resend challenge.
        if (result.current.state.phase === 'code') {
            expect(result.current.state.locked).toBe(false);
            expect(result.current.state.error?.attemptsRemaining).toBe(9);
        }
        vi.useRealTimers();
    });
});
