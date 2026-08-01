import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  Award,
  BookOpen,
  Building2,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { brokersService, companiesService, coursesService, enrollmentsService, profilesService } from "@/lib/supabase-service";
import type { BrokerRow, CompanyRow, CourseRow, EnrollmentRow, ProfileRow } from "@/lib/supabase-service";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [myBroker, setMyBroker] = useState<BrokerRow | null>(null);
  const [myCompany, setMyCompany] = useState<CompanyRow | null>(null);
  const [myEnrollments, setMyEnrollments] = useState<EnrollmentRow[]>([]);
  const [myCourses, setMyCourses] = useState<CourseRow[]>([]);
  const [availableBrokers, setAvailableBrokers] = useState<BrokerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prof, broker, company, enrollments, courses, brokers] = await Promise.all([
          profilesService.getMyProfile(),
          brokersService.getMyBrokerProfile(),
          companiesService.getMyCompany(),
          enrollmentsService.getMyEnrollments(),
          coursesService.listCourses({}),
          brokersService.listAvailableBrokers({}),
        ]);
        setProfile(prof);
        setMyBroker(broker);
        setMyCompany(company);
        setMyEnrollments(enrollments);
        setMyCourses(courses);
        setAvailableBrokers(brokers);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const role = user?.role || "student";

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b-3 border-foreground bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center border-3 border-foreground bg-primary text-primary-foreground font-black text-sm">
              D
            </div>
            <span className="font-black text-lg tracking-tight hidden sm:block">
              DENTRE IMÓVEIS
            </span>
          </button>
          <div className="flex items-center gap-3">
            <Badge className="border-2 border-foreground bg-accent text-accent-foreground font-black text-[10px] uppercase">
              {role === "admin"
                ? "Admin"
                : role === "instructor"
                  ? "Instrutor"
                  : role === "broker"
                    ? "Corretor"
                    : role === "company"
                      ? "Empresa"
                      : "Aluno"}
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
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-black">
            Olá, {user?.name || "Profissional"}!
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            {role === "admin" && "Painel de Administração da Plataforma"}
            {role === "instructor" && "Gerencie seus cursos e alunos"}
            {role === "student" && "Continue sua jornada de aprendizado"}
            {role === "broker" && "Gerencie sua disponibilidade e oportunidades"}
            {role === "company" && "Encontre os melhores profissionais certificados"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 mb-8 md:grid-cols-4">
          <div className="border-3 border-foreground bg-card p-4 shadow-[3px_3px_0px_0px] shadow-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black">{myEnrollments.length || 0}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {role === "company" ? "Candidatos" : "Cursos"}
                </p>
              </div>
            </div>
          </div>
          <div className="border-3 border-foreground bg-card p-4 shadow-[3px_3px_0px_0px] shadow-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black">{myBroker?.completed_courses || 0}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Certificações
                </p>
              </div>
            </div>
          </div>
          <div className="border-3 border-foreground bg-card p-4 shadow-[3px_3px_0px_0px] shadow-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black">{myBroker?.rating?.toFixed(1) || "—"}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Avaliação
                </p>
              </div>
            </div>
          </div>
          <div className="border-3 border-foreground bg-card p-4 shadow-[3px_3px_0px_0px] shadow-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black">{myCourses.length || 0}</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {role === "company" ? "Disponíveis" : "Disponíveis"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Role-based content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="border-3 border-foreground bg-background p-1">
            <TabsTrigger
              value="overview"
              className="font-bold text-xs data-[state=active]:border-2 data-[state=active]:border-foreground data-[state=active]:shadow-[2px_2px_0px_0px] data-[state=active]:shadow-foreground"
            >
              <LayoutDashboard className="h-4 w-4 mr-1" />
              VISÃO GERAL
            </TabsTrigger>
            {(role === "admin" || role === "instructor") && (
              <TabsTrigger
                value="courses"
                className="font-bold text-xs data-[state=active]:border-2 data-[state=active]:border-foreground data-[state=active]:shadow-[2px_2px_0px_0px] data-[state=active]:shadow-foreground"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                CURSOS
              </TabsTrigger>
            )}
            {role === "company" && (
              <TabsTrigger
                value="brokers"
                className="font-bold text-xs data-[state=active]:border-2 data-[state=active]:border-foreground data-[state=active]:shadow-[2px_2px_0px_0px] data-[state=active]:shadow-foreground"
              >
                <Users className="h-4 w-4 mr-1" />
                CORRETORES
              </TabsTrigger>
            )}
            {(role === "broker" || role === "student") && (
              <TabsTrigger
                value="courses"
                className="font-bold text-xs data-[state=active]:border-2 data-[state=active]:border-foreground data-[state=active]:shadow-[2px_2px_0px_0px] data-[state=active]:shadow-foreground"
              >
                <GraduationCap className="h-4 w-4 mr-1" />
                MEUS CURSOS
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Student & Broker view */}
            {(role === "student" || role === "broker") && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
                  <CardHeader>
                    <CardTitle className="text-sm font-black flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      CONTINUAR ESTUDANDO
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {myEnrollments.length > 0 ? (
                      <div className="space-y-3">
                        {myEnrollments.slice(0, 3).map((enrollment) => (
                          <div
                            key={enrollment.id}
                            className="flex items-center justify-between border-2 border-foreground p-3"
                          >
                            <div>
                              <p className="text-sm font-bold">
                                Curso #{enrollment.course_id.slice(-6)}
                              </p>
                              <div className="mt-1 h-2 bg-muted border-2 border-foreground">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${enrollment.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 font-bold">
                                {enrollment.progress}% completo
                              </p>
                            </div>
                            <Button className="neobrutal-btn text-[10px] px-3 py-1 h-auto">
                              CONTINUAR
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm font-bold text-muted-foreground">
                          Nenhum curso em andamento
                        </p>
                        <Button
                          className="neobrutal-btn mt-4 text-xs"
                          onClick={() => navigate("/courses")}
                        >
                          EXPLORAR CURSOS
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
                  <CardHeader>
                    <CardTitle className="text-sm font-black flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      PRÓXIMOS PASSOS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { text: "Complete seu perfil", done: !!profile },
                      { text: "Faça um curso", done: myEnrollments.length > 0 },
                      { text: "Obtenha certificação", done: (myBroker?.completed_courses || 0) > 0 },
                      { text: "Fique disponível para o mercado", done: !!myBroker?.available_for_market },
                    ].map((step) => (
                      <div
                        key={step.text}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 border-foreground ${
                            step.done
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.done ? (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <span className="text-xs font-black">{myEnrollments.length}</span>
                          )}
                        </div>
                        <span className="text-sm font-bold">{step.text}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Broker specific: toggle availability */}
            {role === "broker" && myBroker && (
              <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
                <CardHeader>
                  <CardTitle className="text-sm font-black flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    DISPONIBILIDADE PARA O MERCADO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">
                        {myBroker.available_for_market
                          ? "Você está visível para empresas"
                          : "Você não está visível para empresas"}
                      </p>
                      <p className="text-xs text-muted-foreground font-bold">
                        {myBroker.available_for_market
                          ? "Empresas podem encontrar seu perfil"
                          : "Ative para receber oportunidades"}
                      </p>
                    </div>
                    <Badge
                      className={`border-2 border-foreground font-black text-xs ${
                        myBroker.available_for_market
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {myBroker.available_for_market ? "DISPONÍVEL" : "INDISPONÍVEL"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Company view */}
            {role === "company" && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
                  <CardHeader>
                    <CardTitle className="text-sm font-black flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      CORRETORES DISPONÍVEIS
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-black text-primary">
                      {availableBrokers.length || 0}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground uppercase mt-1">
                      Profissionais certificados
                    </p>
                    <Button
                      className="neobrutal-btn mt-4 text-xs"
                      onClick={() => navigate("/brokers")}
                    >
                      EXPLORAR CORRETORES
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
                  <CardHeader>
                    <CardTitle className="text-sm font-black flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      MEU PERFIL EMPRESA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {myCompany ? (
                      <div className="space-y-2">
                        <p className="font-bold text-sm">{myCompany.company_name}</p>
                        <Badge className="border-2 border-foreground bg-accent text-accent-foreground text-[10px] font-black">
                          {myCompany.company_type === "real_estate"
                            ? "IMOBILIÁRIA"
                            : myCompany.company_type === "construction"
                              ? "CONSTRUTORA"
                              : "INCORPORADORA"}
                        </Badge>
                        <p className="text-xs text-muted-foreground font-bold">
                          {myCompany.city}{myCompany.city && myCompany.state ? ", " : ""}{myCompany.state || ""}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-muted-foreground">
                    Configure seu perfil de empresa
                  </p>
                    )}
                    <Button
                      className="neobrutal-btn mt-4 text-xs"
                      onClick={() => navigate("/settings")}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      EDITAR PERFIL
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Admin view */}
            {role === "admin" && (
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
                  <CardHeader>
                    <CardTitle className="text-sm font-black">USUÁRIOS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-black text-primary">—</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase mt-1">
                      Total de usuários
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
                  <CardHeader>
                    <CardTitle className="text-sm font-black">CURSOS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-black text-primary">
                      {myCourses.length || 0}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground uppercase mt-1">
                      Cursos ativos
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
                  <CardHeader>
                    <CardTitle className="text-sm font-black">CORRETORES</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-black text-primary">
                      {availableBrokers.length || 0}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground uppercase mt-1">
                      Certificados disponíveis
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Instructor view */}
            {role === "instructor" && (
              <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-black flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    MEUS CURSOS CRIADOS
                  </CardTitle>
                  <Button className="neobrutal-btn text-xs">
                    <Plus className="h-4 w-4 mr-1" />
                    NOVO CURSO
                  </Button>
                </CardHeader>
                <CardContent>
                  {myCourses.length > 0 ? (
                    <div className="space-y-3">
                      {myCourses.slice(0, 3).map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between border-2 border-foreground p-3"
                        >
                          <div>
                            <p className="text-sm font-bold">{course.title}</p>
                            <p className="text-xs text-muted-foreground font-bold">
                              {course.enrolled_count} alunos • {course.duration_hours}h
                            </p>
                          </div>
                          <Badge className="border-2 border-foreground text-[10px] font-black">
                            {course.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-muted-foreground text-center py-8">
                      Nenhum curso criado ainda
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="courses">
            <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
              <CardHeader>
                <CardTitle className="text-sm font-black">
                  {role === "instructor" || role === "admin"
                    ? "GERENCIAR CURSOS"
                    : "MEUS CURSOS"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myCourses.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {myCourses.map((course) => (
                      <div
                        key={course.id}
                        className="border-2 border-foreground p-4 hover:shadow-[3px_3px_0px_0px] hover:shadow-foreground transition-shadow"
                      >
                        <div className="h-2 bg-primary mb-3" />
                        <h3 className="font-black text-sm mb-1">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {course.description.slice(0, 80)}...
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="border-2 border-foreground text-[10px] font-black">
                            {course.difficulty === "beginner"
                              ? "INICIANTE"
                              : course.difficulty === "intermediate"
                                ? "INTERMEDIÁRIO"
                                : "AVANÇADO"}
                          </Badge>
                          <span className="text-xs font-bold text-muted-foreground">
                            {course.enrolled_count} alunos
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm font-bold text-muted-foreground">
                      Nenhum curso disponível no momento
                    </p>
                    <Button
                      className="neobrutal-btn mt-4 text-xs"
                      onClick={() => navigate("/courses")}
                    >
                      VER CATÁLOGO DE CURSOS
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {role === "company" && (
            <TabsContent value="brokers">
              <Card className="border-3 border-foreground shadow-[4px_4px_0px_0px] shadow-foreground">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-black flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    CORRETORES CERTIFICADOS
                  </CardTitle>
                  <Button className="neobrutal-btn text-xs">
                    <Search className="h-4 w-4 mr-1" />
                    FILTRAR
                  </Button>
                </CardHeader>
                <CardContent>
                  {availableBrokers.length > 0 ? (
                    <div className="space-y-3">
                      {availableBrokers.slice(0, 5).map((broker) => (
                        <div
                          key={broker.id}
                          className="flex items-center justify-between border-2 border-foreground p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-primary/10 text-primary font-black text-sm">
                              {broker.creci_number.slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-bold">
                                CRECI: {broker.creci_number}
                              </p>
                              <p className="text-xs text-muted-foreground font-bold">
                                {broker.specialization || "Sem especialização"}
                              </p>
                            </div>
                          </div>
                          <Badge className="border-2 border-foreground bg-primary text-primary-foreground text-[10px] font-black">
                            {broker.rating?.toFixed(1) || "—"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm font-bold text-muted-foreground">
                        Nenhum corretor disponível no momento
                      </p>
                      <Button
                        className="neobrutal-btn mt-4 text-xs"
                        onClick={() => navigate("/brokers")}
                      >
                        VER TODOS OS CORRETORES
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
