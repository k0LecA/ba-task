import Decimal from 'decimal.js';
import readline from 'node:readline';
import { parse, isValid, format } from 'date-fns';

export default async function readCustomOptions() {
    const rl = readline.createInterface({
        input: process.stdin
    });

    const lines = rl[Symbol.asyncIterator]();

    const formats = ['yyyy-MM-dd', 'dd/MM/yyyy'];

    let vat, excise, startDate, endDate;
    let parsedStartDate, parsedEndDate;

    while(true) {
        process.stdout.write('Enter VAT: ');
        ({ value: vat } = await lines.next());
        process.stdout.write('Enter Excise: ');
        ({ value: excise } = await lines.next());
        process.stdout.write('Enter Start Date (yyyy-MM-dd or dd/MM/yyyy): ');
        ({ value: startDate } = await lines.next());
        process.stdout.write('Enter End Date (yyyy-MM-dd or dd/MM/yyyy): ');
        ({ value: endDate } = await lines.next());
        for(const f of formats) {
            parsedStartDate = parse(startDate, f, new Date());
            parsedEndDate = parse(endDate, f, new Date());
            if (isValid(parsedStartDate) && isValid(parsedEndDate)) {
                console.log(`Start Date: ${format(parsedStartDate, 'yyyy-MM-dd')}`);
                console.log(`End Date: ${format(parsedEndDate, 'yyyy-MM-dd')}`);
                break;
            }
            console.log('Invalid date format. Please try again.');
        }
        if (isValid(parsedStartDate) && isValid(parsedEndDate)) {
            console.log(`Start Date: ${format(parsedStartDate, 'yyyy-MM-dd')}`);
            console.log(`End Date: ${format(parsedEndDate, 'yyyy-MM-dd')}`);
            break;
        }
        console.log('Invalid date format. Please try again.');
        if(isNaN(vat) || isNaN(excise)) {
            console.log('Invalid input. Please enter numeric values.');
            continue;
        }

        if(Number(vat) < 0) {
            console.log('Invalid VAT rate. Please enter a non-negative value.');
            continue;
        }
        if(Number(excise) < 0) {
            console.log('Invalid Excise rate. Please enter a non-negative value.');
            continue;
        }

        break;
    }

    rl.close();

    const customVat = new Decimal(vat).dividedBy(100);
    const customExcise = new Decimal(excise);

    return { customVat, customExcise };
}
