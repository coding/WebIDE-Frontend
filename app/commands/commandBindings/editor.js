import store, { dispatch as $d } from '../../store'
import api from '../../backendAPI'
import * as Pane from '../../components/Pane/actions'

export default {
  'editor:split_pane_1': (c) => {
    Pane.split(1)
  },
  'editor:split_pane_vertical_2': (c) => {
    Pane.split(2, 'row')
  },
  'editor:split_pane_horizontal_2': (c) => {
    Pane.split(2, 'column')
  },
  'editor:split_pane_vertical_3': (c) => {
    Pane.split(3, 'row')
  },
  'editor:split_pane_horizontal_3': (c) => {
    Pane.split(3, 'column')
  },
  'editor:split_pane_vertical_4': (c) => {
    Pane.split(4, 'row')
  }
}
