import { observable, computed } from 'mobx'

const state = observable({
  wizard: {
    showModal: false,
    step: 1,
    maxStep: 4,
    wizardId: 1,
    name: '',
    settings: {
      sourceFolder: '',
      outputFolder: '',
    },
    platform: {
      eclipseVersion: '3.5 or greater'
    },
    properties: {
      id: '',
      version: '1.0.0',
      name: '',
      vendor: '',
      environment: 'JavaSE-1.7',
      genActivator: false,
      activator: '',
      makeContributions: false,
    },
    sdkList: [
      {
        name: '基础 SDK',
        selected: false,
      },
      {
        name: 'JDK 1.7',
        selected: false,
      },
      {
        name: 'SWT',
        selected: false,
      },
      {
        name: '并行计算',
        selected: false,
      },
      {
        name: '微内核',
        selected: false,
      },
    ],
    templates: {
      list: [
        {
          name: 'Hello, World Command',
          intro: 'This wizard creates standard plug-in directory structors and adds the following: Command contribution'
        },
        {
          name: 'ODA Data Source Designer',
          intro: '1111This wizard creates standard plug-in directory structors and adds the following: Command contribution'
        }
      ],
      template: 'Hello, World Command',
      useTemplate: false,
      get selectedTemplate () {
        console.log('selectedTemplate', this.list)
        return this.list.find((item) => {
          return item.name === this.template
        })
      }
    }
  }
})

export default state
