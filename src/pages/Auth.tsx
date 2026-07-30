import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight,
  Award,
  Building2,
  GraduationCap,
  Loader2,
  Mail,
  Shield,
  UserX,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { usersService } from "@/lib/supabase-service";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, user, signIn, verifyOtp, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | "otp" | "role">("signIn");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.role && user.role !== "student") {
        navigate(redirect, { replace: true });
      } else if (step !== "role") {
        setStep("role");
      }
    }
  }, [authLoading, isAuthenticated, user, navigate, redirect, step]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const emailValue = formData.get("email") as string;
      setEmail(emailValue);
      await signIn(emailValue);
      setStep("otp");
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await verifyOtp(email, otp);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = async (selectedRole: string) => {
    setIsLoading(true);
    try {
      if (user) {
        await usersService.updateUserRole(user.id, selectedRole as any);
        navigate(redirect, { replace: true });
      }
    } catch (error) {
      console.error("Role selection error:", error);
      navigate(redirect, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Just navigate to auth with a guest-like experience
      // For now, prompt user to sign in with email
      setError("Por favor, faça login com seu email para continuar.");
    } catch (error) {
      console.error("Guest login error:", error);
      setError(`Failed to sign in: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "role" && user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-3 border-foreground bg-card shadow-[6px_6px_0px_0px] shadow-foreground">
          <CardHeader className="text-center border-b-3 border-foreground pb-6">
            <div className="flex justify-center mb-3">
              <div className="flex h-16 w-16 items-center justify-center border-3 border-foreground bg-primary text-primary-foreground font-black text-2xl">
                D
              </div>
            </div>
            <CardTitle className="text-xl font-black">
              ESCOLHA SEU PERFIL
            </CardTitle>
            <CardDescription className="text-sm">
              Selecione como você quer usar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {[
              {
                role: "student",
                icon: GraduationCap,
                label: "ALUNO",
                desc: "Quero fazer cursos e me certificar",
              },
              {
                role: "broker",
                icon: Award,
                label: "CORRETOR",
                desc: "Já sou corretor e quero oportunidades",
              },
              {
                role: "company",
                icon: Building2,
                label: "EMPRESA",
                desc: "Quero encontrar profissionais certificados",
              },
            ].map((option) => (
              <button
                key={option.role}
                type="button"
                className="w-full flex items-center gap-4 border-3 border-foreground p-4 bg-background hover:shadow-[3px_3px_0px_0px] hover:shadow-foreground transition-all text-left"
                onClick={() => handleRoleSelect(option.role)}
                disabled={isLoading}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-foreground bg-primary/10">
                  <option.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.desc}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
          <CardFooter className="border-t-3 border-foreground pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/")}
              className="w-full text-sm font-bold"
              disabled={isLoading}
            >
              Voltar ao início
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b-3 border-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center border-3 border-foreground bg-primary text-primary-foreground font-black text-lg">
              D
            </div>
            <span className="font-black text-xl tracking-tight">
              DENTRE
              <span className="text-primary"> IMÓVEIS</span>
            </span>
          </button>
        </div>
      </header>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-3 border-foreground bg-card shadow-[6px_6px_0px_0px] shadow-foreground">
          {step === "signIn" ? (
            <>
              <CardHeader className="text-center border-b-3 border-foreground pb-6">
                <div className="flex justify-center mb-3">
                  <div className="flex h-16 w-16 items-center justify-center border-3 border-foreground bg-primary text-primary-foreground font-black text-2xl">
                    D
                  </div>
                </div>
                <CardTitle className="text-xl font-black">
                  ACESSAR PLATAFORMA
                </CardTitle>
                <CardDescription className="text-sm">
                  Digite seu email para entrar ou criar conta
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        name="email"
                        placeholder="seu@email.com"
                        type="email"
                        className="neobrutal-input pl-10"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  {error && (
                    <p className="mt-3 text-sm font-bold text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="neobrutal-btn w-full mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        ENVIAR CÓDIGO
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t-2 border-foreground" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-3 font-bold text-muted-foreground">
                        Ou
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-3 border-foreground font-bold shadow-[2px_2px_0px_0px] shadow-foreground hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    CONTINUAR COMO CONVIDADO
                  </Button>
                </CardContent>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="text-center border-b-3 border-foreground pb-6">
                <div className="flex justify-center mb-3">
                  <div className="flex h-16 w-16 items-center justify-center border-3 border-foreground bg-primary text-primary-foreground font-black text-2xl">
                    <Mail className="h-7 w-7" />
                  </div>
                </div>
                <CardTitle className="text-xl font-black">
                  VERIFICAR EMAIL
                </CardTitle>
                <CardDescription className="text-sm">
                  Enviamos um código para{" "}
                  <span className="font-bold text-foreground">{email}</span>
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleOtpSubmit}>
                <CardContent className="pt-6">
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          const form = (e.target as HTMLElement).closest("form");
                          if (form) form.requestSubmit();
                        }
                      }}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="!border-3 !border-foreground !w-12 !h-14 !text-lg !font-black"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="mt-3 text-sm font-bold text-destructive text-center">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="neobrutal-btn w-full mt-6"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        VERIFICANDO...
                      </>
                    ) : (
                      <>
                        VERIFICAR CÓDIGO
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Não recebeu o código?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-bold underline"
                      onClick={() => setStep("signIn")}
                    >
                      Tentar novamente
                    </Button>
                  </p>
                </CardContent>
              </form>
            </>
          )}

          <div className="border-t-3 border-foreground bg-muted px-6 py-3">
            <p className="text-xs text-center font-bold text-muted-foreground">
              <Shield className="inline h-3 w-3 mr-1" />
              Plataforma Segura — Proteção de dados (LGPD)
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
