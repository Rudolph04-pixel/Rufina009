import React, { useState, useEffect, createContext, useContext } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Mock UI Components ---
// These are simulated components to make the code runnable and demonstrate the accordion logic.
// They are styled with Tailwind CSS classes.

const Card = ({ className, children }) => <div className={`border rounded-lg shadow-sm ${className}`}>{children}</div>;
const CardContent = ({ className, children }) => <div className={`p-4 ${className}`}>{children}</div>;
const Input = (props) => <input {...props} className={`border rounded-md px-3 py-2 text-sm w-full ${props.className}`} />;
const Button = ({ className, children, ...props }) => <button {...props} className={`px-4 py-2 rounded-md font-semibold text-white transition-colors ${className}`}>{children}</button>;

// Custom Select component to avoid issues with native select styling
const Select = ({ children, value, onValueChange, className }) => {
    return (
        <select
            value={value}
            onChange={e => onValueChange(e.target.value)}
            className={`border rounded-md px-3 py-2 text-sm w-full h-12 bg-white ${className}`}
        >
            {children}
        </select>
    );
};
const SelectValue = ({ placeholder }) => <option value="" disabled>{placeholder}</option>;
const SelectItem = ({ children, value }) => <option value={value}>{children}</option>;


// --- Accordion Logic ---
// Context and components to create a functional accordion.

const AccordionContext = createContext();

const Accordion = ({ className, children }) => {
    const [openSections, setOpenSections] = useState(['ingresos']); // Start with 'Ingresos' open by default

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

const AccordionItem = ({ children }) => {
    return <div className="border-b border-slate-200 dark:border-slate-700">{children}</div>;
};

const AccordionContentWrapper = ({ value, children }) => {
    const { openSections } = useContext(AccordionContext);
    // This component renders its children only if its 'value' is in the openSections array
    if (!openSections.includes(value)) return null;
    return <div className="pt-2 pb-4 px-2">{children}</div>;
};

const AccordionTriggerWrapper = ({ value, className, children }) => {
    const { toggleSection, openSections } = useContext(AccordionContext);
    const isOpen = openSections.includes(value);
    return (
        <button
            onClick={() => toggleSection(value)}
            className={`w-full text-left py-4 px-2 font-semibold flex justify-between items-center transition-colors rounded-t-lg ${className}`}
        >
            <span>{children}</span>
            <span className={`transform transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
        </button>
    );
};

// --- Main Application Component ---

function FinanzasPersonales() {
  /* ------------------ State Management ------------------ */
  const [showChart, setShowChart] = useState(false);

  // Dark/Light Theme
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.body.style.backgroundColor = darkMode ? '#020617' : '#f0f9ff';
  }, [darkMode]);

  // Time Period
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(today.getMonth()));
  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  // Financial State
  const [ingresos, setIngresos] = useState({
    'Ingreso Principal': { valor: "3000000", tipo: "fijo" },
    'Ingreso Freelance': { valor: "500000", tipo: "variable" },
    'Otro Ingreso': { valor: "", tipo: "fijo" },
  });

  const [gastosFijos, setGastosFijos] = useState({
    'Hipoteca o Arriendo': { presupuesto: 694631, real: "" },
    'Gastos comunes': { presupuesto: 129570, real: "" },
    'Luz': { presupuesto: 21193, real: "" },
    'Agua': { presupuesto: 9810, real: "" },
    'Gas': { presupuesto: 19170, real: "" },
    'Celular': { presupuesto: 16990, real: "" },
    'Internet': { presupuesto: 11187, real: "" },
    'Seguro de Salud': { presupuesto: 17612, real: "" },
    'Seguro de Hogar': { presupuesto: 5100, real: "" },
    'Seguro de Auto': { presupuesto: 56000, real: "" },
    'Suscripciones': { presupuesto: 47000, real: "" },
  });

  const [noGuiltSpend, setNoGuiltSpend] = useState({
      'Café y salidas': "50000",
      'Hobbies': "30000",
  });

  const [inversion, setInversion] = useState({
    "Fondo Mutuo A": { presupuesto: 200000, realFijo: "", realVariable: "" },
    "APV": { presupuesto: 100000, realFijo: "", realVariable: "" },
  });

  const [ahorro, setAhorro] = useState({
    "Vacaciones": { presupuesto: 100000, realFijo: "", realVariable: "" },
    "Fondo de Emergencia": { presupuesto: 50000, realFijo: "", realVariable: "" },
    "Metas a largo plazo": { presupuesto: 103200, realFijo: "", realVariable: "" },
  });

  const [gastosVariables, setGastosVariables] = useState({
    "Alimentación & Supermercado": {
      presupuesto: 250000,
      subItems: {
        'Supermercado Lider': { realFijo: "120000" },
        'Verdulería': { realFijo: "35000" }
      }
    },
    'Transporte': { presupuesto: 80000, subItems: { 'Bencina': {realFijo: '60000'}} },
    'Entretención': { presupuesto: 75000, subItems: {} }
  });

  /* ------------------ Data Persistence ------------------ */
  const LS_KEY = "finanzas-personales-v2"; // Updated key for new structure

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const data = localStorage.getItem(LS_KEY);
      const d = data ? JSON.parse(data) : null;
      if (!d) return;

      if (d.ingresos) setIngresos(d.ingresos);
      if (d.gastosFijos) setGastosFijos(d.gastosFijos);
      if (d.noGuiltSpend) setNoGuiltSpend(d.noGuiltSpend);
      if (d.inversion) setInversion(d.inversion);
      if (d.ahorro) setAhorro(d.ahorro);
      if (d.gastosVariables) setGastosVariables(d.gastosVariables);
      if (d.selectedMonth) setSelectedMonth(d.selectedMonth);
      if (d.selectedYear) setSelectedYear(d.selectedYear);
      if (typeof d.darkMode === 'boolean') setDarkMode(d.darkMode);

    } catch (e) {
      console.error("Error loading from localStorage:", e);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const dataToStore = {
      ingresos, gastosFijos, noGuiltSpend, inversion, ahorro,
      gastosVariables, selectedMonth, selectedYear, darkMode
    };
    localStorage.setItem(LS_KEY, JSON.stringify(dataToStore));
  }, [ingresos, gastosFijos, noGuiltSpend, inversion, ahorro, gastosVariables, selectedMonth, selectedYear, darkMode]);

  /* ------------------ Calculations ------------------ */
  const sumValues = (obj, field) => Object.values(obj).reduce((sum, item) => sum + (Number(item[field]) || 0), 0);

  const totalIngresosNominal = sumValues(ingresos, 'valor');
  const totalFixedIngresos = Object.values(ingresos).reduce((s, i) => (i.tipo === "fijo" ? s + Number(i.valor || 0) : s), 0);
  const totalIngresosVariables = totalIngresosNominal - totalFixedIngresos;

  const totalGastosFijos = sumValues(gastosFijos, 'real');
  const totalNoGuilt = Object.values(noGuiltSpend).reduce((s, v) => s + Number(v || 0), 0);

  const totalInvFijo = sumValues(inversion, 'realFijo');
  const totalInvVar = sumValues(inversion, 'realVariable');
  const totalAhrFijo = sumValues(ahorro, 'realFijo');
  const totalAhrVar = sumValues(ahorro, 'realVariable');

  const calcSubTotal = (subItems) => Object.values(subItems).reduce((sum, it) => sum + Number(it.realFijo || 0), 0);
  const totalGVarFijo = Object.values(gastosVariables).reduce((sum, cat) => sum + calcSubTotal(cat.subItems), 0);

  const percent = (v, total = totalFixedIngresos) => (total ? ((v / total) * 100).toFixed(1) : "0.0");
  const percentVar = (v) => percent(v, totalIngresosVariables);

  const totalAssignedVar = totalInvVar + totalAhrVar;
  const remainingVarPool = totalIngresosVariables - totalAssignedVar;

  const totalGastadoFijo = totalGastosFijos + totalNoGuilt + totalInvFijo + totalAhrFijo + totalGVarFijo;
  const disponibleFijo = totalFixedIngresos - totalGastadoFijo;
  const disponibleVar = remainingVarPool;

  /* ------------------ Chart Data & Config ------------------ */
  const chartData = [
    { name: 'Gastos Fijos', value: totalGastosFijos },
    { name: 'Sin Culpa', value: totalNoGuilt },
    { name: 'Inversión', value: totalInvFijo },
    { name: 'Ahorro', value: totalAhrFijo },
    { name: 'Gastos Variables', value: totalGVarFijo },
  ].filter(item => item.value > 0); // Filter out categories with zero value

  const COLORS = ['#0ea5e9', '#10b981', '#f97316', '#8b5cf6', '#ef4444'];
  
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const total = chartData.reduce((sum, entry) => sum + entry.value, 0);
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
      return (
        <div className="p-2 text-sm bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-md shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-bold">{`${name}`}</p>
          <p>{`$${value.toLocaleString()}`}</p>
          <p className="text-slate-500 dark:text-slate-400">{`${percentage}%`}</p>
        </div>
      );
    }
    return null;
  };


  /* ------------------ Event Handlers ------------------ */

  // Generic handler to update a state object
  const handleStateChange = (setter, key, field, value) => {
    setter(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  // Generic handlers for adding, deleting, and renaming keys in state objects
  const addKey = (setter, label, value) => setter(p => ({ ...p, [`${label} ${Object.keys(p).length + 1}`]: value }));
  const deleteKey = (setter, key) => setter(p => { const { [key]: _, ...rest } = p; return rest; });
  const renameKey = (setter, oldKey, newKey) => {
    if (!newKey || oldKey === newKey) return;
    setter(p => {
      const { [oldKey]: value, ...rest } = p;
      return { ...rest, [newKey]: value };
    });
  };

  // Specific handlers for each section
  const handleIngresoChange = (k, f, v) => handleStateChange(setIngresos, k, f, v);
  const handleGastoFijoRealChange = (k, v) => handleStateChange(setGastosFijos, k, 'real', v);
  const handleNoGuiltChange = (k, v) => setNoGuiltSpend(p => ({ ...p, [k]: v }));
  const renameNoGuiltKey = (oldKey, newKey) => renameKey(setNoGuiltSpend, oldKey, newKey);

  // Handlers for variable pool (Savings and Investment from variable income)
  const handlePoolChange = (setter, k, field, val, pool, currentVal) => {
    let n = Number(val) || 0;
    if (field === "realVariable") {
      const availableInPool = pool + currentVal;
      if (n > availableInPool) n = availableInPool;
    }
    setter(p => ({ ...p, [k]: { ...p[k], [field]: String(n) } }));
  };
  const handleInvChange = (k, f, v) => handlePoolChange(setInversion, k, f, v, remainingVarPool, Number(inversion[k].realVariable || 0));
  const handleAhorChange = (k, f, v) => handlePoolChange(setAhorro, k, f, v, remainingVarPool, Number(ahorro[k].realVariable || 0));

  // Handlers for Variable Expenses sub-items
  const handleSubItemChange = (catKey, subKey, val) => {
    setGastosVariables(p => ({
      ...p, [catKey]: { ...p[catKey], subItems: { ...p[catKey].subItems, [subKey]: { realFijo: val } } }
    }));
  };
  const addSubItem = (catKey) => {
    setGastosVariables(p => ({
      ...p, [catKey]: { ...p[catKey], subItems: { ...p[catKey].subItems, [`Ítem Nuevo`]: { realFijo: "" } } }
    }));
  };
  const deleteSubItem = (catKey, subKey) => {
    setGastosVariables(p => {
      const { [subKey]: _, ...rest } = p[catKey].subItems;
      return { ...p, [catKey]: { ...p[catKey], subItems: rest } };
    });
  };
  const renameSubItem = (catKey, oldKey, newKey) => {
    if (!newKey || oldKey === newKey) return;
    setGastosVariables(p => {
      const { [oldKey]: val, ...others } = p[catKey].subItems;
      return { ...p, [catKey]: { ...p[catKey], subItems: { ...others, [newKey]: val } } };
    });
  };

  /* ------------------ CSV Export ------------------ */
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const exportCSV = () => {
    const rows = [["Categoria", "Item", "Presupuesto", "Real Fijo", "% Ingreso Fijo", "Real Variable", "% Ingreso Variable", "Mes", "Año"]];
    const monthName = months[selectedMonth];

    Object.entries(gastosFijos).forEach(([k, v]) => rows.push(["Gastos Fijos", k, v.presupuesto, v.real, percent(v.real), "", "", monthName, selectedYear]));
    Object.entries(noGuiltSpend).forEach(([k, v]) => rows.push(["No Guilt Spend", k, "", v, percent(v), "", "", monthName, selectedYear]));
    Object.entries(inversion).forEach(([k, v]) => rows.push(["Inversión", k, v.presupuesto, v.realFijo, percent(v.realFijo), v.realVariable, percentVar(v.realVariable), monthName, selectedYear]));
    Object.entries(ahorro).forEach(([k, v]) => rows.push(["Ahorro", k, v.presupuesto, v.realFijo, percent(v.realFijo), v.realVariable, percentVar(v.realVariable), monthName, selectedYear]));
    Object.entries(gastosVariables).forEach(([k, v]) => {
        rows.push(["Gastos Variables (Categoría)", k, v.presupuesto, "", "", "", "", monthName, selectedYear]);
        Object.entries(v.subItems).forEach(([subK, subV]) => rows.push([`GV - ${k}`, subK, "", subV.realFijo, percent(subV.realFijo), "", "", monthName, selectedYear]));
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finanzas_${monthName}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ------------------ Render Function ------------------ */
  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'dark bg-slate-950 text-gray-300' : 'bg-sky-50 text-slate-800'}`}>
      <div className="max-w-2xl mx-auto space-y-4 py-8 px-4">

        {/* --- Header --- */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Mis Finanzas</h1>
            <div className="flex items-center gap-2">
                <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                    className={`h-10 w-36 ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300'}`}
                >
                    {months.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
                </Select>
                <Input
                    className={`h-10 w-24 ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-300'}`}
                    type="number" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
                />
                <Button className="h-10 w-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700" onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? "☀️" : "🌙"}
                </Button>
            </div>
        </header>

        {/* --- Accordion --- */}
        <Accordion>
          {/* Ingresos Section */}
          <AccordionItem>
            <AccordionTriggerWrapper value="ingresos" className="hover:bg-slate-100 dark:hover:bg-slate-800">Ingresos</AccordionTriggerWrapper>
            <AccordionContentWrapper value="ingresos">
              <Card className="bg-white dark:bg-slate-900">
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(ingresos).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-sm">
                      <Input className={`col-span-2 dark:bg-slate-800 dark:border-slate-700`} defaultValue={k} onBlur={(e) => renameKey(setIngresos, k, e.target.value.trim())} />
                      <Input className={`dark:bg-slate-800 dark:border-slate-700`} type="number" value={v.valor} placeholder="Monto" onChange={(e) => handleIngresoChange(k, "valor", e.target.value)} />
                      <Select value={v.tipo} onValueChange={(val) => handleIngresoChange(k, "tipo", val)} className="dark:bg-slate-800 dark:border-slate-700 h-10">
                        <SelectItem value="fijo">Fijo</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                      </Select>
                      <span className="text-right font-mono text-slate-500">{v.tipo === "fijo" ? `${percent(v.valor)}%` : "-"}</span>
                    </div>
                  ))}
                  <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300" onClick={() => addKey(setIngresos, "Ingreso", { valor: "", tipo: "fijo" })}>+ Añadir Ingreso</Button>
                  <div className="border-t dark:border-slate-700 pt-3 mt-3 text-right">
                      <p className="text-sm font-semibold">Ingresos Variables Disponibles: <span className="text-cyan-600 dark:text-cyan-400">${remainingVarPool.toLocaleString()}</span></p>
                      <p className="font-bold">Ingresos Totales: <span className="text-green-600 dark:text-green-400">${totalIngresosNominal.toLocaleString()}</span></p>
                  </div>
                </CardContent>
              </Card>
            </AccordionContentWrapper>
          </AccordionItem>
          
          {/* Gastos Fijos Section */}
          <AccordionItem>
            <AccordionTriggerWrapper value="gastos-fijos" className="hover:bg-slate-100 dark:hover:bg-slate-800">Gastos Fijos — {percent(totalGastosFijos)}%</AccordionTriggerWrapper>
            <AccordionContentWrapper value="gastos-fijos">
              <Card className="bg-white dark:bg-slate-900">
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(gastosFijos).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-sm">
                      <span className="col-span-2 truncate" title={k}>{k} (${v.presupuesto.toLocaleString()})</span>
                      <Input className="dark:bg-slate-800 dark:border-slate-700" type="number" value={v.real} placeholder="Real" onChange={(e) => handleGastoFijoRealChange(k, e.target.value)} />
                      <span className="text-right font-mono text-slate-500">{percent(v.real)}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </AccordionContentWrapper>
          </AccordionItem>

          {/* No Guilt Spend Section */}
          <AccordionItem>
            <AccordionTriggerWrapper value="no-guilt-spend" className="hover:bg-slate-100 dark:hover:bg-slate-800">Gastos "Sin Culpa" — {percent(totalNoGuilt)}%</AccordionTriggerWrapper>
            <AccordionContentWrapper value="no-guilt-spend">
              <Card className="bg-white dark:bg-slate-900">
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(noGuiltSpend).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 text-sm">
                        <Input className="flex-1 dark:bg-slate-800 dark:border-slate-700" defaultValue={k} placeholder="Nombre del gasto" onBlur={(e) => renameNoGuiltKey(k, e.target.value.trim())} />
                        <Input className="w-28 dark:bg-slate-800 dark:border-slate-700" type="number" value={v} placeholder="Monto" onChange={(e) => handleNoGuiltChange(k, e.target.value)} />
                        <span className="w-16 text-right font-mono text-slate-500">{percent(v)}%</span>
                        <Button className="bg-transparent hover:bg-red-500/20 text-red-500 p-2 h-9 w-9 flex items-center justify-center" onClick={() => deleteKey(setNoGuiltSpend, k)}>🗑️</Button>
                    </div>
                  ))}
                  <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300" onClick={() => addKey(setNoGuiltSpend, "Gasto", "")}>+ Añadir Gasto</Button>
                </CardContent>
              </Card>
            </AccordionContentWrapper>
          </AccordionItem>

          {/* Inversión y Ahorro Sections */}
          {[
              {title: "Inversión", state: inversion, setter: setInversion, handler: handleInvChange, renamer: (k, nk) => renameKey(setInversion, k, nk), totalF: totalInvFijo, totalV: totalInvVar},
              {title: "Ahorro", state: ahorro, setter: setAhorro, handler: handleAhorChange, renamer: (k, nk) => renameKey(setAhorro, k, nk), totalF: totalAhrFijo, totalV: totalAhrVar}
          ].map(sec => (
            <AccordionItem key={sec.title}>
                <AccordionTriggerWrapper value={sec.title.toLowerCase()} className="hover:bg-slate-100 dark:hover:bg-slate-800">{sec.title} — F: {percent(sec.totalF)}% | V: {percentVar(sec.totalV)}%</AccordionTriggerWrapper>
                <AccordionContentWrapper value={sec.title.toLowerCase()}>
                    <Card className="bg-white dark:bg-slate-900">
                        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                            {Object.entries(sec.state).map(([k, x]) => (
                                <div key={k} className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center gap-2">
                                        <Input className="font-medium text-sm flex-1 bg-transparent border-0 focus:ring-0 p-0" defaultValue={k} onBlur={(e) => sec.renamer(k, e.target.value.trim())} />
                                        <span className="text-xs text-slate-400">Pres: ${x.presupuesto.toLocaleString()}</span>
                                        <Button className="bg-transparent hover:bg-red-500/20 text-red-500 p-2 h-8 w-8 flex items-center justify-center" onClick={() => deleteKey(sec.setter, k)}>🗑️</Button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1">
                                            <label className="block text-xs text-slate-500 mb-1">Real fijo</label>
                                            <Input className="dark:bg-slate-700 dark:border-slate-600" type="number" value={x.realFijo} onChange={(e) => sec.handler(k, "realFijo", e.target.value)} />
                                            <p className="mt-1 text-xs text-right font-mono text-slate-500">{percent(x.realFijo)}%</p>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-slate-500 mb-1">Real var</label>
                                            <Input className="dark:bg-slate-700 dark:border-slate-600" type="number" value={x.realVariable} onChange={(e) => sec.handler(k, "realVariable", e.target.value)} />
                                            <p className="mt-1 text-xs text-right font-mono text-slate-500">{percentVar(x.realVariable)}%</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300" onClick={() => addKey(sec.setter, sec.title, { presupuesto: 0, realFijo: "", realVariable: "" })}>+ Añadir {sec.title}</Button>
                        </CardContent>
                    </Card>
                </AccordionContentWrapper>
            </AccordionItem>
          ))}

          {/* Gastos Variables Section */}
          <AccordionItem>
            <AccordionTriggerWrapper value="gastos-variables" className="hover:bg-slate-100 dark:hover:bg-slate-800">Gastos Variables — {percent(totalGVarFijo)}%</AccordionTriggerWrapper>
            <AccordionContentWrapper value="gastos-variables">
              <Card className="bg-white dark:bg-slate-900">
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(gastosVariables).map(([catKey, catVal]) => {
                    const subTotal = calcSubTotal(catVal.subItems);
                    const restante = catVal.presupuesto - subTotal;
                    return (
                      <Card key={catKey} className="bg-slate-50 dark:bg-slate-800/50 shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Input className="h-8 flex-1 bg-transparent border-0 p-0 focus:ring-0 font-medium" defaultValue={catKey} onBlur={(e) => renameKey(setGastosVariables, catKey, e.target.value.trim())} />
                            <div className="text-xs flex flex-col items-end text-slate-500 dark:text-slate-400">
                              <span>${subTotal.toLocaleString()} / ${catVal.presupuesto.toLocaleString()}</span>
                              <span className={restante >= 0 ? 'text-green-500' : 'text-red-500'}>Rest: ${restante.toLocaleString()}</span>
                            </div>
                            <Button className="bg-transparent hover:bg-red-500/20 text-red-500 p-2 h-8 w-8 flex items-center justify-center" onClick={() => deleteKey(setGastosVariables, catKey)}>🗑️</Button>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(catVal.subItems).map(([subK, subX]) => (
                              <div key={subK} className="flex items-center gap-2">
                                <Input className="flex-1 text-sm dark:bg-slate-700 dark:border-slate-600" defaultValue={subK} onBlur={(e) => renameSubItem(catKey, subK, e.target.value.trim())} placeholder="Nombre del ítem" />
                                <Input className="w-32 text-sm dark:bg-slate-700 dark:border-slate-600" type="number" value={subX.realFijo} placeholder="Monto" onChange={(e) => handleSubItemChange(catKey, subK, e.target.value)} />
                                <Button className="bg-transparent hover:bg-red-500/20 text-red-500 p-2 h-9 w-9 flex items-center justify-center" onClick={() => deleteSubItem(catKey, subK)}>🗑️</Button>
                              </div>
                            ))}
                            <Button className="w-full h-9 text-sm bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300" onClick={() => addSubItem(catKey)}>+ Añadir ítem</Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  <Button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300" onClick={() => addKey(setGastosVariables, "Categoría", { presupuesto: 0, subItems: {} })}>+ Añadir Categoría</Button>
                </CardContent>
              </Card>
            </AccordionContentWrapper>
          </AccordionItem>
        </Accordion>

        {/* --- Chart Section --- */}
        <div className="text-center">
            <Button className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600" onClick={() => setShowChart(!showChart)}>
                {showChart ? 'Ocultar Gráfico' : '📊 Ver Gráfico'}
            </Button>
        </div>

        {showChart && (
            <Card className="bg-white dark:bg-slate-900">
                <CardContent>
                    <h3 className="text-center font-semibold mb-4 text-slate-900 dark:text-white">Distribución de Gastos Fijos</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="name"
                                    labelLine={false}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                        return (
                                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="bold">
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                        );
                                    }}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconSize={10} wrapperStyle={{fontSize: "12px"}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-10 text-slate-500">
                            No hay datos de gastos para mostrar en el gráfico.
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        {/* --- Summary & Export --- */}
        <Card className="bg-white dark:bg-slate-900">
          <CardContent className="space-y-2 text-sm p-4">
              <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Resumen Mensual</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <p><strong>Ingresos Fijos:</strong></p><p className="text-right">${totalFixedIngresos.toLocaleString()}</p>
                  <p><strong>Ingresos Variables:</strong></p><p className="text-right">${totalIngresosVariables.toLocaleString()}</p>
                  <p className="col-span-2 border-b my-2 dark:border-slate-700"></p>
                  <p>Gastos Fijos:</p><p className="text-right">-${totalGastosFijos.toLocaleString()} <span className="text-slate-400">({percent(totalGastosFijos)}%)</span></p>
                  <p>Gastos Sin Culpa:</p><p className="text-right">-${totalNoGuilt.toLocaleString()} <span className="text-slate-400">({percent(totalNoGuilt)}%)</span></p>
                  <p>Inversión Fija:</p><p className="text-right">-${totalInvFijo.toLocaleString()} <span className="text-slate-400">({percent(totalInvFijo)}%)</span></p>
                  <p>Ahorro Fijo:</p><p className="text-right">-${totalAhrFijo.toLocaleString()} <span className="text-slate-400">({percent(totalAhrFijo)}%)</span></p>
                  <p>Gastos Variables:</p><p className="text-right">-${totalGVarFijo.toLocaleString()} <span className="text-slate-400">({percent(totalGVarFijo)}%)</span></p>
                  <p className="col-span-2 border-b my-2 dark:border-slate-700"></p>
                  <p className={`font-semibold`}>Disponible Fijo:</p><p className={`text-right font-semibold ${disponibleFijo >= 0 ? "text-green-500" : "text-red-500"}`}>${disponibleFijo.toLocaleString()} <span className="text-slate-400">({percent(disponibleFijo)}%)</span></p>
                  <p className={`font-semibold`}>Disponible Variable:</p><p className={`text-right font-semibold ${disponibleVar >= 0 ? "text-green-500" : "text-red-500"}`}>${disponibleVar.toLocaleString()} <span className="text-slate-400">({percentVar(disponibleVar)}%)</span></p>
              </div>
            <Button className="mt-4 w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={exportCSV}>Exportar a CSV</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Default export for the app
export default function App() {
    return <FinanzasPersonales />;
}
