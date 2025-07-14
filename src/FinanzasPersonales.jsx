import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

/* ───────────── Helpers ───────────── */
const months = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const createBlobLink = (content, filename) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const LS_KEY = "finanzas-personales-v1";

/* ───────────── Componente ───────────── */
export default function FinanzasPersonales() {
  /* Tema claro/oscuro */
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* Periodo */
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  /* Estado: ingresos */
  const [ingresos, setIngresos] = useState({
    A: { valor: "", tipo: "fijo" },
    B: { valor: "", tipo: "fijo" },
    C: { valor: "", tipo: "fijo" },
    D: { valor: "", tipo: "fijo" },
    E: { valor: "", tipo: "fijo" }
  });

  /* Gastos fijos */
  const [gastosFijos, setGastosFijos] = useState({
    Hipoteca: { presupuesto: 694631, real: "" },
    "Gastos comunes": { presupuesto: 129570, real: "" },
    Luz: { presupuesto: 21193, real: "" },
    Agua: { presupuesto: 9810, real: "" },
    Bidon_Agua_x2: { presupuesto: 5000, real: "" },
    Gas: { presupuesto: 19170, real: "" },
    Celular: { presupuesto: 16990, real: "" },
    Internet: { presupuesto: 11187, real: "" },
    "Seguro Salud banco chile": { presupuesto: 17612, real: "" },
    "Seguros hogar Quillota": { presupuesto: 5100, real: "" },
    "Seguro auto": { presupuesto: 56000, real: "" },
    Patrimore: { presupuesto: 47000, real: "" },
    Abu: { presupuesto: 30000, real: "" },
    Itau: { presupuesto: 10120, real: "" },
    Jardinero: { presupuesto: 10000, real: "" }
  });

  /* No Guilt Spend */
  const [noGuiltSpend, setNoGuiltSpend] = useState({});

  /* Inversión con realFijo y realVariable */
  const [inversion, setInversion] = useState({
    "VECTOR CAPITAL-Patrimore": { presupuesto: 200000, realFijo: "", realVariable: "" },
    "APV -MBI A Y B mes intercalado": { presupuesto: 100000, realFijo: "", realVariable: "" },
    "Gastos no cubiertos DEPTO EC": { presupuesto: 200000, realFijo: "", realVariable: "" },
    "Gastos no cubiertos DEPTO LC": { presupuesto: 100000, realFijo: "", realVariable: "" }
  });

  /* Ahorro con realFijo y realVariable */
  const [ahorro, setAhorro] = useState({
    "Vacaciones FINTUAL": { presupuesto: 100000, realFijo: "", realVariable: "" },
    Abu: { presupuesto: 15000, realFijo: "", realVariable: "" },
    "F.Tranquilidad- patrimore ": { presupuesto: 17000, realFijo: "", realVariable: "" },
    "Contribuciones propiedades": { presupuesto: 103200, realFijo: "", realVariable: "" },
    "Permiso circulacion & mantenciones auto": { presupuesto: 26000, realFijo: "", realVariable: "" }
  });

  /* Gastos variables con realFijo y realVariable */
  const [gastosVariables, setGastosVariables] = useState({
    "Alimentación & hogar": { presupuesto: 120000, realFijo: "", realVariable: "" },
    Transporte: { presupuesto: 80000, realFijo: "", realVariable: "" },
    "TAG (Peajes)": { presupuesto: 25000, realFijo: "", realVariable: "" }
  });

  /* Persistencia en localStorage */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY));
      if (saved) {
        saved.ingresos        && setIngresos(saved.ingresos);
        saved.gastosFijos     && setGastosFijos(saved.gastosFijos);
        saved.noGuiltSpend    && setNoGuiltSpend(saved.noGuiltSpend);
        saved.inversion       && setInversion(saved.inversion);
        saved.ahorro          && setAhorro(saved.ahorro);
        saved.gastosVariables && setGastosVariables(saved.gastosVariables);
        saved.selectedMonth   && setSelectedMonth(saved.selectedMonth);
        saved.selectedYear    && setSelectedYear(saved.selectedYear);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        ingresos,
        gastosFijos,
        noGuiltSpend,
        inversion,
        ahorro,
        gastosVariables,
        selectedMonth,
        selectedYear
      })
    );
  }, [
    ingresos,
    gastosFijos,
    noGuiltSpend,
    inversion,
    ahorro,
    gastosVariables,
    selectedMonth,
    selectedYear
  ]);

  /* Utilities */
  const sumRealFields = o =>
    Object.values(o).reduce(
      (s, it) => s + Number(it.realFijo || 0) + Number(it.realVariable || 0),
      0
    );
  const sumRealSingle = o =>
    Object.values(o).reduce((s, it) => s + Number(it.real || 0), 0);

  /* Cálculos */
  const totalIngresosNominal = Object.values(ingresos).reduce(
    (s, i) => s + Number(i.valor || 0),
    0
  );
  const totalFixedIngresos = Object.values(ingresos).reduce(
    (s, i) => (i.tipo === "fijo" ? s + Number(i.valor || 0) : s),
    0
  );

  const totalGastosFijos = sumRealSingle(gastosFijos);
  const totalNoGuilt = Object.values(noGuiltSpend).reduce((s, v) => s + Number(v || 0), 0);

  const totalInversion = sumRealFields(inversion);
  const totalAhorro = sumRealFields(ahorro);
  const totalGastosVars = sumRealFields(gastosVariables);

  const totalGastos =
    totalGastosFijos + totalNoGuilt + totalInversion + totalAhorro + totalGastosVars;
  const totalIngresos = totalIngresosNominal;

  const percent = v =>
    totalFixedIngresos ? ((v / totalFixedIngresos) * 100).toFixed(1) : "0.0";
  const restante = totalFixedIngresos - totalGastos;

  /* Handlers */
  const handleIngresoChange = (k, f, v) =>
    setIngresos(p => ({ ...p, [k]: { ...p[k], [f]: v } }));

  const handleGastoFijoRealChange = (k, v) =>
    setGastosFijos(p => ({ ...p, [k]: { ...p[k], real: v } }));

  const handleNoGuiltChange = (k, v) =>
    setNoGuiltSpend(p => ({ ...p, [k]: v }));

  const handleItemChange = setter => (k, field, v) =>
    setter(p => ({ ...p, [k]: { ...p[k], [field]: v } }));

  const handleInvChange = handleItemChange(setInversion);
  const handleAhorChange = handleItemChange(setAhorro);
  const handleVarChange = handleItemChange(setGastosVariables);

  const addKey = (setter, label) =>
    setter(p => ({
      ...p,
      [`${label} ${Object.keys(p).length + 1}`]: { presupuesto: 0, realFijo: "", realVariable: "" }
    }));

  const deleteKey = (setter, k) =>
    setter(p => {
      const { [k]: _, ...rest } = p;
      return rest;
    });

  const exportCSV = () => {
    const rows = [["Categoria","Item","Presupuesto","Real fijo","Real var","%","Mes","Año"]];
    const push = (cat, obj) =>
      Object.entries(obj).forEach(([k, v]) => {
        const realTotal = Number(v.realFijo || 0) + Number(v.realVariable || 0);
        rows.push([
          cat,
          k,
          v.presupuesto,
          v.realFijo,
          v.realVariable,
          percent(realTotal),
          months[selectedMonth],
          selectedYear
        ]);
      });

    push("Gastos Fijos", gastosFijos);
    Object.entries(noGuiltSpend).forEach(([k, v]) =>
      rows.push(["No Guilt Spend", k, "-", v, "-", percent(Number(v)), months[selectedMonth], selectedYear])
    );
    push("Inversión", inversion);
    push("Ahorro", ahorro);
    push("Gasto variable", gastosVariables);

    createBlobLink(rows.map(r => r.join(",")).join("\n"),
      `estado-financiero-${months[selectedMonth]}-${selectedYear}.csv`
    );
  };

  return (
    <div className="min-h-screen bg-brand-100 p-4 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center gap-2">
        <Card className="flex-1">
          <CardContent className="p-4 grid grid-cols-2 gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Mes"/></SelectTrigger>
              <SelectContent>
                {months.map((m,i)=>(<SelectItem key={m} value={String(i)}>{m}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              placeholder="Año"
            />
          </CardContent>
        </Card>
        <Button variant="outline" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Modo Claro" : "Modo Oscuro"}
        </Button>
      </div>

      {/* Ingresos */}
      <Card>
        <CardContent className="space-y-2">
          <h2 className="text-brand-500 font-semibold">Ingresos</h2>
          {Object.entries(ingresos).map(([k, v]) => (
            <div key={k} className="grid grid-cols-5 gap-2 items-center text-xs">
              <Input
                type="number"
                value={v.valor}
                placeholder={`Ingreso ${k}`}
                onChange={e => handleIngresoChange(k, "valor", e.target.value)}
              />
              <Select
                value={v.tipo}
                onValueChange={val => handleIngresoChange(k, "tipo", val)}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Tipo"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fijo">Fijo</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-gray-500">{v.tipo}</span>
              <span className="text-right text-gray-500">
                {v.tipo === "fijo" ? `${percent(Number(v.valor||0))}%` : "-"}
              </span>
            </div>
          ))}
          <p className="font-bold text-sm">Ingresos totales: ${totalIngresosNominal.toLocaleString()}</p>
        </CardContent>
      </Card>

      {/* Gastos Fijos */}
      <Card>
        <CardContent className="space-y-2">
          <h2 className="font-semibold text-lg">
            Gastos Fijos — {percent(totalGastosFijos)}%
          </h2>
          {Object.entries(gastosFijos).map(([k, v]) => (
            <div key={k} className="grid grid-cols-4 gap-2 items-center text-xs">
              <span>{k}</span>
              <span>Pres: ${v.presupuesto.toLocaleString()}</span>
              <Input
                type="number"
                value={v.real}
                placeholder="Real"
                onChange={e => handleGastoFijoRealChange(k, e.target.value)}
              />
              <span className="text-right text-gray-500">
                {percent(Number(v.real||0))}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* No Guilt Spend */}
      <Card>
        <CardContent className="space-y-2">
          <h2 className="font-semibold text-lg">
            No Guilt Spend — {percent(totalNoGuilt)}%
          </h2>
          {Object.entries(noGuiltSpend).map(([k, v]) => (
            <div key={k} className="grid grid-cols-5 gap-2 items-center text-xs">
              <Input
                defaultValue={k}
                placeholder="Item"
                onBlur={e => {
                  const newKey = e.target.value.trim();
                  if (!newKey || newKey === k) return;
                  setNoGuiltSpend(p => {
                    const obj = { ...p };
                    const val = obj[k];
                    delete obj[k];
                    obj[newKey] = val;
                    return obj;
                  });
                }}
              />
              <Input
                type="number"
                value={v}
                placeholder="Monto"
                onChange={e => handleNoGuiltChange(k, e.target.value)}
              />
              <Button size="icon" variant="ghost" onClick={() => deleteKey(setNoGuiltSpend, k)}>
                🗑
              </Button>
              <span className="text-right text-gray-500">
                {percent(Number(v||0))}%
              </span>
            </div>
          ))}
          <Button size="sm" onClick={() => setNoGuiltSpend(p => ({ ...p, [`Item ${Object.keys(p).length+1}`]: "" }))}>
            Añadir gasto
          </Button>
        </CardContent>
      </Card>

      {/* Inversión */}
      <Card>
        <CardContent className="space-y-2">
          <h2 className="font-semibold text-lg">
            Inversión — {percent(totalInversion)}%
          </h2>
          {Object.entries(inversion).map(([k, v]) => {
            const suma = Number(v.realFijo || 0) + Number(v.realVariable || 0);
            return (
              <div key={k} className="grid grid-cols-5 gap-2 items-center text-xs">
                <span>{k}</span>
                <span>Pres: ${v.presupuesto.toLocaleString()}</span>
                <Input
                  type="number"
                  value={v.realFijo}
                  placeholder="Real fijo"
                  onChange={e => handleInvChange(k, "realFijo", e.target.value)}
                />
                <Input
                  type="number"
                  value={v.realVariable}
                  placeholder="Real variable"
                  onChange={e => handleInvChange(k, "realVariable", e.target.value)}
                />
                <span className="text-right text-gray-500">
                  {percent(suma)}%
                </span>
              </div>
            );
          })}
          <Button size="sm" onClick={() => addKey(setInversion, "Inversión")}>
            Añadir inversión
          </Button>
        </CardContent>
      </Card>

      {/* Ahorro */}
      <Card>
        <CardContent className="space-y-2">
          <h2 className="font-semibold text-lg">
            Ahorro — {percent(totalAhorro)}%
          </h2>
          {Object.entries(ahorro).map(([k, v]) => {
            const suma = Number(v.realFijo || 0) + Number(v.realVariable || 0);
            return (
              <div key={k} className="grid grid-cols-5 gap-2 items-center text-xs">
                <span>{k}</span>
                <span>Pres: ${v.presupuesto.toLocaleString()}</span>
                <Input
                  type="number"
                  value={v.realFijo}
                  placeholder="Real fijo"
                  onChange={e => handleAhorChange(k, "realFijo", e.target.value)}
                />
                <Input
                  type="number"
                  value={v.realVariable}
                  placeholder="Real variable"
                  onChange={e => handleAhorChange(k, "realVariable", e.target.value)}
                />
                <span className="text-right text-gray-500">
                  {percent(suma)}%
                </span>
              </div>
            );
          })}
          <Button size="sm" onClick={() => addKey(setAhorro, "Ahorro")}>
            Añadir ahorro
          </Button>
        </CardContent>
      </Card>

      {/* Gastos Variables */}
      <Card>
        <CardContent className="space-y-2">
          <h2 className="font-semibold text-lg">
            Gastos variables — {percent(totalGastosVars)}%
          </h2>
          {Object.entries(gastosVariables).map(([k, v]) => {
            const suma = Number(v.realFijo || 0) + Number(v.realVariable || 0);
            return (
              <div key={k} className="grid grid-cols-5 gap-2 items-center text-xs">
                <span>{k}</span>
                <span>Pres: ${v.presupuesto.toLocaleString()}</span>
                <Input
                  type="number"
                  value={v.realFijo}
                  placeholder="Real fijo"
                  onChange={e => handleVarChange(k, "realFijo", e.target.value)}
                />
                <Input
                  type="number"
                  value={v.realVariable}
                  placeholder="Real variable"
                  onChange={e => handleVarChange(k, "realVariable", e.target.value)}
                />
                <span className="text-right text-gray-500">
                  {percent(suma)}%
                </span>
              </div>
            );
          })}
          <Button size="sm" onClick={() => addKey(setGastosVariables, "Gasto variable")}>
            Añadir gasto variable
          </Button>
        </CardContent>
      </Card>

      {/* Resumen & Export */}
      <Card>
        <CardContent className="space-y-1 text-sm">
          <p>
            <strong>Ingresos fijos (100%):</strong>{" "}
            ${totalFixedIngresos.toLocaleString()}
          </p>
          <p>
            Gastos Fijos: ${totalGastosFijos.toLocaleString()} (
            {percent(totalGastosFijos)}%)
          </p>
          <p>
            No Guilt Spend: ${totalNoGuilt.toLocaleString()} (
            {percent(totalNoGuilt)}%)
          </p>
          <p>
            Inversión: ${totalInversion.toLocaleString()} (
            {percent(totalInversion)}%)
          </p>
          <p>
            Ahorro: ${totalAhorro.toLocaleString()} ({percent(totalAhorro)}%)
          </p>
          <p>
            Variables: ${totalGastosVars.toLocaleString()} (
            {percent(totalGastosVars)}%)
          </p>
          <p
            className={`font-bold ${
              restante < 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            Disponible: ${restante.toLocaleString()} ({percent(restante)}%)
          </p>
          <p className="font-bold pt-2">
            Balance: ${(totalIngresos - totalGastos).toLocaleString()}
          </p>
          <Button className="mt-2 w-full" onClick={exportCSV}>
            Exportar CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
