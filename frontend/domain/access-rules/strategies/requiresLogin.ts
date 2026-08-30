import type { AccessRuleStrategy } from "../AccessRuleStrategy";

/** Primeiro tipo de regra: conteúdo visível apenas para leitores logados. */
export const REQUIRES_LOGIN_RULE_TYPE = "requires_login";

export const requiresLoginStrategy: AccessRuleStrategy = {
    type: REQUIRES_LOGIN_RULE_TYPE,
    adminLabel: "Exige login",

    evaluate(context) {
        return context.userId !== null;
    },

    describe() {
        return {
            ruleType: REQUIRES_LOGIN_RULE_TYPE,
            icon: "lock",
            cardLabel: "Faça login para acessar",
            modalTitle: "Conteúdo exclusivo para leitores",
            modalMessage:
                "Este conteúdo só pode ser acessado por quem tem uma conta no portal. Faça login — ou cadastre-se, é gratuito — para desbloquear.",
            unlockButtonLabel: "Fazer login",
            unlockAction: { kind: "open-auth-modal", mode: "login" },
        };
    },
};
