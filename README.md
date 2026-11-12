# Fuel Delivery Pricing Task

Implemented: Task 1, Task 2, and Bonus 1. Bonus 2 is not implemented.

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

The program reads `shipments.json` from the current working folder and writes
CSV files into `output/` there. `payments.json` is only needed for Bonus 2
and is not read by this implementation.

Enter one answer per line: VAT percentage (25 means 25%), gasoline excise rate,
start date, then end date. Dates accept `yyyy-MM-dd` or `dd/MM/yyyy` independently
and are parsed with date-fns. Both range boundaries are included.
