import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SignUpUseCase, SignUpInput } from '@/application/usecases/SignUpUseCase';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';
import { User } from '@/domain/entities/User';

const mockUser = User.create({
    id: 'u1',
    email: 'test@example.com',
    nome: 'Test User',
    celular: '11999999999',
    acceptEmailUpdates: true,
    acceptWhatsAppUpdates: false,
    createdAt: new Date(),
    role: 'user',
});

const mockRepo = {
    signUp: vi.fn(),
} satisfies Partial<IAuthRepository>;

const useCase = new SignUpUseCase(mockRepo as IAuthRepository);

const validInput: SignUpInput = {
    email: 'test@example.com',
    password: 'senha123',
    nome: 'Test User',
    celular: '11999999999',
    acceptEmailUpdates: true,
    acceptWhatsAppUpdates: false,
};

describe('SignUpUseCase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('email vazio → throw sobre campos obrigatórios', async () => {
        await expect(
            useCase.execute({ ...validInput, email: '' })
        ).rejects.toThrow(/campos obrigatórios/);
        expect(mockRepo.signUp).not.toHaveBeenCalled();
    });

    it('nome vazio → throw sobre campos obrigatórios', async () => {
        await expect(
            useCase.execute({ ...validInput, nome: '' })
        ).rejects.toThrow(/campos obrigatórios/);
    });

    it('password vazio → throw sobre campos obrigatórios', async () => {
        await expect(
            useCase.execute({ ...validInput, password: '' })
        ).rejects.toThrow(/campos obrigatórios/);
    });

    it('celular vazio → throw sobre campos obrigatórios', async () => {
        await expect(
            useCase.execute({ ...validInput, celular: '' })
        ).rejects.toThrow(/campos obrigatórios/);
    });

    it('ambas preferências false → throw "Aceite pelo menos uma forma"', async () => {
        await expect(
            useCase.execute({ ...validInput, acceptEmailUpdates: false, acceptWhatsAppUpdates: false })
        ).rejects.toThrow(/Aceite pelo menos uma forma/);
        expect(mockRepo.signUp).not.toHaveBeenCalled();
    });

    it('email e nome normalizados antes de chamar repo', async () => {
        mockRepo.signUp.mockResolvedValue({
            user: mockUser,
            session: { accessToken: 'token', refreshToken: 'refresh' },
        });

        await useCase.execute({
            ...validInput,
            email: '  TEST@EXAMPLE.COM  ',
            nome: '  Test User  ',
        });

        expect(mockRepo.signUp).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'test@example.com',
                nome: 'Test User',
            })
        );
    });

    it('emailConfirmationRequired passado corretamente no output', async () => {
        mockRepo.signUp.mockResolvedValue({
            user: mockUser,
            session: null,
            emailConfirmationRequired: true,
        });

        const result = await useCase.execute(validInput);

        expect(result.emailConfirmationRequired).toBe(true);
        expect(result.accessToken).toBeNull();
    });

    it('sem emailConfirmationRequired → padrão false no output', async () => {
        mockRepo.signUp.mockResolvedValue({
            user: mockUser,
            session: { accessToken: 'token', refreshToken: 'refresh' },
        });

        const result = await useCase.execute(validInput);

        expect(result.emailConfirmationRequired).toBeUndefined();
    });
});
