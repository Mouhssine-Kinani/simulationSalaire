import { useState } from "react";

function Form() {
  const [data, setData] = useState({
    salaire: "",
  });

  const [resultat, setResultat] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    traitment(data);
  };

  const traitment = (theSalaire) => {


    let salaireDB = Number(NET.salaire.replace(",", "."));
    if (isNaN(salaireDB)) {
      alert("Veuillez entrer un salaire valide !");
      return;
    }

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

    // Salaire Brut Imposable
    const sbi = salaireDB - (totalCotisationSalariales + fraisPro);
    const prelevmentIR = 370.01;
    const NAP = SalaireBrutEnMAD - (totalCotisationSalariales + prelevmentIR);

    const total = NAP + totalCotisationSalariales + TCSpatronal + prelevmentIR;
    //auter
    const conge = 742.84;
    const licenciement = 1609.48;
    const dommageEtInteret = 715.32;
    const preavis = 715.32;

    const coutTotal = conge + licenciement + dommageEtInteret + preavis + total;

    setResultat({
      salaireBrut: SalaireBrutEnMAD.toFixed(2),
      totalCotisationSalariales: totalCotisationSalariales.toFixed(2),
      TCSpatronal: TCSpatronal.toFixed(2),
      sbi: sbi.toFixed(2),
      IR: prelevmentIR,
      nap: NAP.toFixed(2),
      CoutTotal: coutTotal.toFixed(2),
    });
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-lg">
          <h2 className="text-3xl font-bold mb-4 text-center">Formulaire</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-lg font-semibold w-1/2">
                Salaire de Base :
              </label>
              <input
                type="text"
                className="w-1/2 p-2 bg-gray-700 rounded border border-gray-600 focus:ring-2 focus:ring-purple-500"
                name="salaire"
                value={data.salaire}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
              Soumettre
            </button>
          </form>
          {resultat && (
            <table className="w-full mt-6 bg-gray-800 text-white rounded-lg border border-gray-600">
              <tbody>
                <tr className="bg-gray-700 border-b border-gray-600">
                  <td className="border-r border-gray-600 p-3">Salaire Brut</td>
                  <td className="p-3">{resultat.salaireBrut}</td>
                </tr>
                <tr className="bg-gray-800 border-b border-gray-600">
                  <td className="border-r border-gray-600 p-3">
                    Salaire net a payer
                  </td>
                  <td className="p-3">{resultat.nap}</td>
                </tr>
                <tr className="bg-gray-700 border-b border-gray-600">
                  <td className="border-r border-gray-600 p-3">
                    Total Cotisations Salariales
                  </td>
                  <td className="p-3">{resultat.totalCotisationSalariales}</td>
                </tr>
                <tr className="bg-gray-800 border-b border-gray-600">
                  <td className="border-r border-gray-600 p-3">
                    Total Cotisations Patronales
                  </td>
                  <td className="p-3">{resultat.TCSpatronal}</td>
                </tr>
                <tr className="bg-gray-700 border-b border-gray-600">
                  <td className="border-r border-gray-600 p-3">
                    Salaire Brut Imposable
                  </td>
                  <td className="p-3">{resultat.sbi}</td>
                </tr>
                <tr className="bg-gray-800 border-b border-gray-600">
                  <td className="border-r border-gray-600 p-3">IR</td>
                  <td className="p-3">{resultat.IR}</td>
                </tr>
                <tr className="bg-gray-700">
                  <td className="border-r border-gray-600 p-3">Cout total</td>
                  <td className="p-3">{resultat.CoutTotal}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default Form;