import React from 'react'
import { observer } from 'mobx-react'
import MenuBar from './MenuBar'
import menuBarItems from './menuBarItems'
import state from './state'

const MenuBarContainer = observer(() => <MenuBar items={state.items} />)

/*
 * @param {Object} toBeInserted 要插入的菜单对象
 * @param {String} underByKey 插入到某个 key 所属菜单的 items 中，有多个 key 用空格分隔
 */
function insertMenuBarItem(toBeInserted, underByKey) {
    if (!underByKey) {
        menuBarItems.push(toBeInserted);
        return;
    }
    const array = underByKey.split(' ');
    let i = 0;
    recursive(menuBarItems);
    function recursive(items) {
        const cur = array[i];
        const nex = array[i + 1];
        items.forEach(v => {
            if (v.key === cur && v.items) {
                if (nex) {
                    i++;
                    recursive(v.items);
                } else {
                    v.items.push(toBeInserted);
                }
            }
        });
    }
}

export default MenuBarContainer
export { menuBarItems, insertMenuBarItem }
