/**
 * BetterAuthRepository (Infrastructure Layer)
 *
 * Implementação concreta do IAuthRepository usando better-auth.
 * Substitui PostgresAuthRepository preservando contrato e arquitetura DI.
 *
 * - DIP: Implementa IAuthRepository definido no domínio
 * - Adapter Pattern: Adapta API better-auth → entidade User do domínio
 * - SRP: Apenas comunicação com better-auth (HTTP via authClient → /api/auth/*)
 */

import { User } from "../../domain/entities/User";
import {
    EmailNotConfirmedError,
    InvalidCredentialsError,
    NetworkError,
    UnknownAuthError,
    UserAlreadyExistsError,
    WeakPasswordError,
} from "../../domain/errors/AuthError";
import {
    AuthResult,
    IAuthRepository,
    SignInParams,
    SignUpParams,
    UpdateEmailParams,
    UpdatePasswordParams,
    UpdatePreferencesParams,
    UpdateProfileParams,
} from "../../domain/repositories/IAuthRepository";
import { authClient } from "../../lib/auth-client";

interface BetterAuthUserData {
    id: string;
    email: string;
    name?: string | null;
    nome?: string | null;
    celular?: string | null;
    accept_email_updates?: boolean | null;
    accept_whatsapp_updates?: boolean | null;
    role?: string | null;
    createdAt?: string | Date;
}

export class BetterAuthRepository implements IAuthRepository {
    /**
     * Cadastra novo usuário via better-auth.
     * additionalFields (nome, celular, accept_*) são persistidos no user table.
     */
    async signUp(params: SignUpParams): Promise<AuthResult> {
        const { data, error } = await authClient.signUp.email({
            email: params.email,
            password: params.password,
            name: params.nome,
            // additionalFields — typed via inferAdditionalFields plugin
            nome: params.nome,
            celular: params.celular,
            accept_email_updates: params.acceptEmailUpdates,
            accept_whatsapp_updates: params.acceptWhatsAppUpdates,
        } as Parameters<typeof authClient.signUp.email>[0]);

        if (error) throw this.mapError(error);
        if (!data) throw new UnknownAuthError("Falha ao criar usuário");

        const user = this.mapToUser(data.user as BetterAuthUserData, params);

        // emailVerification disabled in current config — auto-signed-in immediately
        return {
            user,
            session: data.token
                ? { accessToken: data.token, refreshToken: "" }
                : null,
            emailConfirmationRequired: !data.token,
        };
    }

    async signIn(params: SignInParams): Promise<AuthResult> {
        const { data, error } = await authClient.signIn.email({
            email: params.email,
            password: params.password,
        });

        if (error) throw this.mapError(error);
        if (!data) throw new InvalidCredentialsError();

        const user = this.mapToUser(data.user as BetterAuthUserData);

        return {
            user,
            session: data.token
                ? { accessToken: data.token, refreshToken: "" }
                : null,
        };
    }

    async signOut(): Promise<void> {
        const { error } = await authClient.signOut();
        if (error) throw this.mapError(error);
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const session = await authClient.getSession();
            const data = session?.data;
            if (!data?.user) return null;
            return this.mapToUser(data.user as BetterAuthUserData);
        } catch {
            return null;
        }
    }

    async getUserFromSession(userId: string, role: string): Promise<User | null> {
        // better-auth session already carries full user object — no separate profile fetch needed.
        // userId/role kwargs preserved for interface compat; we re-fetch session for freshest data.
        try {
            const session = await authClient.getSession();
            const data = session?.data;
            if (!data?.user || data.user.id !== userId) return null;
            return this.mapToUser(data.user as BetterAuthUserData, undefined, role);
        } catch {
            return null;
        }
    }

    async sendPasswordReset(email: string): Promise<void> {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "forget-password",
        });
        if (error) throw this.mapError(error);
    }

    async verifyPasswordResetOTP(params: { email: string; token: string }): Promise<void> {
        // emailOTP plugin verifies + caches verification; resetPasswordWithOTP uses it.
        // Storing verified email/code locally in repository instance for the subsequent reset call.
        this.pendingResetEmail = params.email;
        this.pendingResetOtp = params.token;
        // Verify-only step is implicit in resetPassword; we'll surface invalid-OTP errors there.
    }

    async resetPasswordWithToken(_newPassword: string): Promise<void> {
        throw new UnknownAuthError("Use resetPasswordWithOTP — token-based reset deprecated");
    }

    async resetPasswordWithOTP(newPassword: string): Promise<void> {
        if (!this.pendingResetEmail || !this.pendingResetOtp) {
            throw new UnknownAuthError("Verifique o código antes de redefinir a senha");
        }
        const { error } = await authClient.emailOtp.resetPassword({
            email: this.pendingResetEmail,
            otp: this.pendingResetOtp,
            password: newPassword,
        });
        this.pendingResetEmail = null;
        this.pendingResetOtp = null;
        if (error) throw this.mapError(error);
    }

    async updateEmail(params: UpdateEmailParams): Promise<void> {
        const { error } = await authClient.changeEmail({
            newEmail: params.newEmail,
        });
        if (error) throw this.mapError(error);
    }

    async updatePassword(params: UpdatePasswordParams): Promise<void> {
        const { error } = await authClient.changePassword({
            currentPassword: params.currentPassword,
            newPassword: params.newPassword,
        });
        if (error) throw this.mapError(error);
    }

    async updatePreferences(params: UpdatePreferencesParams): Promise<void> {
        const { error } = await authClient.updateUser({
            accept_email_updates: params.acceptEmailUpdates,
            accept_whatsapp_updates: params.acceptWhatsAppUpdates,
        } as Parameters<typeof authClient.updateUser>[0]);
        if (error) throw this.mapError(error);
    }

    async updateProfile(params: UpdateProfileParams): Promise<void> {
        const { error: updateError } = await authClient.updateUser({
            name: params.nome,
            nome: params.nome,
            celular: params.celular,
        } as Parameters<typeof authClient.updateUser>[0]);
        if (updateError) throw this.mapError(updateError);

        const session = await authClient.getSession();
        if (session?.data?.user.email !== params.email) {
            const { error: emailError } = await authClient.changeEmail({
                newEmail: params.email,
            });
            if (emailError) throw this.mapError(emailError);
        }
    }

    async deleteAccount(): Promise<void> {
        const { error } = await authClient.deleteUser();
        if (error) throw this.mapError(error);
    }

    private pendingResetEmail: string | null = null;
    private pendingResetOtp: string | null = null;

    private mapToUser(
        userData: BetterAuthUserData,
        signupParams?: SignUpParams,
        roleOverride?: string,
    ): User {
        const acceptEmail =
            userData.accept_email_updates ??
            signupParams?.acceptEmailUpdates ??
            true;
        const acceptWA =
            userData.accept_whatsapp_updates ??
            signupParams?.acceptWhatsAppUpdates ??
            false;
        const eitherAccepted = acceptEmail || acceptWA;

        return User.create({
            id: userData.id,
            email: userData.email,
            nome: userData.nome ?? userData.name ?? signupParams?.nome ?? "",
            celular: userData.celular ?? signupParams?.celular ?? "",
            acceptEmailUpdates: eitherAccepted ? acceptEmail : true, // ensure invariant
            acceptWhatsAppUpdates: acceptWA,
            createdAt: userData.createdAt
                ? new Date(userData.createdAt)
                : new Date(),
            role: roleOverride ?? userData.role ?? "user",
        });
    }

    private mapError(error: { message?: string; status?: number; code?: string }): Error {
        const msg = error?.message?.toLowerCase() ?? "";
        const code = error?.code ?? "";

        if (code === "USER_ALREADY_EXISTS" || msg.includes("already exists")) {
            return new UserAlreadyExistsError();
        }
        if (code === "INVALID_CREDENTIALS" || msg.includes("invalid") && msg.includes("credentials")) {
            return new InvalidCredentialsError();
        }
        if (code === "EMAIL_NOT_VERIFIED" || msg.includes("not verified")) {
            return new EmailNotConfirmedError();
        }
        if (code === "WEAK_PASSWORD" || msg.includes("password") && (msg.includes("weak") || msg.includes("short"))) {
            return new WeakPasswordError();
        }
        if (msg.includes("network") || msg.includes("fetch")) {
            return new NetworkError();
        }
        return new UnknownAuthError(error?.message ?? "Erro desconhecido");
    }
}
