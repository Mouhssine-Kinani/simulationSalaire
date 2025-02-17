import { useState } from "react";
import Swal from "sweetalert2";

function CalcByNet() {
  const [Net, setNet] = useState("");
  const [resultat, setResultat] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const netValue = formatNumber(Net);
    if (netValue === null || netValue <= 0) {
      // alert("Veuillez entrer un salaire net valide !");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Veuillez entrer un salaire net valide !",
      });
      return;
    }
    rechercheSalaireBase(netValue);
  };

  const formatNumber = (input) => {
    let str = input.trim();
    if (str.includes(",")) {
      str = str.replace(/,/g, ".");
    }
    if (!/^(\d+(\.\d+)?)$/.test(str)) {
      return null;
    }
    return parseFloat(str);
  };

  const rechercheSalaireBase = (netSouhaite) => {
    let minSalaire = netSouhaite / 100;
    let maxSalaire = netSouhaite * 100 ;
    const precision = 0.01;
    let calcResult = null;

    while (minSalaire <= maxSalaire) {
      const midSalaire = (minSalaire + maxSalaire) / 2;
      calcResult = calcule(midSalaire);
      const netCalcule = parseFloat(calcResult.nap);
      if (Math.abs(netCalcule - netSouhaite) < precision) {
        setResultat(calcResult);
        return;
      } else if (netCalcule < netSouhaite) {
        minSalaire = midSalaire + precision;
      } else {
        maxSalaire = midSalaire - precision;
      }
    }
    setResultat({ error: "Aucun salaire de base trouvé pour ce net !" });
  };

  // Fonction de calcul
  const calcule = (salaireDeBase) => {
    const salaireDB = parseFloat(salaireDeBase) || 0;

    // Indemnités
    const indemniteDeTransport = 500;
    const indemniteDePanier = 780;
    const indemDeplacement = 1148.3;
    const SalaireBrutEnMAD =
      salaireDB + indemniteDeTransport + indemniteDePanier + indemDeplacement;

    // Cotisations salariales
const fraisPro = salaireDB * 2.5 < 291667.291667 ? salaireDB * 2.5 : 291667.291667;

    const baseCNSS = Math.min(salaireDB, 6000);
    const RetenueCNSS = baseCNSS * 0.0448;
    const cotisationAMO = salaireDB * 0.0226;
    const CIMR = salaireDB * 0.06;
    const totalCotisationSalariales = RetenueCNSS + cotisationAMO + CIMR;

    // Cotisations patronales
    const RetenueCNSSpatronal = baseCNSS * 0.0889;
    const contisationAMOpatronal = salaireDB * 0.0226;
    const participationAMOpatronal = salaireDB * 0.0185;
    const cotisationAllFAMpatronal = salaireDB * 0.064;
    const cotisationFormationProf = salaireDB * 0.016;
    const mutuelle = salaireDB * 0.02;
    const CIMRpatronal = salaireDB * 0.078;
    const ATpatronal = salaireDB * 0.009;
    const TCSpatronal =
      RetenueCNSSpatronal +
      contisationAMOpatronal +
      participationAMOpatronal +
      cotisationAllFAMpatronal +
      cotisationFormationProf +
      mutuelle +
      CIMRpatronal +
      ATpatronal;

    // Salaire Brut Imposable (SBI)
    const sbi = salaireDB - (totalCotisationSalariales + fraisPro);

    // Calcul de l'IR
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
    // const prixDeVente = 6500;

    return {
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
    };
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4 text-center">Calculer Salaire</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Salaire net souhaité
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            value={Net}
            onChange={(e) => setNet(e.target.value)}
            placeholder="Ex: 9200,00 ou 9200.00 ou 9200"
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
        <div className="mt-6 overflow-x-auto">
          {resultat.error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {resultat.error}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
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
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default CalcByNet;
