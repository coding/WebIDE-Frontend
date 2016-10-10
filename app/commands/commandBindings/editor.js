/* @flow weak */
import store, { dispatch as $d } from '../../store'
import api from '../../api'
import * as Pane from '../../components/Pane/actions'

export default {
  'editor:split_pane_1': c => {
    $d(Pane.split(1))
  },
  'editor:split_pane_2': c => {
    $d(Pane.split(2))
  },
  'editor:split_pane_3': c => {
    $d(Pane.split(3))
  }
}

