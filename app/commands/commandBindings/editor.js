/* @flow weak */
import store, { dispatch as $d } from '../../store'
import api from '../../api'
import * as Pane from '../../components/Pane/actions'

export default {
  'editor:split_pane_1': c => {
    $d(Pane.split(1))
  },
  'editor:split_pane_vertical_2': c => {
    $d(Pane.split(2, 'row'))
  },
  'editor:split_pane_horizontal_2': c => {
    $d(Pane.split(2, 'column'))
  },
  'editor:split_pane_vertical_3': c => {
    $d(Pane.split(3, 'row'))
  },
  'editor:split_pane_horizontal_3': c => {
    $d(Pane.split(3, 'column'))
  },
  'editor:split_pane_vertical_4': c => {
    $d(Pane.split(4, 'row'))
  }
}

