import { expect, test } from "@playwright/test";

const MAILPIT_URL = process.env.MAILPIT_URL || "http://127.0.0.1:54324";
const FIRST_VISIT_STORAGE_KEY = "pp7ia_has_visited";

async function openLoginModal(page: import("@playwright/test").Page) {
    const entrarButton = page.getByRole("button", { name: "Entrar" }).first();
    if (await entrarButton.isVisible().catch(() => false)) {
        await entrarButton.click();
        return;
    }

    const fazerLoginButton = page.getByRole("button", { name: "Fazer login" }).first();
    await expect(fazerLoginButton).toBeVisible({ timeout: 15000 });
    await fazerLoginButton.click();
}

type MailpitMessage = {
    ID: string;
    Snippet?: string;
    To?: Array<{ Address?: string }>;
};

type MailpitMessageDetails = {
    Text?: string;
    HTML?: string;
};

function decodeHtmlEntities(value: string): string {
    return value
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", '"')
        .replaceAll("&#39;", "'");
}

function extractConfirmationLink(content: string): string | null {
    const decoded = decodeHtmlEntities(content);
    const matches = decoded.match(/https?:\/\/[^\s"'()<>]+/g) || [];

    const verifyLink = matches.find(link => link.includes("/auth/v1/verify"));
    if (verifyLink) {
        return verifyLink;
    }

    const confirmLink = matches.find(link => link.includes("/auth/confirm"));
    if (confirmLink) {
        return confirmLink;
    }

    return null;
}

async function getConfirmationLinkFromMailpit(email: string): Promise<string | null> {
    const maxAttempts = 30;
    const delayMs = 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const response = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=50`);
            if (!response.ok) continue;

            const data = await response.json();
            const messages: MailpitMessage[] = data.messages || [];
            console.log(`[MAILPIT] Found ${messages.length} emails, searching for ${email}...`);

            for (const msg of messages) {
                const toAddr = msg.To?.[0]?.Address || "";
                console.log(`[MAILPIT] Checking email to: ${toAddr}`);
                
                if (toAddr === email) {
                    const snippet = msg.Snippet || "";
                    console.log(`[MAILPIT] Found email, snippet: ${snippet.substring(0, 100)}...`);

                    const detailResponse = await fetch(`${MAILPIT_URL}/api/v1/message/${msg.ID}`);
                    if (!detailResponse.ok) {
                        continue;
                    }

                    const detail: MailpitMessageDetails = await detailResponse.json();
                    const textContent = detail.Text || "";
                    const htmlContent = detail.HTML || "";

                    const linkFromText = extractConfirmationLink(textContent);
                    if (linkFromText) {
                        console.log(`[MAILPIT] Found confirmation link in text: ${linkFromText}`);
                        return linkFromText;
                    }

                    const linkFromHtml = extractConfirmationLink(htmlContent);
                    if (linkFromHtml) {
                        console.log(`[MAILPIT] Found confirmation link in HTML: ${linkFromHtml}`);
                        return linkFromHtml;
                    }
                    
                    const tokenMatch = textContent.match(/token_hash[=:]?\s*([a-zA-Z0-9_-]+)/i)
                        || htmlContent.match(/token_hash[=:]?\s*([a-zA-Z0-9_-]+)/i)
                        || snippet.match(/token_hash[=:]?\s*([a-zA-Z0-9_-]+)/i);
                    if (tokenMatch) {
                        console.log(`[MAILPIT] Found token in snippet: ${tokenMatch[1]}`);
                        return `http://127.0.0.1:3000/auth/confirm?token_hash=${tokenMatch[1]}&type=email`;
                    }
                    
                    const codeMatch = textContent.match(/(\d{6,8})/) || snippet.match(/(\d{6,8})/);
                    if (codeMatch) {
                        console.log(`[MAILPIT] Found OTP code: ${codeMatch[1]}`);
                    }
                }
            }
        } catch (e) {
            console.log(`[MAILPIT] Error fetching: ${e}`);
        }

        await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    return null;
}

test.describe("Email confirmation E2E", () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(storageKey => {
            window.localStorage.setItem(storageKey, "true");
        }, FIRST_VISIT_STORAGE_KEY);
    });

    test("cadastro real com confirmacao de email funciona de ponta a ponta", async ({ page }) => {
        const testEmail = `test-${Date.now()}@example.com`;
        console.log(`[TEST] Starting signup with email: ${testEmail}`);

        await page.goto("/");
        await openLoginModal(page);
        await page.locator("form").getByRole("button", { name: "Cadastrar" }).click();

        await page.getByLabel("Nome Completo").fill("Test User");
        await page.getByLabel("Email").fill(testEmail);
        await page.getByLabel("Celular").fill("11999999999");
        await page.getByLabel("Senha", { exact: true }).fill("Test@123456");
        await page.getByText("Aceito receber atualizações e novidades por e-mail").click();
        await page.locator("form").getByRole("button", { name: "Cadastrar" }).click();

        console.log("[TEST] Signup submitted, waiting for confirmation message...");
        await expect(page.getByText(/verifique seu email para confirmar/i)).toBeVisible({ timeout: 15000 });
        console.log("[TEST] Confirmation message shown, looking for email in Mailpit...");

        const confirmLink = await getConfirmationLinkFromMailpit(testEmail);
        console.log(`[TEST] Got confirmation link: ${confirmLink}`);
        
        expect(confirmLink).not.toBeNull();
        expect(confirmLink).toMatch(/\/auth\/(confirm|v1\/verify)/);

        console.log("[TEST] Navigating to confirmation link...");
        await page.goto(confirmLink!);

        console.log("[TEST] Waiting for post-confirmation navigation...");
        await page.waitForURL(/\/(home)?(\?.*)?$/, { timeout: 15000 });

        if (!/\/home(\?.*)?$/.test(page.url())) {
            console.log("[TEST] Link flow returned to landing page, validating confirmation via login...");
            await openLoginModal(page);
            await page.getByLabel("Email").fill(testEmail);
            await page.getByLabel("Senha", { exact: true }).fill("Test@123456");
            await page.locator("form").getByRole("button", { name: "Entrar" }).click();
            await expect(page).toHaveURL(/\/home(\?.*)?$/, { timeout: 15000 });
        }

        console.log("[TEST] On /home, checking authenticated UI...");
        await expect(page.getByRole("link", { name: "Test" })).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole("button", { name: "Sair" })).toBeVisible({ timeout: 15000 });
        console.log("[TEST] User is logged in - TEST PASSED!");
    });

    test("confirmacao com token invalido redireciona para landing page com erro", async ({ page }) => {
        const invalidLink = "http://127.0.0.1:3000/auth/confirm?token_hash=invalid-token&type=email";

        await page.goto(invalidLink);

        await expect(page).toHaveURL(/\/(\?.*)?$/, { timeout: 10000 });
    });
});
