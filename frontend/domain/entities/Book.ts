/**
 * Book Entity (Domain Layer)
 *
 * Representa a entidade de domínio do Livro Principal seguindo DDD.
 * Diferencia-se de Ebook por possuir um status de ativo (isActive) e ser um singleton (apenas um livro ativo).
 */

export interface BookProps {
    id: number;
    title: string;
    subtitle: string | null;
    description: string | null;
    coverImagePath: string | null;
    coverPdfPath: string | null;
    introHtmlPath: string | null;
    introPdfPath: string | null;
    badgeText: string | null;
    isActive: boolean;
}

export class Book {
    private constructor(private readonly props: BookProps) {}

    /**
     * Factory Method para criar Book
     */
    static create(props: BookProps): Book {
        return new Book(props);
    }

    get id(): number {
        return this.props.id ?? 0;
    }

    get title(): string {
        return this.props.title?.trim() || "Livro indisponível";
    }

    get subtitle(): string | null {
        return this.props.subtitle?.trim() || null;
    }

    get description(): string | null {
        return this.props.description?.trim() || null;
    }

    get coverImagePath(): string | null {
        return this.props.coverImagePath?.trim() || null;
    }

    get coverPdfPath(): string | null {
        return this.props.coverPdfPath?.trim() || null;
    }

    get introHtmlPath(): string | null {
        const rawPath = this.props.introHtmlPath?.trim();
        if (!rawPath) return null;
        
        // Se for um HTML hospedado no Supabase Storage (final .html)
        // usamos a rota interna /view proxy do Next.js
        if (rawPath.endsWith('.html')) {
            const match = rawPath.match(/\/([^/]+)\.html$/);
            if (match) {
                const slug = match[1];
                return `/view/book/${slug}`;
            }
        }
        
        // Caso contrário (ex: um PDF ou link externo no varchar), 
        // ou se não conseguirmos extrair o slug, 
        // devolve o link cru do banco de dados
        return rawPath;
    }

    get introPdfPath(): string | null {
        return this.props.introPdfPath?.trim() || null;
    }

    get badgeText(): string | null {
        return this.props.badgeText?.trim() || null;
    }

    get isActive(): boolean {
        return this.props.isActive ?? false;
    }

    toObject(): BookProps {
        return { ...this.props };
    }
}
