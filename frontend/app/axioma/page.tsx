import { ArrowUpRight, FileText } from "lucide-react";
import Link from "next/link";
import { Nav } from "@/components/axioma/Nav";
import Footer from "@/components/Footer";

export default function AxiomaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Nav />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
          {/* Textura editorial — marcas de calibração, como nas seções do portal */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full select-none"
            viewBox="0 0 1440 700"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="-80" cy="620" r="420" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.05" />
            <circle cx="1500" cy="40" r="330" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.05" />
            <circle cx="1080" cy="560" r="110" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="6 5" opacity="0.06" />
            <line x1="220" y1="0" x2="540" y2="700" stroke="currentColor" strokeWidth="0.5" opacity="0.05" />
            <line x1="0" y1="210" x2="230" y2="210" stroke="currentColor" strokeWidth="0.5" opacity="0.06" />
            <line x1="1220" y1="440" x2="1440" y2="440" stroke="currentColor" strokeWidth="0.5" opacity="0.05" />
            {/* Cruzes de registro */}
            <line x1="1150" y1="130" x2="1170" y2="130" stroke="currentColor" strokeWidth="1" opacity="0.14" />
            <line x1="1160" y1="120" x2="1160" y2="140" stroke="currentColor" strokeWidth="1" opacity="0.14" />
            <line x1="330" y1="560" x2="346" y2="560" stroke="currentColor" strokeWidth="1" opacity="0.12" />
            <line x1="338" y1="552" x2="338" y2="568" stroke="currentColor" strokeWidth="1" opacity="0.12" />
          </svg>

          <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7 animate-in">
                {/* Eyebrow — traço na cor do bloco + label + hairline, como na home */}
                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-6" style={{ backgroundColor: "var(--block-estudar)" }} aria-hidden="true" />
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Bloco 06 · Estudar
                    <span className="mx-2 opacity-40">·</span>
                    Diagnóstico
                  </span>
                  <div className="hidden flex-1 sm:flex">
                    <div className="h-px flex-1 bg-border" />
                  </div>
                </div>

                {/* Heading — display editorial do portal */}
                <h1 className="mt-8 font-editorial leading-[0.98] tracking-[-0.025em] text-balance text-ink text-[clamp(2.75rem,5.5vw,4.5rem)]">
                  Mapeie sua jornada na{" "}
                  <em className="italic" style={{ color: "var(--block-estudar)" }}>
                    Inteligência Artificial
                  </em>
                  .
                </h1>

                <p className="mt-7 max-w-[52ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Comece com uma <strong className="font-semibold text-foreground">triagem rápida</strong> para
                  entender seu nível atual. Depois, faça a{" "}
                  <strong className="font-semibold text-foreground">prova personalizada</strong> online e receba
                  correção e feedback gerados por IA na hora.
                </p>

                {/* CTAs — pills do portal */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/axioma/perfil?start=true"
                    className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[var(--block-estudar)]"
                  >
                    Começar pela Triagem
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/axioma/upload"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
                  >
                    <FileText className="size-4" aria-hidden="true" />
                    Enviar prova respondida
                  </Link>
                </div>
              </div>

              {/* Como funciona — cartão ink com hairlines, como as seções escuras do portal */}
              <div className="lg:col-span-5 animate-in [animation-delay:150ms]">
                <div className="relative overflow-hidden rounded-2xl bg-ink p-8 text-background shadow-[var(--shadow-card)]">
                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full select-none"
                    viewBox="0 0 460 420"
                    preserveAspectRatio="xMidYMid slice"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="450" cy="-20" r="180" fill="none" stroke="white" strokeWidth="1" opacity="0.12" />
                    <circle cx="20" cy="430" r="130" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.10" />
                    <line x1="0" y1="120" x2="90" y2="120" stroke="white" strokeWidth="0.5" opacity="0.09" />
                    <line x1="190" y1="0" x2="330" y2="420" stroke="white" strokeWidth="0.5" opacity="0.07" />
                    <line x1="392" y1="368" x2="408" y2="368" stroke="white" strokeWidth="1" opacity="0.16" />
                    <line x1="400" y1="360" x2="400" y2="376" stroke="white" strokeWidth="1" opacity="0.16" />
                  </svg>

                  <div className="relative flex flex-col gap-7">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-background/50">
                      Como funciona
                    </span>
                    <ol className="space-y-6">
                      <li className="flex items-start gap-4">
                        <span className="shrink-0 font-serif text-3xl leading-none text-background/80">01</span>
                        <div>
                          <p className="font-serif text-lg leading-snug text-background">Triagem rápida</p>
                          <p className="mt-1 text-sm text-background/60">10 perguntas mapeiam seu nível atual de IA</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="shrink-0 font-serif text-3xl leading-none text-background/80">02</span>
                        <div>
                          <p className="font-serif text-lg leading-snug text-background">Prova personalizada</p>
                          <p className="mt-1 text-sm text-background/60">Gerada pela IA com base na sua triagem</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="shrink-0 font-serif text-3xl leading-none text-background/80">03</span>
                        <div>
                          <p className="font-serif text-lg leading-snug text-background">Correção + feedback</p>
                          <p className="mt-1 text-sm text-background/60">Pontuação, lacunas e próximos passos</p>
                        </div>
                      </li>
                    </ol>
                    <blockquote className="border-t border-background/10 pt-5">
                      <p className="font-serif text-sm italic leading-relaxed text-background/70">
                        &ldquo;Mapeamos o ponto de partida para construir a jornada certa.&rdquo;
                      </p>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
