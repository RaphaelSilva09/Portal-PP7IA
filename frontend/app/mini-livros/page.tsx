import { redirect } from "next/navigation";

export default function MiniLivrosPage() {
    redirect("/explorar?b=livro");
}
