import React from 'react'
import ResizeBar from 'components/ResizeBar2'
import { DrawersContainer, Drawer } from './Drawer'

export default () => (
  <DrawersContainer flexDirection='column' >
    <Drawer size='40' header='Collaborators' id='d1' >
      <h2>Many Collaborators</h2>
    </Drawer>

    <Drawer size='40' header='Collaborators' id='d2' >
      <div>Yolooooo</div>
      <div>Yolooooo</div>
      <div>Yolooooo</div>
      <div>Yolooooo</div>
      <div>Yolooooo</div>
      <div>Yolooooo</div>
      <div>Yolooooo</div>
      <div>Yolooooo</div>
    </Drawer>

    <Drawer size='40' header='Collaborators' id='d3' >
      <div>Yolooooo</div>
    </Drawer>
  </DrawersContainer>
)

