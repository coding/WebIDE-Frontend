import Backoff from 'backo2';

const getBackoff = ({ min = 1500, max = 10000 }) => {
    return new Backoff({ min, max, jitter: 0.5 });
}

export default getBackoff;
