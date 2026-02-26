import json
import re
from gemini_client import generate_response

def extract_json(text):
    # Remove markdown blocks if present
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)

    # Extract first JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0)

    raise ValueError("No JSON object found in response")

def formalize_puzzle(puzzle_text: str):
    prompt = f"""
Convert the following seating puzzle into STRICT JSON.

IMPORTANT:
- Output ONLY valid JSON.
- Do NOT include markdown.
- Do NOT include explanation.
- Use EXACT keys:
  - people
  - seat_count
  - constraints

Constraint object formats:

not_position:
{{"type": "not_position", "person": "Name", "position": number}}

left_of:
{{"type": "left_of", "left": "Name", "right": "Name"}}

right_of:
{{"type": "right_of", "left": "Name", "right": "Name"}}

not_adjacent:
{{"type": "not_adjacent", "person1": "Name", "person2": "Name"}}

adjacent:
{{"type": "adjacent", "person1": "Name", "person2": "Name"}}

immediate_right:
{{"type": "immediate_right", "person1": "Name", "person2": "Name"}}

immediate_left:
{{"type": "immediate_left", "person1": "Name", "person2": "Name"}}

Puzzle:
{puzzle_text}
"""

    response = generate_response(prompt)

    print("RAW GEMINI RESPONSE:", response)

    json_text = extract_json(response)

    return json.loads(json_text)