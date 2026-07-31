import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Clock,
  GraduationCap,
  LogOut,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { coursesService } from "@/lib/supabase-service";
import type { CourseRow } from "@/lib/supabase-service";

export default function CoursesPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await coursesService.listCourses({});
        setCourses(data);
      } catch (err) {
        console.error("Error loading courses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
              CATÁLOGO
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
          <h1 className="text-3xl font-black">CATÁLOGO DE CURSOS</h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            Explore nossos cursos preparatórios para o mercado imobiliário
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={course.id}
                className="border-3 border-foreground bg-card shadow-[4px_4px_0px_0px] shadow-foreground hover:shadow-[6px_6px_0px_0px] hover:shadow-foreground transition-shadow"
              >
                <div className="h-3 bg-primary" />
                <div className="p-5 space-y-4">
                  <Badge className="border-2 border-foreground bg-accent text-accent-foreground text-[10px] font-black">
                    {course.difficulty === "beginner"
                      ? "INICIANTE"
                      : course.difficulty === "intermediate"
                        ? "INTERMEDIÁRIO"
                        : "AVANÇADO"}
                  </Badge>
                  <h3 className="font-black text-base">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {course.description.slice(0, 100)}...
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration_hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.enrolled_count} alunos
                    </span>
                    {course.is_free && (
                      <Badge className="border-2 border-foreground bg-primary text-primary-foreground text-[10px] font-black">
                        GRÁTIS
                      </Badge>
                    )}
                  </div>
                  <div className="border-t-2 border-foreground pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">
                        {course.is_free
                          ? "GRATUITO"
                          : course.price
                            ? `R$ ${course.price.toFixed(2)}`
                            : "—"}
                      </span>
                      <Button className="neobrutal-btn text-[10px] px-4 py-1 h-auto">
                        INSCREVER-SE
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-16">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-bold text-muted-foreground">
                Nenhum curso disponível no momento
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Novos cursos serão adicionados em breve
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
