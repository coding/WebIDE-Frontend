
class SearchResult {
    constructor({taskId, tagCount, searchChunk}) {
        this.taskId = taskId;
        this.tagCount = tagCount;
        this.searchChunk = searchChunk;
    }
    taskId = '';
    tagCount = 0;
    searchChunk = []; 
}

class SearchChunk {
    constructor({path, fileName, timestamp, results}) {
        this.path = path;
        this.fileName = fileName;
        this.timestamp = timestamp;
        this.results = results;
    }
    path = '';
    fileName = '';
    timestamp = 0;
    results = []
}

class SearchItem {
    constructor({start, end, length, line, innerStart, innerEnd}) {
        this.start = start;
        this.end = end;
        this.length = length;
        this.line = line;
        this.innerStart = innerStart;
        this.innerEnd = innerEnd;
    }
    start = 0;
    end = 0;
    length = 0;
    line = '';
    innerStart = 0;
    innerEnd = 0;
}

export { SearchResult, SearchChunk, SearchItem };