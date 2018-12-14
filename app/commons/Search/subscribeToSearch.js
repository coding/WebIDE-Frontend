import { SearchSocketClient } from 'backendAPI/websocketClients'
import { autorun } from 'mobx'
import state from './state'
import * as api from 'backendAPI/searchAPI'
import debounce from 'lodash/debounce'


export default function subscribeToSearch() {
    autorun(() => {

        if (!config.searchSocketConnected) return
        const client = SearchSocketClient.$$singleton.stompClient

        // workspace up
        client.subscribe('/user/topic/ws/up', response => {
            let result = JSON.parse(response.body);
            editWsStatus(result, 'UP');
        });

        // workspace down
        client.subscribe('/user/topic/ws/down', response => {
            let result = JSON.parse(response.body);
            editWsStatus(result, 'DOWN');
        });

        // workspace status
        client.subscribe('/user/topic/ws/status', response => {
            let result = JSON.stringify(response.body);
            if(result) {
                switch(result) {
                    case 'UP':
                        state.ws.status = true;
                        break
                    case 'DOWN':
                        state.ws.status = false;
                        break
                    case 'NULL':
                }
            } 
        });

        // search string
        client.subscribe('/user/topic/search/string', response => {
            formatSearch(response, false);
        });

        // search pattern
        client.subscribe('/user/topic/search/pattern', response => {
            formatSearch(response, true);
        });

        // single result
        client.subscribe('/user/topic/search/single', response => {
            let result = JSON.parse(response.body);
            if(result == null) {
                return ;
            }
            setData(result);
        });

        // multi result
        client.subscribe('/user/topic/search/join', response => {
            let results = JSON.parse(response.body);
            if(results == null) {
                return ;
            }
            setData(results);
        });

        // error
        client.subscribe('/user/topic/search/error', response => {
            let results = JSON.parse(response.body);
            if(results == null) {
                return ;
            }
            if(result.randomKey === state.searched.randomKey) {
                state.searched.message = results.message;
            }
        });

        // end result
        client.subscribe('/user/topic/search/end', response => {
            end(response)
        });

        // modify workspace status to up and init workspace files in mem
        api.searchWorkspaceUp();

    })
}

// end 
const end = debounce((response) => {
        let result = JSON.parse(response.body);
        if(result == null) {
            return ;
        }
        if(result.randomKey === state.searched.randomKey) {
            state.searched.end = true;
        }
    }, 500)

function setData(result) {
    if(result.randomKey === state.searched.randomKey) {
        if(result.joinResultMessage) {
            let {joinResultMessage: searchChunk} = result;
            for(let chunk of searchChunk) {
                state.searched.results.push(chunk);
            }
        } else if(result.singleResultMessage) {
            let {singleResultMessage: searchChunk} = result;
            state.searched.results.push(searchChunk);
        }
    }
}

function editWsStatus(result, wsStatus) {
    if(result == null) {
        return ;
    }
    if(result.code == 0 || result.code == 2) {
        switch(wsStatus) {
            case 'UP':
                config.searchWsStatus = true;
                state.ws.status = true;
                break;
            case 'DOWN':
                config.searchWsStatus = false;
                state.ws.status = false;
                break;
        }
    } else if(result.code == 1) {
        console.log(result.message);
    }
}

function formatSearch(response, isPattern) {
    let result = JSON.parse(response.body);
    if(result == null) {
        return ;
    }
    if(result.randomKey && result.randomKey === state.searched.randomKey) {
        if(result.message) {
            state.searched.message = result.message
            state.searched.end = true
        } else {
            state.searched.taskId = result.taskId;
            state.searched.isPattern = isPattern;
            state.searched.message = '';
            state.searched.end = false;
        }
    }
}