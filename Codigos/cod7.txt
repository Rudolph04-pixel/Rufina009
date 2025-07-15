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

/*********************** Helpers ***************************/
const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
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

const LS_KEY = "finanzas-personales-v1"; // clave única en localStorage

export default function FinanzasPersonales() {
  /*********************** Theme ****************************/
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    darkMode ? root.classList.add("dark") : root.classList.remove("dark");
  }, [darkMode]);

  /*********************** Periodo *************************/
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  /*********************** Estado **************************/
  const [ingresos, setIngresos] = useState({
    A: { valor: "", tipo: "fijo" },
    B: { valor: "", tipo: "fijo" },
    C: { valor: "", tipo: "fijo" },
    D: { valor: "", tipo: "fijo" },
    E: { valor: "", tipo: "fijo" }
  });

  const [gastosFijos, setGastosFijos] = useState({
    Hipoteca: { presupuesto: 694631, real: "" },
    "Gastos comunes": { presupuesto: 129570, real: "" },
    Luz: { presupuesto: 21193, real: "" },
    Agua: { presupuesto: 9810, real: "" },
    Bidon_Agua: { presupuesto: 2500, real: "" },
    Gas: { presupuesto: 19170, real: "" },
    Celular: { presupuesto: 16990, real: "" },
    Internet: { presupuesto: 11187, real: "" },
    "Seguro médicos banco chile": { presupuesto: 17612, real: "" },
    "Seguros casa Quillota": { presupuesto: 5100, real: "" },
    "Patrimore Scotia": { presupuesto: 47000, real: "" },
    "Auto_mantenciones_permisos": { presupuesto: 81000, real: "" },
    Abu: { presupuesto: 30000, real: "" },
    Itau: { presupuesto: 10120, real: "" },
    Jardinero: { presupuesto: 10000, real: "" },
  });

  const [noGuiltSpend, setNoGuiltSpend] = useState({});

  const [inversion, setInversion] = useState({
    "VECTOR CAPITAL-Patrimore": { presupuesto: 200000, real: "" },
    "APV -MBI A Y B MES INTERCALADO": { presupuesto: 100000, real: "" },
    "Gastos no cubiertos DEPTO EC": { presupuesto: 200000, real: "" },
    "Gastos no cubiertos DEPTO LC": { presupuesto: 100000, real: "" }
  });

  const [ahorro, setAhorro] = useState({
    "Vacaciones FINTUAL": { presupuesto: 100000, real: "" },
    Abu: { presupuesto: 15000, real: "" },
    "F.Imprevistos- patrimore ok": { presupuesto: 17000, real: "" },
    "Contribuciones propiedades": { presupuesto: 0, real: "" },
    "Permiso circulacion & mantenciones auto": { presupuesto: 26000, real: "" }
  });

  /* ------- Gastos variables con presupuesto mensual ------- */
  const [gastosVariables, setGastosVariables] = useState({
    "Alimentación & hogar": { presupuesto: 120000, registros: [] },
    Transporte: { presupuesto: 80000, registros: [] },
    "TAG (Peajes)": { presupuesto: 25000, registros: [] }
  });

  /********************* Persistencia (localStorage) *********/
  /* Cargar al montar */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        data.ingresos && setIngresos(data.ingresos);
        data.gastosFijos && setGastosFijos(data.gastosFijos);
        data.noGuiltSpend && setNoGuiltSpend(data.noGuiltSpend);
        data.inversion && setInversion(data.inversion);
        data.ahorro && setAhorro(data.ahorro);
        data.gastosVariables && setGastosVariables(data.gastosVariables);
        data.selectedMonth && setSelectedMonth(data.selectedMonth);
        data.selectedYear && setSelectedYear(data.selectedYear);
      }
    } catch {
      /* si falla parseo, se ignora y se arranca con valores por defecto */
    }
  }, []);

  /* Guardar cada vez que cambie algo relevante */
  useEffect(() => {
    const data = {
      ingresos,
      gastosFijos,
      noGuiltSpend,
      inversion,
      ahorro,
      gastosVariables,
      selectedMonth,
      selectedYear
    };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
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

  /*********************** Utils ***************************/
  const sumReal = (o) =>
    Object.values(o).reduce((s, it) => s + Number(it.real || 0), 0);

  const totalIngresos = Object.values(ingresos).reduce(
    (s, i) => s + Number(i.valor || 0),
    0
  );
  const totalFixedIngresos = Object.values(ingresos).reduce(
    (s, i) => (i.tipo === "fijo" ? s + Number(i.valor || 0) : s),
    0
  );

  const totalGastosFijos = sumReal(gastosFijos);
  const totalNoGuilt = Object.values(noGuiltSpend).reduce(
    (s, v) => s + Number(v || 0),
    0
  );
  const totalInversion = sumReal(inversion);
  const totalAhorro = sumReal(ahorro);

  const sumVar = (g) =>
    Object.values(g).reduce(
      (s, cat) => s + cat.registros.reduce((a, n) => a + n, 0),
      0
    );
  const totalGastosVariables = sumVar(gastosVariables);

  const totalGastos =
    totalGastosFijos +
    totalNoGuilt +
    totalInversion +
    totalAhorro +
    totalGastosVariables;

  const percent = (v) =>
    totalFixedIngresos ? ((v / totalFixedIngresos) * 100).toFixed(1) : "0.0";

  /********************* Exportar CSV ***********************/
  const exportCSV = () => {
    const rows = [
      ["Categoria", "Item", "Presupuesto", "Real", "%", "Mes", "Año"]
    ];

    const pushObj = (cat, obj) => {
      Object.entries(obj).forEach(([k, v]) => {
        rows.push([
          cat,
          k,
          v.presupuesto ?? "-",
          v.real ?? "-",
          percent(Number(v.real || 0)),
          months[selectedMonth],
          selectedYear
        ]);
      });
    };

    const pushNoGuilt = () => {
      Object.entries(noGuiltSpend).forEach(([k, v]) => {
        rows.push([
          "No Guilt Spend",
          k,
          "-",
          v,
          percent(Number(v)),
          months[selectedMonth],
          selectedYear
        ]);
      });
    };

    const pushVariables = () => {
      Object.entries(gastosVariables).forEach(([k, v]) => {
        const totalCat = v.registros.reduce((s, n) => s + n, 0);
        rows.push([
          "Gasto variable",
          k,
          v.presupuesto,
          totalCat,
          percent(totalCat),
          months[selectedMonth],
          selectedYear
        ]);
      });
    };

    pushObj("Gastos Fijos", gastosFijos);
    pushNoGuilt();
    pushVariables();
    pushObj("Inversion", inversion);
    pushObj("Ahorro", ahorro);

    createBlobLink(
      rows.map((r) => r.join(",")).join("\n"),
      `estado-financiero-${months[selectedMonth]}-${selectedYear}.csv`
    );
  };

  /*********************** Handlers ************************/
  const handleIngresoChange = (k, f, v) =>
    setIngresos((p) => ({ ...p, [k]: { ...p[k], [f]: v } }));

  const handleNoGuiltChange = (k, v) =>
    setNoGuiltSpend((p) => ({ ...p, [k]: v }));

  const genericReal =
    (setter) =>
    (k, v) =>
      setter((p) => ({ ...p, [k]: { ...p[k], real: v } }));

  const handleGastoFijoRealChange = genericReal(setGastosFijos);
  const handleInversionRealChange = genericReal(setInversion);
  const handleAhorroRealChange = genericReal(setAhorro);

  const addNoGuiltItem = () =>
    setNoGuiltSpend((p) => ({ ...p, [`Item ${Object.keys(p).length + 1}`]: "" }));

  /* botones “Añadir” para inversión y ahorro */
  const addItem = (setter, label) =>
    setter((p) => ({
      ...p,
      [`${label} ${Object.keys(p).length + 1}`]: { presupuesto: 0, real: "" }
    }));

  const addInversionItem = () => addItem(setInversion, "Inversión");
  const addAhorroItem = () => addItem(setAhorro, "Ahorro");

  /* eliminar clave genérica */
  const deleteKey = (setter, k) =>
    setter((p) => {
      const { [k]: _, ...rest } = p;
      return rest;
    });

  /* gastos variables: añadir / eliminar registro */
  const addVariableRegistro = (cat, v) =>
    setGastosVariables((p) => ({
      ...p,
      [cat]: {
        ...p[cat],
        registros: [...p[cat].registros, Number(v || 0)]
      }
    }));

  const deleteVariableRegistro = (cat, idx) =>
    setGastosVariables((p) => {
      const copia = { ...p };
      copia[cat].registros = copia[cat].registros.filter((_, i) => i !== idx);
      return copia;
    });

  /*********************** Render ***************************/
  return (
    <div className="min-h-screen bg-brand-100">
      {/* Top Bar */}
      <div className="flex items-center gap-2">
        <Card className="flex-1">
          <CardContent className="p-4 grid grid-cols-2 gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={m} value={String(i)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
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
        <CardContent className="p-4 space-y-2">
          <h2 className="text-brand-500 font-semibold">Ingresos</h2>
          {Object.entries(ingresos).map(([k, v]) => (
            <div key={k} className="grid grid-cols-4 gap-2 items-center text-xs">
              <Input
                type="number"
                value={v.valor}
                placeholder={`Ingreso ${k}`}
                onChange={(e) => handleIngresoChange(k, "valor", e.target.value)}
              />
              <Select
                value={v.tipo}
                onValueChange={(val) => handleIngresoChange(k, "tipo", val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fijo">Fijo</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-gray-500">{v.tipo}</span>
              <span className="text-right text-gray-500">
                {v.tipo === "fijo" ? `${percent(Number(v.valor || 0))}%` : "-"}
              </span>
            </div>
          ))}
          <p className="text-sm font-bold pt-2">
            Ingresos totales: ${totalIngresos.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Gastos Fijos */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-lg">
            Gastos Fijos — {percent(totalGastosFijos)}%
          </h2>
          {Object.entries(gastosFijos).map(([k, v]) => (
            <div key={k} className="grid grid-cols-4 gap-2 items-center text-xs">
              <span>{k}</span>
              <span>Pres: ${Number(v.presupuesto).toLocaleString()}</span>
              <Input
                type="number"
                value={v.real}
                placeholder="Real"
                onChange={(e) => handleGastoFijoRealChange(k, e.target.value)}
              />
              <span className="text-right text-gray-500">
                {percent(Number(v.real || 0))}%
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* No Guilt Spend */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-lg">
            No Guilt Spend — {percent(totalNoGuilt)}%
          </h2>
          {Object.entries(noGuiltSpend).map(([k, v]) => (
            <div key={k} className="grid grid-cols-5 gap-2 items-center text-xs">
              {/* nombre editable solo al perder foco */}
              <Input
                defaultValue={k}
                placeholder="Item"
                onBlur={(e) => {
                  const newKey = e.target.value.trim();
                  if (!newKey || newKey === k) return;
                  setNoGuiltSpend((p) => {
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
                onChange={(e) => handleNoGuiltChange(k, e.target.value)}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteKey(setNoGuiltSpend, k)}
              >
                🗑
              </Button>
              <span className="text-right text-gray-500 col-span-1">
                {percent(Number(v || 0))}%
              </span>
            </div>
          ))}
          <Button onClick={addNoGuiltItem} size="sm">
            Añadir gasto
          </Button>
        </CardContent>
      </Card>

      {/* Inversión */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-lg">
            Inversión — {percent(totalInversion)}%
          </h2>
          {Object.entries(inversion).map(([k, v]) => (
            <div key={k} className="grid grid-cols-5 gap-2 items-center text-xs">
              <span>{k}</span>
              <span>Pres: ${Number(v.presupuesto).toLocaleString()}</span>
              <Input
                type="number"
                value={v.real}
                placeholder="Real"
                onChange={(e) => handleInversionRealChange(k, e.target.value)}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteKey(setInversion, k)}
              >
                🗑
              </Button>
              <span className="text-right text-gray-500">
                {percent(Number(v.real || 0))}%
              </span>
            </div>
          ))}
          <Button onClick={addInversionItem} size="sm">
            Añadir inversión
          </Button>
        </CardContent>
      </Card>

      {/* Ahorro */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-lg">
            Ahorro — {percent(totalAhorro)}%
          </h2>
          {Object.entries(ahorro).map(([k, v]) => (
            <div key={k} className="grid grid-cols-5 gap-2 items-center text-xs">
              <span>{k}</span>
              <span>Pres: ${Number(v.presupuesto).toLocaleString()}</span>
              <Input
                type="number"
                value={v.real}
                placeholder="Real"
                onChange={(e) => handleAhorroRealChange(k, e.target.value)}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteKey(setAhorro, k)}
              >
                🗑
              </Button>
              <span className="text-right text-gray-500">
                {percent(Number(v.real || 0))}%
              </span>
            </div>
          ))}
          <Button onClick={addAhorroItem} size="sm">
            Añadir ahorro
          </Button>
        </CardContent>
      </Card>

      {/* Gastos Variables */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-lg">
            Gastos variables — {percent(totalGastosVariables)}%
          </h2>

          {Object.entries(gastosVariables).map(([k, v]) => {
            const totalCat = v.registros.reduce((s, n) => s + n, 0);
            const inputId = `input-${k.replace(/\s+/g, "-")}`;
            return (
              <div key={k} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span>{k}</span>
                  <span>
                    ${totalCat.toLocaleString()} / $
                    {Number(v.presupuesto).toLocaleString()} (
                    {percent(totalCat)}%)
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Monto"
                    id={inputId}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      const el = document.getElementById(inputId);
                      if (el && el.value) {
                        addVariableRegistro(k, el.value);
                        el.value = "";
                      }
                    }}
                  >
                    Añadir
                  </Button>
                </div>
                {v.registros.length > 0 && (
                  <ul className="pl-4 list-disc text-xs space-y-1">
                    {v.registros.map((n, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span>${n.toLocaleString()}</span>
                        <button
                          onClick={() => deleteVariableRegistro(k, idx)}
                          className="text-red-600"
                        >
                          x
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Resumen & Export */}
      <Card>
        <CardContent className="p-4 space-y-1 text-sm">
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
            Variables: ${totalGastosVariables.toLocaleString()} (
            {percent(totalGastosVariables)}%)
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
