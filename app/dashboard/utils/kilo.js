const kiloRegex = /(?!^)(?=(\d{3})+$)/g;

function kilo(num) {
    return String(num).replace(kiloRegex, ',');
}

export default kilo;
