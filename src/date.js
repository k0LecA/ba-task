import { parse, isValid, format } from 'date-fns';

export default function parseDate(value) {
    if (typeof value !== 'string') return undefined;

    for (const pattern of ['yyyy-MM-dd', 'dd/MM/yyyy']) {
        const date = parse(value, pattern, new Date(2000, 0, 1));
        if (isValid(date) && format(date, pattern) === value) {
            return date;
        }
    }

    return undefined;
}
