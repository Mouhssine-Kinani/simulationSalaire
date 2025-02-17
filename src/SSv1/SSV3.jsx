import { useState } from "react";

function Test3() {
  const [Net, setNet] = useState("");
  const [resultat, setResultat] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const netValue = formatNumber(Net);
    if (netValue === null || netValue <= 0) {
      alert("Veuillez entrer un salaire net valide !");
      return;
    }
    rechercheSalaireBase(netValue);
  };

  // Fonction de formatage pour accepter 9200 | 9200.00 | 9200,00 | 9200,02 | 9200.02
  const formatNumber = (input) => {
    let str = input.trim();
    // Remplacer toutes les virgules par des points
    if (str.includes(",")) {
      str = str.replace(/,/g, ".");
    }
    // Valider que l'entrée est un nombre (au moins un chiffre, optionnellement un point suivi de chiffres)
    if (!/^(\d+(\.\d+)?)$/.test(str)) {
      return null;
    }
    return parseFloat(str);
  };

  // Recherche du salaire de base par dichotomie afin d'obtenir le NAP souhaité
  const rechercheSalaireBase = (netSouhaite) => {
    let minSalaire = netSouhaite / 2;
    let maxSalaire = netSouhaite * 2;
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

  // Fonction de calcul qui intègre le calcul dynamique de l'IR
  const calcule = (salaireDeBase) => {
    const salaireDB = parseFloat(salaireDeBase) || 0;

    // Indemnités
    const indemniteDeTransport = 500;
    const indemniteDePanier = 780;
    const indemDeplacement = 1148.3;
    const SalaireBrutEnMAD =
      salaireDB + indemniteDeTransport + indemniteDePanier + indemDeplacement;

    // Cotisations salariales
    const fraisPro = 2019.43;
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

    // Calcul de l'Impôt sur le Revenu (IR) en fonction du SBI
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

    // Autres indemnités
    const conge = 742.84;
    const licenciement = 1609.48;
    const dommageEtInteret = 715.32;
    const preavis = 715.32;
    const CoutTotal =
      conge +
      licenciement +
      dommageEtInteret +
      preavis +
      NAP +
      totalCotisationSalariales +
      TCSpatronal +
      ir;

    return {
      salaireDeBase: salaireDB.toFixed(2),
      salaireBrut: SalaireBrutEnMAD.toFixed(2),
      totalCotisationSalariales: totalCotisationSalariales.toFixed(2),
      TCSpatronal: TCSpatronal.toFixed(2),
      sbi: sbi.toFixed(2),
      IR: ir.toFixed(2),
      nap: NAP.toFixed(2),
      CoutTotal: CoutTotal.toFixed(2),
    };
  };

  return (
    <>
    
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h1>claculer salaire</h1>
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
        <>
          {resultat.error ? (
            <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {resultat.error}
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th colSpan="2" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Résultats du calcul
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Salaire de Base
                    </th>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resultat.salaireDeBase} MAD
                    </td>
                  </tr>
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Salaire Brut
                    </th>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resultat.salaireBrut} MAD
                    </td>
                  </tr>
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total Cotisations Salariales
                    </th>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resultat.totalCotisationSalariales} MAD
                    </td>
                  </tr>
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Cotisations Patronales
                    </th>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resultat.TCSpatronal} MAD
                    </td>
                  </tr>
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Salaire Brut Imposable (SBI)
                    </th>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resultat.sbi} MAD
                    </td>
                  </tr>
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Impôt sur le Revenu (IR)
                    </th>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resultat.IR} MAD
                    </td>
                  </tr>
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Net à Payer (NAP)
                    </th>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resultat.nap} MAD
                    </td>
                  </tr>
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Coût Total
                    </th>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resultat.CoutTotal} MAD
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>

    </>
  );
  
}

export default Test3;
