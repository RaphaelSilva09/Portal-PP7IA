/**
 * AccessRuleView (Domain Layer) — DTO client-safe descrevendo, para um leitor
 * específico, por que um conteúdo está bloqueado e como desbloqueá-lo.
 * Produzido por `AccessRuleStrategy.describe()`, consumido igualmente pelo
 * card na listagem, pelo pop-up de bloqueio e pela página de acesso negado —
 * nenhum desses três precisa conhecer o tipo de regra por trás do DTO.
 */

/** Ícone associado ao bloqueio. Extensível: um tipo de regra futuro (ex. assinatura) pode introduzir um novo valor sem afetar os existentes. */
export type AccessRuleIcon = "lock";

/**
 * Ação de desbloqueio que o botão "fácil acesso" executa. União
 * discriminada por `kind` — adicionar uma ação nova (ex. abrir uma página de
 * upgrade) é adicionar uma variante aqui e um `case` no componente que a
 * executa (`UnlockActionButton`), sem tocar nas regras existentes.
 */
export type UnlockAction =
    | { kind: "open-auth-modal"; mode: "login" | "signup" }
    | { kind: "retry" };

export interface AccessRuleView {
    ruleType: string;
    icon: AccessRuleIcon;
    /** Texto curto ao lado do ícone, no card da listagem. */
    cardLabel: string;
    /** Título do pop-up / da página de acesso negado. */
    modalTitle: string;
    /** Corpo explicando por que o conteúdo está bloqueado. */
    modalMessage: string;
    unlockButtonLabel: string;
    unlockAction: UnlockAction;
}
