import React from 'react'
import { ThemeProvider } from 'styled-components'
import { observer } from 'mobx-react'

export default Com => observer((props) => {
  const theme = window.themeVariables.toJS()
  return (
    <ThemeProvider theme={theme}>
      <Com {...props} />
    </ThemeProvider>
  )
})
