/**
 * IStorageRepository Interface (Domain Layer)
 *
 * Define o contrato para operações de upload/delete de arquivos.
 * Abstrai o storage backend (filesystem, S3, etc).
 *
 * Princípios aplicados:
 * - DIP: Abstração que permite inversão de dependência
 * - ISP: Interface segregada para operações de storage
 */

export interface UploadResult {
    /** Caminho do arquivo no storage */
    path: string;
    /** URL pública para acesso ao arquivo */
    publicUrl: string;
}

export interface IStorageRepository {
    /**
     * Faz upload de um arquivo
     * @param bucket - Nome do bucket
     * @param fileName - Nome do arquivo (já formatado com ID)
     * @param file - Arquivo a ser enviado
     * @returns Resultado com path e URL pública
     */
    upload(bucket: string, fileName: string, file: File): Promise<UploadResult>;

    /**
     * Copia um arquivo já existente no storage para um novo caminho.
     * Não apaga o arquivo de origem — quem chama decide quando limpar.
     * @param bucket - Nome do bucket
     * @param fromPath - Caminho de origem, relativo ao bucket
     * @param toPath - Caminho de destino, relativo ao bucket
     * @returns Resultado com path e URL pública do novo arquivo
     */
    copy(bucket: string, fromPath: string, toPath: string): Promise<UploadResult>;

    /**
     * Remove um arquivo do storage
     * @param bucket - Nome do bucket
     * @param filePath - Caminho do arquivo no bucket
     */
    delete(bucket: string, filePath: string): Promise<void>;
}
