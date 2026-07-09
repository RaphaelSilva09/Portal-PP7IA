import { pool } from "../lib/db";
import { sendWeeklyDigest } from "../lib/email/weekly-digest";

async function main() {
    const result = await sendWeeklyDigest({
        force: process.env.DIGEST_FORCE === "1",
        dryRun: process.env.DIGEST_DRY_RUN === "1",
    });

    console.log("[weekly-digest] result", result);

    if (result.status === "partial" || result.failedCount > 0) {
        process.exitCode = 1;
    }
}

main()
    .catch((error) => {
        console.error("[weekly-digest] fatal", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
