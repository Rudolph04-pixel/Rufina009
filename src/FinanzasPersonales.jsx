import { useState, useEffect, createContext, useContext } from "react";

// --- Mock Components for Standalone Demo ---
// Estos son componentes simulados para que el código se pueda ejecutar.
// Se ha añadido la lógica para que el acordeón funcione.
const Card = ({ className, children }) => <div className={`border rounded-lg shadow-sm ${className}`}>{children}</div>;
const CardContent = ({ className, children }) => <div className={`p-4 ${className}`}>{children}</div>;
const Input = (props) => <input {...props} className={`border rounded-md px-3 py-2 text-sm w-full ${props.className}`} />;
const Button = ({ className, children, ...props }) => <button {...props} className={`px-4 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 ${className}`}>{children}</button>;
const Select = ({ children, value, onValueChange }) => <select value={value} onChange={e => onValueChange(e.target.value)} className="border rounded-md px-3 py-2 text-sm w-full h-12 bg-white">{children}</select>;
const SelectValue = ({ placeholder }) => <option value="" disabled>{placeholder}</option>;
const SelectItem = ({ children, value }) => <option value={value}>{children}</option>;

// Lógica del Acordeón
const AccordionContext = createContext();

const Accordion = ({ type, className, children }) => {
    const [openSections, setOpenSections] = useState([]);

    const toggleSection = (value) => {
        setOpenSections(prev =>
            prev.includes(value)
                ? prev.filter(item => item !== value)
                : [...prev, value]
        );
    };

    return (
        <AccordionContext.Provider value={{ openSections, toggleSection }}>
            <div className={className}>{children}</div>
        </AccordionContext.Provider>
    );
};

const AccordionItem = ({ value, children }) => {
    return <div className="border-b">{children}</div>;
};

const AccordionTrigger = ({ className, children }) => {
    const { toggleSection } = useContext(AccordionContext);
    // Extraer el valor del padre (asumiendo que el padre es AccordionItem)
    // En una implementación real, esto se manejaría de forma más robusta.
    // Aquí, asumimos que el `value` se pasa implícitamente o se extrae del contexto del item.
    // Para este mock, vamos a necesitar pasar el 'value' al trigger.
    const value = children[0]?.props?.value || 'default'; // Solución temporal para el mock

    return (
        <button
            onClick={() => toggleSection(value)}
            className={`w-full text-left py-4 px-2 font-semibold flex justify-between items-center ${className}`}
        >
            <span>{children}</span>
            <span>▼</span>
        </button>
    );
};

const AccordionContent = ({ children }) => {
    const { openSections } = useContext(AccordionContext);
    // Este es un truco para obtener el 'value' del AccordionItem padre.
    // Una librería real lo manejaría internamente.
    const parentValue = children?.props?.value;
    if (!openSections.includes(parentValue)) {
        return null;
    }
    return <div className="p-2">{children}</div>;
};

// Componente Wrapper para que el contenido del acordeón funcione
const AccordionContentWrapper = ({ value, children }) => {
    const { openSections } = useContext(AccordionContext);
    if (!openSections.includes(value)) return null;
    return <div className="p-2">{children}</div>;
};

const AccordionTriggerWrapper = ({ value, className, children }) => {
    const { toggleSection, openSections } = useContext(AccordionContext);
    const isOpen = openSections.includes(value);
    return (
        <button
            onClick={() => toggleSection(value)}
            className={`w-full text-left py-4 px-2 font-semibold flex justify-between items-center ${className}`}
        >
            <span>{children}</span>
            <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </button>
    );
};

// --- End of Mock Components ---


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
    document.body.style.backgroundColor = darkMode ? '#020617' : '#f0f9ff';
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
    "Bidon Agua x2": { presupuesto: 5000, real: "" },
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

  /* Gastos Variables */
  const [gastosVariables, setGastosVariables] = useState({
    "Alimentación & hogar": {
      presupuesto: 120000,
      subItems: {
        Mercado: { realFijo: "" },
        "Artículos de limpieza": { realFijo: "" }
      }
    },
    Transporte: { presupuesto: 80000, subItems: {} },
    "TAG (Peajes)": { presupuesto: 25000, subItems: {} }
  });

  /* Persistencia */
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(LS_KEY));
      if (!d) return;
      if (d.ingresos) setIngresos(d.ingresos);
      if (d.gastosFijos) setGastosFijos(d.gastosFijos);
      if (d.noGuiltSpend) setNoGuiltSpend(d.noGuiltSpend);
      if (d.inversion) setInversion(d.inversion);
      if (d.ahorro) setAhorro(d.ahorro);
      if (d.gastosVariables) setGastosVariables(d.gastosVariables);
      if (d.selectedMonth) setSelectedMonth(d.selectedMonth);
      if (d.selectedYear) setSelectedYear(d.selectedYear);
    } catch (e) {
      console.error("Error loading from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    const dataToStore = {
      ingresos,
      gastosFijos,
      noGuiltSpend,
      inversion,
      ahorro,
      gastosVariables,
      selectedMonth,
      selectedYear
    };
    localStorage.setItem(LS_KEY, JSON.stringify(dataToStore));
  }, [ingresos, gastosFijos, noGuiltSpend, inversion, ahorro, gastosVariables, selectedMonth, selectedYear]);

  /* Cálculos */
  const sumSingle = (o) => Object.values(o).reduce((s, x) => s + Number(x.real || 0), 0);
  const totalIngresosNominal = Object.values(ingresos).reduce((s, i) => s + Number(i.valor || 0), 0);
  const totalFixedIngresos = Object.values(ingresos).reduce((s, i) => (i.tipo === "fijo" ? s + Number(i.valor || 0) : s), 0);
  const totalIngresosVariables = Object.values(ingresos).reduce((s, i) => (i.tipo === "variable" ? s + Number(i.valor || 0) : s), 0);
  const totalGastosFijos = sumSingle(gastosFijos);
  const totalNoGuilt = Object.values(noGuiltSpend).reduce((s, v) => s + Number(v || 0), 0);
  const totalInvFijo = Object.values(inversion).reduce((s, x) => s + Number(x.realFijo || 0), 0);
  const totalInvVar = Object.values(inversion).reduce((s, x) => s + Number(x.realVariable || 0), 0);
  const totalAhrFijo = Object.values(ahorro).reduce((s, x) => s + Number(x.realFijo || 0), 0);
  const totalAhrVar = Object.values(ahorro).reduce((s, x) => s + Number(x.realVariable || 0), 0);
  const calcSubTotal = (subItems) => Object.values(subItems).reduce((sum, it) => sum + Number(it.realFijo || 0), 0);
  const totalGVarFijo = Object.values(gastosVariables).reduce((sum, cat) => sum + calcSubTotal(cat.subItems), 0);
  
  const percent = (v) => (totalFixedIngresos ? ((v / totalFixedIngresos) * 100).toFixed(1) : "0.0");
  const percentVar = (v) => (totalIngresosVariables ? ((v / totalIngresosVariables) * 100).toFixed(1) : "0.0");

  const totalAssignedVar = totalInvVar + totalAhrVar;
  const remainingVarPool = totalIngresosVariables - totalAssignedVar;

  const disponibleFijo = totalFixedIngresos - (totalGastosFijos + totalInvFijo + totalAhrFijo + totalGVarFijo);
  const disponibleVar = remainingVarPool;

  /* Handlers */
  const handleIngresoChange = (k, f, v) => setIngresos((p) => ({ ...p, [k]: { ...p[k], [f]: v } }));
  const handleGastoFijoRealChange = (k, v) => setGastosFijos((p) => ({ ...p, [k]: { ...p[k], real: v } }));
  const handleNoGuiltChange = (k, v) => setNoGuiltSpend((p) => ({ ...p, [k]: v }));

  const handlePoolChange = (setter, k, field, val, pool, currentVal) => {
    let n = Number(val) || 0;
    if (field === "realVariable") {
      const availableInPool = pool + currentVal;
      if (n > availableInPool) n = availableInPool;
    }
    setter((p) => ({ ...p, [k]: { ...p[k], [field]: String(n) } }));
  };
  const handleInvChange = (k, field, val) => handlePoolChange(setInversion, k, field, val, remainingVarPool, Number(inversion[k].realVariable || 0));
  const handleAhorChange = (k, field, val) => handlePoolChange(setAhorro, k, field, val, remainingVarPool, Number(ahorro[k].realVariable || 0));

  const addKey = (setter, label, value) => setter((p) => ({ ...p, [`${label} ${Object.keys(p).length + 1}`]: value }));
  const deleteKey = (setter, k) => setter((p) => {
    const { [k]: _, ...r } = p;
    return r;
  });
  const renameKey = (setter, oldKey, newKey) => {
    if (!newKey || oldKey === newKey) return;
    setter((p) => {
      const { [oldKey]: value, ...rest } = p;
      return { ...rest, [newKey]: value };
    });
  };
  const renameInvKey = (oldKey, newKey) => renameKey(setInversion, oldKey, newKey);
  const renameAhorroKey = (oldKey, newKey) => renameKey(setAhorro, oldKey, newKey);
  const renameGVCatKey = (oldKey, newKey) => renameKey(setGastosVariables, oldKey, newKey);
  const renameNoGuiltKey = (oldKey, newKey) => renameKey(setNoGuiltSpend, oldKey, newKey);

  /* Sub‑ítems de Gastos Variables */
  const addSubItem = (categoryKey) => {
    setGastosVariables((prev) => {
      const cat = { ...prev[categoryKey] };
      const newKey = `Ítem ${Object.keys(cat.subItems).length + 1}`;
      cat.subItems = { ...cat.subItems, [newKey]: { realFijo: "" } };
      return { ...prev, [categoryKey]: cat };
    });
  };
  const deleteSubItem = (categoryKey, subKey) => {
    setGastosVariables((prev) => {
      const cat = { ...prev[categoryKey] };
      const { [subKey]: _, ...rest } = cat.subItems;
      cat.subItems = rest;
      return { ...prev, [categoryKey]: cat };
    });
  };
  const handleSubItemChange = (categoryKey, subKey, val) => {
    setGastosVariables((prev) => ({
      ...prev, [categoryKey]: { ...prev[categoryKey], subItems: { ...prev[categoryKey].subItems, [subKey]: { realFijo: val } } }
    }));
  };
  const renameSubItem = (categoryKey, oldKey, newKey) => {
    if (!newKey || oldKey === newKey) return;
    setGastosVariables((prev) => {
      const cat = { ...prev[categoryKey] };
      const { [oldKey]: val, ...others } = cat.subItems;
      cat.subItems = { ...others, [newKey]: val };
      return { ...prev, [categoryKey]: cat };
    });
  };

  /* Export CSV */
  const exportCSV = () => {
    const rows = [["Categoria", "Item", "Presupuesto", "Real Fijo", "% Ingreso Fijo", "Real Variable", "% Ingreso Variable", "Mes", "Año"]];
    const pushSingle = (cat, obj) => Object.entries(obj).forEach(([k, x]) => rows.push([cat, k, x.presupuesto, Number(x.real || 0), percent(Number(x.real || 0)), "-", "-", months[selectedMonth], selectedYear]));
    const pushDual = (cat, obj) => Object.entries(obj).forEach(([k, x]) => rows.push([cat, k, x.presupuesto, Number(x.realFijo || 0), percent(Number(x.realFijo || 0)), Number(x.realVariable || 0), percentVar(Number(x.realVariable || 0)), months[selectedMonth], selectedYear]));
    const pushGV = (obj) => Object.entries(obj).forEach(([k, x]) => {
      rows.push(["Gastos Variables", k, x.presupuesto, "-", "-", "-", "-", months[selectedMonth], selectedYear]);
      Object.entries(x.subItems).forEach(([subK, subX]) => rows.push([`GV - ${k}`, subK, "-", Number(subX.realFijo || 0), percent(Number(subX.realFijo || 0)), "-", "-", months[selectedMonth], selectedYear]));
    });
    pushSingle("Gastos Fijos", gastosFijos);
    Object.entries(noGuiltSpend).forEach(([k, v]) => rows.push(["No Guilt", k, "-", Number(v || 0), percent(Number(v || 0)), "-", "-", months[selectedMonth], selectedYear]));
    pushDual("Inversión", inversion);
    pushDual("Ahorro", ahorro);
    pushGV(gastosVariables);
    createBlobLink(rows.map((r) => r.join(",")).join("\n"), `estado-financiero-${months[selectedMonth]}-${selectedYear}.csv`);
  };

  /* ───────────── Render ───────────── */
  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-gray-200' : 'bg-sky-100'}`}>
      <div className="max-w-lg mx-auto space-y-4 py-6 px-4">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Card className={`w-full sm:flex-1 ${darkMode ? 'bg-slate-800' : 'bg-sky-50'}`}>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectValue placeholder="Mes" />
                {months.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
              </Select>
              <Input className={`h-12 w-full ${darkMode ? 'bg-slate-700 border-slate-600' : ''}`} type="number" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} placeholder="Año" />
            </CardContent>
          </Card>
          <Button className="h-12 w-full sm:w-auto bg-slate-600 hover:bg-slate-700" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </Button>
        </div>

        {/* Accordion */}
        <Accordion type="multiple" className="space-y-4">
          <AccordionItem value="ingresos">
            <AccordionTriggerWrapper value="ingresos" className={`${darkMode ? 'hover:bg-slate-800' : ''}`}>Ingresos</AccordionTriggerWrapper>
            <AccordionContentWrapper value="ingresos">
              <Card className={`${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <CardContent className="space-y-3">
                  {Object.entries(ingresos).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-sm">
                      <Input className={`col-span-2 ${darkMode ? 'bg-slate-700 border-slate-600' : ''}`} type="number" value={v.valor} placeholder={`Ingreso ${k}`} onChange={(e) => handleIngresoChange(k, "valor", e.target.value)} />
                      <Select value={v.tipo} onValueChange={(val) => handleIngresoChange(k, "tipo", val)}>
                        <SelectItem value="fijo">Fijo</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                      </Select>
                      <span className="text-right col-span-2">{v.tipo === "fijo" ? `${percent(Number(v.valor || 0))}%` : "-"}</span>
                    </div>
                  ))}
                  <p className="text-sm font-semibold">Restante variable: ${remainingVarPool.toLocaleString()} ({percentVar(remainingVarPool)}%)</p>
                  <p className="font-bold text-sm">Ingresos totales: ${totalIngresosNominal.toLocaleString()} <span className="text-xs text-gray-500">({totalIngresosVariables.toLocaleString()} variables)</span></p>
                </CardContent>
              </Card>
            </AccordionContentWrapper>
          </AccordionItem>

          <AccordionItem value="gastos-fijos">
            <AccordionTriggerWrapper value="gastos-fijos" className={`${darkMode ? 'hover:bg-slate-800' : ''}`}>Gastos Fijos — {percent(totalGastosFijos)}%</AccordionTriggerWrapper>
            <AccordionContentWrapper value="gastos-fijos">
              <Card className={`${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <CardContent className="space-y-3">
                  {Object.entries(gastosFijos).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-sm">
                      <span className="col-span-2">{k} (${v.presupuesto.toLocaleString()})</span>
                      <Input className={`${darkMode ? 'bg-slate-700 border-slate-600' : ''}`} type="number" value={v.real} placeholder="Real" onChange={(e) => handleGastoFijoRealChange(k, e.target.value)} />
                      <span className="text-right">{percent(Number(v.real || 0))}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AccordionContentWrapper>
          </AccordionItem>

          <AccordionItem value="no-guilt-spend">
            <AccordionTriggerWrapper value="no-guilt-spend" className={`${darkMode ? 'hover:bg-slate-800' : ''}`}>No Guilt Spend — {percent(totalNoGuilt)}%</AccordionTriggerWrapper>
            <AccordionContentWrapper value="no-guilt-spend">
              <Card className={`${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <CardContent className="space-y-3">
                  {Object.entries(noGuiltSpend).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-5 gap-2 items-center text-sm">
                      <Input className={`col-span-2 ${darkMode ? 'bg-slate-700 border-slate-600' : ''}`} defaultValue={k} placeholder="Item" onBlur={(e) => renameNoGuiltKey(k, e.target.value.trim())} />
                      <Input className={`${darkMode ? 'bg-slate-700 border-slate-600' : ''}`} type="number" value={v} placeholder="Monto" onChange={(e) => handleNoGuiltChange(k, e.target.value)} />
                      <Button className="bg-transparent hover:bg-red-500/20 text-lg" onClick={() => deleteKey(setNoGuiltSpend, k)}>🗑️</Button>
                      <span className="text-right">{percent(Number(v || 0))}%</span>
                    </div>
                  ))}
                  <Button className="w-full bg-slate-600 hover:bg-slate-700" onClick={() => addKey(setNoGuiltSpend, "Item", "")}>Añadir gasto</Button>
                </CardContent>
              </Card>
            </AccordionContentWrapper>
          </AccordionItem>

          <AccordionItem value="inversion">
            <AccordionTriggerWrapper value="inversion" className={`${darkMode ? 'hover:bg-slate-800' : ''}`}>Inversión — F: {percent(totalInvFijo)}% | V: {percentVar(totalInvVar)}%</AccordionTriggerWrapper>
            <AccordionContentWrapper value="inversion">
              <Card className={`${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <CardContent className="space-y-4">
                  {Object.entries(inversion).map(([k, x]) => (
                    <div key={k} className={`space-y-2 py-3 px-4 rounded-lg shadow-sm border-b last:border-0 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-sky-50'}`}>
                      <div className="flex justify-between items-center gap-2">
                        <Input className="font-medium text-sm flex-1 bg-transparent border-0 focus:ring-0 p-0" defaultValue={k} onBlur={(e) => renameInvKey(k, e.target.value.trim())} />
                        <span className="text-sm text-gray-400">${x.presupuesto.toLocaleString()}</span>
                        <Button className="bg-transparent hover:bg-red-500/20 text-lg" onClick={() => deleteKey(setInversion, k)}>🗑️</Button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Real fijo</label>
                          <Input className={`${darkMode ? 'bg-slate-600 border-slate-500' : ''}`} type="number" value={x.realFijo} onChange={(e) => handleInvChange(k, "realFijo", e.target.value)} />
                          <p className="mt-1 text-xs text-gray-400">{percent(Number(x.realFijo || 0))}%</p>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Real var</label>
                          <Input className={`${darkMode ? 'bg-slate-600 border-slate-500' : ''}`} type="number" value={x.realVariable} onChange={(e) => handleInvChange(k, "realVariable", e.target.value)} />
                          <p className="mt-1 text-xs text-gray-400">{percentVar(Number(x.realVariable || 0))}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-slate-600 hover:bg-slate-700" onClick={() => addKey(setInversion, "Inversión", { presupuesto: 0, realFijo: "", realVariable: "" })}>Añadir inversión</Button>
                </CardContent>
              </Card>
            </AccordionContentWrapper>
          </AccordionItem>

          <AccordionItem value="ahorro">
            <AccordionTriggerWrapper value="ahorro" className={`${darkMode ? 'hover:bg-slate-800' : ''}`}>Ahorro — F: {percent(totalAhrFijo)}% | V: {percentVar(totalAhrVar)}%</AccordionTriggerWrapper>
            <AccordionContentWrapper value="ahorro">
              <Card className={`${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <CardContent className="space-y-4">
                  {Object.entries(ahorro).map(([k, x]) => (
                     <div key={k} className={`space-y-2 py-3 px-4 rounded-lg shadow-sm border-b last:border-0 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-sky-50'}`}>
                      <div className="flex justify-between items-center gap-2">
                        <Input className="font-medium text-sm flex-1 bg-transparent border-0 focus:ring-0 p-0" defaultValue={k} onBlur={(e) => renameAhorroKey(k, e.target.value.trim())} />
                        <span className="text-sm text-gray-400">${x.presupuesto.toLocaleString()}</span>
                        <Button className="bg-transparent hover:bg-red-500/20 text-lg" onClick={() => deleteKey(setAhorro, k)}>🗑️</Button>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Real fijo</label>
                          <Input className={`${darkMode ? 'bg-slate-600 border-slate-500' : ''}`} type="number" value={x.realFijo} onChange={(e) => handleAhorChange(k, "realFijo", e.target.value)} />
                          <p className="mt-1 text-xs text-gray-400">{percent(Number(x.realFijo || 0))}%</p>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Real var</label>
                          <Input className={`${darkMode ? 'bg-slate-600 border-slate-500' : ''}`} type="number" value={x.realVariable} onChange={(e) => handleAhorChange(k, "realVariable", e.target.value)} />
                          <p className="mt-1 text-xs text-gray-400">{percentVar(Number(x.realVariable || 0))}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-slate-600 hover:bg-slate-700" onClick={() => addKey(setAhorro, "Ahorro", { presupuesto: 0, realFijo: "", realVariable: "" })}>Añadir ahorro</Button>
                </CardContent>
              </Card>
            </AccordionContentWrapper>
          </AccordionItem>

          <AccordionItem value="gastos-variables">
            <AccordionTriggerWrapper value="gastos-variables" className={`${darkMode ? 'hover:bg-slate-800' : ''}`}>Gastos Variables — {percent(totalGVarFijo)}%</AccordionTriggerWrapper>
            <AccordionContentWrapper value="gastos-variables">
              <Card className={`${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <CardContent className="space-y-4">
                  {Object.entries(gastosVariables).map(([catKey, catVal]) => {
                    const subTotal = calcSubTotal(catVal.subItems);
                    const restante = catVal.presupuesto - subTotal;
                    const pctCat = catVal.presupuesto ? ((subTotal / catVal.presupuesto) * 100).toFixed(1) : "0.0";
                    return (
                      <Card key={catKey} className={`${darkMode ? 'bg-slate-700' : 'bg-sky-50 shadow-sm'}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Input className="h-8 flex-1 bg-transparent border-0 p-0 focus:ring-0 font-medium" defaultValue={catKey} onBlur={(e) => renameGVCatKey(catKey, e.target.value.trim())} />
                            <div className="text-xs flex flex-col items-end text-gray-400">
                              <span>Pres: ${catVal.presupuesto.toLocaleString()}</span>
                              <span>Gastado: ${subTotal.toLocaleString()} ({pctCat}%)</span>
                              <span className={restante >= 0 ? 'text-green-500' : 'text-red-500'}>Rest: ${restante.toLocaleString()}</span>
                            </div>
                            <Button className="bg-transparent hover:bg-red-500/20 text-lg" onClick={() => deleteKey(setGastosVariables, catKey)}>🗑️</Button>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(catVal.subItems).map(([subK, subX]) => (
                              <div key={subK} className="flex items-center gap-2">
                                <Input className={`flex-1 ${darkMode ? 'bg-slate-600 border-slate-500' : 'bg-white'}`} defaultValue={subK} onBlur={(e) => renameSubItem(catKey, subK, e.target.value.trim())} />
                                <Input className={`w-32 ${darkMode ? 'bg-slate-600 border-slate-500' : 'bg-white'}`} type="number" value={subX.realFijo} placeholder="Monto" onChange={(e) => handleSubItemChange(catKey, subK, e.target.value)} />
                                <Button className="bg-transparent hover:bg-red-500/20 text-lg" onClick={() => deleteSubItem(catKey, subK)}>🗑️</Button>
                              </div>
                            ))}
                            <Button className={`w-full h-10 ${darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-sky-200 text-sky-800 hover:bg-sky-300'}`} onClick={() => addSubItem(catKey)}>Añadir ítem</Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  <Button className="w-full bg-slate-600 hover:bg-slate-700" onClick={() => addKey(setGastosVariables, "Nueva Categoría", { presupuesto: 0, subItems: {} })}>Añadir Categoría</Button>
                </CardContent>
              </Card>
            </AccordionContentWrapper>
          </AccordionItem>
        </Accordion>

        {/* Resumen & Export */}
        <Card className={`${darkMode ? 'bg-slate-800' : 'bg-sky-50'}`}>
          <CardContent className="space-y-1 text-sm p-4">
            <p><strong>Ingresos fijos (100%):</strong> ${totalFixedIngresos.toLocaleString()}</p>
            <p><strong>Ingresos variables:</strong> ${totalIngresosVariables.toLocaleString()}</p>
            <p><strong>Gastos Fijos:</strong> ${totalGastosFijos.toLocaleString()} ({percent(totalGastosFijos)}%)</p>
            <p><strong>No Guilt Spend:</strong> ${totalNoGuilt.toLocaleString()} ({percent(totalNoGuilt)}%)</p>
            <p><strong>Inversión fijo:</strong> ${totalInvFijo.toLocaleString()} ({percent(totalInvFijo)}%)</p>
            <p><strong>Ahorro fijo:</strong> ${totalAhrFijo.toLocaleString()} ({percent(totalAhrFijo)}%)</p>
            <p className={`font-semibold ${disponibleFijo >= 0 ? "text-green-500" : "text-red-500"}`}>Disponible fijo: ${disponibleFijo.toLocaleString()} ({percent(disponibleFijo)}%)</p>
            <p className={`font-semibold ${disponibleVar >= 0 ? "text-green-500" : "text-red-500"}`}>Disponible var: ${disponibleVar.toLocaleString()} ({percentVar(disponibleVar)}%)</p>
            <Button className="mt-2 w-full h-12 bg-emerald-600 hover:bg-emerald-700" onClick={exportCSV}>Exportar CSV</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
