from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from gemini_client import generate_response
from formalizer import formalize_puzzle
from dynamic_solver import solve_dynamic_puzzle
from validator import validate_against_constraints


app = FastAPI(title="Neuro-Symbolic Seating Puzzle API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PuzzleRequest(BaseModel):
    puzzle: str


@app.get("/")
def root():
    return {"message": "Neuro-Symbolic Seating Puzzle API Running"}


# ===============================
# 🧠 BASELINE LLM ENDPOINT
# ===============================
@app.post("/baseline")
def baseline_solver(request: PuzzleRequest):

    prompt = f"""
Solve this seating puzzle step-by-step.
Then provide final answer in STRICT format:

Final Seating Order:
Seat 1: <Name>
Seat 2: <Name>
Seat 3: <Name>
Seat 4: <Name>
Seat 5: <Name>
Seat 6: <Name>

Puzzle:
{request.puzzle}
"""

    # 1️⃣ Get baseline reasoning
    response = generate_response(prompt)

    # 2️⃣ Formalize puzzle dynamically
    structured_data = formalize_puzzle(request.puzzle)

    # 3️⃣ Validate baseline against constraints
    validation = validate_against_constraints(response, structured_data)

    return {
        "model": "baseline_llm",
        "raw_response": response,
        "structured_representation": structured_data,
        "validation": validation
    }


# ===============================
# ⚙ NEURO-SYMBOLIC ENDPOINT
# ===============================
@app.post("/neurosymbolic")
def neurosymbolic_solver(request: PuzzleRequest):

    # 1️⃣ Formalize puzzle
    structured_data = formalize_puzzle(request.puzzle)

    # 2️⃣ Solve using dynamic symbolic solver
    solutions = solve_dynamic_puzzle(structured_data)

    return {
        "model": "neuro_symbolic",
        "structured_representation": structured_data,
        "total_solutions": len(solutions),
        "solutions": solutions
    }