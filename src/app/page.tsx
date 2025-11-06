import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 text-white">
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-10 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-500/25 blur-3xl" />
        </div>

        <header className="relative z-10 mb-12 text-center sm:mb-16">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            高级科学计算器
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            随时随地，计算更智能
          </h1>
          <p className="mt-4 max-w-2xl text-balance text-base text-white/70 sm:text-lg">
            专为移动端优化的专业计算器，覆盖科学运算、记忆功能与角度模式切换，
            在指尖体验丝滑易用的高级运算效率。
          </p>
        </header>

        <div className="relative z-10 w-full">
          <Calculator />
        </div>
      </div>
    </div>
  );
}
