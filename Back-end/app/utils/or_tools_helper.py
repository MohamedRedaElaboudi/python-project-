from ortools.sat.python import cp_model

def generate_planning(soutenances, salles):
    model = cp_model.CpModel()
    x = {}

    for s in soutenances:
        for r in salles:
            x[(s["id"], r["id"])] = model.NewBoolVar(
                f"s{s['id']}_r{r['id']}"
            )

    # une seule salle par soutenance
    for s in soutenances:
        model.Add(sum(x[(s["id"], r["id"])] for r in salles) == 1)

    # une seule soutenance par salle
    for r in salles:
        model.Add(sum(x[(s["id"], r["id"])] for s in soutenances) <= 1)

    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status != cp_model.OPTIMAL:
        return None

    result = []
    for s in soutenances:
        for r in salles:
            if solver.Value(x[(s["id"], r["id"])]):
                result.append({
                    "soutenance_id": s["id"],
                    "salle_id": r["id"]
                })
    return result
