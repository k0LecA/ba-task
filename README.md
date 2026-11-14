# Fuel Delivery Pricing Task

Implemented: Task 1, Task 2, Bonus 1, and Bonus 2.

## Setup and run

Install Node.js 22 or newer with npm. Download or clone this project, open a
terminal in its folder, and install dependencies:

```sh
npm ci
```

Start the program without arguments:

```sh
node src/index.js
```

The program reads `shipments.json` and `payments.json` from the current working
folder and writes `task1.csv`, `task2.csv`, `bonus1.csv`, `bonus2.csv`, and
`errors.csv` into `output/` there. Task 1 and shipment errors are written before
the input prompts. Invalid payments and payments with unknown ids are ignored.

Enter one answer per line: VAT percentage (25 means 25%), gasoline excise rate,
start date, then end date. Dates accept `yyyy-MM-dd` or `dd/MM/yyyy` independently
and are parsed with date-fns. Both range boundaries are included.

Invalid answers repeat only the current question. Dates are checked for real
calendar dates and an exact match to either supported format. Pricing uses the
parsed delivery date for the VAT rate. Money uses decimal.js with half-up
rounding. Bonus 2 uses Task 1 totals, the first usable payment, and calendar days
split at the interest rate change date.

AI usage: OpenAI Codex was used to assist with code refactoring and reviewing the implementation against the task requirements.