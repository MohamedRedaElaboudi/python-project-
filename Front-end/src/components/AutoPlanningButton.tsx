import { autoAssign } from "../services/soutenances";

export default function AutoPlanningButton() {
  return (
    <button onClick={() => autoAssign().then(() => alert("Planning généré"))}>
      Générer planning automatiquement
    </button>
  );
}
