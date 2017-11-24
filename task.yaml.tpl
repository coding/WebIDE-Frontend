apps:
- script   : npm
  name     : 'main-project'
  args: start
  exec_mode: fork_mode
  exec_interpreter: node

- script   : npm
  name     : 'main-packageList'
  args: run packageList
  exec_mode: fork_mode
  exec_interpreter: node

- script   : npm
  name     : 'plugin-platform'
  cwd: /Users/zhengxinqi/mycodingjob/webide/WebIDE-Plugin-Platform
  args: start
  env:
    PORT: 4001
  exec_mode: fork_mode
  exec_interpreter: node

- script   : npm
  name     : 'plugin-debugger'
  cwd: /Users/zhengxinqi/mycodingjob/webide/WebIDE-Plugin-Debugger
  args: start
  env:
    PORT: 4002
  exec_mode: fork_mode
  exec_interpreter: node