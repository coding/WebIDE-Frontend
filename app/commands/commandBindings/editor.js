/* @flow weak */
import store, { dispatch as $d } from '../../store'
import api from '../../api'
import * as Pane from '../../components/Pane/actions'

export default {
  'editor:split_pane_2': c => {
    $d(Pane.split())
  },

}

