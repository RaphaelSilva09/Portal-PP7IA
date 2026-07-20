"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Nav } from "@/components/axioma/Nav";
import Footer from "@/components/Footer";
import { QuestionnaireFlow } from "@/components/axioma/QuestionnaireFlow";
import { tecnicoQuestions } from "@/lib/axioma/questions";

function TecnicoPageContent() {
  const searchParams = useSearchParams();
  const start = searchParams.get("start");
  const initialStarted = start === "true" || start === "1";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Nav />
      <main className="flex-1">
        <QuestionnaireFlow
          tipo="tecnico"
          title="Prova de IA"
          questions={tecnicoQuestions}
          initialStarted={initialStarted}
          startHref="/axioma/tecnico?start=true"
        />
      </main>
      <Footer />
    </div>
  );
}

export default function TecnicoPage() {
  return (
    <Suspense fallback={null}>
      <TecnicoPageContent />
    </Suspense>
  );
}
