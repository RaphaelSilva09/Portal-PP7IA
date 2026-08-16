import { describe, expect, it } from 'vitest';
import {
    AuthError,
    EmailNotConfirmedError,
    InvalidCredentialsError,
    InvalidResetTokenError,
    NetworkError,
    PasswordResetRequestError,
    RateLimitError,
    TooManyOTPAttemptsError,
    UnknownAuthError,
    UserAlreadyExistsError,
    WeakPasswordError,
} from '@/domain/errors/AuthError';

describe('AuthError subtypes', () => {
    it('InvalidCredentialsError é instanceof AuthError e Error', () => {
        const err = new InvalidCredentialsError();
        expect(err).toBeInstanceOf(AuthError);
        expect(err).toBeInstanceOf(Error);
    });

    it('InvalidCredentialsError tem mensagem correta em português', () => {
        expect(new InvalidCredentialsError().message).toBe('Email ou senha inválidos');
    });

    it('UserAlreadyExistsError é instanceof AuthError', () => {
        expect(new UserAlreadyExistsError()).toBeInstanceOf(AuthError);
    });

    it('UserAlreadyExistsError tem mensagem correta', () => {
        expect(new UserAlreadyExistsError().message).toBe('Já existe uma conta com este email');
    });

    it('WeakPasswordError é instanceof AuthError', () => {
        expect(new WeakPasswordError()).toBeInstanceOf(AuthError);
    });

    it('WeakPasswordError com mensagem padrão', () => {
        expect(new WeakPasswordError().message).toBe('A senha não atende aos requisitos de segurança');
    });

    it('WeakPasswordError aceita mensagem customizada', () => {
        expect(new WeakPasswordError('Senha muito curta').message).toBe('Senha muito curta');
    });

    it('NetworkError é instanceof AuthError', () => {
        expect(new NetworkError()).toBeInstanceOf(AuthError);
    });

    it('NetworkError tem mensagem de conexão', () => {
        expect(new NetworkError().message).toMatch(/conexão/);
    });

    it('UnknownAuthError é instanceof AuthError', () => {
        expect(new UnknownAuthError()).toBeInstanceOf(AuthError);
    });

    it('UnknownAuthError com mensagem padrão', () => {
        expect(new UnknownAuthError().message).toMatch(/erro inesperado/i);
    });

    it('EmailNotConfirmedError é instanceof AuthError', () => {
        expect(new EmailNotConfirmedError()).toBeInstanceOf(AuthError);
    });

    it('EmailNotConfirmedError tem mensagem de confirmação de email', () => {
        expect(new EmailNotConfirmedError().message).toMatch(/confirme seu email/i);
    });

    it('PasswordResetRequestError é instanceof AuthError', () => {
        expect(new PasswordResetRequestError()).toBeInstanceOf(AuthError);
    });

    it('InvalidResetTokenError é instanceof AuthError', () => {
        expect(new InvalidResetTokenError()).toBeInstanceOf(AuthError);
    });

    it('InvalidResetTokenError tem mensagem sobre link inválido', () => {
        expect(new InvalidResetTokenError().message).toMatch(/inválido|expirado/i);
    });

    it('TooManyOTPAttemptsError é instanceof AuthError', () => {
        expect(new TooManyOTPAttemptsError()).toBeInstanceOf(AuthError);
    });

    it('TooManyOTPAttemptsError orienta o usuário a solicitar um novo código', () => {
        expect(new TooManyOTPAttemptsError().message).toMatch(/novo código/i);
    });

    it('RateLimitError é instanceof AuthError e carrega retryAfterSeconds', () => {
        const err = new RateLimitError(30);
        expect(err).toBeInstanceOf(AuthError);
        expect(err.retryAfterSeconds).toBe(30);
    });

    it('RateLimitError sem retryAfterSeconds informado é null (não inventa um tempo)', () => {
        expect(new RateLimitError().retryAfterSeconds).toBeNull();
    });

    it('cada subtipo tem name igual ao nome da classe', () => {
        expect(new InvalidCredentialsError().name).toBe('InvalidCredentialsError');
        expect(new UserAlreadyExistsError().name).toBe('UserAlreadyExistsError');
        expect(new NetworkError().name).toBe('NetworkError');
    });
});
