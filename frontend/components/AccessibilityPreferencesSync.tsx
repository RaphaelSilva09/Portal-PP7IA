"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    loadReadingPrefs,
    READING_PREFS_EVENT,
    sanitizeReadingPrefs,
    saveReadingPrefs,
} from "@/lib/readingPrefs";
import {
    loadPortalFontScale,
    PORTAL_FONT_SCALE_EVENT,
    sanitizePortalFontScale,
    savePortalFontScale,
} from "@/lib/portalTypography";

const SYNC_DEBOUNCE_MS = 800;
const ENDPOINT = "/api/user/accessibility-preferences";

interface AccessibilityPreferencesResponse {
    preferences: { readingPrefs?: unknown; portalFontScale?: unknown } | null;
}

function currentLocalPreferences() {
    return {
        readingPrefs: loadReadingPrefs(),
        portalFontScale: loadPortalFontScale(),
    };
}

function postCurrentPreferences() {
    return fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentLocalPreferences()),
    });
}

/**
 * Sincroniza as preferências de acessibilidade (tipografia de leitura e do
 * portal) com o servidor para leitores logados — um perfil por categoria de
 * dispositivo (móvel/não-móvel), compartilhado entre todos os aparelhos do
 * usuário na mesma categoria. Sem UI própria; montado uma vez perto da raiz,
 * como PortalTypographyEffect.
 *
 * No login (ou já logado no mount): se o servidor já tem um perfil para a
 * categoria deste dispositivo, aplica-o localmente; senão, semeia o servidor
 * a partir do valor já salvo no localStorage deste dispositivo, para não
 * descartar uma customização feita antes desta sincronização existir.
 * Enquanto logado, reenvia ao servidor (com debounce) a cada mudança local
 * subsequente, via os eventos que readingPrefs/portalTypography já disparam.
 */
export default function AccessibilityPreferencesSync() {
    const { user } = useAuth();
    const syncedUserId = useRef<string | null>(null);
    const applyingFromServer = useRef(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    // true enquanto a sincronização inicial do usuário atual ainda está em
    // voo — usado para saber se uma edição local concorrente aconteceu antes
    // do GET responder (ver localEditPending abaixo).
    const initialSyncDone = useRef(false);
    // true se o usuário editou uma preferência entre o mount e a resposta do
    // GET inicial. Sem isso, aplicar o valor do servidor nesse meio-tempo
    // sobrescreveria a edição do usuário silenciosamente, e o POST com
    // debounce já agendado reenviaria esse mesmo valor sobrescrito ao
    // servidor — perdendo a escolha do usuário sem qualquer aviso.
    const localEditPending = useRef(false);

    useEffect(() => {
        if (!user) {
            // Permite que um novo login do MESMO usuário nesta aba (logout
            // seguido de login sem reload de página) refaça a sincronização
            // — sem isso o ref continuaria apontando para o id antigo e o
            // GET inicial nunca seria refeito.
            syncedUserId.current = null;
            return;
        }
        if (syncedUserId.current === user.id) return;
        syncedUserId.current = user.id;
        initialSyncDone.current = false;
        localEditPending.current = false;

        (async () => {
            try {
                const res = await fetch(ENDPOINT);
                if (!res.ok) return;
                const json = (await res.json()) as AccessibilityPreferencesResponse;

                if (json.preferences && !localEditPending.current) {
                    applyingFromServer.current = true;
                    saveReadingPrefs(sanitizeReadingPrefs(json.preferences.readingPrefs));
                    savePortalFontScale(sanitizePortalFontScale(json.preferences.portalFontScale));
                    applyingFromServer.current = false;
                } else {
                    // Sem perfil salvo no servidor, ou o usuário já editou
                    // localmente enquanto o GET estava em voo — nos dois
                    // casos o valor local atual é a fonte da verdade e deve
                    // subir para o servidor, não o contrário.
                    if (debounceTimer.current) {
                        clearTimeout(debounceTimer.current);
                        debounceTimer.current = null;
                    }
                    await postCurrentPreferences();
                }
            } catch {
                // Servidor indisponível — segue com o que já está no localStorage deste dispositivo.
            } finally {
                initialSyncDone.current = true;
            }
        })();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const scheduleSync = () => {
            // Eco do valor que a própria sincronização acabou de aplicar — não reenviar.
            if (applyingFromServer.current) return;
            if (!initialSyncDone.current) localEditPending.current = true;
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                postCurrentPreferences().catch(() => {});
            }, SYNC_DEBOUNCE_MS);
        };

        window.addEventListener(READING_PREFS_EVENT, scheduleSync);
        window.addEventListener(PORTAL_FONT_SCALE_EVENT, scheduleSync);
        return () => {
            window.removeEventListener(READING_PREFS_EVENT, scheduleSync);
            window.removeEventListener(PORTAL_FONT_SCALE_EVENT, scheduleSync);
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [user]);

    return null;
}
