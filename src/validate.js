export default function validateDelivery(delivery) {
    const { type, client, volume, distance, basePrice } = delivery;

    if (basePrice == null) {
    return false;
    }

    if (typeof basePrice !== 'number' ||
        !Number.isFinite(basePrice) ||
        basePrice < 0) {
        return false;
    }

    return true;
}