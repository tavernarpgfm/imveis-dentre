import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  LogOut,
  Search,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { brokersService } from "@/lib/supabase-service";
import type { BrokerRow } from "@/lib/supabase-service";

export default function BrokersPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [availableBrokers, setAvailableBrokers] = useState<BrokerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrokers() {
      try {
        const data = await brokersService.listAvailableBrokers({});
        setAvailableBrokers(data);
      } catch (err) {
        console.error("Error loading brokers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBrokers();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const filteredBrokers = availableBrokers.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.creci_number.toLowerCase().includes(term) ||
      b.specialization?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b-3 border-foreground bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 font-bold text-sm hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            VOLTAR
          </button>
          <div className="flex items-center gap-3">
            <Badge className="border-2 border-foreground bg-accent text-accent-foreground font-black text-[10px] uppercase">
              CORRETORES
            </Badge>
            <Button
              type="button"
              variant="ghost"
              className="border-2 border-transparent hover:border-foreground font-bold text-xs"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-1" />
              SAIR
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black">CORRETORES CERTIFICADOS</h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            Encontre profissionais qualificados para sua empresa
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por CRECI, especialidade..."
              className="neobrutal-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredBrokers.length > 0 ? (
            filteredBrokers.map((broker) => (
              <div
                key={broker.id}
                className="border-3 border-foreground bg-card p-5 shadow-[3px_3px_0px_0px] shadow-foreground hover:shadow-[5px_5px_0px_0px] hover:shadow-foreground transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center border-3 border-foreground bg-primary/10 text-primary font-black text-lg">
                    {broker.creci_number.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-sm">
                        CRECI: {broker.creci_number}/{broker.creci_state}
                      </h3>
                      <Badge className="border-2 border-foreground bg-primary text-primary-foreground text-[10px] font-black">
                        DISPONÍVEL
                      </Badge>
                    </div>
                    {broker.specialization && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {broker.specialization}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs font-bold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-primary" />
                        {broker.rating?.toFixed(1) || "Sem avaliação"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-primary" />
                        {broker.completed_courses} cursos
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t-2 border-foreground pt-3">
                  <Button className="neobrutal-btn w-full text-xs">
                    ENVIAR OPORTUNIDADE
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-16">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-bold text-muted-foreground">
                {searchTerm
                  ? "Nenhum corretor encontrado para esta busca"
                  : "Nenhum corretor disponível no momento"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm
                  ? "Tente outros termos de busca"
                  : "Novos corretores serão adicionados após certificação"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
