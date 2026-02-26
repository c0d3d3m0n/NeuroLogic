from z3 import *

def solve_dynamic_puzzle(data):
    solver = Solver()

    seat_count = data["seat_count"]
    people_names = data["people"]

    # Create variables dynamically
    people = {name: Int(name) for name in people_names}

    # Domain constraints
    for person in people.values():
        solver.add(person >= 1, person <= seat_count)

    # Distinct seats
    solver.add(Distinct(list(people.values())))

    # Add constraints
    for constraint in data["constraints"]:
        ctype = constraint["type"]

        if ctype == "not_position":
            solver.add(people[constraint["person"]] != constraint["position"])

        elif ctype == "left_of":
            solver.add(people[constraint["left"]] < people[constraint["right"]])

        elif ctype == "right_of":
            solver.add(people[constraint["left"]] > people[constraint["right"]])

        elif ctype == "not_adjacent":
            solver.add(Abs(
                people[constraint["person1"]] - people[constraint["person2"]]
            ) != 1)

        elif ctype == "adjacent":
            solver.add(Abs(
                people[constraint["person1"]] - people[constraint["person2"]]
            ) == 1)

        elif ctype == "immediate_right":
            solver.add(
                people[constraint["person1"]] ==
                people[constraint["person2"]] + 1
            )

        elif ctype == "immediate_left":
            solver.add(
                people[constraint["person1"]] ==
                people[constraint["person2"]] - 1
            )

    solutions = []

    while solver.check() == sat:
        model = solver.model()
        solution = {name: model[people[name]].as_long() for name in people}
        solutions.append(solution)

        solver.add(Or([people[name] != solution[name] for name in people]))

    return solutions