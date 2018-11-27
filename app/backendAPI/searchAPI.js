import { SearchSocketClient } from './websocketClients'
import config from 'config';

export function searchWorkspaceUp() {
    SearchSocketClient.$$singleton.send(`/app/ws/up`, {spaceKey: config.spaceKey});
}

export function searchWorkspaceDown() {
    SearchSocketClient.$$singleton.send(`/app/ws/down`, {spaceKey: config.spaceKey});
}

export function searchWorkspaceStatus() {
    SearchSocketClient.$$singleton.send(`/app/ws/status`, {spaceKey: config.spaceKey});
}

export function searchString(searching, randomKey) {
    SearchSocketClient.$$singleton.send(`/app/search/string`, {spaceKey: config.spaceKey, randomKey: randomKey}, JSON.stringify(searching));
}

export function searchPattern(searching, randomKey) {
    SearchSocketClient.$$singleton.send(`/app/search/pattern`, {spaceKey: config.spaceKey, randomKey: randomKey}, JSON.stringify(searching));
}

export function searchInterrupt(taskId) {
    SearchSocketClient.$$singleton.send(`/app/search/interrupt`, {spaceKey: config.spaceKey}, taskId);
}