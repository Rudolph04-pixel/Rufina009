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
const LS_KEY = "finanzas-personales-v1";

const createBlobLink = (content, filename) => {
  const blob = new Blob([content], { type:"text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* ───────────── Component ───────────── */
export default function FinanzasPersonales() {
  /* Tema oscuro */
  const [darkMode,setDarkMode] = useState(false);
  useEffect(()=>{
    document.documentElement.classList.toggle("dark", darkMode);
  },[darkMode]);

  /* Periodo */
  const today = new Date();
  const [selectedMonth,setSelectedMonth] = useState(String(today.getMonth()));
  const [selectedYear ,setSelectedYear ] = useState(String(today.getFullYear()));

  /* Estado */
  const [ingresos,setIngresos] = useState({
    A:{valor:"",tipo:"fijo"},
    B:{valor:"",tipo:"fijo"},
    C:{valor:"",tipo:"fijo"},
    D:{valor:"",tipo:"fijo"},
    E:{valor:"",tipo:"fijo"}
  });
  const [gastosFijos,setGastosFijos] = useState({ /* ...igual que antes...*/ });
  const [noGuiltSpend,setNoGuiltSpend] = useState({});
  const [inversion,setInversion] = useState({ /* ...igual que antes...*/ });
  const [ahorro,setAhorro] = useState({ /* ...igual que antes...*/ });
  const [gastosVariables,setGastosVariables] = useState({ /* ...igual que antes...*/ });

  /* Persistencia */
  useEffect(()=>{
    try{
      const d = JSON.parse(localStorage.getItem(LS_KEY));
      if(!d) return;
      d.ingresos        && setIngresos(d.ingresos);
      d.gastosFijos     && setGastosFijos(d.gastosFijos);
      d.noGuiltSpend    && setNoGuiltSpend(d.noGuiltSpend);
      d.inversion       && setInversion(d.inversion);
      d.ahorro          && setAhorro(d.ahorro);
      d.gastosVariables && setGastosVariables(d.gastosVariables);
      d.selectedMonth   && setSelectedMonth(d.selectedMonth);
      d.selectedYear    && setSelectedYear(d.selectedYear);
    }catch{}
  },[]);
  useEffect(()=>{
    localStorage.setItem(LS_KEY,JSON.stringify({
      ingresos,gastosFijos,noGuiltSpend,
      inversion,ahorro,gastosVariables,
      selectedMonth,selectedYear
    }));
  },[
    ingresos,gastosFijos,noGuiltSpend,
    inversion,ahorro,gastosVariables,
    selectedMonth,selectedYear
  ]);

  /* Cálculos */
  const sumSingle = o => Object.values(o).reduce((s,x)=>s+Number(x.real||0),0);
  const sumDual   = o => Object.values(o).reduce((s,x)=>s+Number(x.realFijo||0)+Number(x.realVariable||0),0);

  const totalIngresosNominal   = Object.values(ingresos).reduce((s,i)=>s+Number(i.valor||0),0);
  const totalFixedIngresos     = Object.values(ingresos).reduce((s,i)=>i.tipo==="fijo"?s+Number(i.valor||0):s,0);
  const totalIngresosVariables = Object.values(ingresos).reduce((s,i)=>i.tipo==="variable"?s+Number(i.valor||0):s,0);

  const totalGastosFijos = sumSingle(gastosFijos);
  const totalNoGuilt    = Object.values(noGuiltSpend).reduce((s,v)=>s+Number(v||0),0);

  const totalInvFijo = Object.values(inversion).reduce((s,x)=>s+Number(x.realFijo||0),0);
  const totalInvVar  = Object.values(inversion).reduce((s,x)=>s+Number(x.realVariable||0),0);

  const totalAhrFijo = Object.values(ahorro).reduce((s,x)=>s+Number(x.realFijo||0),0);
  const totalAhrVar  = Object.values(ahorro).reduce((s,x)=>s+Number(x.realVariable||0),0);

  const totalGVarFijo = Object.values(gastosVariables).reduce((s,x)=>s+Number(x.realFijo||0),0);
  const totalGVarVar  = Object.values(gastosVariables).reduce((s,x)=>s+Number(x.realVariable||0),0);

  const totalInversion  = totalInvFijo + totalInvVar;
  const totalAhorro     = totalAhrFijo + totalAhrVar;
  const totalGastosVars = totalGVarFijo + totalGVarVar;

  const totalGastos = totalGastosFijos
    + totalNoGuilt
    + totalInversion
    + totalAhorro
    + totalGastosVars;

  const percent    = v => totalFixedIngresos ? ((v/totalFixedIngresos)*100).toFixed(1) : "0.0";
  const percentVar = v => totalIngresosVariables ? ((v/totalIngresosVariables)*100).toFixed(1) : "0.0";

  // Pool restante de variables
  const totalAssignedVar = totalInvVar + totalAhrVar + totalGVarVar;
  const remainingVarPool = totalIngresosVariables - totalAssignedVar;

  // Disponibles
  const disponibleFijo = totalFixedIngresos
    - ( totalGastosFijos + totalInvFijo + totalAhrFijo + totalGVarFijo );
  const disponibleVar  = remainingVarPool;

  /* Handlers */
  const handleIngresoChange       = (k,f,v) => setIngresos(p=>({...p,[k]:{...p[k],[f]:v}}));
  const handleGastoFijoRealChange = (k,v) => setGastosFijos(p=>({...p,[k]:{...p[k],real:v}}));
  const handleNoGuiltChange       = (k,v) => setNoGuiltSpend(p=>({...p,[k]:v}));

  const dualHandler = setter => (k,f,v) => {
    // clamp to pool
    let num = Number(v)||0;
    const current = Number(setter===setInversion?inversion[k].realVariable:
                           setter===setAhorro   ?ahorro[k].realVariable:
                           gastosVariables[k].realVariable);
    const maxAllowed = current + remainingVarPool;
    if(num > maxAllowed) num = maxAllowed;
    setter(p=>({...p,[k]:{...p[k],[f]:String(num)}}));
  };
  const handleInvChange  = dualHandler(setInversion);
  const handleAhorChange = dualHandler(setAhorro);
  const handleVarChange  = dualHandler(setGastosVariables);

  const addKey = (setter,label) => setter(p=>({
    ...p,
    [`${label} ${Object.keys(p).length+1}`]:{presupuesto:0,realFijo:"",realVariable:""}
  }));
  const deleteKey = (setter,k) => setter(p=>{
    const {[k]:_,...rest}=p; return rest;
  });

  /* Export CSV */
  const exportCSV = () => {
    const rows=[["Cat","Item","Pres","RFijo","%RF","RVar","%RV","Mes","Año"]];
    const pushSingle = (cat,obj)=>Object.entries(obj).forEach(([k,x])=>{
      const rf=Number(x.real||0);
      rows.push([cat,k,x.presupuesto,rf,percent(rf),"-","-",months[selectedMonth],selectedYear]);
    });
    const pushDual = (cat,obj)=>Object.entries(obj).forEach(([k,x])=>{
      const rf=Number(x.realFijo||0), rv=Number(x.realVariable||0);
      rows.push([cat,k,x.presupuesto,rf,percent(rf),rv,percentVar(rv),months[selectedMonth],selectedYear]);
    });

    pushSingle("Gastos Fijos",gastosFijos);
    Object.entries(noGuiltSpend).forEach(([k,v])=>{
      const rv=Number(v||0);
      rows.push(["No Guilt",k,"-",rv,percent(rv),"-","-",months[selectedMonth],selectedYear]);
    });
    pushDual("Inversión",inversion);
    pushDual("Ahorro",ahorro);
    pushDual("Gastos Variables",gastosVariables);

    createBlobLink(rows.map(r=>r.join(",")).join("\n"),
      `estado-financiero-${months[selectedMonth]}-${selectedYear}.csv`
    );
  };

  /* Render */
  return (
    <div className="min-h-screen bg-brand-100 p-4 space-y-4">

      {/* Top Bar */}
      <div className="flex items-center gap-2">
        <Card className="flex-1">
          <CardContent className="p-4 grid grid-cols-2 gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Mes"/></SelectTrigger>
              <SelectContent>
                {months.map((m,i)=><SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={selectedYear}
              onChange={e=>setSelectedYear(e.target.value)}
              placeholder="Año"
            />
          </CardContent>
        </Card>
        <Button variant="outline" onClick={()=>setDarkMode(!darkMode)}>
          {darkMode?"Modo Claro":"Modo Oscuro"}
        </Button>
      </div>

      {/* Ingresos */}
      <Card>
        <CardContent className="space-y-2">
          <h2 className="text-brand-500 font-semibold">Ingresos</h2>
          {Object.entries(ingresos).map(([k,v])=>(
            <div key={k} className="grid grid-cols-5 gap-2 items-center text-xs">
              <Input
                type="number"
                value={v.valor}
                placeholder={`Ingreso ${k}`}
                onChange={e=>handleIngresoChange(k,"valor",e.target.value)}
              />
              <Select
                value={v.tipo}
                onValueChange={val=>handleIngresoChange(k,"tipo",val)}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Tipo"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fijo">Fijo</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-gray-500">{v.tipo}</span>
              <span className="text-right text-gray-500">
                {v.tipo==="fijo"?`${percent(Number(v.valor||0))}%`:"-"}
              </span>
            </div>
          ))}
          <p className="font-bold text-sm">
            Ingresos totales: ${totalIngresosNominal.toLocaleString()}
            <span className="text-xs text-gray-600">  ({totalIngresosVariables.toLocaleString()} variables)</span>
          </p>
        </CardContent>
      </Card>

      {/* ... luego los bloques de Gastos Fijos, No Guilt, etc. igual que antes */}

      {/* Bloques Inversión / Ahorro / Gastos Variables */}
      {[
        {label:"Inversión",   data:inversion,   setter:setInversion,   handler:handleInvChange},
        {label:"Ahorro",      data:ahorro,      setter:setAhorro,      handler:handleAhorChange},
        {label:"Gasto variable", data:gastosVariables, setter:setGastosVariables, handler:handleVarChange}
      ].map(({label,data,setter,handler})=>{
        // cálculos de porcentajes para el título
        const fixedSum = Object.values(data).reduce((s,x)=>s+Number(x.realFijo||0),0);
        const varSum   = Object.values(data).reduce((s,x)=>s+Number(x.realVariable||0),0);
        return (
          <Card key={label}>
            <CardContent className="space-y-2">
              <h2 className="font-semibold text-lg">
                {label} — Fijo: {percent(fixedSum)}% | Variable: {percentVar(varSum)}%
              </h2>
              {/* columnas */}
              <div className="grid grid-cols-7 gap-2 text-[11px] font-medium">
                <span>Item</span><span>Pres</span>
                <span>Real fijo</span><span>%RF</span>
                <span>Real var</span><span>%RV</span><span/>
              </div>
              {Object.entries(data).map(([k,x])=>{
                const rf=Number(x.realFijo||0), rv=Number(x.realVariable||0);
                const maxVar = rv + remainingVarPool;
                return (
                  <div key={k} className="grid grid-cols-7 gap-2 items-center text-xs">
                    <span>{k}</span>
                    <span>${x.presupuesto.toLocaleString()}</span>
                    <Input
                      type="number" value={x.realFijo}
                      onChange={e=>handler(k,"realFijo",e.target.value)}
                    />
                    <span>{percent(rf)}%</span>
                    <Input
                      type="number"
                      value={x.realVariable}
                      max={maxVar}
                      onChange={e=>handler(k,"realVariable",e.target.value)}
                    />
                    <span>{percentVar(rv)}%</span>
                    <Button size="icon" variant="ghost" onClick={()=>deleteKey(setter,k)}>🗑</Button>
                  </div>
                );
              })}
              <Button size="sm" onClick={()=>addKey(setter,label)}>
                Añadir {label.toLowerCase()}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {/* Resumen & Export */}
      <Card>
        <CardContent className="space-y-1 text-sm">
          <p><strong>Ingresos fijos (100%):</strong> ${totalFixedIngresos.toLocaleString()}</p>
          <p><strong>Ingresos variables:</strong> ${totalIngresosVariables.toLocaleString()}</p>

          <p>Gastos Fijos: ${totalGastosFijos.toLocaleString()} ({percent(totalGastosFijos)}%)</p>
          <p>No Guilt Spend: ${totalNoGuilt.toLocaleString()} ({percent(totalNoGuilt)}%)</p>

          <p>Inversión fijo: ${totalInvFijo.toLocaleString()} ({percent(totalInvFijo)}%)</p>
          <p>Inversión var: ${totalInvVar.toLocaleString()} ({percentVar(totalInvVar)}%)</p>

          <p>Ahorro fijo: ${totalAhrFijo.toLocaleString()} ({percent(totalAhrFijo)}%)</p>
          <p>Ahorro var: ${totalAhrVar.toLocaleString()} ({percentVar(totalAhrVar)}%)</p>

          <p>Variables fijo: ${totalGVarFijo.toLocaleString()} ({percent(totalGVarFijo)}%)</p>
          <p>Variables var: ${totalGVarVar.toLocaleString()} ({percentVar(totalGVarVar)}%)</p>

          <p className="text-sm font-semibold">
            Disponible fijo: ${disponibleFijo.toLocaleString()} ({percent(disponibleFijo)}%)
          </p>
          <p className="text-sm font-semibold">
            Disponible var: ${disponibleVar.toLocaleString()} ({percentVar(disponibleVar)}%)
          </p>

          <p className="font-bold pt-2">
            Balance (nominal): ${(totalIngresosNominal - totalGastos).toLocaleString()}
          </p>

          <Button className="mt-2 w-full" onClick={exportCSV}>
            Exportar CSV
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
