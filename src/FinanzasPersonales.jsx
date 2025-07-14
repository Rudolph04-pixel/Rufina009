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
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const LS_KEY = "finanzas-personales-v1";

const createBlobLink = (content, filename) => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* ───────────── Component ───────────── */
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

  /* Ingresos */
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

  /* Inversión */
  const [inversion, setInversion] = useState({
    "VECTOR CAPITAL-Patrimore": { presupuesto: 200000, realFijo: "", realVariable: "" },
    "APV -MBI A Y B mes intercalado": { presupuesto: 100000, realFijo: "", realVariable: "" },
    "Gastos no cubiertos DEPTO EC": { presupuesto: 200000, realFijo: "", realVariable: "" },
    "Gastos no cubiertos DEPTO LC": { presupuesto: 100000, realFijo: "", realVariable: "" }
  });

  /* Ahorro */
  const [ahorro, setAhorro] = useState({
    "Vacaciones FINTUAL": { presupuesto: 100000, realFijo: "", realVariable: "" },
    Abu: { presupuesto: 15000, realFijo: "", realVariable: "" },
    "F.Tranquilidad- patrimore ": { presupuesto: 17000, realFijo: "", realVariable: "" },
    "Contribuciones propiedades": { presupuesto: 103200, realFijo: "", realVariable: "" },
    "Permiso circulacion & mantenciones auto": { presupuesto: 26000, realFijo: "", realVariable: "" }
  });

  /* Gastos Variables */
  const [gastosVariables, setGastosVariables] = useState({
    "Alimentación & hogar": { presupuesto: 120000, realFijo: "", realVariable: "" },
    Transporte: { presupuesto: 80000, realFijo: "", realVariable: "" },
    "TAG (Peajes)": { presupuesto: 25000, realFijo: "", realVariable: "" }
  });

  /* Persistencia */
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(LS_KEY));
      if (d) {
        d.ingresos && setIngresos(d.ingresos);
        d.gastosFijos && setGastosFijos(d.gastosFijos);
        d.noGuiltSpend && setNoGuiltSpend(d.noGuiltSpend);
        d.inversion && setInversion(d.inversion);
        d.ahorro && setAhorro(d.ahorro);
        d.gastosVariables && setGastosVariables(d.gastosVariables);
        d.selectedMonth && setSelectedMonth(d.selectedMonth);
        d.selectedYear && setSelectedYear(d.selectedYear);
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

  /* Cálculos */
  const sumSingle = o => Object.values(o).reduce((s, it) => s + Number(it.real || 0), 0);
  const sumDual   = o => Object.values(o).reduce(
    (s, it) => s + Number(it.realFijo || 0) + Number(it.realVariable || 0),
    0
  );

  const totalIngresosNominal = Object.values(ingresos).reduce((s, i) => s + Number(i.valor || 0), 0);
  const totalFixedIngresos   = Object.values(ingresos).reduce(
    (s, i) => (i.tipo === "fijo" ? s + Number(i.valor || 0) : s),
    0
  );

  const totalGastosFijos = sumSingle(gastosFijos);
  const totalNoGuilt    = Object.values(noGuiltSpend).reduce((s, v) => s + Number(v || 0), 0);

  const totalInversion   = sumDual(inversion);
  const totalAhorro      = sumDual(ahorro);
  const totalGastosVars  = sumDual(gastosVariables);

  const totalGastos =
    totalGastosFijos + totalNoGuilt + totalInversion + totalAhorro + totalGastosVars;

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

  const makeDualHandler = setter => (k, field, v) =>
    setter(p => ({ ...p, [k]: { ...p[k], [field]: v } }));

  const handleInvChange  = makeDualHandler(setInversion);
  const handleAhorChange = makeDualHandler(setAhorro);
  const handleVarChange  = makeDualHandler(setGastosVariables);

  const addKey = (setter, label) =>
    setter(p => ({
      ...p,
      [`${label} ${Object.keys(p).length + 1}`]: {
        presupuesto: 0,
        realFijo: "",
        realVariable: ""
      }
    }));

  const deleteKey = (setter, k) =>
    setter(p => {
      const { [k]: _, ...rest } = p;
      return rest;
    });

  /* Export CSV */
  const exportCSV = () => {
    const rows = [["Cat","Item","Pres","RFijo","%RF","RVar","%RV","Mes","Año"]];
    const pushSingle = (cat, obj) =>
      Object.entries(obj).forEach(([k, x]) => {
        const rf = Number(x.real || 0);
        rows.push([cat, k, x.presupuesto, rf, percent(rf), "-", "-", months[selectedMonth], selectedYear]);
      });
    const pushDual = (cat, obj) =>
      Object.entries(obj).forEach(([k, x]) => {
        const rf = Number(x.realFijo || 0);
        const rv = Number(x.realVariable || 0);
        rows.push([cat, k, x.presupuesto, rf, percent(rf), rv, percent(rv), months[selectedMonth], selectedYear]);
      });

    pushSingle("Gastos Fijos", gastosFijos);
    Object.entries(noGuiltSpend).forEach(([k, v]) => {
      const rv = Number(v || 0);
      rows.push(["No Guilt", k, "-", rv, percent(rv), "-", "-", months[selectedMonth], selectedYear]);
    });
    pushDual("Inversión", inversion);
    pushDual("Ahorro", ahorro);
    pushDual("Gastos Variables", gastosVariables);

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
                {months.map((m, i) => (
                  <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                ))}
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
          <p className="font-bold text-sm">
            Ingresos totales: ${totalIngresosNominal.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Gastos Fijos */}
      <Card>
        <CardContent className="space-y-2">
          <h2 className="font-semibold text-lg">Gastos Fijos — {percent(totalGastosFijos)}%</h2>
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
              <span className="text-right text-gray-500">{percent(Number(v.real||0))}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* No Guilt Spend */}
      <Card>
        <CardContent className="space-y-2">
          <h2 className="font-semibold text-lg">No Guilt Spend — {percent(totalNoGuilt)}%</h2>
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
              <span className="text-right text-gray-500">{percent(Number(v||0))}%</span>
            </div>
          ))}
          <Button size="sm" onClick={() => setNoGuiltSpend(p => ({ ...p, [`Item ${Object.keys(p).length+1}`]: "" }))}>
            Añadir gasto
          </Button>
        </CardContent>
      </Card>

      {/* Bloques Inversión / Ahorro / Variables */}
      {[
        { label: "Inversión", data: inversion, setter: setInversion, handler: handleInvChange },
        { label: "Ahorro",    data: ahorro,    setter: setAhorro,    handler: handleAhorChange },
        { label: "Gasto variable", data: gastosVariables, setter: setGastosVariables, handler: handleVarChange }
      ].map(({ label, data, setter, handler }) => (
        <Card key={label}>
          <CardContent className="space-y-2">
            <h2 className="font-semibold text-lg">
              {label} — {percent(sumDual(data))}%
            </h2>
            <div className="grid grid-cols-7 gap-2 text-[11px] font-medium">
              <span>Item</span><span>Pres</span>
              <span>Real fijo</span><span>%RF</span>
              <span>Real var</span><span>%RV</span><span/>
            </div>
            {Object.entries(data).map(([k, x]) => {
              const rf = Number(x.realFijo||0), rv = Number(x.realVariable||0);
              return (
                <div key={k} className="grid grid-cols-7 gap-2 items-center text-xs">
                  <span>{k}</span>
                  <span>${x.presupuesto.toLocaleString()}</span>
                  <Input
                    type="number" value={x.realFijo} placeholder="0"
                    onChange={e=>handler(k,"realFijo",e.target.value)}
                  />
                  <span>{percent(rf)}%</span>
                  <Input
                    type="number" value={x.realVariable} placeholder="0"
                    onChange={e=>handler(k,"realVariable",e.target.value)}
                  />
                  <span>{percent(rv)}%</span>
                  <Button size="icon" variant="ghost" onClick={()=>deleteKey(setter,k)}>🗑</Button>
                </div>
              );
            })}
            <Button size="sm" onClick={()=>addKey(setter,label)}>
              Añadir {label.toLowerCase()}
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* Resumen & Export */}
      <Card>
        <CardContent className="space-y-1 text-sm">
          <p><strong>Ingresos fijos (100%):</strong> ${totalFixedIngresos.toLocaleString()}</p>
          <p>Gastos Fijos: ${totalGastosFijos.toLocaleString()} ({percent(totalGastosFijos)}%)</p>
          <p>No Guilt Spend: ${totalNoGuilt.toLocaleString()} ({percent(totalNoGuilt)}%)</p>
          <p>Inversión (fijo): ${totalInvFijo.toLocaleString()} ({percent(totalInvFijo)}%)</p>
          <p>Inversión (variable): ${totalInvVar.toLocaleString()} ({percent(totalInvVar)}%)</p>
          <p>Ahorro (fijo): ${totalAhrFijo.toLocaleString()} ({percent(totalAhrFijo)}%)</p>
          <p>Ahorro (variable): ${totalAhrVar.toLocaleString()} ({percent(totalAhrVar)}%)</p>
          <p>Variables (fijo): ${totalGVarFijo.toLocaleString()} ({percent(totalGVarFijo)}%)</p>
          <p>Variables (variable): ${totalGVarVar.toLocaleString()} ({percent(totalGVarVar)}%)</p>
          <p className={`font-bold ${restante<0?"text-red-600":"text-green-600"}`}>
            Disponible: ${restante.toLocaleString()} ({percent(restante)}%)
          </p>
          <p className="font-bold pt-2">
            Balance: ${(totalIngresosNominal - totalGastos).toLocaleString()}
          </p>
          <Button className="mt-2 w-full" onClick={exportCSV}>
            Exportar CSV
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
