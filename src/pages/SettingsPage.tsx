import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  CheckCircle2,
  LogOut,
  Save,
} from "lucide-react";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const profile = useQuery(api.profiles.getMyProfile);
  const myBroker = useQuery(api.brokers.getMyBrokerProfile);
  const myCompany = useQuery(api.companies.getMyCompany);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const role = user?.role || "student";

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
              CONFIGURAÇÕES
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

      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="text-3xl font-black mb-8">CONFIGURAÇÕES</h1>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
            <CardHeader>
              <CardTitle className="text-sm font-black">
                INFORMAÇÕES BÁSICAS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Nome completo
                  </Label>
                  <Input
                    defaultValue={user?.name || ""}
                    className="neobrutal-input"
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Email
                  </Label>
                  <Input
                    defaultValue={user?.email || ""}
                    className="neobrutal-input"
                    disabled
                  />
                </div>
              </div>
              {profile && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      CPF
                    </Label>
                    <Input
                      defaultValue={profile.cpf || ""}
                      className="neobrutal-input"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Telefone
                    </Label>
                    <Input
                      defaultValue={profile.phone || ""}
                      className="neobrutal-input"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              )}
              <Button className="neobrutal-btn text-xs">
                <Save className="h-4 w-4 mr-1" />
                SALVAR ALTERAÇÕES
              </Button>
            </CardContent>
          </Card>

          {/* Broker-specific */}
          {role === "broker" && myBroker && (
            <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
              <CardHeader>
                <CardTitle className="text-sm font-black">
                  DADOS DO CORRETOR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      CRECI
                    </Label>
                    <Input
                      defaultValue={myBroker.creciNumber}
                      className="neobrutal-input"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Estado CRECI
                    </Label>
                    <Input
                      defaultValue={myBroker.creciState}
                      className="neobrutal-input"
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Especialização
                  </Label>
                  <Input
                    defaultValue={myBroker.specialization || ""}
                    className="neobrutal-input"
                    placeholder="Ex: Residencial, Comercial, Rural..."
                  />
                </div>
                <Button className="neobrutal-btn text-xs">
                  <Save className="h-4 w-4 mr-1" />
                  SALVAR
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Company-specific */}
          {role === "company" && (
            <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
              <CardHeader>
                <CardTitle className="text-sm font-black">
                  DADOS DA EMPRESA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Nome da Empresa
                    </Label>
                    <Input
                      defaultValue={myCompany?.companyName || ""}
                      className="neobrutal-input"
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      CNPJ
                    </Label>
                    <Input
                      defaultValue={myCompany?.cnpj || ""}
                      className="neobrutal-input"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">
                    Tipo de Empresa
                  </Label>
                  <Select
                    defaultValue={myCompany?.companyType || "real_estate"}
                  >
                    <SelectTrigger className="neobrutal-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-3 border-foreground">
                      <SelectItem value="real_estate">Imobiliária</SelectItem>
                      <SelectItem value="construction">Construtora</SelectItem>
                      <SelectItem value="developer">Incorporadora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Cidade
                    </Label>
                    <Input
                      defaultValue={myCompany?.city || ""}
                      className="neobrutal-input"
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">
                      Estado
                    </Label>
                    <Input
                      defaultValue={myCompany?.state || ""}
                      className="neobrutal-input"
                      placeholder="UF"
                    />
                  </div>
                </div>
                <Button className="neobrutal-btn text-xs">
                  <Save className="h-4 w-4 mr-1" />
                  SALVAR
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Profile description */}
          <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
            <CardHeader>
              <CardTitle className="text-sm font-black">BIO / DESCRIÇÃO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                defaultValue={profile?.bio || ""}
                className="border-3 border-foreground min-h-[120px] bg-card shadow-[2px_2px_0px_0px] shadow-foreground focus:shadow-[4px_4px_0px_0px] focus:shadow-foreground focus:outline-none transition-shadow"
                placeholder="Conte um pouco sobre você..."
              />
              <Button className="neobrutal-btn text-xs">
                <Save className="h-4 w-4 mr-1" />
                SALVAR
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
