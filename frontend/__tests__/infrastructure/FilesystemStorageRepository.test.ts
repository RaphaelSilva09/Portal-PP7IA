import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { FilesystemStorageRepository as FilesystemStorageRepositoryType } from "@/infrastructure/repositories/FilesystemStorageRepository";

let tempRoot: string;
let repo: InstanceType<typeof FilesystemStorageRepositoryType>;

beforeAll(async () => {
    tempRoot = await mkdtemp(path.join(tmpdir(), "storage-copy-test-"));
    process.env.STORAGE_ROOT = tempRoot;
    const { FilesystemStorageRepository } = await import("@/infrastructure/repositories/FilesystemStorageRepository");
    repo = new FilesystemStorageRepository();
});

afterAll(async () => {
    delete process.env.STORAGE_ROOT;
    await rm(tempRoot, { recursive: true, force: true });
});

describe("FilesystemStorageRepository.copy", () => {
    it("copia um arquivo existente para o novo caminho, sem apagar a origem", async () => {
        await mkdir(path.join(tempRoot, "materiais", "radar-de-oportunidades"), { recursive: true });
        await writeFile(
            path.join(tempRoot, "materiais", "radar-de-oportunidades", "007.html"),
            "<p>origem</p>",
        );

        const result = await repo.copy("materiais", "radar-de-oportunidades/007.html", "estudar/014.html");

        expect(result.path).toBe("materiais/estudar/014.html");
        expect(result.publicUrl).toBe("/api/files/materiais/estudar/014.html");

        const copied = await readFile(path.join(tempRoot, "materiais", "estudar", "014.html"), "utf8");
        expect(copied).toBe("<p>origem</p>");

        const original = await readFile(
            path.join(tempRoot, "materiais", "radar-de-oportunidades", "007.html"),
            "utf8",
        );
        expect(original).toBe("<p>origem</p>");
    });

    it("lança erro quando o arquivo de origem não existe", async () => {
        await expect(
            repo.copy("materiais", "radar-de-oportunidades/999.html", "estudar/999.html"),
        ).rejects.toThrow();
    });
});
