import { parse, isValid, format } from 'date-fns';

export default function validateDelivery(delivery, seenIds = new Set()) {
    const { id, type, client, date, volume, distance, basePrice } = delivery;

    if (id != null) {
        if (seenIds.has(id)) {
            return 'DUPLICATE_ID';
        }
        seenIds.add(id);
    }

    if ([id, type, client, date, volume, distance, basePrice]
        .some(value => value == null)) {
        return 'MISSING_FIELD';
    }

    const fuelType = typeof type === 'string'
        ? type.trim().toUpperCase()
        : '';

    if (!['GASOLINE', 'DIESEL', 'LPG'].includes(fuelType)) {
        return 'UNKNOWN_TYPE';
    }

    const clientType = typeof client === 'string'
        ? client.trim().toUpperCase()
        : '';

    if (!['PRIVATE', 'EXEMPT'].includes(clientType)) {
        return 'UNKNOWN_CLIENT';
    }

    if (!isValidDate(date)) {
        return 'INVALID_DATE';
    }

    if (
        typeof volume !== 'number' ||
        !Number.isFinite(volume) ||
        volume <= 0 ||
        typeof distance !== 'number' ||
        !Number.isFinite(distance) ||
        distance < 0 ||
        typeof basePrice !== 'number' ||
        !Number.isFinite(basePrice) ||
        basePrice < 0
    ) {
        return 'INVALID_VALUE';
    }

    return null;
}

function isValidDate(value) {
    if (typeof value !== 'string') return false;

    return ['yyyy-MM-dd', 'dd/MM/yyyy'].some(pattern => {
        const date = parse(value, pattern, new Date(2000, 0, 1));

        return isValid(date) && format(date, pattern) === value;
    });
}
