import { useState } from "react";
import Swal from "sweetalert2";

function CalcBySb() {
  const [data, setData] = useState({ salaire: "" });
  const [resultat, setResultat] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const salaireValue = data.salaire.trim();
    if (!salaireValue) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Veuillez entrer un salaire de base valide !",
      });
      return;
    }
    calculer(salaireValue);
  };

  const calculer = (salaireStr) => {
    let salaireDB = Number(salaireStr.replace(",", "."));

    if (isNaN(salaireDB)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Veuillez entrer un salaire de base valide !",
      });

      return;
    }
    // if (salaireDB < 3045.96) { // SMIG au Maroc
    //   Swal.fire({
    //     icon: "error",
    //     title: "Oops...",
    //     text: "Le salaire de base doit être au moins de 3045,96 MAD (SMIG au Maroc).",
    //   });
    //   return;
    // }

    // Indemnités
    const indemniteDeTransport = 500;
    const indemniteDePanier = 780;
    const indemDeplacement = 1148.3;
    const SalaireBrutEnMAD =
      salaireDB + indemniteDeTransport + indemniteDePanier + indemDeplacement;

    // Cotisations salariales
    const fraisPro =
      salaireDB * 0.25 < 291667.291667 ? salaireDB * 0.25 : 291667.291667;
    const baseCNSS = Math.min(salaireDB, 6000);
    const RetenueCNSS = baseCNSS * 0.0448;
    const cotisationAMO = salaireDB * 0.0226;
    const CIMR = salaireDB * 0.06;
    const totalCotisationSalariales = RetenueCNSS + cotisationAMO + CIMR;

    // Cotisations patronales
    const RetenueCNSSpatronal = baseCNSS * 0.0898;
    const cotisationAMOpatronal = salaireDB * 0.0226;
    const participationAMOpatronal = salaireDB * 0.0185;
    const cotisationAllFAMpatronal = salaireDB * 0.064;
    const cotisationFormationProf = salaireDB * 0.016;
    const mutuelle = 150;
    const CIMRpatronal = salaireDB * 0.078;
    const ATpatronal = salaireDB * 0.009;
    const TCSpatronal =
      RetenueCNSSpatronal +
      cotisationAMOpatronal +
      participationAMOpatronal +
      cotisationAllFAMpatronal +
      cotisationFormationProf +
      mutuelle +
      CIMRpatronal +
      ATpatronal;
    // Salaire Brut Imposable (SBI)
    const sbi = salaireDB - fraisPro - totalCotisationSalariales;

    // Calcul de l'IR selon les tranches
    let ir;
    if (sbi > 15000) {
      ir = sbi * 0.38 - 2033.33;
    } else if (sbi > 6666.67) {
      ir = sbi * 0.34 - 1433.33;
    } else if (sbi > 5000) {
      ir = sbi * 0.3 - 1166.67;
    } else if (sbi > 4166.67) {
      ir = sbi * 0.2 - 666.67;
    } else if (sbi > 2500) {
      ir = sbi * 0.1 - 250;
    } else {
      ir = 0;
    }

    // Net à Payer (NAP)
    const NAP = SalaireBrutEnMAD - (totalCotisationSalariales + ir);

    // Calcul intermédiaire pour le calcul des indemnités
    const total = NAP + totalCotisationSalariales + TCSpatronal + ir;

    // Autres indemnités
    const conge = (total / 26) * 1.5;
    const licenciement = total * 1.5 * (3 / 36);
    const dommageEtInteret = total * (1 / 2) * (3 / 36);
    const preavis = total * (2 / 36);
    const autresIndemnites = conge + licenciement + dommageEtInteret + preavis;

    // Coût Total
    const CoutTotal =
      autresIndemnites + NAP + totalCotisationSalariales + TCSpatronal + ir;

    const salaierParJour = CoutTotal / 20;
    setResultat({
      salaireDeBase: salaireDB.toFixed(2),
      salaireBrut: SalaireBrutEnMAD.toFixed(2),
      totalCotisationSalariales: totalCotisationSalariales.toFixed(2),
      TCSpatronal: TCSpatronal.toFixed(2),
      sbi: sbi.toFixed(2),
      IR: ir.toFixed(2),
      nap: NAP.toFixed(2),
      autresIndemnites: autresIndemnites.toFixed(2),
      CoutTotal: CoutTotal.toFixed(2),
      salaierParJour: salaierParJour.toFixed(2),
    });
  };

  return (
    <div className="max-w-md lg:max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4 text-center">
        Calculer par Salaire de Base
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Salaire de Base :
          </label>
          <input
            type="text"
            name="salaire"
            value={data.salaire}
            onChange={handleChange}
            placeholder="Ex: 5000,00"
            inputMode="decimal"
            pattern="[0-9.,]*"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
        >
          Calculer
        </button>
      </form>
      {resultat && (
        <div className="mt-6 overflow-x-auto lg:overflow-x-visible">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Libellé
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Valeur
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  الترجمة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Salaire de Base
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resultat.salaireDeBase} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  الراتب الأساسي
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Salaire Brut
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resultat.salaireBrut} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  الراتب الإجمالي
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Total Cotisations Salariales
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resultat.totalCotisationSalariales} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  إجمالي الاشتراكات العمالية
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Cotisations Patronales
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resultat.TCSpatronal} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  اشتراكات صاحب العمل
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Salaire Brut Imposable (SBI)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resultat.sbi} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  الراتب الخاضع للضريبة
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Impôt sur le Revenu (IR)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resultat.IR} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ضريبة الدخل
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Net à Payer (NAP)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resultat.nap} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  الصافي للدفع
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Autres indemnités
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resultat.autresIndemnites} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  بدلات أخرى
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Coût Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resultat.CoutTotal} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  التكلفة الإجمالية
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  salaire par jour
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {resultat.salaierParJour} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  الراتب يوميا
                </td>
              </tr>
              {/* ... autres lignes du tableau ... */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CalcBySb;
