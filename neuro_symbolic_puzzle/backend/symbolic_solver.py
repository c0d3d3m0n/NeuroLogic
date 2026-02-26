from z3 import *

def solve_seating_puzzle():
    # Create solver
    solver = Solver()

    # Seat variables (1–4)
    Alice = Int("Alice")
    Bob = Int("Bob")
    Carol = Int("Carol")
    David = Int("David")

    people = [Alice, Bob, Carol, David]

    # Domain constraint: seats 1 to 4
    for person in people:
        solver.add(person >= 1, person <= 4)

    # All seats must be distinct
    solver.add(Distinct(people))

    # Constraints from puzzle
    # 1. Alice not at either end
    solver.add(Alice != 1, Alice != 4)

    # 2. Bob sits to the left of Carol
    solver.add(Bob < Carol)

    # 3. David not next to Alice
    solver.add(Abs(David - Alice) != 1)

    solutions = []

    while solver.check() == sat:
        model = solver.model()

        solution = {
            "Alice": model[Alice].as_long(),
            "Bob": model[Bob].as_long(),
            "Carol": model[Carol].as_long(),
            "David": model[David].as_long()
        }

        solutions.append(solution)

        # Block current solution to find others
        solver.add(Or(
            Alice != solution["Alice"],
            Bob != solution["Bob"],
            Carol != solution["Carol"],
            David != solution["David"]
        ))

    return solutions