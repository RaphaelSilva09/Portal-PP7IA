"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Nav } from "@/components/axioma/Nav";
import Footer from "@/components/Footer";
import { QuestionnaireFlow } from "@/components/axioma/QuestionnaireFlow";
import { perfilQuestions } from "@/lib/axioma/questions";

function PerfilPageContent() {
  const searchParams = useSearchParams();
  const start = searchParams.get("start");
  const initialStarted = start === "true" || start === "1";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Nav />
      <main className="flex-1">
        <QuestionnaireFlow
          tipo="perfil"
          title="Triagem de Conhecimento"
          questions={perfilQuestions}
          initialStarted={initialStarted}
          startHref="/axioma/perfil?start=true"
        />
      </main>
      <Footer />
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={null}>
      <PerfilPageContent />
    </Suspense>
  );
}
