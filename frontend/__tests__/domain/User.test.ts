import { describe, expect, it } from 'vitest';
import { User, UserProps } from '@/domain/entities/User';

const validProps: UserProps = {
    id: 'user-1',
    email: 'test@example.com',
    nome: 'Test User',
    celular: '11999999999',
    acceptEmailUpdates: true,
    createdAt: new Date('2024-01-01'),
    role: 'user',
};

describe('User', () => {
    describe('User.create()', () => {
        it('com props válidas → cria instância com getters corretos', () => {
            const user = User.create(validProps);

            expect(user.id).toBe('user-1');
            expect(user.email).toBe('test@example.com');
            expect(user.nome).toBe('Test User');
            expect(user.celular).toBe('11999999999');
            expect(user.acceptEmailUpdates).toBe(true);
            expect(user.role).toBe('user');
        });

        it('email inválido → throw "Email inválido"', () => {
            expect(() => User.create({ ...validProps, email: 'not-an-email' })).toThrow('Email inválido');
        });

        it('email vazio → throw "Email inválido"', () => {
            expect(() => User.create({ ...validProps, email: '' })).toThrow('Email inválido');
        });

        it('nome vazio → throw "Nome é obrigatório"', () => {
            expect(() => User.create({ ...validProps, nome: '' })).toThrow('Nome é obrigatório');
        });

        it('nome apenas espaços → throw "Nome é obrigatório"', () => {
            expect(() => User.create({ ...validProps, nome: '   ' })).toThrow('Nome é obrigatório');
        });

        it('celular com menos de 10 dígitos → throw "Celular inválido"', () => {
            expect(() => User.create({ ...validProps, celular: '999999999' })).toThrow('Celular inválido');
        });

        it('celular com 10 dígitos com máscara → válido', () => {
            const user = User.create({ ...validProps, celular: '(11) 9999-9999' });
            expect(user.celular).toBe('(11) 9999-9999');
        });

        it('celular com 11 dígitos com máscara → válido', () => {
            const user = User.create({ ...validProps, celular: '(11) 99999-9999' });
            expect(user.celular).toBe('(11) 99999-9999');
        });

        it('acceptEmailUpdates false → throw sobre e-mail obrigatório', () => {
            expect(() =>
                User.create({ ...validProps, acceptEmailUpdates: false })
            ).toThrow(/aceitar receber atualizações por e-mail/i);
        });
    });

    describe('isAdmin', () => {
        it('role "admin" → isAdmin true', () => {
            const user = User.create({ ...validProps, role: 'admin' });
            expect(user.isAdmin).toBe(true);
        });

        it('role "user" → isAdmin false', () => {
            const user = User.create(validProps);
            expect(user.isAdmin).toBe(false);
        });
    });

    describe('toObject()', () => {
        it('retorna cópia plana dos props', () => {
            const user = User.create(validProps);
            const obj = user.toObject();

            expect(obj).toEqual(validProps);
            expect(obj).not.toBe(validProps);
        });
    });
});
