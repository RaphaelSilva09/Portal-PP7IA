import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SignInUseCase } from '@/application/usecases/SignInUseCase';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { InvalidCredentialsError } from '@/domain/errors/AuthError';
import { User } from '@/domain/entities/User';

const mockUser = User.create({
    id: 'u1',
    email: 'test@example.com',
    nome: 'Test User',
    celular: '11999999999',
    acceptEmailUpdates: true,
    createdAt: new Date(),
    role: 'user',
});

const mockRepo = {
    signIn: vi.fn(),
} satisfies Partial<IAuthRepository>;

const useCase = new SignInUseCase(mockRepo as unknown as IAuthRepository);

describe('SignInUseCase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('email vazio → throw "Email e senha são obrigatórios"', async () => {
        await expect(useCase.execute({ email: '', password: 'senha' })).rejects.toThrow(
            'Email e senha são obrigatórios'
        );
        expect(mockRepo.signIn).not.toHaveBeenCalled();
    });

    it('senha vazia → throw "Email e senha são obrigatórios"', async () => {
        await expect(useCase.execute({ email: 'test@test.com', password: '' })).rejects.toThrow(
            'Email e senha são obrigatórios'
        );
        expect(mockRepo.signIn).not.toHaveBeenCalled();
    });

    it('email normalizado para lowercase antes de chamar repo', async () => {
        mockRepo.signIn.mockResolvedValue({
            user: mockUser,
            session: { accessToken: 'token', refreshToken: 'refresh' },
        });

        await useCase.execute({ email: 'TEST@EXAMPLE.COM', password: 'senha' });

        expect(mockRepo.signIn).toHaveBeenCalledWith(
            expect.objectContaining({ email: 'test@example.com' })
        );
    });

    it('repo retorna usuário → output com user e accessToken', async () => {
        mockRepo.signIn.mockResolvedValue({
            user: mockUser,
            session: { accessToken: 'my-token', refreshToken: 'refresh' },
        });

        const result = await useCase.execute({ email: 'test@example.com', password: 'senha' });

        expect(result.user).toBe(mockUser);
        expect(result.accessToken).toBe('my-token');
    });

    it('repo retorna session null → accessToken null', async () => {
        mockRepo.signIn.mockResolvedValue({ user: mockUser, session: null });

        const result = await useCase.execute({ email: 'test@example.com', password: 'senha' });

        expect(result.accessToken).toBeNull();
    });

    it('repo lança InvalidCredentialsError → repassa sem transformar', async () => {
        mockRepo.signIn.mockRejectedValue(new InvalidCredentialsError());

        await expect(useCase.execute({ email: 'test@example.com', password: 'errada' })).rejects.toBeInstanceOf(
            InvalidCredentialsError
        );
    });
});
