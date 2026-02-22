/**
 * VerifyPasswordResetOTPUseCase (Application Layer)
 *
 * Caso de uso para verificar código OTP de recuperação de senha.
 *
 * Princípios aplicados:
 * - SRP: Responsabilidade única de verificar OTP
 * - DIP: Depende da abstração IAuthRepository
 * - Clean Architecture: Use case orquestra operações de domínio
 * - YAGNI: Implementa apenas o necessário para o caso de uso
 */

import { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { isValidEmail } from "../../lib/validators";

export interface VerifyPasswordResetOTPInput {
    email: string;
    otp: string;
}

/**
 * Use Case: Verificar código OTP de recuperação de senha
 *
 * Fluxo:
 * 1. Valida formato do OTP (6 dígitos numéricos)
 * 2. Valida email
 * 3. Chama repository para verificar OTP com Supabase
 * 4. Se válido: estabelece sessão temporária de recovery
 */
export class VerifyPasswordResetOTPUseCase {
    constructor(private readonly authRepository: IAuthRepository) {}

    /**
     * Executa o caso de uso de verificar OTP
     * @param input Email e código OTP de 6 dígitos
     * @throws Error se OTP inválido, expirado ou formato incorreto
     */
    async execute(input: VerifyPasswordResetOTPInput): Promise<void> {
        this.validateInput(input);

        const normalizedEmail = input.email.trim().toLowerCase();
        const cleanedOTP = input.otp.trim();

        await this.authRepository.verifyPasswordResetOTP({
            email: normalizedEmail,
            token: cleanedOTP,
        });
    }

    /**
     * Valida os dados de entrada
     * @throws Error se validação falhar
     */
    private validateInput(input: VerifyPasswordResetOTPInput): void {
        if (!input.email) {
            throw new Error("Email é obrigatório");
        }

        if (!isValidEmail(input.email)) {
            throw new Error("Email inválido");
        }

        if (!input.otp) {
            throw new Error("Código OTP é obrigatório");
        }

        // Valida que OTP tem exatamente 6 dígitos numéricos
        const otpRegex = /^\d{6}$/;
        if (!otpRegex.test(input.otp.trim())) {
            throw new Error("Código deve ter exatamente 6 dígitos numéricos");
        }
    }
}
