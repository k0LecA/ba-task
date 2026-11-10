
export default function validateDelivery(delivery, seenIds = new Set()) {
    const { id, type, client, date, volume, distance, basePrice } = delivery;

    if ([id, type, client, date, volume, distance, basePrice]
        .some(value => value == null)) {
        return 'MISSING_FIELD';
    }

    if (seenIds.has(id)) {
        return 'DUPLICATE_ID';
    }
    seenIds.add(id);

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

    let year, month, day;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        [year, month, day] = value.split('-').map(Number);
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        [day, month, year] = value.split('/').map(Number);
    } else {
        return false;
    }

    const date = new Date(Date.UTC(year, month - 1, day));

    return date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day;
}
