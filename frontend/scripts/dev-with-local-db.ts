/**
 * Wraps `next dev` so every `pnpm run dev` always has a local Postgres copy of
 * the Railway `development` database to talk to: installs postgresql@18 +
 * pgvector via Homebrew if missing, starts the local server if it isn't
 * running, creates `pp7ias_develop_local` from a dump of the remote
 * `development` database the first time it's needed, and stops the local
 * server on exit — but only if this process is the one that started it.
 */
import { execSync, spawn } from "node:child_process";

const DB_NAME = "pp7ias_develop_local";
const DB_HOST = "127.0.0.1";
const DB_PORT = "5432";
const LOCAL_DATABASE_URL = `postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
const RAILWAY_SERVICE = "Postgres";
const RAILWAY_ENVIRONMENT = "development";

let startedServerOurselves = false;

function log(message: string): void {
    console.log(`[dev-db] ${message}`);
}

function run(command: string): string {
    return execSync(command, { encoding: "utf8" }).trim();
}

function runInherit(command: string): void {
    execSync(command, { stdio: "inherit" });
}

function succeeds(command: string): boolean {
    try {
        execSync(command, { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

function ensureToolingInstalled(): void {
    let installed = "";
    try {
        installed = run("brew list --formula");
    } catch {
        throw new Error("[dev-db] Homebrew não encontrado. Instale em https://brew.sh e rode `pnpm run dev` de novo.");
    }

    const formulae = installed.split("\n");
    if (!formulae.includes("postgresql@18")) {
        log("postgresql@18 não encontrado — instalando via Homebrew (pode levar um minuto)...");
        runInherit("brew install postgresql@18");
    }
    if (!formulae.includes("pgvector")) {
        log("pgvector não encontrado — instalando via Homebrew...");
        runInherit("brew install pgvector");
    }
}

function ensurePgBinOnPath(): void {
    const pgBin = `${run("brew --prefix postgresql@18")}/bin`;
    process.env.PATH = `${pgBin}:${process.env.PATH ?? ""}`;
}

function ensureServerRunning(): void {
    if (succeeds(`pg_isready -q -h ${DB_HOST} -p ${DB_PORT}`)) {
        return;
    }

    log("Postgres local não está rodando — iniciando postgresql@18...");
    runInherit("brew services start postgresql@18");
    startedServerOurselves = true;

    for (let attempt = 0; attempt < 20; attempt += 1) {
        if (succeeds(`pg_isready -q -h ${DB_HOST} -p ${DB_PORT}`)) {
            return;
        }
        execSync("sleep 1");
    }
    throw new Error("[dev-db] Postgres local não respondeu a tempo depois de iniciar o serviço.");
}

function databaseExists(): boolean {
    const databases = run(`psql -h ${DB_HOST} -p ${DB_PORT} -lqt`)
        .split("\n")
        .map((line) => line.split("|")[0]?.trim());
    return databases.includes(DB_NAME);
}

function createLocalCopyFromRemote(): void {
    if (!succeeds("command -v railway")) {
        throw new Error(
            "[dev-db] Railway CLI não encontrado no PATH. Instale (https://docs.railway.com/guides/cli) e rode " +
                "`railway login` + `railway link` neste projeto antes de rodar `pnpm run dev`.",
        );
    }

    log(`Banco local '${DB_NAME}' não encontrado — criando cópia a partir do Railway (${RAILWAY_ENVIRONMENT})...`);
    log("Isso pode levar alguns segundos (dump + restore via Railway CLI). Aguarde.");

    runInherit(`createdb -h ${DB_HOST} -p ${DB_PORT} ${DB_NAME}`);
    runInherit(`psql -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -c "CREATE EXTENSION IF NOT EXISTS vector;"`);

    const dumpFile = `/tmp/pp7ias_dev_db_bootstrap_${Date.now()}.dump`;
    try {
        runInherit(
            `railway run --service ${RAILWAY_SERVICE} --environment ${RAILWAY_ENVIRONMENT} -- ` +
                `bash -c 'pg_dump "$DATABASE_PUBLIC_URL" -Fc --no-owner --no-acl -f "${dumpFile}"'`,
        );
        runInherit(`pg_restore --no-owner --no-acl -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} "${dumpFile}"`);
        log("Cópia local pronta.");
    } finally {
        execSync(`rm -f "${dumpFile}"`);
    }
}

function stopServerIfWeStartedIt(): void {
    if (!startedServerOurselves) return;
    log("Encerrando Postgres local (foi este comando que iniciou)...");
    try {
        execSync("brew services stop postgresql@18", { stdio: "inherit" });
    } catch {
        log("Falha ao parar postgresql@18 — pode ter que parar manualmente (`brew services stop postgresql@18`).");
    }
}

function main(): void {
    ensureToolingInstalled();
    ensurePgBinOnPath();
    ensureServerRunning();

    if (databaseExists()) {
        log(`Usando banco local existente: ${DB_NAME}`);
    } else {
        createLocalCopyFromRemote();
    }

    const child = spawn("next", ["dev", "--webpack"], {
        stdio: "inherit",
        env: { ...process.env, DATABASE_URL: LOCAL_DATABASE_URL },
    });

    process.on("SIGINT", () => child.kill("SIGINT"));
    process.on("SIGTERM", () => child.kill("SIGTERM"));

    child.on("exit", (code) => {
        stopServerIfWeStartedIt();
        process.exit(code ?? 0);
    });
}

main();
