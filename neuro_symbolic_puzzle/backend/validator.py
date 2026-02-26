import re


def extract_seating_order(text):
    pattern = r"Seat\s*(\d+):\s*(\w+)"
    matches = re.findall(pattern, text)

    seating = {}

    for seat, name in matches:
        seating[name] = int(seat)

    return seating


def check_constraints(seating, structured_data):
    violations = []

    for constraint in structured_data["constraints"]:
        ctype = constraint["type"]

        if ctype == "not_position":
            if seating.get(constraint["person"]) == constraint["position"]:
                violations.append(
                    f'{constraint["person"]} cannot be at seat {constraint["position"]}'
                )

        elif ctype == "left_of":
            if seating.get(constraint["left"]) >= seating.get(constraint["right"]):
                violations.append(
                    f'{constraint["left"]} must be left of {constraint["right"]}'
                )

        elif ctype == "right_of":
            if seating.get(constraint["left"]) <= seating.get(constraint["right"]):
                violations.append(
                    f'{constraint["left"]} must be right of {constraint["right"]}'
                )

        elif ctype == "not_adjacent":
            if abs(seating.get(constraint["person1"]) -
                   seating.get(constraint["person2"])) == 1:
                violations.append(
                    f'{constraint["person1"]} cannot be adjacent to {constraint["person2"]}'
                )

        elif ctype == "adjacent":
            if abs(seating.get(constraint["person1"]) -
                   seating.get(constraint["person2"])) != 1:
                violations.append(
                    f'{constraint["person1"]} must be adjacent to {constraint["person2"]}'
                )

        elif ctype == "immediate_right":
            if seating.get(constraint["person1"]) != seating.get(constraint["person2"]) + 1:
                violations.append(
                    f'{constraint["person1"]} must sit immediately to the right of {constraint["person2"]}'
                )

        elif ctype == "immediate_left":
            if seating.get(constraint["person1"]) != seating.get(constraint["person2"]) - 1:
                violations.append(
                    f'{constraint["person1"]} must sit immediately to the left of {constraint["person2"]}'
                )

    return violations


def validate_against_constraints(baseline_text, structured_data):
    seating = extract_seating_order(baseline_text)

    violations = check_constraints(seating, structured_data)

    return {
        "valid": len(violations) == 0,
        "baseline_solution": seating,
        "violations": violations
    }