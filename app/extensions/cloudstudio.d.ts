declare module "*.svg"
declare module "*.png"
declare module "*.gif"
declare module "cloudstudio" {
  /**
   * 编辑器相关 API
   */
  export namespace editor {
    /**
     * 编辑器参数
     */
    interface IEditorConfig {
      /**
       * 文件路径
       */
      filePath: string;
      /**
       * 编辑器 id
       */
      id?: string;
      /**
       * 文件内容
       */
      content: string;
    }
    /**
     * 获取当前激活的编辑器实例
     * @return {monaco.editor.IStandaloneCodeEditor} monaco 编辑器实例
     *
     * **Note:** 此方法需要确保编辑器已经正确加载，在 pluginWillMount 生命周期方法中可能无法获取实例
     *
     * ```javascript
     * class MyComponent extends React.Component {
     *   componentDidMount() {
     *      const editor = Editor.getActiveEditor();
     *   }
     *  }
     * ```
     */
    export function getActiveEditor(): any | null;

    /**
     * 打开一个新的编辑器
     *
     * @param {IEditorConfig} config 编辑器配置
     *
     * **Note:** 文件路径和内容为必要参数，可自定义编辑器唯一 id
     *
     * ```javascript
     * const filePath = '/src/index.js';
     * File.getFileContent(filePath)
     *  .then((data) => {
     *      const { content } = data;
     *      openNewEditor({ filePath, content, id: `editor_${filePath}` });
     *  });
     * ```
     */
    export function openNewEditor(config: IEditorConfig): void;

    interface IContribution {
      id: string;
      extensions: string[];
      aliases: string[];
      loader: () => Thenable<any>;
    }

    interface ILanguageConfig {
      contribution: IContribution;
    }
    /**
     * 注册自定义语言
     * @param {ILanguageConfig} languageConf 自定义语言配置
     *
     * **Note:** 向 monaco 编辑器注册自定义语言的语法高亮，如插件类型为语法高亮，则只需在 `pluginWillMount` 生命周期中调用此方法
     *
     * monaco 的语法高亮基于 monarch 实现，这是一个声明式的词法规范（JSON 格式），具有很强的表现力，可以指定复杂的状态转换，动态括号匹配，自动完成等语法细节。
     * monarch 规范具体细节可以前往 https://microsoft.github.io/monaco-editor/monarch.html 查看
     * 此方法相关参数及具体用法可以参考 https://github.com/Microsoft/monaco-languages 仓库中的其他语言实现
     *
     * ```javascript
     * // 定义编辑器在该语言下的括号匹配规则、注释及自动缩进等配置
     * const myLanguage = {
     *    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
     *    comments: {
     *        lineComment: "//",
     *        blockComment: ["*", "*\\"]
     *    },
     *    brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
     *    autoClosingPairs: [
     *        { open: "{", close: "}" },
     *        { open: "[", close: "]" },
     *        { open: "(", close: ")" },
     *        { open: '"', close: '"' },
     *        { open: "'", close: "'" }
     *    ],
     *    surroundingPairs: [
     *        { open: "{", close: "}" },
     *        { open: "[", close: "]" },
     *        { open: "(", close: ")" },
     *        { open: '"', close: '"' },
     *        { open: "'", close: "'" },
     *        { open: "<", close: ">" }
     *    ]
     *    };
     *    const myLanguageConf = {
     *      defaultToken: "",
     *      tokenPostfix: ".ml",
     *      keywords: [
     *        "class",
     *        "break",
     *        "func",
     *        "switch",
     *        "continue",
     *        "extends",
     *        "interface",
     *        "type"
     *      ]
     *    };
     *    const languageContribution = {
     *      id: "myLanguage", // 自定义语言名
     *      extensions: [".ml"], // 自定语言文件扩展名，支持多个扩展名
     *      aliases: ["myLang", "ml"], // 自定义语言别名，支持多个别名
     *      loader: () => Promise.resolve({ language: myLanguage, conf: myLanguageConf }) // 语法高亮配置
     *    };
     *    registerLanguage({ contribution: languageContribution });
     * ```
     */
    export function registerLanguage(languageConf: ILanguageConfig): void;

    interface IContentProvider {
      name: string;
      [propName: string]: any;
    }

    interface IContentProviderDetail {
      editorType: string;
      activate: (editorType: string, title: string) => string;
      dispose: (tabId) => void;
    }
    /**
     * 注册 Content Provider
     * @param component 需要注册的编辑器视图组件
     * @param {IContentProvider} conf 视图配置，name 为必传项
     * @return {IContentProviderDetail} 编辑器视图类型及打开/关闭方法
     *
     * **Note:** 此方法并不是自定义一个编辑器类型，虽然你可以用它来注册一个自定义的编辑器
     *
     * 准确说这个方法允许你在编辑器区域注册一个自定义的视图组件，用来显示一些内容
     * 例如你可以注册一个 Git Diff 视图，展示某个文件不同版本的对比差异（可以借助 Git 模块相应的 API 来实现这个功能）
     */
    export function registerContentProvider(
      component: any,
      conf: IContentProvider
    ): IContentProviderDetail;

    interface IColor {
      [propName: string]: string;
    }
    interface ITokenColorSettings {
      fontStyle: string;
      foreground: string;
      [propName: string]: any;
    }
    interface ITokenColor {
      scope: Array<string>;
      settings: ITokenColorSettings;
    }
    interface IThemeDefine {
      colors: Array<IColor>;
      tokenColors: Array<string>;
      [propName: string]: any;
    }
    /**
     * 自定义主题配置
     * @param name 主题名
     * @param {IThemeDefine} theme 主题配置信息
     * @return named 注册功能的主题名称
     *
     * 此方法允许你自定义一个语法高亮主题，这个主题只会应用于编辑器部分，无法影响界面其他组件主题
     * 自定义主题配置应当至少包含一个 colors 和一个 tokenColors
     * 可以参考 https://github.com/Binaryify/OneDark-Pro 来学习如何自定义主题配色
     */
    export function defineTheme(name: string, theme: IThemeDefine): string;

    interface IEditorDidMountHandler {
      (editor: any): void;
    }
    /**
     * 注册编辑器实例被创建时的回调函数
     *
     * @param {IEditorDidMountHandler} fn 回调函数
     * @return dispose 清除函数
     * ```javascript
     * const dispose = Editor.registerEditorDidMountHandler((editor) => {
     *      // editor
     * });
     * ```
     */
    export function registerEditorDidMountHandler(
      fn: IEditorDidMountHandler
    ): IDisposable;

    interface IEditorActiveHandler {
      (editor: any): void;
    }

    /**
     * 注册活动编辑器被改变时的回调函数
     * @param {IEditorActiveHandler} fn 回调函数
     * @return {IDisposable} dispose 清除函数
     */
    export function registerActiveEditorChangeHandler(
      fn: IEditorActiveHandler
    ): IDisposable;

    export enum SnippetsItemKind {
      Text = 0,
      Method = 1,
      Function = 2,
      Constructor = 3,
      Field = 4,
      Variable = 5,
      Class = 6,
      Interface = 7,
      Module = 8,
      Property = 9,
      Unit = 10,
      Value = 11,
      Enum = 12,
      Keyword = 13,
      Snippet = 14,
      Color = 15,
      File = 16,
      Reference = 17,
      Folder = 18
    }
    interface ISnippetsString {
      value: string;
    }
    /**
     * 代码片段实体
     */
    interface ISnippets {
      /**
       * 触发自动完成提示的字符
       */
      label: string;
      /**
       * 代码片段文档，描述这段代码的作用
       */
      documentation: string;
      /**
       * 将会插入的代码片段
       */
      insertText: ISnippetsString;
      /**
       * 指代这段代码的类型，提供了18种可选类型，这将会在自动完成提示框内显示不同的图标
       */
      kind?: SnippetsItemKind;
    }
    interface ISnippetsProvirder {
      (): Array<ISnippets>;
    }
    /**
     * 注册自动完成代码片段
     * @param {Array<string> | string} languages 指定的语言
     * @param {ISnippetsProvirder | Array<ISnippets>} snippetsProvider 自动完成提供者
     *
     * 在指定语言的编辑器中提供可以自动完成的代码片段
     *
     * ```javascript
     * Editor.registerCodeSnippetsProvider(['javascript', 'typescript'], () => {
     *    return [
     *      {
     *        label: 'react',
     *        documention: '生成一个 React 组件',
     *        insertText: {
     *          value: 'import React, { PureComponent } from 'react';\n\nclass ${0:componentName} extends PureComponent {\n\n}\n\nexport default ${0:componentName};'
     *        },
     *        kind: SnippetsItemKind.Class
     *      }
     *    ]
     * });
     * ```
     * 这段代码将会注册一个名为 react 的代码片段，在编辑器中输入 react ，会出现自动完成列表，按下  `Tab` 键将生成一段模板代码
     *
     * ```javascript
     * import React, { PureComponent } from 'react';
     *
     *
     * class ${0:componentName} extends PureComponent {
     *
     * }
     *
     * export default ${0:componentName};
     *
     * ```
     *
     * 注意其中语法类似于 es6 模板字符串的部分，代码片段中包含 ${number:string} 插入点，即表示生成代码片段后光标会自动聚焦在此处，如果有多个相同的片段，则光标会同时聚焦在多个位置
     * 其中 `:` 前的数字表示光标聚焦的次序，从0开始，按下 Tab 键光标会跳转到下一个插入点。
     * 冒号后面的字符为可选参数，光标聚焦之后会自动被选中，用于描述此处需要输入的值。
     */
    export function registerCodeSnippetsProvider(
      languages: Array<string> | string,
      snippetsProvider: ISnippetsProvirder | Array<ISnippets>
    );
  }

  /**
   * Modal 模态框
   */
  export namespace modal {
    /**
     * 注册一个模态框
     * @param {string} name 模态框名称
     * @param component 模态框组件
     * @param {string} command 打开模态框命令
     *
     * 第三个参数 command 可以调用 Command 模块中的 dispatchCommand 方法来弹出模态框
     */
    export function modalRegister(
      name: string,
      component: any,
      command: string
    ): void;

    /**
     * 模态框位置参数
     */
    enum IModalPosition {
      /**
       * 顶部
       */
      top = "top",
      /**
       * 底部
       */
      bottom = "bottom",
      /**
       * 中间
       */
      center = "center"
    }
    /**
     * 模态框选项
     */
    interface IModalShowConf {
      /**
       * 模态框类型，等同于模态框名称
       */
      type: string;
      position?: IModalPosition;
    }
    /**
     * @param config 弹出模态框基本参数
     *
     * **Note:** 如不传入 position 参数，则默认在顶部弹出
     */
    export function showModal(config: IModalShowConf): void;
  }

  /**
   * Git 相关操作 API
   *
   * **Note:** 此模块下方法调用时需要确保项目已经绑定远端仓库
   */
  export namespace git {
    interface IFileLogsConfig {
      filePath: string;
      page?: number;
    }

    interface IGitAuthor {
      name: string;
      emailAddress: string;
      when: number;
    }

    interface IGitLog {
      id: string;
      author: IGitAuthor;
      date: Date;
      message: string;
      parentIds: Array<string>;
    }

    /**
     * 获取指定文件的 Git 提交日志
     * @param {IFileLogsConfig} config 文件路径及返回页码
     * @return {Thenable<Array<IGitLog> | null>} gitLog 该文件 Git 提交日志
     */
    export function gitFileLogs(
      config: IFileLogsConfig
    ): Thenable<Array<IGitLog> | null>;

    interface IGitRef {
      id: string;
      name: string;
    }
    /**
     * 获取项目的所有 GitRefs
     *
     * 查看 https://git-scm.com/book/zh/v2/Git-%E5%86%85%E9%83%A8%E5%8E%9F%E7%90%86-Git-%E5%BC%95%E7%94%A8 了解 GitRefs 细节
     * @return {Thenable<Array<IGitRef> | null>} gitRef 项目 GitRefs
     */
    export function gitRefs(): Thenable<Array<IGitRef> | null>;

    interface IFileContentParams {
      filePath: string;
      ref: string;
    }
    interface IFileContent {
      base64: boolean;
      content: string;
      filePath: string;
    }
    /**
     * 获取文件在指定 commitId 的文本内容
     *
     * @param {IFileContentParams} params 指定文件及 commitId
     * @return {Thenable<IFileContent>} fileContent 文件内容
     *
     * 通过调用 gitFileLogs 方法先获取所有提交记录
     */
    export function gitFileContentWithRef(
      params: IFileContentParams
    ): Thenable<IFileContent>;

    interface IFileDiffParams {
      filePath: string;
      oldRef: string;
      newRef: string;
    }
    interface IFileDiff {
      diff: string;
    }
    /**
     * 获取文件在新/旧 commitId 下的文本 diff
     *
     * @param {IFileDiffParams} params 文件路径及新旧 commitId
     * @return {Thenable<IFileDiff>} 文件原始 diff 信息
     *
     * 此方法的返回值与在终端执行 git diff 命令的格式相同
     */
    export function gitFileDiffWithRef(
      params: IFileDiffParams
    ): Thenable<IFileDiff>;

    interface ICommitDiffParams {
      rev: string;
    }

    /**
     * 文件状态
     */
    enum ChangeType {
      ADD = "ADD",
      COPY = "COPY",
      DELETE = "DELETE",
      MODIFY = "MODIFY",
      RENAME = "RENAME"
    }

    interface ICommitDiff {
      changeType: ChangeType;
      newPath: string;
      oldPath: string;
    }
    /**
     * 获取指定 Ref 下项目中的提交差异列表
     *
     * @param {ICommitDiffParams} params 指定 Ref
     *
     * 可以调用 gitRefs 获取项目所有 GitRefs
     */
    export function gitCommitDiff(
      params: ICommitDiffParams
    ): Thenable<Array<ICommitDiff>>;

    interface IGitBlame {
      author: IGitAuthor;
      shortName: string;
      when: number;
    }
    /**
     * 获取指定文件的 GitBlame
     *
     * @param {string} filePath 文件路径
     * @return {Thenable<Array<IGitBlame>>} gitBlame
     *
     * 查看 https://git-scm.com/docs/git-blame 了解 GitBlame 具体细节
     */
    export function gitBlame(filePath: string): Thenable<Array<IGitBlame>>;
  }

  export namespace terminal {
    /**
     * 一个终端实例
     */
    interface ITerminal {
      /**
       * 终端名
       */
      name: string;
      /**
       * 向终端中写入命令，这会自动执行命令
       * @param text 命令
       */
      sendText(text: string): void;
      /**
       * 将当前终端设为活动终端
       */
      active(): void;
      /**
       * 退出终端，这将断开终端会话，并销毁终端实例
       */
      exit(): void;
    }
    /**
     * 当一个终端被打开时的回调函数
     */
    interface ITerminalOpenFn {
      (terminal: ITerminal): void;
    }

    /**
     * 注册终端打开事件回调函数
     *
     * @param {ITerminalOpenFn} fn 回调函数
     * @return {ITerminalOpenDispose} disposable 取消回调函数
     *
     * 新建一个终端实例后会被自动调用
     *
     * ```javascript
     * const dispose = Terminal.regiserTerminalOpenHandler((terminal) => {
     *      terminal.emit('data', ['npm', 'install'])
     * });
     * ```
     */
    export function registerTerminalOpenHandler(
      fn: ITerminalOpenFn
    ): IDisposable;

    /**
     * 创建一个新的终端
     *
     * @param {string} id 唯一 id
     * @param {string} shellpath 终端默认启动目录
     * @return {ITerminal} terminal 新建的终端
     * ```javascript
     * const terminal = Terminal.createTerminal('my-terminal', '/home/coding/workspace/java');
     * terminal.sendText('npm install');
     * terminal.hide();
     * ```
     */
    export function createTerminal(id: string, shellPath?: string): ITerminal;
  }
  /**
   * 文件操作 API
   */
  export namespace file {
    interface IHandler {
      (IFileNode): void;
    }

    /**
     * 一个文件节点
     */
    interface IFileNode {
      /**
       * 文件路径（相对）
       */
      path: string;
      /**
       * 文件类型
       */
      contentType: string;
      /**
       * 文件内容
       */
      content: string;
      /**
       * 是否为文件夹
       */
      isDir: boolean;
      /**
       * 是否已同步
       */
      isSynced: boolean;
      /**
       * 文件的 Git 状态
       */
      gitStatus: string;
      /**
       * 文件大小
       */
      size: number;
      /**
       * 是否正在加载
       */
      isEditorLoading: boolean;
      /**
       * 文件名
       */
      _name: any;
      /**
       * 文件名
       */
      name: string;
      /**
       * 文件 Id
       */
      id: string;
      /**
       * 是否为根目录
       */
      isRoot: boolean;
      /**
       * 文件所在目录层级
       */
      depth: number;
      /**
       * 文件父节点
       */
      parent: IFileNode;
      /**
       * 文件夹所哟子节点
       */
      children: Array<IFileNode>;
      /**
       * 兄弟节点
       */
      siblings: Array<IFileNode>;
      /**
       * 第一个子节点
       */
      firstChild: IFileNode;
      /**
       * 最后一个子节点
       */
      lastChild: IFileNode;
      /**
       * 上一个节点
       */
      prev: IFileNode;
      /**
       * 下一个节点
       */
      next: IFileNode;
      /**
       * 遍历文件节点
       */
      forEachDescendant: (handler: IHandler) => void;
    }

    // 打开文件创建弹窗
    export function openCreateFileModal(): void;

    /**
     * 获取指定路径的文件 FileNode 实例
     *
     * @param {string} filePath 文件路径
     * @return {Thenable<IFileNode | null>} 文件 FileNode 实例
     */
    export function getFileNode(filePath: string): IFileNode;

    /**
     * 获取指定路径的文件内容
     * @param  {string} filePath 文件路径
     * @returns {Thenable<string>} 文件内容
     */
    export function getFileContent(filePath: string): Thenable<string>;

    interface IFileNodeCreatedFn {
      (IFileNode): void;
    }
    /**
     * 注册 FileNode 创建时的回调函数
     *
     * @param {IFileNodeCreatedFn} fn 回调函数
     *
     * FileNode 是 CS 中文件的基本结构，当文件被新建或是获取到项目中文件列表后都会触发此回调函数
     * 可以获取到创建的 FileNode
     */
    export function onDidFileNodeCreated(fn: IFileNodeCreatedFn): void;

    interface IIcons {
        [propName: string]: string;
    }

    /**
     * 具体文件及文件扩展名的图标映射
     * 例如指定
     * 
     * ```javascript
     * {
     *  name: 'javascript',
     *  fileExtendsions: ['js', 'jsx', 'mjs'],
     *  fileNames: ['index.js', 'main.js'],
     * }
     * ```
     * 则表示文件扩展名为 `js`、`jsx`、`mjs`或者文件名为 `index.js`、`main.js` 时使用 `javascript.svg` 作为图标
     */
    interface IFileIconMapping {
        /**
         * 图标名（应当与 icons 目录下的图标文件同名）
         */
        name: string;
        /**
         * 文件扩展类型
         */
        fileExtensions: Array<string>;
        /**
         * 文件名
         */
        fileNames?: Array<string>;
    }
    /**
     * 具体文件夹图标映射
     * 例如指定
     * 
     * ```javascript
     * {
     *  name: 'redux-action',
     *  folderNames: ['actions']
     * }
     * ```
     * 表示如果文件夹名为 `actions`，则使用 `folder-redux-action.svg` 和 `folder-redux-action-open.svg` 作为展开/闭合状态的图标
     */
    interface IFolderIconMapping {
        name: string;
        folderNames: Array<string>;
    }
    interface IFileNodeIcons<T> {
        /**
         * 默认图标
         */
        defaultIcon: string;
        icons: Array<T>;
    }
    /**
     * 文件图标配置
     */
    interface IFileIcon {
        /**
         * 文件映射
         */
        fileicons: IFileNodeIcons<IFileIconMapping>;
        /**
         * 文件夹映射
         */
        foldericons: IFileNodeIcons<IFolderIconMapping>;
        /**
         * 所有图标
         */
        icons: IIcons;
    }
    /**
     * 文件图标提供者
     */
    interface IFileIconProvider {
      (): IFileIcon;
    }
    /**
     * 注册自定义文件图标主题
     * 
     * @param {string} name 主题名称
     * @param {IFileIconProvider} provider 主题图标映射
     * 
     * 主题图标注册成功后可在 CS 设置->样式->文件图标进行设置
     * 仅支持转换为 base64 字符串的 svg 图标，图标文件应放在 src/icons 目录下
     * 图标可分为文件图标与文件夹图标两类，其中文件夹图标建议包含展开/闭合两种状态
     * 文件夹图标文件名以 `folder` 开始，例如 `folder-javascript` 对应的展开图标文件名为 `folder-javascript-open`
     * 点击查看[文件图标主图插件示例](https://coding.net/u/codingide/p/CloudStudio-Plugin-FileIcon)
     * 
     * ```javascript
     * file.registerFileIconProvider('material-ui-icons', () => {
     *      return {
     *          icons: {
     *              // icons 文件夹下导出的所有图标文件
     *          },
     *          fileicons: {
     *              defaultIcon: 'doc',
     *              icons: [
     *                  {
     *                      name: 'javascript',
     *                      fileExtendsions: ['js', 'jsx', 'mjs'],
     *                      fileNames: ['index.js', 'main.js'],
     *                  },
     *                  {
     *                      name: 'css',
     *                      fileExtendsions: ['css'],
     *                  }
     *              ]
     *          },
     *          foldericons: {
     *              defaultIcon: 'folder',
     *              icons: [
     *                  {
     *                      name: 'folder-android',
     *                      folderNames: ['android'],
     *                  },
     *                  {
     *                      name: 'folder-src',
     *                      folderNames: ['src', 'resource']
     *                  },
     *                  {
     *                      name: 'folder-config',
     *                      folderNames: ['config', 'configuration']
     *                  }
     *              ]
     *          }
     *      }
     * })
     * ```
     */
    export function registerFileIconProvider(name: string, provider: IFileIconProvider);
  }

  /**
   * 菜单模块
   */
  export namespace menu {
    interface IMenuItem {
      key: string; // 菜单项的唯一 key
      name: string | any; // 菜单显示名称
      command: string; // 点击菜单项触发的命令，可以通过 Command 模块的 registerCommand 方法注册命令
      icon?: string; // 菜单项左侧需显示的 icon ，支持 fontawesome 的 icon
      items?: Array<IMenuItem>; // 子项
      showMore?: boolean; // 是否需要在菜单项名称右侧显示 ...，这表示点击菜单后需要后续操作，例如会弹出模态框
    }
    /**
     * 注册一个新的菜单或在已有菜单中注册子项
     * @param {IMenuItem} menuItem 菜单项
     * @param {striung} target 注入位置
     *
     * 目前 CS 仅支持在顶部菜单栏注入新的菜单项，target 表示注入菜单项的位置，你可以注入一个新的菜单，也可以作为子项注入到其他已存在的菜单项中
     * 例如：窗口菜单的 key 为 'window'，target 参数写作 'window'，这会把你的自定义菜单作为窗口菜单的子项插入
     * target 为空或空字符串，会作为新菜单项插入到顶部菜单右侧
     */
    export function registerMenu(
      menuItem: Array<IMenuItem> | IMenuItem,
      target?: string
    ): void;
  }

  /**
   * 命令模块
   */
  export namespace command {
    interface ICommandHandlerArg {
      context: any;
      data: any;
      type: string;
    }
    interface ICommandHandler {
      (arg: ICommandHandlerArg): any;
    }
    /**
     * 注册一个命令
     * @param {string} commandType 命令名称
     * @param {handler} 命令回调函数
     *
     * 命令注册成功后会在 CS 全局可用，建议命令名以 '模块.具体操作' 格式注册，例如 'Editor.Close'
     */
    export function registerCommand(
      commandType: string,
      handler: ICommandHandler
    ): IDisposable;

    /**
     * 手动触发一个已注册的命令
     * @param {string} commandType 命令名称
     * @param payload 命令参数，会传入到注册的命令回调函数中
     *
     * ```javascript
     * registerCommand('Git.Commit', (commitMessage) => {
     *     // 后续操作
     * });
     *
     * const CommitBtn = (props) => {
     *      <div>
     *          <button onClick={() => dispatchCommand('Git.Commit', 'first commit')}>
     *              commit
     *          </button>
     *      </div>
     *  }
     * ```
     */
    export function dispatchCommand(commandType: string, payload: any): void;

    /**
     * 一个组合键实例
     */
    interface IKeyMaps {
      /**
       * 按下组合键后触发的命令
       */
      command: string;
      /**
       * mac os键位
       */
      mac: string;
      /**
       * windows 键位
       */
      win: string;
      /**
       * 名称
       */
      label: any;
    }
    interface IKeyBinding {
      /**
       * 组合名
       */
      name: string;
      keymaps: Array<IKeyMaps>;
    }
    /**
     * 注册快捷键组合
     *
     * @param {IKeyBinding} keyBindings 快捷键组合
     * @return {IDisposable} 清除快捷键
     *
     * **Note:** 快捷键只能用于手动触发 registerCommand 函数注册的命令
     *
     * 例如 'ctrl+c' 表示一个快捷键组合
     * 如果组合键已被占用将无法注册，可在 CS 设置面板->快捷键查看已注册的插件快捷键和系统快捷键
     *
     * 目前暂不支持修改已注册的快捷键
     */
    export function registerKeyBindings(keyBindings: IKeyBinding): IDisposable;
  }

  /**
   * 窗口相关方法
   */
  export namespace actions {
    interface INotify {
      notifyType: "ERROR" | "INFO";
      message: any;
    }
    /**
     * 弹出一个通知
     * @param {INotify} notify 通知
     *
     * 此方法需要传入通知类型，目前支持 ERROR 和 INFO
     */
    export function notification(notify: INotify): void;

    /**
     * 弹出一个错误通知
     * @param {string} message 通知消息
     */
    export function errorNotify(message: string | object): void;

    /**
     * 弹出一个默认通知
     * @param {string} message 通知消息
     */
    export function infoNotify(message: string | object): void;

    /**
     * 在左下角状态栏显示一条消息，不传入 hideAfterTimeout 默认 3000 ms 后自动隐藏消息
     *
     * @param {string} text 要显示的消息
     * @param {number} hideAfterTimeout 显示时间，单位 ms
     * @return {IStatusBarMsgDispose} 清除函数，调用后立即隐藏消息
     *
     * ```javascript
     * const dipose = actions.setStatusBarMessage('一条调皮的状态消息', 10000);
     * setTimeout(() => {
     *   dipose();
     * }, 2000)
     * ```
     */
    export function setStatusBarMessage(
      text: string,
      hideAfterTimeout: number
    ): IDisposable;

    /**
     * 在左下角状态栏显示一条消息，不传入 hideWhenDone 默认 3000 ms 后自动隐藏消息
     *
     * @param {string} text 要显示的消息
     * @param {number} hideWhenDone Promise 执行完毕自动隐藏消息
     * @return {IStatusBarMsgDispose} 清除函数，调用后立即隐藏消息
     *
     *  ```javascript
     *  const task = new Promise((resolve, reject) => {
     *       setTimeout(() => {
     *           resolve()
     *       }, 5000)
     *  });
     *
     *  const dispose = actions.setStatusBarMessage('第二条调皮的消息', task);
     *  ```
     */
    export function setStatusBarMessage(
      text: string,
      hideWhenDone: Thenable<any>
    ): IDisposable;
  }

  /**
   * 插件注册相关
   */
  interface IInjectLabel {
    [propName: string]: any;
  }

  interface IComponentGetter {
    (extensions: any): any;
  }

  interface IPluginChildren {
    position: string;
    key: string;
    label: any;
    view: any;
  }

  interface IAppRegisterCallBackFn {
    (...args: Array<any>): any;
  }

  type IAppUnRegisterCallBackFn = IAppRegisterCallBackFn;
  interface IPluginRegisterFn {
    (children: IPluginChildren, callback: IAppRegisterCallBackFn): void;
  }

  interface IInjectFn {
    (
      position: string,
      label: IInjectLabel,
      getComponent: IComponentGetter,
      callback?: IAppRegisterCallBackFn
    ): IPluginRegisterFn;
  }

  interface IPluginUnRegisterFn {
    (children: any, callback?: IAppUnRegisterCallBackFn): void;
  }

  /**
   * 菜单栏注入点
   */
  interface IMENUBAR {
    // 插件将在菜单栏右侧以 widget 形式显示
    WIDGET: string;
  }

  /**
   * 侧边栏注入点
   */
  interface ISIDEBAR {
    // 右侧边栏
    RIGHT: string;
    // 左侧边栏
    LEFT: string;
    // 下边栏
    BOTTOM: string;
  }

  /**
   * 顶部面包屑导航
   */
  interface ITOPBAR {
    // 右侧以 widget 形式显示
    WIDGET: string;
  }

  interface ICONTAINERS {
    UTILITIES: string;
  }

  interface ITERMINAL {
    ENV: string;
  }

  interface ISTATUSBAR {
    WIDGET: string;
  }

  interface IPluginPosition {
    MENUBAR: IMENUBAR;
    SIDEBAR: ISIDEBAR;
    TOPBAR: ITOPBAR;
    CONTAINERS: ICONTAINERS;
    STATUSBAR: ISTATUSBAR;
  }

  interface IInjectComponent {
    inject: IInjectFn;
    register: IPluginRegisterFn;
    unregister: IPluginUnRegisterFn;
    PluginArea: any;
    position: IPluginPosition;
  }

  interface IRequest {
    (options: any): Thenable<any>;
    get: (options: any) => Thenable<any>;
    postJSON: (options: any) => Thenable<any>;
  }

  interface ILanguage {
    [propName: string]: any;
  }

  interface ILanguagePool {
    zh_CN: ILanguage;
    en_US: ILanguage;
  }

  interface II18nConf {
    customLanguagePool: any;
  }

  interface IPluginAppConf {
    pkgId: string;
    i18n?: II18nConf;
    [propName: string]: any;
  }

  export class PluginApp {
    constructor(config: IPluginAppConf);
    inializeData: any;
    injectComponent: IInjectComponent;
    request: IRequest;
    i18n: any;
    sdk: any;
  }

  interface IAppManager {
    pluginWillMount?: () => void;
    pluginWillUnMount?: () => void;
    [propName: string]: any;
  }
  interface IAppRegisterConf {
    key: string;
    Manager: IAppManager;
    app?: any;
  }

  interface IPluginProperties {
    [propkey: string]: IProperties;
  }

  interface IProperties {
    title: string;
    description?: string;
    type: "string" | "array" | "boolean";
    default: Array<string> | string | boolean | null;
    enum?: Array<string>;
  }
  interface IPluginConfiguration {
    key: string; // 插件唯一 key
    title: string; // 需要显示在设置面板中的标签页标题
    properties: IPluginProperties; // 注册的设置项，包含设置项的唯一 key、title、默认值、类型及描述等信息
  }

  interface IPluginConfigChangeHandler {
    (propKey: string, oldValue: any, newValue: any): void;
  }

  /**
   * 注册一系列插件自定义设置项，该设置会在 CS -> 设置面板中以单独的标签展示
   * @param {IPluginConfiguration} configuration 设置项
   *
   * 相同插件 key 多次注册的设置项会被替换
   *
   * **Note:** 请分清 type 属性表示设置项值的属性类型，用字符串表示
   *
   * 设置项的书写规则非常简单，例如你的设置项负责管理启动/禁用某功能，则其中 type 值应为 boolean，default 为 true/false
   * 这将会被渲染为一个 checkbox
   *
   * 又或者你希望设置项是一个下拉选择框，就需要包含 enum 属性，并提供所有可选项
   *
   * 而如果设置项 type 为 string ，default 为 null 或 空串，则会被渲染为一个普通的输入框
   * ```javascript
   * const mySettings = {
   *      key: 'my-plugin',
   *      title; ‘My Plugin Setting’,
   *      properties: {
   *          'enable.autofocus': {
   *              type: boolean,
   *              title: '启用自动聚焦'
   *              default: false,
   *              description: 'enable autofocus',
   *          },
   *          'render.mode': {
   *              type: string,
   *              enum: [
   *                  'canvas',
   *                  'dom',
   *                  'auto',
   *              ],
   *              default: 'auto',
   *              title: '选择渲染模式',
   *              description: 'some secription...',
   *          }
   *      }
   * }
   * registerPluginConfiguration(mySettings)
   * ```
   */
  export function registerPluginConfiguration(
    configuration: IPluginConfiguration
  ): void;
  interface IPluginKVProperties {
    [propName: string]: any;
  }
  /**
   * 获取指定插件 key 注册的所有设置项的 key/value 对象
   *
   * @param {string} pluginKey 插件唯一 key
   * @return {IPluginKVProperties} key/value 对象
   *
   */
  export function getPluginConfiguration(
    pluginKey: string
  ): IPluginKVProperties;
  /**
   * 注册指定插件所注册设置项被修改时的回调函数
   *
   * @param {string} pluginKey 插件唯一 key
   * @param {IPluginConfigChangeHandler} fn 回调函数
   * @return {IDisposable} dispose 清除回调函数
   *
   * 回调函数会在对应插件的自定义设置项发生改变时被调用
   * 可以获取到包括发生改变设置项的唯一 key, 以及新/旧值
   */
  export function registerPluginConfigChangeHandler(
    pluginKey: string,
    fn: IPluginConfigChangeHandler
  ): IDisposable;
  export function appRegistry(
    registerConf: Array<IAppRegisterConf>,
    callbackfn?: IAppRegisterCallBackFn
  ): void;
}

interface Thenable<T> {
  then<TResult>(
    onfulfilled?: (value: T) => TResult | Thenable<TResult>,
    onrejected?: (reason: any) => TResult | Thenable<TResult>
  ): Thenable<TResult>;
  then<TResult>(
    onfulfilled?: (value: T) => TResult | Thenable<TResult>,
    onrejected?: (reason: any) => void
  ): Thenable<TResult>;
}

interface IDisposable {
  (): any;
}
