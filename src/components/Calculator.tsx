"use client";

import { useState } from "react";
import { all, create } from "mathjs";
import clsx from "clsx";

type AngleMode = "DEG" | "RAD";

const math = create(all, {});

math.import(
  {
    ln: (value: number) => Math.log(value),
    log10: (value: number) => Math.log10(value),
    sqrt: (value: number) => Math.sqrt(value),
    abs: (value: number) => Math.abs(value),
  },
  { override: true }
);

const primaryButtons = [
  { label: "AC", type: "action" as const },
  { label: "⌫", value: "backspace", type: "action" as const },
  { label: "%", value: "%", type: "input" as const },
  { label: "÷", value: "/", type: "operator" as const },
  { label: "7", value: "7", type: "input" as const },
  { label: "8", value: "8", type: "input" as const },
  { label: "9", value: "9", type: "input" as const },
  { label: "×", value: "*", type: "operator" as const },
  { label: "4", value: "4", type: "input" as const },
  { label: "5", value: "5", type: "input" as const },
  { label: "6", value: "6", type: "input" as const },
  { label: "−", value: "-", type: "operator" as const },
  { label: "1", value: "1", type: "input" as const },
  { label: "2", value: "2", type: "input" as const },
  { label: "3", value: "3", type: "input" as const },
  { label: "+", value: "+", type: "operator" as const },
  { label: "±", value: "negate", type: "action" as const },
  { label: "0", value: "0", type: "input" as const },
  { label: ".", value: ".", type: "input" as const },
  { label: "=", value: "equals", type: "equals" as const },
];

const scientificButtons = [
  { label: "sin", value: "sin(" },
  { label: "cos", value: "cos(" },
  { label: "tan", value: "tan(" },
  { label: "ln", value: "ln(" },
  { label: "log", value: "log10(" },
  { label: "√", value: "sqrt(" },
  { label: "x²", value: "^2" },
  { label: "xʸ", value: "^" },
  { label: "|x|", value: "abs(" },
  { label: "π", value: "pi" },
  { label: "e", value: "e" },
  { label: "(", value: "(" },
  { label: ")", value: ")" },
  { label: "!", value: "!" },
  { label: "Exp", value: "E" },
];

const memoryButtons = [
  { label: "MC", action: "clear" as const },
  { label: "MR", action: "recall" as const },
  { label: "M+", action: "add" as const },
  { label: "M-", action: "subtract" as const },
];

const formatNumber = (num: number) => {
  if (!Number.isFinite(num)) return "Error";
  if (Math.abs(num) < 1e-6 || Math.abs(num) > 1e9) {
    return num.toExponential(8).replace(/\+?0+(?=e)/, "");
  }
  const rounded = Math.round((num + Number.EPSILON) * 1e12) / 1e12;
  return rounded.toString();
};

const toNumber = (value: unknown) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error("Invalid calculation");
  }
  return numeric;
};

export default function Calculator() {
  const [expression, setExpression] = useState("0");
  const [result, setResult] = useState<string>("0");
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<AngleMode>("RAD");
  const [error, setError] = useState<string | null>(null);
  const [lastExpression, setLastExpression] = useState<string | null>(null);

  const clearTransientStates = () => {
    if (error) {
      setError(null);
    }
    if (lastExpression) {
      setLastExpression(null);
    }
  };

  const updateExpression = (updater: (current: string) => string) => {
    clearTransientStates();
    setExpression((prev) => {
      const next = updater(prev);
      setResult(next);
      return next;
    });
  };

  const evaluate = (expr: string) => {
    try {
      math.import(
        {
          sin: (angle: number) =>
            angleMode === "DEG"
              ? Math.sin((angle * Math.PI) / 180)
              : Math.sin(angle),
          cos: (angle: number) =>
            angleMode === "DEG"
              ? Math.cos((angle * Math.PI) / 180)
              : Math.cos(angle),
          tan: (angle: number) =>
            angleMode === "DEG"
              ? Math.tan((angle * Math.PI) / 180)
              : Math.tan(angle),
        },
        { override: true }
      );

      const scope = {
        pi: Math.PI,
        e: Math.E,
        E: Math.E,
      };
      const computed = math.evaluate(expr, scope);
      const numeric = toNumber(computed);

      const formatted = formatNumber(numeric);
      setLastExpression(expr);
      setExpression(formatted);
      setResult(formatted);
      setError(null);
    } catch {
      setError("计算错误");
    }
  };

  const appendValue = (value: string) => {
    updateExpression((prev) => {
      if (prev === "0") {
        if (/^[\d.]+$/.test(value)) {
          return value;
        }
        if (value === "pi" || value === "e") {
          return value;
        }
        if (value === ".") {
          return "0.";
        }
        return value;
      }

      if (value === "." && prev.endsWith(".")) {
        return prev;
      }

      return prev + value;
    });
  };

  const handleButtonPress = (button: (typeof primaryButtons)[number]) => {
    if (button.type === "input" || button.type === "operator") {
      appendValue(button.value!);
      return;
    }
    if (button.type === "equals") {
      evaluate(expression);
      return;
    }

    switch (button.label) {
      case "AC":
        setExpression("0");
        setResult("0");
        setError(null);
        setLastExpression(null);
        break;
      case "⌫":
        updateExpression((prev) => {
          if (prev.length <= 1) return "0";
          return prev.slice(0, -1);
        });
        break;
      case "±":
        updateExpression((prev) => {
          if (prev.startsWith("-")) return prev.slice(1);
          if (prev === "0") return prev;
          return "-" + prev;
        });
        break;
      case "%":
        try {
          clearTransientStates();
          const percentage = toNumber(math.evaluate(`(${expression}) / 100`));
          const formatted = formatNumber(percentage);
          setExpression(formatted);
          setResult(formatted);
          setError(null);
        } catch {
          setError("计算错误");
        }
        break;
      default:
        break;
    }
  };

  const handleScientificButton = (value: string) => {
    if (value === "^2") {
      updateExpression((prev) => `(${prev})^2`);
      return;
    }
    if (value === "^") {
      updateExpression((prev) => `${prev}^`);
      return;
    }
    if (value === "!") {
      updateExpression((prev) => `${prev}!`);
      return;
    }
    appendValue(value);
  };

  const handleMemory = (action: (typeof memoryButtons)[number]["action"]) => {
    switch (action) {
      case "clear":
        setMemory(0);
        break;
      case "recall":
        appendValue(memory.toString());
        break;
      case "add":
        try {
          const computed = toNumber(math.evaluate(expression));
          setMemory((prev) => prev + computed);
        } catch {
          setError("记忆失败");
        }
        break;
      case "subtract":
        try {
          const computed = toNumber(math.evaluate(expression));
          setMemory((prev) => prev - computed);
        } catch {
          setError("记忆失败");
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto text-white">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 pb-4 bg-gradient-to-b from-white/25 to-transparent">
          <div className="flex items-center justify-between text-sm text-white/70 mb-6">
            <div className="flex gap-2">
              {memory !== 0 && <span className="px-3 py-1 rounded-full bg-white/20">M</span>}
              <button
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                onClick={() => setAngleMode((prev) => (prev === "DEG" ? "RAD" : "DEG"))}
              >
                {angleMode}
              </button>
            </div>
            <span className="font-medium tracking-widest uppercase text-white/60">
              Sci-Calc Pro
            </span>
        </div>
        <div className="text-right space-y-2">
          {lastExpression && (
            <div className="text-xs uppercase tracking-widest text-white/50">
              {lastExpression} =
            </div>
          )}
          {expression !== result && (
            <div className="text-sm text-white/60 break-all">{expression}</div>
          )}
          <div
            className={clsx(
              "text-4xl font-semibold tabular-nums tracking-tight",
                error ? "text-rose-200" : "text-white"
              )}
            >
              {error ? error : result}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-4 gap-2 mb-4 text-sm text-white/80">
            {memoryButtons.map((btn) => (
              <button
                key={btn.label}
                className="py-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => handleMemory(btn.action)}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4 text-sm text-white/90">
            {scientificButtons.map((btn) => (
              <button
                key={btn.label}
                className="py-3 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/20 transition-colors"
                onClick={() => handleScientificButton(btn.value)}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {primaryButtons.map((btn) => (
              <button
                key={btn.label}
                className={clsx(
                  "py-4 rounded-2xl text-lg font-medium transition-transform transform active:scale-95",
                  btn.type === "action"
                    ? "bg-white/15 text-rose-100 hover:bg-white/25"
                    : btn.type === "operator"
                    ? "bg-white/20 text-sky-100 hover:bg-white/30"
                    : btn.type === "equals"
                    ? "col-span-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-white shadow-lg shadow-purple-500/30"
                    : "bg-white/10 hover:bg-white/20 text-white"
                )}
                onClick={() => handleButtonPress(btn)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
