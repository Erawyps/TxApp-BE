import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./FeuilleRouteWebForm.css";

export default function FeuilleRouteWebForm({ data }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: data || {}
  });

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const handleGeneratePDF = async (values) => {
    const input = document.getElementById("feuille-container");
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "pt", [canvas.width, canvas.height]);
    pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
    pdf.save(`feuille_de_route_${values.date || "sans_date"}.pdf`);
  };

  const rows = Array.from({ length: 8 }, (_, i) => i);
  const rowHeight = 23.5;
  const courseStartY = 262;

  return (
    <form className="feuille-wrapper" onSubmit={handleSubmit(handleGeneratePDF)}>
      <div id="feuille-container" className="feuille-container">
        <img
          src="/feuille_de_route_taxi_page1.jpg"
          alt="Feuille de route"
          className="pdf-background"
        />

        {/* Champs principaux */}
        <input className="field" style={{ top: "78px", left: "90px" }} placeholder="Date" {...register("date")} />
        <input className="field" style={{ top: "78px", left: "280px", width: "200px" }} placeholder="Chauffeur" {...register("chauffeur")} />
        <input className="field" style={{ top: "108px", left: "90px" }} placeholder="Plaque" {...register("plaque")} />
        <input className="field" style={{ top: "108px", left: "300px" }} placeholder="N° Identification" {...register("numeroIdentification")} />
        <input className="field" style={{ top: "154px", left: "73px" }} placeholder="Heure Début" {...register("heureDebut")} />
        <input className="field" style={{ top: "154px", left: "130px" }} placeholder="Heure Fin" {...register("heureFin")} />
        <input className="field" style={{ top: "154px", left: "205px" }} placeholder="Interruptions" {...register("interruptions")} />
        <input className="field" style={{ top: "154px", left: "275px" }} placeholder="Total Heures" {...register("totalHeures")} />
        <input className="field" style={{ top: "154px", left: "370px" }} placeholder="KM Début" {...register("kmDebut")} />
        <input className="field" style={{ top: "169px", left: "370px" }} placeholder="KM Fin" {...register("kmFin")} />
        <input className="field" style={{ top: "184px", left: "370px" }} placeholder="KM Parcourus" {...register("kmParcourus")} />

        {/* Courses dynamiques */}
        {rows.map((_, i) => {
          const top = courseStartY + i * rowHeight;
          return (
            <React.Fragment key={i}>
              <input className="field" style={{ top: `${top}px`, left: "37px", width: "18px" }} placeholder={`#${i + 1}`} defaultValue={i + 1} readOnly />
              <input className="field" style={{ top: `${top}px`, left: "57px", width: "28px" }} placeholder="Idx Dép." {...register(`courses.${i}.indexDepart`)} />
              <input className="field" style={{ top: `${top}px`, left: "102px", width: "90px" }} placeholder="Lieu Emb." {...register(`courses.${i}.lieuEmbarquement`)} />
              <input className="field" style={{ top: `${top}px`, left: "193px", width: "50px" }} placeholder="Heure Emb." {...register(`courses.${i}.heureEmbarquement`)} />
              <input className="field" style={{ top: `${top}px`, left: "247px", width: "28px" }} placeholder="Idx Arr." {...register(`courses.${i}.indexArrivee`)} />
              <input className="field" style={{ top: `${top}px`, left: "292px", width: "90px" }} placeholder="Lieu Déb." {...register(`courses.${i}.lieuDebarquement`)} />
              <input className="field" style={{ top: `${top}px`, left: "383px", width: "50px" }} placeholder="Heure Déb." {...register(`courses.${i}.heureDebarquement`)} />
              <input className="field" style={{ top: `${top}px`, left: "437px", width: "50px" }} placeholder="Prix €" {...register(`courses.${i}.prixTaximetre`)} />
              <input className="field" style={{ top: `${top}px`, left: "500px", width: "60px" }} placeholder="Somme €" {...register(`courses.${i}.sommePercue`)} />
            </React.Fragment>
          );
        })}
      </div>

      <button type="submit" className="generate-btn">
        Générer PDF
      </button>
    </form>
  );
}
