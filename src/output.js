import fs from 'node:fs';

fs.mkdirSync('output', { recursive: true });

function writeResults(results, filename = 'task1.csv') {
    const rows = [
        'Jonas_Butrimas',
        'ShipmentID,NetFuelPrice,LogisticsCost,TotalTax,GrandTotal'
    ];

    for (const result of results) {
        rows.push([
            result.id,
            result.netFuelPrice.toFixed(2),
            result.logisticsCost.toFixed(2),
            result.totalTax.toFixed(2),
            result.grandTotal.toFixed(2)
        ].join(','));
    }

    fs.writeFileSync(`output/${filename}`, rows.join('\n'));
}

function writeErrors(errors, filename = 'errors.csv') {
    const rows = [
        'Jonas_Butrimas',
        'ShipmentID,ErrorCode'
    ];

    for (const error of errors) {
        rows.push(`${error.id ?? ''},${error.error}`);
    }
    fs.writeFileSync(`output/${filename}`, rows.join('\n'));
}

function writeBonus1(count, mostExpensiveShipment, vatSum, filename = 'bonus1.csv') {
    const rows = [
        'Jonas_Butrimas',
        'ShipmentCount,MostExpensiveID,TotalVAT'
    ];
    rows.push(`${count},${mostExpensiveShipment?.id ?? 'N/A'},${vatSum.toFixed(2)}`);
    fs.writeFileSync(`output/${filename}`, rows.join('\n'));
}

export { writeResults, writeErrors, writeBonus1 };
