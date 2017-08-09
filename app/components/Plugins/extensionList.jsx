import React, { Component, PropTypes } from 'react'
import { observer } from 'mobx-react'
import { togglePackage, updatePackageList } from './actions'
import store from './store'

const Card = ({ card }) => (
  <div className='card'>
    <div className='title'>
      {card.name}
      <span>{card.version}</span>
    </div>
    <div className='desc'>
      {card.description}
    </div>
    <div className='author'>
      <div className='icon' />
      <div className='text'>
        {card.author}
      </div>
    </div>
    <div className='buttons'>
      <div className='label'>
        {/* <button>settings</button>*/}
        {/* <button>uninstall</button>*/}
        {card.requirement !== 'Required' ? (
          <button
            onClick={e => togglePackage(card.name, !card.enabled)}
          >
            {card.enabled
              ? 'disable'
              : 'enable'}
          </button>
          ) : null}
      </div>
    </div>
  </div>)

Card.propTypes = {
  card: PropTypes.object,
}

class ExtensionList extends Component {
  state = {
    searchKey: ''
  }
  componentWillMount () {
    updatePackageList()
  }
  render () {
    const data = store.list
    return (
      <div className='settings-extension-container'>
        <div>
          <input
            type='text'
            className='search form-control'
            value={this.state.searchKey}
            placeholder={i18n.get('settings.extension.searchPlaceholder')}
            onChange={(e) => {
              this.setState({ searchKey: e.target.value })
            }}
          />
        </div>
        <div className='lists'>
          {data
              .toJS()
              .filter((card) => {
                if (this.state.searchKey) {
                  if (card.name.includes(this.state.searchKey)) {
                    return true
                  }
                  return false
                }
                return true
              })
              .map((card, idx) => (<Card key={idx} card={card} />))
          }
        </div>
      </div>
    )
  }
}

export default observer(ExtensionList)
