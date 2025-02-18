import { useState } from "react";
import Swal from "sweetalert2";

function CalcByNet() {
  const [netInput, setNetInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Charges fixes utilisées dans le calcul
  const chargeFixe = {
    transport: 500,
    panier: 780,
    deplacement: 1148.3,
    representation: 0,
    // Valeur par défaut qui pourra être recalculée en fonction du salaire
    fraisProfessionel: 2916.67,
  };

  // Cette fonction calcule tous les indicateurs à partir d'un salaire de base proposé
  // et renvoie un objet contenant :
  // - NAP : le net à payer (arrondi avec Math.floor pour faciliter la comparaison)
  // - details : un objet contenant tous les indicateurs formatés
  function calcSalaire(guessSalBase) {
    const salaireBase = guessSalBase;
    // Calcul du salaire brut (en ajoutant les charges fixes hors fraisProfessionel)
    const salaireBrut =
      salaireBase +
      chargeFixe.transport +
      chargeFixe.panier +
      chargeFixe.deplacement +
      chargeFixe.representation;

    // Pour les cotisations, on utilise une logique similaire :
    // On applique une cotisation sur le salaire de base (avec un plafond pour la CNSS)
    const salaireBaseCnss = Math.min(salaireBase, 6000);
    const cotisationsSal =
      salaireBaseCnss * 0.0448 + salaireBase * 0.0226 + salaireBase * 0.06;

    // Cotisations patronales (calculées selon des taux donnés)
    const cotisationPatronale =
      salaireBaseCnss * 0.0898 +
      salaireBase * 0.0226 +
      salaireBase * 0.0185 +
      salaireBase * 0.064 +
      salaireBase * 0.016 +
      150 +
      salaireBase * 0.078 +
      salaireBase * 0.009;

    // Calcul des frais professionnels
    // Ici, on simule la fonction calculFraisProfessionel avec une formule simple
    const fraisProfessionel =
      salaireBase * 0.25 < 2916.67 ? salaireBase * 0.25 : 2916.67;
    chargeFixe.fraisProfessionel = fraisProfessionel;

    // Salaire de base imposable = salaire de base - cotisations - frais professionnels
    const salaireBaseImposable =
      salaireBase - cotisationsSal - fraisProfessionel;

    // Calcul de l'impôt sur le revenu (IR) en fonction de tranches
    let ir;
    if (salaireBaseImposable > 15000) {
      ir = salaireBaseImposable * 0.38 - 2033.33;
    } else if (salaireBaseImposable > 6666.67) {
      ir = salaireBaseImposable * 0.34 - 1433.33;
    } else if (salaireBaseImposable > 5000) {
      ir = salaireBaseImposable * 0.3 - 1166.67;
    } else if (salaireBaseImposable > 4166.67) {
      ir = salaireBaseImposable * 0.2 - 666.67;
    } else if (salaireBaseImposable > 2500) {
      ir = salaireBaseImposable * 0.1 - 250;
    } else {
      ir = 0;
    }

    // Calcul du Net à Payer (NAP)
    const NAP = salaireBrut - (cotisationsSal + ir);

    // Calcul du coût total de l'emploi
    const coutTotal = NAP + cotisationsSal + ir + cotisationPatronale;
    // Calcul d'indemnités complémentaires
    const conge = (coutTotal / 26) * 1.5;
    const licenciement = (coutTotal * 1.5 * 3) / 36;
    const dommage = (coutTotal * 0.5 * 3) / 36;
    const preavis = (coutTotal * 2) / 36;
    const coutTotalAddedCharge =
      coutTotal + conge + licenciement + dommage + preavis;

    // Création d'un objet détaillé à afficher
    const resultsObj = {
      salaireBase: salaireBase.toFixed(2),
      salaireBrut: salaireBrut.toFixed(2),
      cotisationsSal: cotisationsSal.toFixed(2),
      cotisationPatronale: cotisationPatronale.toFixed(2),
      salaireBaseImposable: salaireBaseImposable.toFixed(2),
      IR: ir.toFixed(2),
      nap: Math.floor(NAP), // arrondi pour faciliter la comparaison
      coutTotal: coutTotal.toFixed(2),
      coutTotalAddedCharge: coutTotalAddedCharge.toFixed(2),
    };

    return { NAP: Math.floor(NAP), details: resultsObj };
  }

  // Recherche binaire récursive du salaire de base qui permet d'obtenir le NAP souhaité
  function binarySearchSalaireBase(min, max, desiredNAP) {
    // Si l'intervalle est trop petit, on considère qu'on n'a pas trouvé de résultat
    if (max - min <= 1) {
      setError("Aucun salaire de base trouvé pour ce net !");
      return;
    }
    const guessSalBase = Math.floor((min + max) / 2);
    const { NAP: NAPGuess, details } = calcSalaire(guessSalBase);
    console.log("Guess Salary Base: ", guessSalBase, "NAP: ", NAPGuess);
    if (NAPGuess === desiredNAP) {
      // Mise à jour de l'objet résultat en ajoutant le salaire de base trouvé
      setResult({ salaireBase: guessSalBase.toFixed(2), ...details });
      return;
    } else if (NAPGuess > desiredNAP) {
      return binarySearchSalaireBase(min, guessSalBase, desiredNAP);
    } else {
      return binarySearchSalaireBase(guessSalBase, max, desiredNAP);
    }
  }

  // Fonction qui initialise la recherche avec des bornes adaptées
  function findSalaireBase() {
    const desiredNAP = Math.floor(formatNumber(netInput));
    // Définir des bornes initiales. Ces valeurs peuvent être ajustées en fonction de vos cas.
    const min = Math.floor(desiredNAP / 3);
    const max = desiredNAP * 2;
    binarySearchSalaireBase(min, max, desiredNAP);
  }

  // Fonction pour formater le nombre entré (remplacement de la virgule par un point)
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

  // Gestion du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    const netValue = formatNumber(netInput);
    if (netValue === null || netValue <= 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Veuillez entrer un salaire net valide !",
      });
      return;
    }
    setError(null);
    findSalaireBase();
  };

  return (
    <div className="max-w-md lg:max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4 text-center">Calculer Salaire</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Salaire net souhaité
          </label>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9.,]*"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
            value={netInput}
            onChange={(e) => setNetInput(e.target.value)}
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
      {error && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {result && (
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
                  {result.salaireBase} MAD
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
                  {result.salaireBrut} MAD
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
                  {result.cotisationsSal} MAD
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
                  {result.cotisationPatronale} MAD
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
                  {result.salaireBaseImposable} MAD
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
                  {result.IR} MAD
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
                  {result.nap} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  الصافي للدفع
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Coût Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.coutTotal} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  التكلفة الإجمالية
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Coût Total + Charges
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.coutTotalAddedCharge} MAD
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  التكلفة الإجمالية مع البدلات
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CalcByNet;
