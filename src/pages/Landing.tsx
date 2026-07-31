import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Home,
  Layers,
  MapPin,
  Shield,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: {
    transition: { staggerChildren: 0.12 },
  },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b-3 border-foreground bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border-3 border-foreground bg-primary text-primary-foreground font-black text-lg">
              D
            </div>
            <span className="font-black text-xl tracking-tight">
              DENTRE
              <span className="text-primary"> IMÓVEIS</span>
            </span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-bold hover:text-primary transition-colors">SOBRE</a>
            <a href="#courses" className="text-sm font-bold hover:text-primary transition-colors">CURSOS</a>
            <a href="#brokers" className="text-sm font-bold hover:text-primary transition-colors">CORRETORES</a>
            <a href="#companies" className="text-sm font-bold hover:text-primary transition-colors">EMPRESAS</a>
            <a href="#contact" className="text-sm font-bold hover:text-primary transition-colors">CONTATO</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-sm font-bold border-3 border-transparent hover:border-foreground"
              onClick={() => navigate("/auth")}
            >
              ENTRAR
            </Button>
            <Button
              className="hidden sm:inline-flex neobrutal-btn text-xs px-5"
              onClick={() => navigate("/auth")}
            >
              COMEÇAR AGORA
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b-3 border-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="grid items-center gap-16 md:grid-cols-2"
          >
            <div className="space-y-8">
              <motion.div variants={fadeInUp}>
                <Badge className="neobrutal-tag mb-4 text-xs">
                  <Star className="mr-1 h-3 w-3" />
                  PLATAFORMA OFICIAL
                </Badge>
              </motion.div>
              <motion.h1
                variants={fadeInUp}
                className="text-5xl font-black leading-tight md:text-7xl"
              >
                SUA CARREIRA NO
                <span className="block text-primary">MERCADO IMOBILIÁRIO</span>
                COMEÇA AQUI
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                className="text-lg text-muted-foreground max-w-lg"
              >
                Capacitação profissional, certificação e conexão com as melhores
                imobiliárias, construtoras e incorporadoras do Brasil.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="neobrutal-btn text-base px-8 py-6"
                  onClick={() => navigate("/auth")}
                >
                  QUERO SER CORRETOR
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-3 border-foreground text-base px-8 py-6 shadow-[3px_3px_0px_0px] shadow-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px] transition-all"
                  onClick={() => navigate("/auth")}
                >
                  SOU EMPRESA
                </Button>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="flex items-center gap-6 text-sm font-bold"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>Certificação reconhecida</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span>100% online</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={fadeInUp}
              className="relative hidden md:block"
            >
              <div className="neobrutal-card p-8">
                <div className="flex items-center gap-4 border-b-3 border-foreground pb-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center border-3 border-foreground bg-accent">
                    <Home className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-muted-foreground">
                      FLUXO DE SUCESSO
                    </p>
                    <p className="font-black text-lg">Jornada do Profissional</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { icon: UserCheck, text: "Cadastro e Perfil" },
                    { icon: BookOpen, text: "Curso Preparatório" },
                    { icon: Award, text: "Certificação" },
                    { icon: Building2, text: "Conexão com Empresas" },
                    { icon: TrendingUp, text: "Oportunidades de Negócio" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="h-2 w-2 rounded-full bg-foreground" />
                      <span className="font-bold text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="border-t-3 border-foreground bg-secondary">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { number: "500+", label: "CORRETORES CERTIFICADOS" },
                { number: "120+", label: "EMPRESAS PARCEIRAS" },
                { number: "15+", label: "CURSOS DISPONÍVEIS" },
                { number: "98%", label: "SATISFAÇÃO" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-black text-primary">
                    {stat.number}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="border-b-3 border-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid items-center gap-16 md:grid-cols-2"
          >
            <div className="space-y-6">
              <Badge className="neobrutal-tag">SOBRE A PLATAFORMA</Badge>
              <h2 className="text-4xl font-black leading-tight md:text-5xl">
                CONECTANDO TALENTOS AO{" "}
                <span className="text-primary">MERCADO IMOBILIÁRIO</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Dentre Imóveis é uma plataforma completa que forma profissionais
                qualificados e os conecta diretamente com imobiliárias, construtoras
                e incorporadoras que buscam talentos certificados.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nosso foco não é venda de imóveis — é capacitar pessoas e criar
                oportunidades reais de negócio no mercado imobiliário brasileiro.
              </p>
            </div>
            <div className="neobrutal-card p-6 space-y-4">
              {[
                { icon: GraduationCap, title: "Formação Completa", desc: "Cursos preparatórios com conteúdo atualizado" },
                { icon: Award, title: "Certificação", desc: "Certificado reconhecido pelo mercado" },
                { icon: Building2, title: "Conexão Direta", desc: "Empresas encontram você" },
                { icon: TrendingUp, title: "Crescimento", desc: "Oportunidades de carreira e negócios" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 border-l-3 border-primary pl-4"
                >
                  <item.icon className="h-6 w-6 mt-1 shrink-0 text-primary" />
                  <div>
                    <p className="font-black text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="border-b-3 border-foreground bg-primary/5">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="neobrutal-tag mb-4">COMO FUNCIONA</Badge>
            <h2 className="text-4xl font-black md:text-5xl">
              SUA JORNADA EM <span className="text-primary">6 PASSOS</span>
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: UserCheck,
                title: "CADASTRO",
                desc: "Crie seu perfil completo como aluno ou empresa em segundos.",
              },
              {
                step: "02",
                icon: BookOpen,
                title: "APRENDIZADO",
                desc: "Acesse cursos preparatórios com aulas teóricas e práticas.",
              },
              {
                step: "03",
                icon: Layers,
                title: "AVALIAÇÃO",
                desc: "Teste seus conhecimentos com quizzes e exames finais.",
              },
              {
                step: "04",
                icon: Award,
                title: "CERTIFICAÇÃO",
                desc: "Receba seu certificado Dentre Imóveis ao ser aprovado.",
              },
              {
                step: "05",
                icon: Building2,
                title: "CONEXÃO",
                desc: "Fique disponível para empresas encontrarem você.",
              },
              {
                step: "06",
                icon: TrendingUp,
                title: "OPORTUNIDADES",
                desc: "Receba propostas de parceria, comissão ou contratação.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="neobrutal-card-sm p-6 hover:shadow-[5px_5px_0px_0px] hover:shadow-foreground transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center border-2 border-foreground bg-primary text-primary-foreground font-black text-lg mb-4">
                  {item.step}
                </div>
                <item.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-black text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="border-b-3 border-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="neobrutal-tag mb-4">CURSOS</Badge>
            <h2 className="text-4xl font-black md:text-5xl">
              PREPARE-SE PARA O{" "}
              <span className="text-primary">MERCADO</span>
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "FORMAÇÃO DE CORRETORES",
                desc: "Curso completo para iniciar sua carreira no mercado imobiliário.",
                lessons: "24 aulas",
                duration: "120h",
                level: "Iniciante",
              },
              {
                title: "AVANÇADO EM NEGOCIAÇÃO",
                desc: "Técnicas avançadas de negociação e fechamento de contratos.",
                lessons: "18 aulas",
                duration: "80h",
                level: "Intermediário",
              },
              {
                title: "DIREITO IMOBILIÁRIO",
                desc: "Legislação aplicada ao mercado imobiliário brasileiro.",
                lessons: "20 aulas",
                duration: "100h",
                level: "Avançado",
              },
            ].map((course, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neobrutal-card overflow-hidden"
              >
                <div className="h-3 bg-primary" />
                <div className="p-6 space-y-4">
                  <Badge className="neobrutal-tag text-[10px]">
                    {course.level}
                  </Badge>
                  <h3 className="font-black text-lg">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {course.desc}
                  </p>
                  <div className="flex gap-4 text-xs font-bold text-muted-foreground">
                    <span>{course.lessons}</span>
                    <span>{course.duration}</span>
                  </div>
                  <Button
                    className="neobrutal-btn w-full text-xs"
                    onClick={() => navigate("/auth")}
                  >
                    INSCREVER-SE
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Companies */}
      <section id="companies" className="border-b-3 border-foreground bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid items-center gap-16 md:grid-cols-2"
          >
            <div className="space-y-6">
              <Badge className="!border-background !text-background !bg-transparent border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                PARA EMPRESAS
              </Badge>
              <h2 className="text-4xl font-black leading-tight md:text-5xl">
                ENCONTRE OS MELHORES PROFISSIONAIS
              </h2>
              <p className="text-background/70 leading-relaxed">
                Imobiliárias, construtoras e incorporadoras podem acessar nosso
                banco de corretores certificados e encontrar o profissional ideal
                para cada oportunidade.
              </p>
              <Button
                size="lg"
                className="border-3 border-background bg-background text-foreground font-black shadow-[3px_3px_0px_0px] shadow-background hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px] transition-all text-base px-8 py-6"
                onClick={() => navigate("/auth")}
              >
                CADASTRAR EMPRESA
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              {[
                { icon: SearchIcon, title: "Busque por especialidade" },
                { icon: MapPin, title: "Filtre por localização" },
                { icon: Star, title: "Veja avaliações e histórico" },
                { icon: Shield, title: "Profissionais certificados" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-4 border-2 border-background/30 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-background bg-background/10">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">{item.title}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-b-3 border-foreground">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="neobrutal-tag mb-4">DEPOIMENTOS</Badge>
            <h2 className="text-4xl font-black md:text-5xl">
              QUEM JÁ <span className="text-primary">TRANSFORMOU</span>{" "}
              A CARREIRA
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "CARLA MENDES",
                role: "Corretora Certificada",
                text: "A Dentre Imóveis mudou minha vida. Fiz o curso, me certifiquei e em menos de um mês já estava recebendo propostas de imobiliárias.",
                rating: 5,
              },
              {
                name: "PEDRO OLIVEIRA",
                role: "Corretor Certificado",
                text: "A plataforma é incrível! O curso é completo e a conexão com as empresas funciona de verdade. Recomendo para todos.",
                rating: 5,
              },
              {
                name: "LUCAS SANTOS",
                role: "Diretor Comercial - Construtora Nova Era",
                text: "Encontramos profissionais extremamente capacitados na plataforma. A certificação Dentre Imóveis é um diferencial no mercado.",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="neobrutal-card-sm p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="border-t-2 border-foreground pt-4">
                  <p className="font-black text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="border-b-3 border-foreground bg-primary/10">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Badge className="neobrutal-tag">COMEÇE AGORA</Badge>
            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              PRONTO PARA DAR O PRÓXIMO PASSO?
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Junte-se à Dentre Imóveis e faça parte do maior ecossistema de
              formação e conexão de profissionais do mercado imobiliário.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="neobrutal-btn text-base px-10 py-7"
                onClick={() => navigate("/auth")}
              >
                QUERO SER CORRETOR
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-3 border-foreground text-base px-10 py-7 shadow-[3px_3px_0px_0px] shadow-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px] transition-all"
                onClick={() => navigate("/auth")}
              >
                SOU UMA EMPRESA
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-3 border-foreground bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-3 border-background bg-primary text-primary-foreground font-black text-lg">
                  D
                </div>
                <span className="font-black text-xl">DENTRE IMÓVEIS</span>
              </div>
              <p className="text-sm text-background/60">
                Capacitando profissionais e conectando talentos ao mercado imobiliário.
              </p>
            </div>
            <div>
              <h4 className="font-black text-sm mb-4">PLATAFORMA</h4>
              <ul className="space-y-2 text-sm text-background/60">
                <li><a href="#courses" className="hover:text-background transition-colors">Cursos</a></li>
                <li><a href="#brokers" className="hover:text-background transition-colors">Corretores</a></li>
                <li><a href="#companies" className="hover:text-background transition-colors">Empresas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-sm mb-4">EMPRESA</h4>
              <ul className="space-y-2 text-sm text-background/60">
                <li><a href="#about" className="hover:text-background transition-colors">Sobre</a></li>
                <li><a href="#contact" className="hover:text-background transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-sm mb-4">LEGAL</h4>
              <ul className="space-y-2 text-sm text-background/60">
                <li>Privacidade</li>
                <li>Termos de Uso</li>
                <li>LGPD</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t-2 border-background/20 pt-6 text-center text-sm text-background/40">
            <p>© 2026 Dentre Imóveis. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
