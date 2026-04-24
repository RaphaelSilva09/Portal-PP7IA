/**
 * Application Layer - Public API
 *
 * Centraliza exports da camada de aplicação.
 */

// Use Cases
export { SignUpUseCase } from "./usecases/SignUpUseCase";
export type { SignUpInput, SignUpOutput } from "./usecases/SignUpUseCase";

export { SignInUseCase } from "./usecases/SignInUseCase";
export type { SignInInput, SignInOutput } from "./usecases/SignInUseCase";

export { SignOutUseCase } from "./usecases/SignOutUseCase";

export { GetCurrentUserUseCase } from "./usecases/GetCurrentUserUseCase";

export { SendPasswordResetUseCase } from "./usecases/SendPasswordResetUseCase";
export type { SendPasswordResetInput } from "./usecases/SendPasswordResetUseCase";

export { VerifyPasswordResetOTPUseCase } from "./usecases/VerifyPasswordResetOTPUseCase";
export type { VerifyPasswordResetOTPInput } from "./usecases/VerifyPasswordResetOTPUseCase";

export { ResetPasswordWithTokenUseCase } from "./usecases/ResetPasswordWithTokenUseCase";
export type { ResetPasswordWithTokenInput } from "./usecases/ResetPasswordWithTokenUseCase";

export { SearchContentUseCase } from "./usecases/SearchContentUseCase";
export type { SearchContentInput, SearchFilter, SearchResultItem } from "./usecases/SearchContentUseCase";

export { GetRadarOportunidadesUseCase } from "./usecases/GetRadarOportunidadesUseCase";
export type { GetRadarOportunidadesResult } from "./usecases/GetRadarOportunidadesUseCase";

export { GetEstudarUseCase } from "./usecases/GetEstudarUseCase";
export type { GetEstudarResult } from "./usecases/GetEstudarUseCase";

export { GetEbookUseCase } from "./usecases/GetEbookUseCase";
export type { GetEbookResult } from "./usecases/GetEbookUseCase";

export { GetContentViewNavigationUseCase } from "./usecases/GetContentViewNavigationUseCase";
export type {
    ContentViewNavigationLink,
    GetContentViewNavigationInput,
    GetContentViewNavigationResult,
} from "./usecases/GetContentViewNavigationUseCase";
