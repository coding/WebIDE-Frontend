function buildScrollMap($lines) {
    const map = {};
    for (let i = 0, n = $lines.length; i < n; i++) {
        const $line = $lines[i];
        const $nextLine = $lines[i + 1] || $line;
        const line = $line.dataset.line;
        map[line] = {
            top: $line.offsetTop,
            current: line,
            next: $nextLine.dataset.line,
        };
    }
    return map;
}

function scrollMixin(monaco, previewDOM) {
    let active = 'editor';
    const $lines = previewDOM.getElementsByClassName('line');
    const map = buildScrollMap($lines);
    const array = Object.keys(map);
    const length = array.length;
    const lastMap = map[array[length - 1]];
    let previewLine = 0;
    let preMap = { top: 0, current: 0, next: 0 };
    let nextMap = { top: 0, current: 0, next: 0 };
    let areaStep = 1;
    previewDOM.addEventListener('mouseover', () => active = 'preview');
    monaco.getDomNode().addEventListener('mouseover', () => active = 'editor');
    monaco.onDidScrollChange((event) => {
        if (active === 'preview') {
            return;
        }
        let mapItem;
        const line = Math.ceil(event.scrollTop / 20); // 20px each line
        if (line > array[length - 1]) {
            previewDOM.scrollTop = lastMap.top;
            return;
        }
        for (let i = 0; i < length; i++) {
            const cur = array[i];
            const next = array[i + 1];
            if (line == cur) {
                mapItem = map[line];
            } else if (line - cur > 0 && line - cur < 6 && next - line > 0 && next - line < 6) {
                mapItem = map[next];
            }
        }
        if (mapItem) {
            preMap = mapItem;
            nextMap = map[mapItem.next];
            previewDOM.scrollTop = mapItem.top;
            areaStep = 1;
        } else {
            const distance = nextMap.top - preMap.top;
            const piece = distance / (nextMap.current - preMap.current) / 5;
            if (piece * areaStep <= distance) {
                previewDOM.scrollTop = preMap.top + piece * areaStep;
                areaStep++;
            }
        }
    });
    previewDOM.addEventListener('scroll', () => {
        if (active === 'editor') {
            return;
        }
        if (previewDOM.scrollTop === 0) {
            monaco.revealLine(0);
            return;
        }
        const top = previewDOM.scrollTop + previewDOM.offsetHeight;
        for (let i = 0; i < length; i++) {
            const cur = array[i];
            const next = array[i + 1];
            const mapCur = map[cur] || lastMap;
            const mapNext = map[next] || lastMap.top;
            if (top == mapCur.top) {
                previewLine = mapCur.current;
            } else if (top > mapCur.top && top < mapNext.top) {
                previewLine = mapNext.current;
            }
        }
        monaco.revealLine(Number(previewLine));
    });
}

export default scrollMixin;
