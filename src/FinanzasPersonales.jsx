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
  a.href = url; a.download = filename;
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

  /* Estado */
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
  const [noGuiltSpend, setNoGuiltSpend] = useState({});
  const [inversion, setInversion] = useState({
    "VECTOR CAPITAL-Patrimore": { presupuesto: 200000, realFijo: "", realVariable: "" },
    "APV -MBI A Y B mes intercalado": { presupuesto: 100000, realFijo: "", realVariable: "" },
    "Gastos no cubiertos DEPTO EC": { presupuesto: 200000, realFijo: "", realVariable: "" },
    "Gastos no cubiertos DEPTO LC": { presupuesto: 100000, realFijo: "", realVariable: "" }
  });
  const [ahorro, setAhorro] = useState({
    "Vacaciones FINTUAL": { presupuesto: 100000, realFijo: "", realVariable: "" },
    Abu: { presupuesto: 15000, realFijo: "", realVariable: "" },
    "F.Tranquilidad- patrimore ": { presupuesto: 17000, realFijo: "", realVariable: "" },
    "Contribuciones propiedades": { presupuesto: 103200, realFijo: "", realVariable: "" },
    "Permiso circulacion & mantenciones auto": { presupuesto: 26000, realFijo: "", realVariable: "" }
  });
  // CAMBIO CLAVE: Estructura de gastosVariables para incluir subItems
  const [gastosVariables, setGastosVariables] = useState({
    "Alimentación & hogar": {
      presupuesto: 120000,
      realFijo: "",
      realVariable: "",
      subItems: { // Aquí irán los sub-ítems
        "Mercado": { realFijo: "", realVariable: "" }, // Ejemplo inicial
        "Artículos de limpieza": { realFijo: "", realVariable: "" } // Ejemplo inicial
      }
    },
    Transporte: {
      presupuesto: 80000,
      realFijo: "",
      realVariable: "",
      subItems: {}
    },
    "TAG (Peajes)": {
      presupuesto: 25000,
      realFijo: "",
      realVariable: "",
      subItems: {}
    }
  });

  /* Persistencia */
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(LS_KEY));
      if (!d) return;
      d.ingresos && setIngresos(d.ingresos);
      d.gastosFijos && setGastosFijos(d.gastosFijos);
      d.noGuiltSpend && setNoGuiltSpend(d.noGuiltSpend);
      d.inversion && setInversion(d.inversion);
      d.ahorro && setAhorro(d.ahorro);
      // CAMBIO: Al cargar gastosVariables, asegurar que subItems existe
      if (d.gastosVariables) {
        // Asegurar que cada categoría cargada tenga la propiedad subItems
        const loadedGastosVariables = Object.fromEntries(
          Object.entries(d.gastosVariables).map(([key, value]) => [
            key,
            { ...value, subItems: value.subItems || {} } // Asegura subItems
          ])
        );
        setGastosVariables(loadedGastosVariables);
      }
      d.selectedMonth && setSelectedMonth(d.selectedMonth);
      d.selectedYear && setSelectedYear(d.selectedYear);
    } catch (e) {
      console.error("Error loading from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({
      ingresos, gastosFijos, noGuiltSpend,
      inversion, ahorro, gastosVariables,
      selectedMonth, selectedYear
    }));
  }, [
    ingresos, gastosFijos, noGuiltSpend,
    inversion, ahorro, gastosVariables,
    selectedMonth, selectedYear
  ]);

  /* Cálculos */
  const sumSingle = o => Object.values(o).reduce((s, x) => s + Number(x.real || 0), 0);
  const totalIngresosNominal = Object.values(ingresos).reduce((s, i) => s + Number(i.valor || 0), 0);
  const totalFixedIngresos = Object.values(ingresos).reduce((s, i) => i.tipo === "fijo" ? s + Number(i.valor || 0) : s, 0);
  const totalIngresosVariables = Object.values(ingresos).reduce((s, i) => i.tipo === "variable" ? s + Number(i.valor || 0) : s, 0);
  const totalGastosFijos = sumSingle(gastosFijos);
  const totalNoGuilt = Object.values(noGuiltSpend).reduce((s, v) => s + Number(v || 0), 0);

  const totalInvFijo = Object.values(inversion).reduce((s, x) => s + Number(x.realFijo || 0), 0);
  const totalInvVar = Object.values(inversion).reduce((s, x) => s + Number(x.realVariable || 0), 0);
  const totalAhrFijo = Object.values(ahorro).reduce((s, x) => s + Number(x.realFijo || 0), 0);
  const totalAhrVar = Object.values(ahorro).reduce((s, x) => s + Number(x.realVariable || 0), 0);

  // CAMBIO: Los totales de gastos variables ahora incluyen sub-ítems
  const totalGVarFijo = Object.values(gastosVariables).reduce((s, x) => {
    let categoryTotal = Number(x.realFijo || 0); // Valor de la categoría principal
    if (x.subItems) {
      // Suma los realFijo de todos los sub-ítems
      categoryTotal += Object.values(x.subItems).reduce((subS, subX) => subS + Number(subX.realFijo || 0), 0);
    }
    return s + categoryTotal;
  }, 0);

  const totalGVarVar = Object.values(gastosVariables).reduce((s, x) => {
    let categoryTotal = Number(x.realVariable || 0); // Valor de la categoría principal
    if (x.subItems) {
      // Suma los realVariable de todos los sub-ítems
      categoryTotal += Object.values(x.subItems).reduce((subS, subX) => subS + Number(subX.realVariable || 0), 0);
    }
    return s + categoryTotal;
  }, 0);

  const totalInversion = totalInvFijo + totalInvVar;
  const totalAhorro = totalAhrFijo + totalAhrVar;
  const totalGastosVars = totalGVarFijo + totalGVarVar; // Suma de todos los reales (fijo y variable) de gastos variables
  const totalGastos = totalGastosFijos + totalNoGuilt + totalInversion + totalAhorro + totalGastosVars;

  const percent = v => totalFixedIngresos ? ((v / totalFixedIngresos) * 100).toFixed(1) : "0.0";
  const percentVar = v => totalIngresosVariables ? ((v / totalIngresosVariables) * 100).toFixed(1) : "0.0";

  /* Pool restante variables */
  const totalAssignedVar = totalInvVar + totalAhrVar + totalGVarVar;
  const remainingVarPool = totalIngresosVariables - totalAssignedVar;

  /* Disponibles */
  const disponibleFijo = totalFixedIngresos
    - (totalGastosFijos + totalInvFijo + totalAhrFijo + totalGVarFijo);
  const disponibleVar = remainingVarPool;

  /* Handlers */
  const handleIngresoChange = (k, f, v) => setIngresos(p => ({ ...p, [k]: { ...p[k], [f]: v } }));
  const handleGastoFijoRealChange = (k, v) => setGastosFijos(p => ({ ...p, [k]: { ...p[k], real: v } }));
  const handleNoGuiltChange = (k, v) => setNoGuiltSpend(p => ({ ...p, [k]: v }));

  const handleInvChange = (k, field, val) => {
    let n = Number(val) || 0;
    if (field === "realVariable") {
      const cur = Number(inversion[k].realVariable) || 0;
      // Para un cálculo más preciso del máximo, podríamos necesitar un remainingVarPool
      // específico para el ítem o un manejo más granular. Por ahora, se basa en el pool global.
      const availableInPool = remainingVarPool + cur; // Suma lo que ya tiene el ítem al pool para no "penalizarlo"
      if (n > availableInPool) n = availableInPool;
    }
    setInversion(p => ({ ...p, [k]: { ...p[k], [field]: String(n) } }));
  };
  const handleAhorChange = (k, field, val) => {
    let n = Number(val) || 0;
    if (field === "realVariable") {
      const cur = Number(ahorro[k].realVariable) || 0;
      const availableInPool = remainingVarPool + cur;
      if (n > availableInPool) n = availableInPool;
    }
    setAhorro(p => ({ ...p, [k]: { ...p[k], [field]: String(n) } }));
  };

  // CAMBIO: handleVarChange ahora solo para los campos de la CATEGORÍA PRINCIPAL de Gastos Variables
  const handleVarChange = (k, field, val) => {
    let n = Number(val) || 0;
    if (field === "realVariable") {
      const cur = Number(gastosVariables[k].realVariable) || 0;
      const availableInPool = remainingVarPool + cur;
      if (n > availableInPool) n = availableInPool;
    }
    setGastosVariables(p => ({ ...p, [k]: { ...p[k], [field]: String(n) } }));
  };

  // NUEVAS FUNCIONES: para manejar sub-ítems en Gastos Variables
  const addSubItem = (categoryKey, setter) => {
    setter(prevCategories => {
      const newCategories = { ...prevCategories };
      const category = { ...newCategories[categoryKey] };
      if (!category.subItems) {
        category.subItems = {}; // Asegura que subItems exista
      }
      const newItemKey = `Nuevo Ítem ${Object.keys(category.subItems).length + 1}`;
      category.subItems[newItemKey] = { realFijo: "", realVariable: "" };
      newCategories[categoryKey] = category;
      return newCategories;
    });
  };

  const deleteSubItem = (categoryKey, subItemKey, setter) => {
    setter(prevCategories => {
      const newCategories = { ...prevCategories };
      const category = { ...newCategories[categoryKey] };
      if (category.subItems) {
        const { [subItemKey]: _, ...restSubItems } = category.subItems;
        category.subItems = restSubItems;
      }
      newCategories[categoryKey] = category;
      return newCategories;
    });
  };

  const handleSubItemChange = (categoryKey, subItemKey, field, val) => {
    let n = Number(val) || 0;
    setGastosVariables(prevCategories => {
      const newCategories = { ...prevCategories };
      const category = { ...newCategories[categoryKey] };
      if (!category.subItems) category.subItems = {};
      const subItem = { ...category.subItems[subItemKey] };

      // Considerar la limitación del pool variable para sub-ítems
      if (field === "realVariable") {
        const currentSubItemValue = Number(subItem.realVariable) || 0;
        // Calcular el pool disponible excluyendo el valor actual de este sub-ítem
        const totalOtherAssignedVar = totalInvVar + totalAhrVar + (totalGVarVar - currentSubItemValue);
        const effectiveRemainingPool = totalIngresosVariables - totalOtherAssignedVar;

        if (n > effectiveRemainingPool) n = effectiveRemainingPool;
        if (n < 0) n = 0; // Asegurar que no sea negativo
      }

      subItem[field] = String(n);
      category.subItems[subItemKey] = subItem;
      newCategories[categoryKey] = category;
      return newCategories;
    });
  };

  const renameSubItem = (categoryKey, oldSubItemKey, newSubItemKey, setter) => {
    setter(prevCategories => {
      const newCategories = { ...prevCategories };
      const category = { ...newCategories[categoryKey] };
      if (category.subItems && oldSubItemKey !== newSubItemKey && newSubItemKey.trim() !== "") {
        const { [oldSubItemKey]: value, ...restSubItems } = category.subItems;
        category.subItems = { ...restSubItems, [newSubItemKey.trim()]: value };
      }
      newCategories[categoryKey] = category;
      return newCategories;
    });
  };
  // FIN NUEVAS FUNCIONES

  const addKey = (setter, label) => setter(p => ({
    ...p, [`${label} ${Object.keys(p).length + 1}`]: { presupuesto: 0, realFijo: "", realVariable: "", subItems: {} } // Añadir subItems para nuevas categorías de Gastos Variables
  }));
  const deleteKey = (setter, k) => setter(p => { const { [k]: _, ...r } = p; return r; });

  /* Export CSV */
  const exportCSV = () => {
    const rows = [["Cat", "Item", "Pres", "RFijo", "%RF", "RVar", "%RV", "Mes", "Año"]];
    const pushSingle = (cat, obj) => Object.entries(obj).forEach(([k, x]) => {
      const rf = Number(x.real || 0);
      rows.push([cat, k, x.presupuesto, rf, percent(rf), "-", "-", months[selectedMonth], selectedYear]);
    });
    const pushDual = (cat, obj) => Object.entries(obj).forEach(([k, x]) => {
      const rf = Number(x.realFijo || 0), rv = Number(x.realVariable || 0);
      rows.push([cat, k, x.presupuesto, rf, percent(rf), rv, percentVar(rv), months[selectedMonth], selectedYear]);
    });

    // CAMBIO: Nueva función para exportar Gastos Variables con sub-ítems
    const pushDualWithSubItems = (cat, obj) => Object.entries(obj).forEach(([k, x]) => {
      const rf = Number(x.realFijo || 0), rv = Number(x.realVariable || 0);
      rows.push([cat, k, x.presupuesto, rf, percent(rf), rv, percentVar(rv), months[selectedMonth], selectedYear]);

      // Añadir sub-ítems
      if (x.subItems) {
        Object.entries(x.subItems).forEach(([subK, subX]) => {
          const subRf = Number(subX.realFijo || 0), subRv = Number(subX.realVariable || 0);
          rows.push([`${cat} - ${k} (Sub)`, subK, "-", subRf, percent(subRf), subRv, percentVar(subRv), months[selectedMonth], selectedYear]);
        });
      }
    });

    pushSingle("Gastos Fijos", gastosFijos);
    Object.entries(noGuiltSpend).forEach(([k, v]) => {
      const rv = Number(v || 0);
      rows.push(["No Guilt", k, "-", rv, percent(rv), "-", "-", months[selectedMonth], selectedYear]);
    });
    pushDual("Inversión", inversion);
    pushDual("Ahorro", ahorro);
    pushDualWithSubItems("Gastos Variables", gastosVariables); // Usar la nueva función aquí

    createBlobLink(
      rows.map(r => r.join(",")).join("\n"),
      `estado-financiero-${months[selectedMonth]}-${selectedYear}.csv`
    );
  };

  /* ───────────── Render ───────────── */
  return (
    <div className="min-h-screen bg-brand-100 px-4 sm:px-6 md:px-8 lg:px-16">
      <div className="max-w-lg mx-auto space-y-4 py-6">

        {/** Top Bar **/}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Card className="w-full sm:flex-1">
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                className="h-12 w-full"
                type="number"
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                placeholder="Año"
              />
            </CardContent>
          </Card>
          <Button
            className="mt-2 sm:mt-0 h-12 w-full sm:w-auto"
            variant="outline"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Modo Claro" : "Modo Oscuro"}
          </Button>
        </div>

        {/** Ingresos **/}
        <Card>
          <CardContent className="space-y-3">
            <h2 className="text-xl font-semibold">Ingresos</h2>
            {Object.entries(ingresos).map(([k, v]) => (
              <div key={k} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-sm">
                <Input
                  className="h-12 w-full"
                  type="number"
                  value={v.valor}
                  placeholder={`Ingreso ${k}`}
                  onChange={e => handleIngresoChange(k, "valor", e.target.value)}
                />
                <Select
                  className="h-12 w-full"
                  value={v.tipo}
                  onValueChange={val => handleIngresoChange(k, "tipo", val)}
                >
                  <SelectTrigger className="w-full h-12">
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
            <p className="text-sm font-semibold">
              Restante variable: ${remainingVarPool.toLocaleString()} ({percentVar(remainingVarPool)}%)
            </p>
            <p className="font-bold text-sm">
              Ingresos totales: ${totalIngresosNominal.toLocaleString()}
              <span className="text-xs text-gray-600">
                {" "}({totalIngresosVariables.toLocaleString()} variables)
              </span>
            </p>
          </CardContent>
        </Card>

        {/** Gastos Fijos **/}
        <Card>
          <CardContent className="space-y-3">
            <h2 className="font-semibold text-lg">
              Gastos Fijos — {percent(totalGastosFijos)}%
            </h2>
            {Object.entries(gastosFijos).map(([k, v]) => (
              <div key={k} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-sm">
                <span>{k}</span>
                <span>Pres: ${v.presupuesto.toLocaleString()}</span>
                <Input
                  className="h-12 w-full"
                  type="number"
                  value={v.real}
                  placeholder="Real"
                  onChange={e => handleGastoFijoRealChange(k, e.target.value)}
                />
                <span className="text-right text-gray-500">
                  {percent(Number(v.real || 0))}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/** No Guilt Spend **/}
        <Card>
          <CardContent className="space-y-3">
            <h2 className="font-semibold text-lg">
              No Guilt Spend — {percent(totalNoGuilt)}%
            </h2>
            {Object.entries(noGuiltSpend).map(([k, v]) => (
              <div key={k} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-sm">
                <Input
                  className="h-12 w-full"
                  defaultValue={k}
                  placeholder="Item"
                  onBlur={e => {
                    const nk = e.target.value.trim();
                    if (!nk || nk === k) return;
                    setNoGuiltSpend(p => {
                      const o = { ...p }, val = o[k];
                      delete o[k]; o[nk] = val;
                      return o;
                    });
                  }}
                />
                <Input
                  className="h-12 w-full"
                  type="number"
                  value={v}
                  placeholder="Monto"
                  onChange={e => handleNoGuiltChange(k, e.target.value)}
                />
                <Button
                  className="h-12 w-12"
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteKey(setNoGuiltSpend, k)}
                >
                  🗑
                </Button>
                <span className="text-right text-gray-500">
                  {percent(Number(v || 0))}%
                </span>
              </div>
            ))}
            <Button
              className="h-12 w-full"
              size="sm"
              onClick={() => setNoGuiltSpend(p => ({ ...p, [`Item ${Object.keys(p).length + 1}`]: "" }))}
            >
              Añadir gasto
            </Button>
          </CardContent>
        </Card>

        {/** Inversión **/}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">
              Inversión
              <span className="block text-sm text-gray-500 mt-1">
                Fijo: {percent(totalInvFijo)}% | Variable: {percentVar(totalInvVar)}%
              </span>
            </h2>
            {Object.entries(inversion).map(([k, x]) => {
              const rf = Number(x.realFijo || 0), rv = Number(x.realVariable || 0);
              return (
                <div
                  key={k}
                  className="space-y-2 py-3 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-b last:border-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{k}</span>
                    <span className="text-sm text-gray-500">
                      ${x.presupuesto.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Real fijo</label>
                      <Input
                        className="h-10 w-full"
                        type="number"
                        value={x.realFijo}
                        onChange={e => handleInvChange(k, "realFijo", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">{percent(rf)}%</p>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Real var</label>
                      <Input
                        className="h-10 w-full"
                        type="number"
                        value={x.realVariable}
                        onChange={e => handleInvChange(k, "realVariable", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">{percentVar(rv)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <Button className="h-12 w-full" size="sm" onClick={() => addKey(setInversion, "Inversión")}>
              Añadir inversión
            </Button>
          </CardContent>
        </Card>

        {/** Ahorro **/}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">
              Ahorro
              <span className="block text-sm text-gray-500 mt-1">
                Fijo: {percent(totalAhrFijo)}% | Variable: {percentVar(totalAhrVar)}%
              </span>
            </h2>
            {Object.entries(ahorro).map(([k, x]) => {
              const rf = Number(x.realFijo || 0), rv = Number(x.realVariable || 0);
              return (
                <div
                  key={k}
                  className="space-y-2 py-3 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-b last:border-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{k}</span>
                    <span className="text-sm text-gray-500">
                      ${x.presupuesto.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Real fijo</label>
                      <Input
                        className="h-10 w-full"
                        type="number"
                        value={x.realFijo}
                        onChange={e => handleAhorChange(k, "realFijo", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">{percent(rf)}%</p>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Real var</label>
                      <Input
                        className="h-10 w-full"
                        type="number"
                        value={x.realVariable}
                        onChange={e => handleAhorChange(k, "realVariable", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">{percentVar(rv)}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <Button className="h-12 w-full" size="sm" onClick={() => addKey(setAhorro, "Ahorro")}>
              Añadir ahorro
            </Button>
          </CardContent>
        </Card>

        {/** Gastos Variables - MODIFICADO PARA SUB-ÍTĒMS **/}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">
              Gastos Variables
              <span className="block text-sm text-gray-500 mt-1">
                Fijo: {percent(totalGVarFijo)}% | Variable: {percentVar(totalGVarVar)}%
              </span>
            </h2>
            {Object.entries(gastosVariables).map(([k, x]) => { // k es "Alimentación & hogar", "Transporte", etc.
              const rf = Number(x.realFijo || 0), rv = Number(x.realVariable || 0);
              return (
                <div
                  key={k}
                  className="space-y-2 py-3 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-b last:border-0"
                >
                  {/* Encabezado de la categoría principal de Gasto Variable */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-base">{k}</span> {/* Nombre de la categoría principal */}
                    <span className="text-sm text-gray-500">
                      Presupuesto: ${x.presupuesto.toLocaleString()}
                    </span>
                    {/* Botón para eliminar la categoría principal (opcional, si se quiere) */}
                    <Button
                      className="h-10 w-10"
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteKey(setGastosVariables, k)}
                    >
                      🗑
                    </Button>
                  </div>

                  {/* Inputs para Real fijo y Real variable de la CATEGORÍA PRINCIPAL */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Real fijo (Cat. Principal)</label>
                      <Input
                        className="h-10 w-full"
                        type="number"
                        value={x.realFijo}
                        onChange={e => handleVarChange(k, "realFijo", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">{percent(rf)}%</p>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Real var (Cat. Principal)</label>
                      <Input
                        className="h-10 w-full"
                        type="number"
                        value={x.realVariable}
                        onChange={e => handleVarChange(k, "realVariable", e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-500">{percentVar(rv)}%</p>
                    </div>
                  </div>

                  {/* Sección de Sub-ítems */}
                  <h3 className="text-sm font-semibold mt-4 mb-2">Detalle de Gastos para {k}:</h3>
                  {x.subItems && Object.entries(x.subItems).map(([subK, subX]) => (
                    <div key={subK} className="flex flex-col sm:flex-row gap-2 items-center text-sm ml-4 pl-2 border-l-2 border-gray-200 dark:border-gray-700 py-1">
                      {/* Input para editar el nombre del sub-ítem */}
                      <Input
                        className="h-10 w-full sm:w-1/4" // Ajustado para mejor visualización
                        defaultValue={subK}
                        placeholder="Nombre del ítem"
                        onBlur={e => {
                          const newSubK = e.target.value.trim();
                          if (!newSubK || newSubK === subK) return;
                          renameSubItem(k, subK, newSubK, setGastosVariables);
                        }}
                      />
                      <Input
                        className="h-10 w-full sm:w-1/4"
                        type="number"
                        value={subX.realFijo}
                        placeholder="Real fijo sub-ítem"
                        onChange={e => handleSubItemChange(k, subK, "realFijo", e.target.value)}
                      />
                      <Input
                        className="h-10 w-full sm:w-1/4"
                        type="number"
                        value={subX.realVariable}
                        placeholder="Real variable sub-ítem"
                        onChange={e => handleSubItemChange(k, subK, "realVariable", e.target.value)}
                      />
                      <Button
                        className="h-10 w-10"
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteSubItem(k, subK, setGastosVariables)}
                      >
                        🗑
                      </Button>
                    </div>
                  ))}

                  {/* Botón para añadir sub-ítem a esta categoría principal */}
                  <Button
                    className="h-10 w-full mt-4"
                    size="sm"
                    onClick={() => addSubItem(k, setGastosVariables)}
                  >
                    Añadir ítem a "{k}"
                  </Button>
                </div>
              );
            })}
            {/* Este botón es para añadir una nueva CATEGORÍA PRINCIPAL de Gasto Variable, no un sub-ítem */}
            <Button className="h-12 w-full" size="sm" onClick={() => addKey(setGastosVariables, "Nueva Categoría Variable")}>
              Añadir Nueva Categoría Variable
            </Button>
          </CardContent>
        </Card>

        {/* Resumen & Export */}
           <Card>
             <CardContent className="space-y-1 text-sm">
               <p><strong>Ingresos fijos (100%):</strong> ${totalFixedIngresos.toLocaleString()}</p>
               <p><strong>Ingresos variables:</strong> ${totalIngresosVariables.toLocaleString()}</p>
               <p><strong>Gastos Fijos:</strong> ${totalGastosFijos.toLocaleString()} ({percent(totalGastosFijos)}%)</p>
               <p><strong>No Guilt Spend:</strong> ${totalNoGuilt.toLocaleString()} ({percent(totalNoGuilt)}%)</p>
               <p><strong>Inversión fijo:</strong> ${totalInvFijo.toLocaleString()} ({percent(totalInvFijo)}%)</p>
               <p><strong>Ahorro fijo:</strong> ${totalAhrFijo.toLocaleString()} ({percent(totalAhrFijo)}%)</p>
               <p className={`text-sm font-semibold ${disponibleFijo>=0?"text-green-600":"text-red-600"}`}>Disponible fijo: ${disponibleFijo.toLocaleString()} ({percent(disponibleFijo)}%)</p>
               <p className={`text-sm font-semibold ${disponibleVar>=0?"text-green-600":"text-red-600"}`}>Disponible var: ${disponibleVar.toLocaleString()} ({percent(disponibleVar)}%)</p>
               <Button className="mt-2 w-full h-12" onClick={exportCSV}>Exportar CSV</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
